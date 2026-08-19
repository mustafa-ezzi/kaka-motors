from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import serializers

from catalog.models import Vehicle
from leads.models import TestDriveRequest
from studio.models import StudioLocation


class PublicTestDriveSerializer(serializers.ModelSerializer):
    vehicleSlug = serializers.SlugField(write_only=True)
    preferredDate = serializers.DateField(source='preferred_date')
    preferredSlot = serializers.ChoiceField(
        source='preferred_slot',
        choices=['morning', 'afternoon', 'evening'],
        required=False,
        default='afternoon',
    )
    phone = serializers.CharField(max_length=32)
    message = serializers.CharField(source='visitor_message', required=False, allow_blank=True, max_length=600)
    source = serializers.CharField(required=False, allow_blank=True, max_length=200)
    hpField = serializers.CharField(write_only=True, required=False, allow_blank=True)
    company = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = TestDriveRequest
        fields = (
            'reference',
            'name',
            'email',
            'phone',
            'vehicleSlug',
            'preferredDate',
            'preferredSlot',
            'city',
            'message',
            'consent',
            'source',
            'hpField',
            'company',
        )
        read_only_fields = ('reference',)

    def validate_phone(self, value):
        digits = ''.join(ch for ch in (value or '') if ch.isdigit())
        if len(digits) < 10:
            raise serializers.ValidationError('A reachable mobile number is required.')
        return value.strip()

    def validate_consent(self, value):
        if value is not True:
            raise serializers.ValidationError('Consent is required.')
        return value

    def validate_preferred_date(self, value):
        if value < timezone.localdate():
            raise serializers.ValidationError('Choose a future date.')
        return value

    def validate_city(self, value):
        city = (value or '').strip()
        if not city:
            raise serializers.ValidationError('City is required.')
        # Accept any city if no studio locations have been configured yet
        if StudioLocation.objects.filter(active=True).exists():
            if not StudioLocation.objects.filter(city__iexact=city, active=True).exists():
                raise serializers.ValidationError('Choose a studio city.')
        return city

    def validate_vehicleSlug(self, value):
        vehicle = Vehicle.objects.filter(slug=value, status=Vehicle.Status.PUBLISHED).first()
        if not vehicle:
            raise serializers.ValidationError('That car is not on the floor.')
        return value

    def create(self, validated_data):
        validated_data.pop('hpField', None)
        validated_data.pop('company', None)
        slug = validated_data.pop('vehicleSlug')
        vehicle = Vehicle.objects.get(slug=slug, status=Vehicle.Status.PUBLISHED)
        location = StudioLocation.objects.filter(city=validated_data['city'], active=True).first()
        row = TestDriveRequest(
            vehicle=vehicle,
            location=location,
            status=TestDriveRequest.Status.NEW,
            **validated_data,
        )
        row.reference = TestDriveRequest.allocate_reference()
        try:
            row.full_clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict or exc.messages) from exc
        row.save()
        return row


class StaffLeadSerializer(serializers.ModelSerializer):
    vehicleName = serializers.CharField(source='vehicle.name', read_only=True)
    vehicleSlug = serializers.CharField(source='vehicle.slug', read_only=True)
    preferredDate = serializers.DateField(source='preferred_date', read_only=True)
    preferredSlot = serializers.CharField(source='preferred_slot', read_only=True)
    message = serializers.CharField(source='visitor_message', read_only=True)
    adminNotes = serializers.CharField(source='admin_notes', allow_blank=True, required=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = TestDriveRequest
        fields = (
            'id',
            'reference',
            'name',
            'email',
            'phone',
            'city',
            'vehicleName',
            'vehicleSlug',
            'preferredDate',
            'preferredSlot',
            'message',
            'consent',
            'source',
            'status',
            'adminNotes',
            'createdAt',
        )
        read_only_fields = (
            'id',
            'reference',
            'name',
            'email',
            'phone',
            'city',
            'vehicleName',
            'vehicleSlug',
            'preferredDate',
            'preferredSlot',
            'message',
            'consent',
            'source',
            'createdAt',
        )
