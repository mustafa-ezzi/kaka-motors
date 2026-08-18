from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from catalog.staff_views import StaffGalleryViewSet, StaffVehicleViewSet
from catalog.views import VehicleViewSet
from config.auth_views import LoginView, LogoutView, MeView
from leads.staff_views import StaffLeadViewSet
from leads.views import PublicTestDriveView
from studio.staff_views import (
    StaffContentView,
    StaffLocationViewSet,
    StaffSettingsView,
    StudioOverviewView,
)
from studio.views import ContentView, LocationViewSet, SettingsView

router = DefaultRouter()
router.register(r'vehicles', VehicleViewSet, basename='vehicle')
router.register(r'locations', LocationViewSet, basename='location')

studio_router = DefaultRouter()
studio_router.register(r'vehicles', StaffVehicleViewSet, basename='studio-vehicle')
studio_router.register(r'gallery', StaffGalleryViewSet, basename='studio-gallery')
studio_router.register(r'locations', StaffLocationViewSet, basename='studio-location')
studio_router.register(r'leads', StaffLeadViewSet, basename='studio-lead')


def health(_request):
    return JsonResponse({'ok': True, 'service': 'kaka-motors'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', LoginView.as_view()),
    path('api/auth/logout/', LogoutView.as_view()),
    path('api/auth/me/', MeView.as_view()),
    path('api/studio/overview/', StudioOverviewView.as_view()),
    path('api/studio/content/', StaffContentView.as_view()),
    path('api/studio/settings/', StaffSettingsView.as_view()),
    path('api/studio/', include(studio_router.urls)),
    path('api/test-drive-requests/', PublicTestDriveView.as_view()),
    path('api/', include(router.urls)),
    path('api/content/', ContentView.as_view()),
    path('api/settings/', SettingsView.as_view()),
    path('api/health/', health),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
