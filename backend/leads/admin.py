from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from unfold.admin import ModelAdmin

from .models import TestDriveRequest


@admin.register(TestDriveRequest)
class TestDriveRequestAdmin(ModelAdmin):
    ordering = ('-created_at',)
    list_display = (
        'reference',
        'name',
        'phone',
        'vehicle_link',
        'city',
        'preferred_date',
        'preferred_slot',
        'status',
        'created_at',
    )
    list_filter = ('status', 'vehicle', 'location', 'preferred_date', 'preferred_slot')
    search_fields = ('reference', 'name', 'email', 'phone')
    readonly_fields = (
        'reference',
        'name',
        'email',
        'phone',
        'location',
        'city',
        'vehicle_link',
        'preferred_date',
        'preferred_slot',
        'visitor_message',
        'consent',
        'source',
        'created_at',
    )
    fields = (
        'reference',
        'name',
        'email',
        'phone',
        'vehicle_link',
        'city',
        'location',
        'preferred_date',
        'preferred_slot',
        'visitor_message',
        'consent',
        'source',
        'created_at',
        'status',
        'admin_notes',
    )

    def has_add_permission(self, request):
        return False

    @admin.display(description='Vehicle')
    def vehicle_link(self, obj):
        if not obj.vehicle_id:
            return '—'
        url = reverse('admin:catalog_vehicle_change', args=[obj.vehicle_id])
        return format_html('<a href="{}">{}</a>', url, obj.vehicle.name)
