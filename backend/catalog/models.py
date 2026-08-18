import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Vehicle(models.Model):
    class Category(models.TextChoices):
        PERFORMANCE = 'performance', 'Performance'
        ELECTRIC = 'electric', 'Electric'
        EXECUTIVE = 'executive', 'Executive'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        ARCHIVED = 'archived', 'Archived'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=120)
    category = models.CharField(max_length=32, choices=Category.choices)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
    status_label = models.CharField(max_length=80, blank=True)
    summary = models.TextField()
    description = models.TextField()
    interior_story = models.TextField(blank=True)
    price_from = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, default='PKR')
    specs = models.JSONField(default=dict, blank=True)
    features = models.JSONField(default=list, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    featured_on_home = models.BooleanField(default=False)
    card_image_url = models.CharField(max_length=500, blank=True)
    card_image_key = models.CharField(max_length=255, blank=True)
    hero_image_url = models.CharField(max_length=500, blank=True)
    hero_image_key = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return f'{settings.FRONTEND_URL.rstrip("/")}/cars/{self.slug}/'

    def clean(self):
        if self.status != self.Status.PUBLISHED:
            return
        missing = []
        if not self.name:
            missing.append('name')
        if not self.slug:
            missing.append('slug')
        if not self.summary:
            missing.append('summary')
        if not self.card_image_url:
            missing.append('card image')
        specs = self.specs or {}
        if not specs.get('power'):
            missing.append('power')
        if not specs.get('acceleration'):
            missing.append('acceleration')
        if missing:
            raise ValidationError(f'Cannot publish without: {", ".join(missing)}.')

    def delete(self, using=None, keep_parents=False):
        from catalog.services.cloudflare import delete_stored_image

        keys = [self.card_image_key, self.hero_image_key, *self.gallery.values_list('object_key', flat=True)]
        result = super().delete(using=using, keep_parents=keep_parents)
        for key in keys:
            delete_stored_image(key)
        return result


class GalleryMedia(models.Model):
    class Kind(models.TextChoices):
        IMAGE = 'image', 'Image'
        VIDEO = 'video', 'Video'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vehicle = models.ForeignKey(Vehicle, related_name='gallery', on_delete=models.CASCADE)
    kind = models.CharField(max_length=16, choices=Kind.choices, default=Kind.IMAGE)
    image_url = models.CharField(max_length=500, blank=True)
    object_key = models.CharField(max_length=255, blank=True)
    alt = models.CharField(max_length=200)
    object_position = models.CharField(max_length=64, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_default_exterior = models.BooleanField(default=False)
    is_default_interior = models.BooleanField(default=False)

    class Meta:
        ordering = ['sort_order', 'id']
        verbose_name_plural = 'Gallery media'

    def __str__(self):
        return f'{self.vehicle.name} — {self.alt}'

    def delete(self, using=None, keep_parents=False):
        from catalog.services.cloudflare import delete_stored_image

        key = self.object_key
        result = super().delete(using=using, keep_parents=keep_parents)
        delete_stored_image(key)
        return result
