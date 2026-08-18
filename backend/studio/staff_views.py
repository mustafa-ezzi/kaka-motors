from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from catalog.models import Vehicle
from config.permissions import IsStudioStaff
from leads.models import TestDriveRequest
from studio.models import SiteContent, StudioLocation, StudioSettings
from studio.serializers import LocationSerializer, SiteContentSerializer, StaffStudioSettingsSerializer


class StaffLocationViewSet(ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStudioStaff]
    serializer_class = LocationSerializer
    queryset = StudioLocation.objects.all()


class StaffContentView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStudioStaff]

    def get(self, request):
        return Response(SiteContentSerializer(SiteContent.load()).data)

    def put(self, request):
        content = SiteContent.load()
        serializer = SiteContentSerializer(content, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class StaffSettingsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStudioStaff]

    def get(self, request):
        return Response(StaffStudioSettingsSerializer(StudioSettings.load()).data)

    def put(self, request):
        row = StudioSettings.load()
        serializer = StaffStudioSettingsSerializer(row, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class StudioOverviewView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStudioStaff]

    def get(self, request):
        return Response(
            {
                'publishedVehicles': Vehicle.objects.filter(status=Vehicle.Status.PUBLISHED).count(),
                'draftVehicles': Vehicle.objects.filter(status=Vehicle.Status.DRAFT).count(),
                'newLeads': TestDriveRequest.objects.filter(status=TestDriveRequest.Status.NEW).count(),
                'activeCities': StudioLocation.objects.filter(active=True).count(),
            }
        )
