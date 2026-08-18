from rest_framework import viewsets

from catalog.models import Vehicle
from catalog.serializers import VehicleSerializer


class VehicleViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = VehicleSerializer
    lookup_field = 'slug'
    filterset_fields = ('category',)

    def get_queryset(self):
        return (
            Vehicle.objects.filter(status=Vehicle.Status.PUBLISHED)
            .prefetch_related('gallery')
            .order_by('sort_order', 'name')
        )
