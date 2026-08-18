from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from studio.models import SiteContent, StudioLocation, StudioSettings
from studio.serializers import LocationSerializer, PublicSettingsSerializer, SiteContentSerializer


class LocationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LocationSerializer

    def get_queryset(self):
        return StudioLocation.objects.filter(active=True)


class ContentView(APIView):
    def get(self, request):
        content = SiteContent.load()
        return Response(SiteContentSerializer(content).data)


class SettingsView(APIView):
    def get(self, request):
        settings_row = StudioSettings.load()
        return Response(PublicSettingsSerializer(settings_row).data)
