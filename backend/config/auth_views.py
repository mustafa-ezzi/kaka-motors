from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from config.permissions import IsStudioStaff


class LoginThrottle(AnonRateThrottle):
    rate = '10/min'


class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [LoginThrottle]

    def post(self, request):
        username = (request.data.get('username') or '').strip()
        password = request.data.get('password') or ''
        user = authenticate(request, username=username, password=password)
        if user is None or not user.is_active or not user.is_staff:
            return Response({'detail': 'Staff credentials required.'}, status=400)
        token, _created = Token.objects.get_or_create(user=user)
        return Response(
            {
                'token': token.key,
                'user': {
                    'username': user.username,
                    'isSuperuser': user.is_superuser,
                },
            }
        )


class LogoutView(APIView):
    permission_classes = [IsStudioStaff]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({'ok': True})


class MeView(APIView):
    permission_classes = [IsStudioStaff]

    def get(self, request):
        return Response(
            {
                'username': request.user.username,
                'isSuperuser': request.user.is_superuser,
            }
        )
