from datetime import timedelta

from django.contrib.auth.models import User
from django.core import mail
from django.core.cache import cache
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from catalog.models import Vehicle
from leads.models import TestDriveRequest
from leads.views import TestDriveThrottle
from studio.models import StudioLocation, StudioSettings


class PublicTestDriveApiTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.city = StudioLocation.objects.create(city='Lahore', active=True)
        StudioLocation.objects.create(city='Quetta', active=False)
        self.car = Vehicle.objects.create(
            slug='honda-civic',
            name='Honda Civic',
            category=Vehicle.Category.PERFORMANCE,
            status=Vehicle.Status.PUBLISHED,
            status_label='In showroom',
            summary='Published civic',
            description='A published car.',
            card_image_url='/media/vehicles/honda-civic.png',
            specs={'power': '176 hp', 'acceleration': '8.2 sec'},
        )
        self.draft = Vehicle.objects.create(
            slug='hidden-draft',
            name='Hidden Draft',
            category=Vehicle.Category.EXECUTIVE,
            status=Vehicle.Status.DRAFT,
            summary='Draft',
            description='Draft only.',
        )
        settings_row = StudioSettings.load()
        settings_row.notification_email = 'studio@kakamotors.test'
        settings_row.save()
        self.tomorrow = (timezone.localdate() + timedelta(days=1)).isoformat()
        self.payload = {
            'name': 'Ayesha Khan',
            'email': 'ayesha@example.com',
            'phone': '03001234567',
            'preferredDate': self.tomorrow,
            'preferredSlot': 'morning',
            'city': 'Lahore',
            'vehicleSlug': 'honda-civic',
            'message': 'Please call after 6pm.',
            'consent': True,
            'source': '/test-drive?car=honda-civic',
        }

    def test_get_is_not_allowed(self):
        response = self.client.get('/api/test-drive-requests/')
        self.assertEqual(response.status_code, 405)

    def test_create_persists_new_request(self):
        response = self.client.post('/api/test-drive-requests/', self.payload, format='json')
        self.assertEqual(response.status_code, 201, response.content)
        body = response.json()
        self.assertTrue(body['reference'].startswith('KM-'))
        self.assertNotEqual(body['reference'], 'KM-00-0000')
        row = TestDriveRequest.objects.get(reference=body['reference'])
        self.assertEqual(row.status, TestDriveRequest.Status.NEW)
        self.assertEqual(row.city, 'Lahore')
        self.assertEqual(row.vehicle, self.car)
        self.assertEqual(row.location, self.city)
        self.assertEqual(row.phone, '03001234567')
        self.assertEqual(row.preferred_slot, 'morning')
        self.assertEqual(row.visitor_message, 'Please call after 6pm.')
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(row.reference, mail.outbox[0].body)
        self.assertIn('03001234567', mail.outbox[0].body)

    def test_phone_required(self):
        payload = {**self.payload, 'phone': '123'}
        response = self.client.post('/api/test-drive-requests/', payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(TestDriveRequest.objects.count(), 0)

    def test_consent_required(self):
        payload = {**self.payload, 'consent': False}
        response = self.client.post('/api/test-drive-requests/', payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(TestDriveRequest.objects.count(), 0)

    def test_draft_vehicle_rejected(self):
        payload = {**self.payload, 'vehicleSlug': 'hidden-draft'}
        response = self.client.post('/api/test-drive-requests/', payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(TestDriveRequest.objects.count(), 0)

    def test_inactive_city_rejected(self):
        payload = {**self.payload, 'city': 'Quetta'}
        response = self.client.post('/api/test-drive-requests/', payload, format='json')
        self.assertEqual(response.status_code, 400)

    def test_honeypot_does_not_persist(self):
        payload = {**self.payload, 'hpField': 'spam-bot'}
        response = self.client.post('/api/test-drive-requests/', payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['reference'], 'KM-00-0000')
        self.assertEqual(TestDriveRequest.objects.count(), 0)

    def test_staff_status_change_does_not_touch_catalog(self):
        created = self.client.post('/api/test-drive-requests/', self.payload, format='json')
        row = TestDriveRequest.objects.get(reference=created.json()['reference'])
        staff = User.objects.create_user('floor', 'floor@kakamotors.test', 'studio-pass', is_staff=True)
        token = Token.objects.create(user=staff)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        response = self.client.patch(
            f'/api/studio/leads/{row.id}/',
            {'status': 'contacted', 'adminNotes': 'Called.'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        row.refresh_from_db()
        self.car.refresh_from_db()
        self.assertEqual(row.status, TestDriveRequest.Status.CONTACTED)
        self.assertEqual(self.car.status, Vehicle.Status.PUBLISHED)
        self.assertEqual(self.car.name, 'Honda Civic')


class TestDriveThrottleTests(APITestCase):
    def setUp(self):
        cache.clear()
        StudioLocation.objects.create(city='Lahore', active=True)
        Vehicle.objects.create(
            slug='honda-civic',
            name='Honda Civic',
            category=Vehicle.Category.PERFORMANCE,
            status=Vehicle.Status.PUBLISHED,
            summary='Published civic',
            description='A published car.',
            card_image_url='/media/vehicles/honda-civic.png',
            specs={'power': '176 hp', 'acceleration': '8.2 sec'},
        )
        self.payload = {
            'name': 'Ayesha Khan',
            'email': 'ayesha@example.com',
            'phone': '03001234567',
            'preferredDate': (timezone.localdate() + timedelta(days=1)).isoformat(),
            'city': 'Lahore',
            'vehicleSlug': 'honda-civic',
            'consent': True,
        }

    def test_rapid_submits_are_throttled(self):
        original = getattr(TestDriveThrottle, 'rate', None)
        TestDriveThrottle.rate = '3/min'
        self.addCleanup(setattr, TestDriveThrottle, 'rate', original)
        for _ in range(3):
            response = self.client.post('/api/test-drive-requests/', self.payload, format='json')
            self.assertEqual(response.status_code, 201, response.content)
        blocked = self.client.post('/api/test-drive-requests/', self.payload, format='json')
        self.assertEqual(blocked.status_code, 429)
