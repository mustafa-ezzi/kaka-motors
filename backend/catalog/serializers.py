from rest_framework import serializers

from catalog.models import GalleryMedia, Vehicle
from catalog.services.images import display_url, srcset


def absolute_media_url(url: str, request) -> str:
    if not url:
        return ''
    if url.startswith('http://') or url.startswith('https://'):
        return url
    if request:
        return request.build_absolute_uri(url)
    return url


class GalleryMediaSerializer(serializers.ModelSerializer):
    imageUrl = serializers.SerializerMethodField()
    imageSrcSet = serializers.SerializerMethodField()
    objectPosition = serializers.CharField(source='object_position', allow_blank=True)
    sortOrder = serializers.IntegerField(source='sort_order')
    label = serializers.SerializerMethodField()

    class Meta:
        model = GalleryMedia
        fields = ('id', 'kind', 'imageUrl', 'imageSrcSet', 'alt', 'objectPosition', 'sortOrder', 'label')

    def _absolute(self, obj):
        return absolute_media_url(obj.image_url, self.context.get('request'))

    def get_imageUrl(self, obj):
        return display_url(self._absolute(obj), 1600) or self._absolute(obj)

    def get_imageSrcSet(self, obj):
        return srcset(self._absolute(obj))

    def get_label(self, obj):
        if obj.is_default_interior:
            return 'Interior'
        if obj.is_default_exterior:
            return 'Exterior'
        return None


class VehicleSerializer(serializers.ModelSerializer):
    statusLabel = serializers.CharField(source='status_label')
    interiorStory = serializers.CharField(source='interior_story', allow_blank=True)
    priceFrom = serializers.FloatField(source='price_from', allow_null=True)
    heroImageUrl = serializers.SerializerMethodField()
    heroSrcSet = serializers.SerializerMethodField()
    heroObjectPosition = serializers.SerializerMethodField()
    cardImageUrl = serializers.SerializerMethodField()
    cardSrcSet = serializers.SerializerMethodField()
    gallery = GalleryMediaSerializer(many=True, read_only=True)
    sortOrder = serializers.IntegerField(source='sort_order')
    featuredOnHome = serializers.BooleanField(source='featured_on_home')

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
            'heroSrcSet',
            'heroObjectPosition',
            'cardImageUrl',
            'cardSrcSet',
            'gallery',
            'specs',
            'features',
            'sortOrder',
            'featuredOnHome',
        )

    def _hero(self, obj):
        return absolute_media_url(obj.hero_image_url, self.context.get('request'))

    def _card(self, obj):
        return absolute_media_url(obj.card_image_url, self.context.get('request'))

    def get_heroImageUrl(self, obj):
        return display_url(self._hero(obj), 1920) or self._hero(obj)

    def get_heroSrcSet(self, obj):
        return srcset(self._hero(obj))

    def get_heroObjectPosition(self, obj):
        for item in obj.gallery.all():
            if item.is_default_exterior and item.object_position:
                return item.object_position
        return 'center 38%'

    def get_cardImageUrl(self, obj):
        return display_url(self._card(obj), 1200) or self._card(obj)

    def get_cardSrcSet(self, obj):
        return srcset(self._card(obj))
