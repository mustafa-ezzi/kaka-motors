from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from catalog.models import GalleryMedia, Vehicle
from catalog.services.cloudflare import store_vehicle_image
from catalog.staff_serializers import StaffGallerySerializer, StaffVehicleSerializer
from config.permissions import IsStudioStaff


class StaffVehicleViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStudioStaff]
    serializer_class = StaffVehicleSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    queryset = Vehicle.objects.prefetch_related('gallery').all()
    filterset_fields = ('status', 'category', 'featured_on_home')
    search_fields = ('name', 'slug')
    filter_backends = [DjangoFilterBackend, SearchFilter]
    lookup_field = 'pk'

    def _store(self, upload, folder, old_key=''):
        return store_vehicle_image(upload, folder=folder, old_key=old_key)

    @action(detail=True, methods=['post'], url_path='card-image')
    def card_image(self, request, pk=None):
        vehicle = self.get_object()
        upload = request.FILES.get('file')
        if not upload:
            return Response({'detail': 'Choose a card image.'}, status=status.HTTP_400_BAD_REQUEST)
        url, key = self._store(upload, 'vehicles/cards', vehicle.card_image_key)
        vehicle.card_image_url = url
        vehicle.card_image_key = key
        vehicle.save(update_fields=['card_image_url', 'card_image_key', 'updated_at'])
        return Response(self.get_serializer(vehicle).data)

    @action(detail=True, methods=['post'], url_path='hero-image')
    def hero_image(self, request, pk=None):
        vehicle = self.get_object()
        upload = request.FILES.get('file')
        if not upload:
            return Response({'detail': 'Choose a hero image.'}, status=status.HTTP_400_BAD_REQUEST)
        url, key = self._store(upload, 'vehicles/heroes', vehicle.hero_image_key)
        vehicle.hero_image_url = url
        vehicle.hero_image_key = key
        vehicle.save(update_fields=['hero_image_url', 'hero_image_key', 'updated_at'])
        return Response(self.get_serializer(vehicle).data)

    @action(detail=True, methods=['post'], url_path='gallery')
    def add_gallery(self, request, pk=None):
        vehicle = self.get_object()
        upload = request.FILES.get('file')
        if not upload:
            return Response({'detail': 'Choose a gallery image.'}, status=status.HTTP_400_BAD_REQUEST)
        url, key = self._store(upload, 'vehicles/gallery')
        item = GalleryMedia.objects.create(
            vehicle=vehicle,
            kind=GalleryMedia.Kind.IMAGE,
            image_url=url,
            object_key=key,
            alt=request.data.get('alt') or f'{vehicle.name} gallery',
            object_position=request.data.get('objectPosition') or 'center',
            sort_order=int(request.data.get('sortOrder') or vehicle.gallery.count()),
            is_default_exterior=str(request.data.get('isDefaultExterior', '')).lower() in {'1', 'true', 'on'},
            is_default_interior=str(request.data.get('isDefaultInterior', '')).lower() in {'1', 'true', 'on'},
        )
        return Response(StaffGallerySerializer(item, context={'request': request}).data, status=status.HTTP_201_CREATED)


class StaffGalleryViewSet(viewsets.GenericViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStudioStaff]
    serializer_class = StaffGallerySerializer
    queryset = GalleryMedia.objects.select_related('vehicle')
    http_method_names = ['patch', 'delete', 'head', 'options']

    def partial_update(self, request, pk=None):
        item = self.get_object()
        serializer = self.get_serializer(item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def destroy(self, request, pk=None):
        item = self.get_object()
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
