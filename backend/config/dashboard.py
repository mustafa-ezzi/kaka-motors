from django.urls import reverse

from catalog.models import Vehicle
from leads.models import TestDriveRequest
from studio.models import StudioLocation


def dashboard_callback(request, context):
    context.update(
        {
            'kaka_cards': [
                {
                    'title': 'Published vehicles',
                    'metric': Vehicle.objects.filter(status=Vehicle.Status.PUBLISHED).count(),
                    'hint': 'Live on the public site',
                    'link': reverse('admin:catalog_vehicle_changelist') + '?status__exact=published',
                },
                {
                    'title': 'Draft vehicles',
                    'metric': Vehicle.objects.filter(status=Vehicle.Status.DRAFT).count(),
                    'hint': 'Hidden until published',
                    'link': reverse('admin:catalog_vehicle_changelist') + '?status__exact=draft',
                },
                {
                    'title': 'New test drives',
                    'metric': TestDriveRequest.objects.filter(
                        status=TestDriveRequest.Status.NEW
                    ).count(),
                    'hint': 'Waiting on the studio',
                    'link': reverse('admin:leads_testdriverequest_changelist')
                    + '?status__exact=new',
                },
                {
                    'title': 'Active cities',
                    'metric': StudioLocation.objects.filter(active=True).count(),
                    'hint': 'Shown on the test-drive form',
                    'link': reverse('admin:studio_studiolocation_changelist'),
                },
            ]
        }
    )
    return context


def new_leads_badge(request):
    return TestDriveRequest.objects.filter(status=TestDriveRequest.Status.NEW).count()


def superuser_only(request):
    return request.user.is_superuser
