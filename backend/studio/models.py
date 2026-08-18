from django.db import models

from .models_base import SingletonModel


class StudioLocation(models.Model):
    city = models.CharField(max_length=80)
    studio_name = models.CharField(max_length=120, blank=True)
    address = models.TextField(blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ['city']

    def __str__(self):
        return self.city


class SiteContent(SingletonModel):
    home_eyebrow = models.CharField(max_length=120, blank=True)
    home_headline = models.CharField(max_length=200, blank=True)
    home_cta_label = models.CharField(max_length=80, blank=True)
    home_narrative = models.TextField(blank=True)
    about_intro = models.TextField(blank=True)
    founder_quote = models.TextField(blank=True)
    founder_name = models.CharField(max_length=120, blank=True)
    brand_history = models.TextField(blank=True)
    values = models.JSONField(default=list, blank=True)
    studio_blurb = models.TextField(blank=True)
    test_drive_intro = models.TextField(blank=True)
    privacy_copy = models.TextField(blank=True)
    response_time_copy = models.CharField(max_length=120, default='under 24 hours')

    class Meta:
        verbose_name = 'Site content'
        verbose_name_plural = 'Site content'

    def __str__(self):
        return 'Site content'


class StudioSettings(SingletonModel):
    studio_display_name = models.CharField(max_length=120, default='Kaka Motors')
    notification_email = models.EmailField(blank=True)
    default_currency = models.CharField(max_length=3, default='INR')
    maintenance_mode = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Studio settings'
        verbose_name_plural = 'Studio settings'

    def __str__(self):
        return self.studio_display_name
