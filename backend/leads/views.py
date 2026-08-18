from rest_framework import status
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from leads.models import TestDriveRequest
from leads.serializers import PublicTestDriveSerializer
from leads.services import notify_studio


class TestDriveThrottle(AnonRateThrottle):
    scope = 'test_drive'


class PublicTestDriveView(CreateAPIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = PublicTestDriveSerializer
    throttle_classes = [TestDriveThrottle]
    queryset = TestDriveRequest.objects.none()

    def create(self, request, *args, **kwargs):
        honeypot = (request.data.get('hpField') or request.data.get('company') or '').strip()
        if honeypot:
            return Response({'reference': 'KM-00-0000', 'name': request.data.get('name') or ''}, status=status.HTTP_201_CREATED)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        row = serializer.save()
        notify_studio(row)
        return Response({'reference': row.reference, 'name': row.name}, status=status.HTTP_201_CREATED)
