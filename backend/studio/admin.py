from django.contrib import admin
from django.contrib.admin.models import LogEntry
from unfold.admin import ModelAdmin

from .models import SiteContent, StudioLocation, StudioSettings


@admin.register(StudioLocation)
class StudioLocationAdmin(ModelAdmin):
    list_display = ('city', 'studio_name', 'active')
    list_filter = ('active',)


@admin.register(SiteContent)
class SiteContentAdmin(ModelAdmin):
    def has_add_permission(self, request):
        return not SiteContent.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(StudioSettings)
class StudioSettingsAdmin(ModelAdmin):
    def has_add_permission(self, request):
        return not StudioSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(LogEntry)
class AuditLogAdmin(ModelAdmin):
    date_hierarchy = 'action_time'
    list_display = ('action_time', 'user', 'content_type', 'object_repr', 'action_flag')
    list_filter = ('action_flag', 'content_type')
    search_fields = ('object_repr', 'change_message', 'user__username')
    readonly_fields = (
        'action_time',
        'user',
        'content_type',
        'object_id',
        'object_repr',
        'action_flag',
        'change_message',
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
