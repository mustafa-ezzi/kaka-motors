import random
import uuid

from django.db import models
from django.utils import timezone

from catalog.models import Vehicle
from studio.models import StudioLocation


class TestDriveRequest(models.Model):
    class Status(models.TextChoices):
        NEW = 'new', 'New'
        CONTACTED = 'contacted', 'Contacted'
        SCHEDULED = 'scheduled', 'Scheduled'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference = models.CharField(max_length=24, unique=True, editable=False)
    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=32, blank=True)
    location = models.ForeignKey(
        StudioLocation,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    city = models.CharField(max_length=80)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.PROTECT)
    preferred_date = models.DateField()
    preferred_slot = models.CharField(
        max_length=16,
        choices=[
            ('morning', 'Morning · 10:00–13:00'),
            ('afternoon', 'Afternoon · 13:00–17:00'),
            ('evening', 'Evening · 17:00–20:00'),
        ],
        default='afternoon',
    )
    visitor_message = models.TextField(blank=True)
    consent = models.BooleanField()
    source = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.NEW)
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    @classmethod
    def allocate_reference(cls):
        year = timezone.now().strftime('%y')
        for _ in range(40):
            reference = f'KM-{year}-{random.randint(1000, 9999)}'
            if not cls.objects.filter(reference=reference).exists():
                return reference
        return f'KM-{year}-{uuid.uuid4().int % 9000 + 1000:04d}'

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = self.allocate_reference()
        if not self.status:
            self.status = self.Status.NEW
        super().save(*args, **kwargs)

    def __str__(self):
        return self.reference
