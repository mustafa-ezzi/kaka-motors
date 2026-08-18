from rest_framework import serializers

from studio.models import SiteContent, StudioLocation, StudioSettings


class LocationSerializer(serializers.ModelSerializer):
    studioName = serializers.CharField(source='studio_name', allow_blank=True, required=False)

    class Meta:
        model = StudioLocation
        fields = ('id', 'city', 'studioName', 'address', 'active')


class SiteContentSerializer(serializers.ModelSerializer):
    homeEyebrow = serializers.CharField(source='home_eyebrow', allow_blank=True)
    homeHeadline = serializers.CharField(source='home_headline', allow_blank=True)
    homeCtaLabel = serializers.CharField(source='home_cta_label', allow_blank=True)
    homeNarrative = serializers.CharField(source='home_narrative', allow_blank=True)
    aboutIntro = serializers.CharField(source='about_intro', allow_blank=True)
    founderQuote = serializers.CharField(source='founder_quote', allow_blank=True)
    founderName = serializers.CharField(source='founder_name', allow_blank=True)
    brandHistory = serializers.CharField(source='brand_history', allow_blank=True)
    studioBlurb = serializers.CharField(source='studio_blurb', allow_blank=True)
    testDriveIntro = serializers.CharField(source='test_drive_intro', allow_blank=True)
    privacyCopy = serializers.CharField(source='privacy_copy', allow_blank=True)
    responseTimeCopy = serializers.CharField(source='response_time_copy', allow_blank=True)

    class Meta:
        model = SiteContent
        fields = (
            'homeEyebrow',
            'homeHeadline',
            'homeCtaLabel',
            'homeNarrative',
            'aboutIntro',
            'founderQuote',
            'founderName',
            'brandHistory',
            'values',
            'studioBlurb',
            'testDriveIntro',
            'privacyCopy',
            'responseTimeCopy',
        )


class PublicSettingsSerializer(serializers.ModelSerializer):
    studioDisplayName = serializers.CharField(source='studio_display_name')
    defaultCurrency = serializers.CharField(source='default_currency')
    maintenanceMode = serializers.BooleanField(source='maintenance_mode')

    class Meta:
        model = StudioSettings
        fields = ('studioDisplayName', 'defaultCurrency', 'maintenanceMode')


class StaffStudioSettingsSerializer(serializers.ModelSerializer):
    studioDisplayName = serializers.CharField(source='studio_display_name')
    defaultCurrency = serializers.CharField(source='default_currency')
    maintenanceMode = serializers.BooleanField(source='maintenance_mode')
    notificationEmail = serializers.EmailField(source='notification_email', allow_blank=True)

    class Meta:
        model = StudioSettings
        fields = ('studioDisplayName', 'defaultCurrency', 'maintenanceMode', 'notificationEmail')
