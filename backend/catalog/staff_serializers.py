from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from catalog.models import GalleryMedia, Vehicle
from catalog.serializers import absolute_media_url


class StaffGallerySerializer(serializers.ModelSerializer):
    imageUrl = serializers.SerializerMethodField()
    objectPosition = serializers.CharField(source='object_position', allow_blank=True, required=False)
    sortOrder = serializers.IntegerField(source='sort_order', required=False)
    isDefaultExterior = serializers.BooleanField(source='is_default_exterior', required=False)
    isDefaultInterior = serializers.BooleanField(source='is_default_interior', required=False)

    class Meta:
        model = GalleryMedia
        fields = (
            'id',
            'kind',
            'imageUrl',
            'alt',
            'objectPosition',
            'sortOrder',
            'isDefaultExterior',
            'isDefaultInterior',
        )
        read_only_fields = ('id', 'imageUrl')

    def get_imageUrl(self, obj):
        return absolute_media_url(obj.image_url, self.context.get('request'))


class StaffVehicleSerializer(serializers.ModelSerializer):
    statusLabel = serializers.CharField(source='status_label', allow_blank=True, required=False)
    interiorStory = serializers.CharField(source='interior_story', allow_blank=True, required=False)
    priceFrom = serializers.DecimalField(
        source='price_from',
        max_digits=12,
        decimal_places=2,
        allow_null=True,
        required=False,
    )
    heroImageUrl = serializers.SerializerMethodField()
    cardImageUrl = serializers.SerializerMethodField()
    gallery = StaffGallerySerializer(many=True, read_only=True)
    sortOrder = serializers.IntegerField(source='sort_order', required=False)
    featuredOnHome = serializers.BooleanField(source='featured_on_home', required=False)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    features = serializers.ListField(child=serializers.CharField(), required=False)
    specs = serializers.DictField(required=False)

    class Meta:
        model = Vehicle
        fields = (
            'id',
            'slug',
            'name',
            'category',
            'status',
            'statusLabel',
            'summary',
            'description',
            'interiorStory',
            'priceFrom',
            'currency',
            'heroImageUrl',
            'cardImageUrl',
            'gallery',
            'specs',
            'features',
            'sortOrder',
            'featuredOnHome',
            'updatedAt',
        )
        read_only_fields = ('id', 'heroImageUrl', 'cardImageUrl', 'gallery', 'updatedAt')

    def get_heroImageUrl(self, obj):
        return absolute_media_url(obj.hero_image_url, self.context.get('request'))

    def get_cardImageUrl(self, obj):
        return absolute_media_url(obj.card_image_url, self.context.get('request'))

    def validate_slug(self, value):
        if (
            self.instance
            and self.instance.status == Vehicle.Status.PUBLISHED
            and value != self.instance.slug
        ):
            raise serializers.ValidationError('Slug is frozen after first publish.')
        return value

    def _persist(self, instance):
        try:
            instance.full_clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict or exc.messages) from exc
        instance.save()
        return instance

    def create(self, validated_data):
        instance = Vehicle(**validated_data)
        return self._persist(instance)

    def update(self, instance, validated_data):
        for field, value in validated_data.items():
            setattr(instance, field, value)
        return self._persist(instance)
