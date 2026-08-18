from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APITestCase

from catalog.admin import VehicleAdminForm
from catalog.models import GalleryMedia, Vehicle
from catalog.services.cloudflare import store_vehicle_image
from studio.models import StudioLocation

PIXEL_PNG = (
    b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
    b'\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf'
    b'\xc0\x00\x00\x00\x03\x00\x01\x00\x05\xfe\xd4\xef\x00\x00\x00\x00IEND\xaeB`\x82'
)


class PublicVehicleApiTests(APITestCase):
    def setUp(self):
        self.published = Vehicle.objects.create(
            slug='honda-civic',
            name='Honda Civic',
            category=Vehicle.Category.PERFORMANCE,
            status=Vehicle.Status.PUBLISHED,
            status_label='In showroom',
            summary='Published civic',
            description='A published car.',
            featured_on_home=True,
            hero_image_url='/media/vehicles/honda-civic.png',
            card_image_url='/media/vehicles/honda-civic.png',
            specs={'power': '176 hp', 'acceleration': '8.2 sec', 'topSpeed': '200 km/h'},
        )
        self.draft = Vehicle.objects.create(
            slug='hidden-draft',
            name='Hidden Draft',
            category=Vehicle.Category.EXECUTIVE,
            status=Vehicle.Status.DRAFT,
            status_label='Incoming',
            summary='Should not appear',
            description='Draft only.',
        )

    def test_list_returns_published_only(self):
        response = self.client.get('/api/vehicles/')
        self.assertEqual(response.status_code, 200)
        slugs = [row['slug'] for row in response.json()]
        self.assertIn('honda-civic', slugs)
        self.assertNotIn('hidden-draft', slugs)

    def test_detail_by_slug(self):
        response = self.client.get('/api/vehicles/honda-civic/')
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body['name'], 'Honda Civic')
        self.assertIn('gallery', body)
        self.assertTrue(body['heroImageUrl'].endswith('/media/vehicles/honda-civic.png'))
        self.assertIn('heroSrcSet', body)
        self.assertIn('cardSrcSet', body)
        self.assertEqual(body['heroObjectPosition'], 'center 38%')

    def test_draft_detail_is_hidden(self):
        response = self.client.get('/api/vehicles/hidden-draft/')
        self.assertEqual(response.status_code, 404)

    def test_category_filter(self):
        response = self.client.get('/api/vehicles/?category=performance')
        slugs = [row['slug'] for row in response.json()]
        self.assertEqual(slugs, ['honda-civic'])

    def test_unpublish_removes_from_list(self):
        self.published.status = Vehicle.Status.DRAFT
        self.published.save()
        response = self.client.get('/api/vehicles/')
        slugs = [row['slug'] for row in response.json()]
        self.assertNotIn('honda-civic', slugs)

    def test_public_payload_omits_storage_keys(self):
        self.published.card_image_key = 'vehicles/secret-card.png'
        self.published.save(update_fields=['card_image_key'])
        GalleryMedia.objects.create(
            vehicle=self.published,
            alt='Civic exterior',
            image_url='/media/vehicles/honda-civic.png',
            object_key='vehicles/secret-gallery.png',
            sort_order=0,
            is_default_exterior=True,
        )
        GalleryMedia.objects.create(
            vehicle=self.published,
            alt='Civic cabin',
            image_url='/media/vehicles/honda-civic-interior.png',
            object_key='vehicles/secret-interior.png',
            sort_order=1,
            is_default_interior=True,
        )
        GalleryMedia.objects.create(
            vehicle=self.published,
            alt='Civic rear three-quarter',
            image_url='/media/vehicles/honda-civic-rear.png',
            object_key='vehicles/secret-rear.png',
            sort_order=2,
        )
        response = self.client.get('/api/vehicles/honda-civic/')
        body = response.json()
        blob = str(body)
        self.assertNotIn('object_key', blob)
        self.assertNotIn('objectKey', blob)
        self.assertNotIn('cardImageKey', blob)
        self.assertEqual(len(body['gallery']), 3)


class VehiclePublishRuleTests(TestCase):
    def test_draft_without_card_is_allowed(self):
        car = Vehicle(
            slug='draft-car',
            name='Draft Car',
            category=Vehicle.Category.PERFORMANCE,
            status=Vehicle.Status.DRAFT,
            summary='Soon',
            description='Soon.',
        )
        car.full_clean()

    def test_publish_without_card_is_rejected(self):
        car = Vehicle(
            slug='empty-publish',
            name='Empty Publish',
            category=Vehicle.Category.PERFORMANCE,
            status=Vehicle.Status.PUBLISHED,
            summary='Missing photography.',
            description='Should not go live.',
            specs={'power': '100 hp', 'acceleration': '8.0 sec'},
        )
        with self.assertRaises(ValidationError):
            car.full_clean()

    def test_publish_without_power_is_rejected(self):
        car = Vehicle(
            slug='no-power',
            name='No Power',
            category=Vehicle.Category.PERFORMANCE,
            status=Vehicle.Status.PUBLISHED,
            summary='Missing specs.',
            description='Should not go live.',
            card_image_url='/media/vehicles/no-power.png',
            specs={'acceleration': '8.0 sec'},
        )
        with self.assertRaises(ValidationError):
            car.full_clean()


class ImageStoreTests(TestCase):
    def test_local_store_writes_url_not_bytes_in_db(self):
        upload = SimpleUploadedFile('card.png', PIXEL_PNG, content_type='image/png')
        url, key = store_vehicle_image(upload, folder='vehicles/cards')
        self.assertTrue(url.startswith('/media/vehicles/cards/'))
        self.assertTrue(key.startswith('vehicles/cards/'))
        self.assertTrue(key.endswith('.png'))

    def test_svg_is_rejected(self):
        upload = SimpleUploadedFile('evil.svg', b'<svg xmlns="http://www.w3.org/2000/svg"></svg>', content_type='image/svg+xml')
        with self.assertRaises(ValidationError):
            store_vehicle_image(upload)

    def test_admin_form_publish_with_upload(self):
        form = VehicleAdminForm(
            data={
                'name': 'Suzuki Alto',
                'slug': 'suzuki-alto',
                'category': Vehicle.Category.EXECUTIVE,
                'status': Vehicle.Status.PUBLISHED,
                'status_label': 'In showroom',
                'summary': 'City car.',
                'description': 'A compact daily.',
                'currency': 'PKR',
                'sort_order': '0',
                'power': '68 hp',
                'acceleration': '14.0 sec',
                'top_speed': '140 km/h',
                'transmission': 'Manual',
                'features_text': 'Light steering\nEasy parking',
            },
            files={
                'card_image_file': SimpleUploadedFile('card.png', PIXEL_PNG, content_type='image/png'),
            },
        )
        self.assertTrue(form.is_valid(), form.errors)
        vehicle = form.save()
        self.assertEqual(vehicle.status, Vehicle.Status.PUBLISHED)
        self.assertTrue(vehicle.card_image_url)
        self.assertTrue(vehicle.card_image_key)
        self.assertEqual(vehicle.specs['power'], '68 hp')
        self.assertEqual(vehicle.features, ['Light steering', 'Easy parking'])
        self.assertEqual(Vehicle.objects.get(slug='suzuki-alto').card_image_url, vehicle.card_image_url)


class PublicStudioApiTests(APITestCase):
    def test_locations_omit_inactive(self):
        StudioLocation.objects.create(city='Karachi', active=True)
        StudioLocation.objects.create(city='Quetta', active=False)
        response = self.client.get('/api/locations/')
        cities = [row['city'] for row in response.json()]
        self.assertIn('Karachi', cities)
        self.assertNotIn('Quetta', cities)

    def test_content_singleton(self):
        response = self.client.get('/api/content/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('homeHeadline', response.json())


class AdminAuthTests(TestCase):
    def test_anonymous_is_sent_to_login(self):
        response = self.client.get('/admin/')
        self.assertEqual(response.status_code, 302)
        self.assertIn('/admin/login/', response.url)

    def test_login_page_loads(self):
        response = self.client.get('/admin/login/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Kaka Motors')

    def test_staff_reaches_dashboard(self):
        User.objects.create_superuser('studio', 'studio@kakamotors.test', 'phase3-pass')
        self.client.force_login(User.objects.get(username='studio'))
        response = self.client.get('/admin/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Published vehicles')
        self.assertContains(response, 'Vehicles')

    def test_vehicle_add_page_loads(self):
        User.objects.create_superuser('studio', 'studio@kakamotors.test', 'phase4-pass')
        self.client.force_login(User.objects.get(username='studio'))
        response = self.client.get('/admin/catalog/vehicle/add/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Upload card image')
        self.assertContains(response, 'Gallery')


class StudioStaffApiTests(APITestCase):
    def setUp(self):
        from rest_framework.authtoken.models import Token

        self.staff = User.objects.create_user('floor', 'floor@kakamotors.test', 'studio-pass', is_staff=True)
        self.token = Token.objects.create(user=self.staff)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_anonymous_cannot_list_studio_vehicles(self):
        self.client.credentials()
        response = self.client.get('/api/studio/vehicles/')
        self.assertEqual(response.status_code, 401)

    def test_staff_creates_draft_and_sees_it(self):
        response = self.client.post(
            '/api/studio/vehicles/',
            {
                'name': 'Suzuki Cultus',
                'slug': 'suzuki-cultus',
                'category': 'executive',
                'status': 'draft',
                'summary': 'City hatch.',
                'description': 'A compact daily for Karachi.',
                'currency': 'PKR',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual(response.json()['name'], 'Suzuki Cultus')
        listed = self.client.get('/api/studio/vehicles/')
        slugs = [row['slug'] for row in listed.json()]
        self.assertIn('suzuki-cultus', slugs)
        public = self.client.get('/api/vehicles/')
        public_slugs = [row['slug'] for row in public.json()]
        self.assertNotIn('suzuki-cultus', public_slugs)

    def test_staff_cannot_publish_without_card(self):
        created = self.client.post(
            '/api/studio/vehicles/',
            {
                'name': 'No Photo',
                'slug': 'no-photo',
                'category': 'performance',
                'status': 'draft',
                'summary': 'Missing photography.',
                'description': 'Draft only.',
                'specs': {'power': '100 hp', 'acceleration': '8.0 sec'},
            },
            format='json',
        )
        vehicle_id = created.json()['id']
        response = self.client.patch(
            f'/api/studio/vehicles/{vehicle_id}/',
            {'status': 'published'},
            format='json',
        )
        self.assertEqual(response.status_code, 400)

    def test_login_rejects_non_staff(self):
        User.objects.create_user('visitor', 'v@test.com', 'visitor-pass')
        response = self.client.post(
            '/api/auth/login/',
            {'username': 'visitor', 'password': 'visitor-pass'},
            format='json',
        )
        self.assertEqual(response.status_code, 400)


class ImageDerivativeTests(TestCase):
    def test_local_media_is_not_rewritten(self):
        from catalog.services.images import resized_url, srcset

        url = '/media/vehicles/honda-civic.png'
        self.assertEqual(resized_url(url, 800), url)
        self.assertEqual(srcset(url), '')

    def test_remote_url_uses_cloudflare_resize(self):
        from django.test import override_settings

        from catalog.services.images import resized_url, srcset

        remote = 'https://cdn.kakamotors.test/vehicles/civic.webp'
        with override_settings(CLOUDFLARE_IMAGE_RESIZE_BASE='https://kakamotors.com/cdn-cgi/image'):
            rewritten = resized_url(remote, 1200)
            self.assertIn('/cdn-cgi/image/width=1200,format=auto', rewritten)
            self.assertTrue(rewritten.endswith(remote))
            set_value = srcset(remote)
            self.assertIn('480w', set_value)
            self.assertIn('1920w', set_value)


class HardeningTests(TestCase):
    def test_csp_header_is_present(self):
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.get('Content-Security-Policy') or response.get('Content-Security-Policy-Report-Only'))

    def test_audit_log_is_in_admin(self):
        User.objects.create_superuser('studio', 'studio@kakamotors.test', 'phase8-pass')
        self.client.force_login(User.objects.get(username='studio'))
        response = self.client.get('/admin/admin/logentry/')
        self.assertEqual(response.status_code, 200)
