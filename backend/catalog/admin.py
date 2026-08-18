from django import forms
from django.conf import settings
from django.contrib import admin, messages
from django.core.exceptions import ValidationError
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline
from unfold.widgets import UnfoldAdminImageFieldWidget

from catalog.models import GalleryMedia, Vehicle
from catalog.services.cloudflare import store_vehicle_image

IMAGE_HELP = 'JPEG, PNG, WebP, or AVIF. Max 8MB. Stored on Cloudflare R2 (or local media in development).'


class VehicleAdminForm(forms.ModelForm):
    card_image_file = forms.FileField(
        required=False,
        label='Upload card image',
        help_text=IMAGE_HELP,
        widget=UnfoldAdminImageFieldWidget,
    )
    hero_image_file = forms.FileField(
        required=False,
        label='Upload hero image',
        help_text=IMAGE_HELP,
        widget=UnfoldAdminImageFieldWidget,
    )
    power = forms.CharField(required=False, help_text='Required to publish.')
    acceleration = forms.CharField(required=False, help_text='Required to publish.')
    top_speed = forms.CharField(required=False, label='Top speed')
    transmission = forms.CharField(required=False)
    weight_bias = forms.CharField(required=False)
    length = forms.CharField(required=False)
    features_text = forms.CharField(
        required=False,
        label='Features',
        widget=forms.Textarea(attrs={'rows': 5}),
        help_text='One feature per line.',
    )

    class Meta:
        model = Vehicle
        exclude = (
            'specs',
            'features',
            'card_image_url',
            'card_image_key',
            'hero_image_url',
            'hero_image_key',
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        specs = self.instance.specs or {} if self.instance.pk else {}
        self.fields['power'].initial = specs.get('power', '')
        self.fields['acceleration'].initial = specs.get('acceleration', '')
        self.fields['top_speed'].initial = specs.get('topSpeed', '')
        self.fields['transmission'].initial = specs.get('transmission', '')
        self.fields['weight_bias'].initial = specs.get('weightBias', '')
        self.fields['length'].initial = specs.get('length', '')
        features = self.instance.features if self.instance.pk else []
        self.fields['features_text'].initial = '\n'.join(features or [])
        if not self.instance.pk:
            self.fields['currency'].initial = 'PKR'

    def clean(self):
        cleaned = super().clean()
        cleaned['specs'] = {
            'power': (cleaned.get('power') or '').strip(),
            'acceleration': (cleaned.get('acceleration') or '').strip(),
            'topSpeed': (cleaned.get('top_speed') or '').strip(),
            'transmission': (cleaned.get('transmission') or '').strip(),
            'weightBias': (cleaned.get('weight_bias') or '').strip(),
            'length': (cleaned.get('length') or '').strip(),
        }
        features_text = cleaned.get('features_text') or ''
        cleaned['features'] = [line.strip() for line in features_text.splitlines() if line.strip()]
        self.instance.specs = cleaned['specs']
        self.instance.features = cleaned['features']
        if cleaned.get('card_image_file') and not self.instance.card_image_url:
            self.instance.card_image_url = 'pending-upload'

        if cleaned.get('status') == Vehicle.Status.PUBLISHED:
            missing = []
            if not cleaned.get('name'):
                missing.append('name')
            if not cleaned.get('slug'):
                missing.append('slug')
            if not cleaned.get('summary'):
                missing.append('summary')
            if not (self.instance.card_image_url or cleaned.get('card_image_file')):
                missing.append('card image')
            specs = cleaned['specs']
            if not specs.get('power'):
                missing.append('power')
            if not specs.get('acceleration'):
                missing.append('acceleration')
            if missing:
                raise ValidationError(f'Cannot publish without: {", ".join(missing)}.')
        return cleaned

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.specs = self.cleaned_data['specs']
        instance.features = self.cleaned_data['features']

        card_file = self.cleaned_data.get('card_image_file')
        if card_file:
            url, key = store_vehicle_image(
                card_file,
                folder='vehicles/cards',
                old_key=instance.card_image_key,
            )
            instance.card_image_url = url
            instance.card_image_key = key

        hero_file = self.cleaned_data.get('hero_image_file')
        if hero_file:
            url, key = store_vehicle_image(
                hero_file,
                folder='vehicles/heroes',
                old_key=instance.hero_image_key,
            )
            instance.hero_image_url = url
            instance.hero_image_key = key

        if commit:
            instance.save()
        return instance


class GalleryMediaForm(forms.ModelForm):
    image_file = forms.FileField(
        required=False,
        label='Upload',
        help_text=IMAGE_HELP,
        widget=UnfoldAdminImageFieldWidget,
    )
    alt = forms.CharField(required=False)

    class Meta:
        model = GalleryMedia
        fields = (
            'kind',
            'image_file',
            'alt',
            'object_position',
            'sort_order',
            'is_default_exterior',
            'is_default_interior',
        )

    def clean(self):
        cleaned = super().clean()
        if cleaned.get('DELETE'):
            return cleaned
        upload = cleaned.get('image_file')
        alt = (cleaned.get('alt') or '').strip()
        has_existing = bool(self.instance.image_url)
        if not upload and not has_existing and not alt:
            return cleaned
        if not alt:
            self.add_error('alt', 'Alt text is required.')
        if not upload and not has_existing:
            self.add_error('image_file', 'Upload an image for this gallery row.')
        return cleaned

    def save(self, commit=True):
        instance = super().save(commit=False)
        upload = self.cleaned_data.get('image_file')
        if upload:
            url, key = store_vehicle_image(
                upload,
                folder='vehicles/gallery',
                old_key=instance.object_key,
            )
            instance.image_url = url
            instance.object_key = key
        if commit:
            instance.save()
        return instance


class GalleryMediaInline(TabularInline):
    model = GalleryMedia
    form = GalleryMediaForm
    extra = 0
    fields = (
        'kind',
        'image_file',
        'image_url',
        'alt',
        'object_position',
        'sort_order',
        'is_default_exterior',
        'is_default_interior',
    )
    readonly_fields = ('image_url',)
    verbose_name = 'Gallery image'
    verbose_name_plural = 'Gallery (any number of images)'


@admin.register(Vehicle)
class VehicleAdmin(ModelAdmin):
    form = VehicleAdminForm
    inlines = [GalleryMediaInline]
    list_display = (
        'thumbnail',
        'name',
        'category',
        'status',
        'featured_on_home',
        'updated_at',
    )
    list_display_links = ('name',)
    list_filter = ('status', 'category', 'featured_on_home')
    search_fields = ('name', 'slug')
    actions = ('publish_vehicles', 'unpublish_vehicles')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = (
        'card_image_url',
        'hero_image_url',
        'card_image_key',
        'hero_image_key',
        'preview_link',
        'updated_at',
    )
    fieldsets = (
        ('Identity', {'fields': ('name', 'slug', 'category', 'status', 'status_label')}),
        ('Copy', {'fields': ('summary', 'description', 'interior_story', 'features_text')}),
        (
            'Specs',
            {
                'fields': (
                    'power',
                    'acceleration',
                    'top_speed',
                    'transmission',
                    'weight_bias',
                    'length',
                    'price_from',
                    'currency',
                )
            },
        ),
        ('Placement', {'fields': ('featured_on_home', 'sort_order')}),
        ('Card image', {'fields': ('card_image_file', 'card_image_url')}),
        ('Hero image', {'fields': ('hero_image_file', 'hero_image_url')}),
        ('Public site', {'fields': ('preview_link', 'updated_at')}),
        (
            'Storage keys',
            {
                'classes': ('collapse',),
                'fields': ('card_image_key', 'hero_image_key'),
                'description': 'Object keys used to replace or delete files. Never sent to the public API.',
            },
        ),
    )

    def get_prepopulated_fields(self, request, obj=None):
        if obj and obj.status == Vehicle.Status.PUBLISHED:
            return {}
        return self.prepopulated_fields

    def get_readonly_fields(self, request, obj=None):
        fields = list(self.readonly_fields)
        if obj and obj.status == Vehicle.Status.PUBLISHED:
            fields.append('slug')
        return fields

    @admin.display(description='')
    def thumbnail(self, obj):
        if not obj.card_image_url:
            return '—'
        return format_html(
            '<img src="{}" alt="" width="72" height="44" style="object-fit:cover;width:72px;height:44px;" />',
            obj.card_image_url,
        )

    @admin.display(description='Preview')
    def preview_link(self, obj):
        if not obj or not obj.slug:
            return 'Save to generate a public URL.'
        url = f'{settings.FRONTEND_URL.rstrip("/")}/cars/{obj.slug}/'
        if obj.status != Vehicle.Status.PUBLISHED:
            return format_html('<span>{} <em>(unpublished)</em></span>', url)
        return format_html('<a href="{}" target="_blank" rel="noopener">Open on the public site</a>', url)

    @admin.action(description='Publish selected vehicles')
    def publish_vehicles(self, request, queryset):
        published = 0
        skipped = 0
        for vehicle in queryset:
            vehicle.status = Vehicle.Status.PUBLISHED
            try:
                vehicle.full_clean()
            except ValidationError as exc:
                skipped += 1
                self.message_user(request, f'{vehicle.name}: {exc}', level=messages.ERROR)
                continue
            vehicle.save(update_fields=['status', 'updated_at'])
            published += 1
        if published:
            self.message_user(request, f'Published {published} vehicle(s).', level=messages.SUCCESS)
        if skipped:
            self.message_user(request, f'Skipped {skipped} vehicle(s).', level=messages.WARNING)

    @admin.action(description='Unpublish selected vehicles')
    def unpublish_vehicles(self, request, queryset):
        count = queryset.update(status=Vehicle.Status.DRAFT)
        self.message_user(request, f'Unpublished {count} vehicle(s).', level=messages.SUCCESS)
