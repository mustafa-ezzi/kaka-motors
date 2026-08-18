from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import mixins, viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.filters import SearchFilter

from config.permissions import IsStudioStaff
from leads.models import TestDriveRequest
from leads.serializers import StaffLeadSerializer


class StaffLeadViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStudioStaff]
    serializer_class = StaffLeadSerializer
    queryset = TestDriveRequest.objects.select_related('vehicle').all()
    filterset_fields = ('status', 'city')
    search_fields = ('reference', 'name', 'email')
    filter_backends = [DjangoFilterBackend, SearchFilter]
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']
