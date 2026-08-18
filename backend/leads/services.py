import logging

from django.conf import settings
from django.core.mail import send_mail

from studio.models import StudioSettings

logger = logging.getLogger(__name__)


def notify_studio(request_row):
    inbox = StudioSettings.load().notification_email
    if not inbox:
        return
    vehicle_name = request_row.vehicle.name if request_row.vehicle_id else '—'
    body = (
        f'Reference: {request_row.reference}\n'
        f'Name: {request_row.name}\n'
        f'Email: {request_row.email}\n'
        f'Phone: {request_row.phone or "—"}\n'
        f'Vehicle: {vehicle_name}\n'
        f'Date: {request_row.preferred_date}\n'
        f'Slot: {request_row.get_preferred_slot_display()}\n'
        f'City: {request_row.city}\n'
        f'Message: {request_row.visitor_message or "—"}\n'
    )
    try:
        send_mail(
            subject=f'Kaka Motors drive {request_row.reference}',
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[inbox],
            fail_silently=False,
        )
    except Exception:
        logger.exception('Could not email test-drive notice for %s', request_row.reference)
