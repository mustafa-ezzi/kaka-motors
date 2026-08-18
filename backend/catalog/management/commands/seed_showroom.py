from pathlib import Path
from shutil import copy2

from django.conf import settings
from django.core.management.base import BaseCommand

from catalog.models import GalleryMedia, Vehicle
from studio.models import SiteContent, StudioLocation, StudioSettings

SEED_IMAGES = Path(settings.BASE_DIR) / 'seed' / 'images'

LOCATIONS = [
    {'city': 'Karachi', 'studio_name': 'Kaka Motors Studio', 'address': 'Private appointments, Karachi', 'active': True},
]

CONTENT = {
    'home_eyebrow': 'Karachi studio',
    'home_headline': 'Performance, with a point of view.',
    'home_cta_label': 'Meet',
    'home_narrative': (
        'Kaka Motors is a private showroom, not a lot. We present a short line of machines '
        'with the lights low and the copy even lower. If a car is here, it earned the floor.'
    ),
    'about_intro': (
        'We opened a studio, not a showroom in the usual sense. The brief was simple: fewer cars, '
        'better light, and a conversation that starts after you have already decided you want to drive.'
    ),
    'founder_quote': 'A machine should feel inevitable. If you have to explain the drama, it was never there.',
    'founder_name': 'Founder, Kaka Motors',
    'brand_history': (
        'The studio began in Karachi as a room for people who still read a car before they buy it. '
        'We keep the catalog short on purpose. Inventory moves. The standard does not.'
    ),
    'values': [
        {'title': 'Restraint', 'body': 'Scarlet is a signal. Glass is a layer. Nothing is decoration if it does not earn the frame.'},
        {'title': 'Precision', 'body': 'Specs are written like they will be checked. They will.'},
        {'title': 'Presence', 'body': 'The car is the protagonist. Interface stays in the wings.'},
    ],
    'studio_blurb': 'Private appointments in Karachi. Bring a date, not a crowd.',
    'test_drive_intro': 'Name, email, a date. We confirm under 24 hours.',
    'privacy_copy': 'Details remain with Kaka Motors.',
    'response_time_copy': 'under 24 hours',
}

VEHICLES = [
    {
        'slug': 'honda-civic',
        'name': 'Honda Civic',
        'category': Vehicle.Category.PERFORMANCE,
        'status_label': 'In showroom',
        'summary': 'The 1.5 turbo sedan Pakistan still measures other cars against.',
        'description': (
            'Civic is the appointment car: low stance, turbo pull, and a cabin that still feels like a cockpit '
            'on the Canal and the motorway. This is the floor’s performance sedan.'
        ),
        'interior_story': 'A driver-first cabin. Tight wheel, clear gauges, and enough quiet to hear the turbo spool.',
        'price_from': 8650000,
        'featured_on_home': True,
        'sort_order': 0,
        'image': 'honda-civic.png',
        'interior': 'civic-interior.png',
        'specs': {
            'power': '176 hp',
            'acceleration': '8.2 sec',
            'topSpeed': '200 km/h',
            'transmission': 'CVT',
            'length': '4.67 m',
        },
        'features': ['1.5L VTEC Turbo', 'Honda Sensing', 'LED lighting', 'Dual-zone climate'],
    },
    {
        'slug': 'toyota-corolla-grande',
        'name': 'Toyota Corolla Grande',
        'category': Vehicle.Category.EXECUTIVE,
        'status_label': 'Executive',
        'summary': 'The Grande remains the country’s default executive sedan — calm, credible, everywhere.',
        'description': (
            'Corolla Grande is how Pakistan does distance. A 1.8 with presence, a quiet rear bench, '
            'and the resale story every other badge still has to beat.'
        ),
        'interior_story': '',
        'price_from': 7499000,
        'featured_on_home': False,
        'sort_order': 1,
        'image': 'toyota-corolla-grande.png',
        'specs': {
            'power': '140 hp',
            'acceleration': '10.1 sec',
            'topSpeed': '190 km/h',
            'transmission': 'CVT',
            'length': '4.63 m',
        },
        'features': ['1.8 Dual VVT-i', 'Grande interior pack', 'Rear AC vents', 'Vehicle stability control'],
    },
    {
        'slug': 'honda-vezel',
        'name': 'Honda Vezel',
        'category': Vehicle.Category.ELECTRIC,
        'status_label': 'Hybrid crossover',
        'summary': 'A compact crossover with hybrid manners and enough height for the city.',
        'description': (
            'Vezel is the imported crossover that still looks current on Karachi roads: high seating, '
            'hybrid assistance, and a footprint that fits a Defence driveway.'
        ),
        'interior_story': '',
        'price_from': 8250000,
        'featured_on_home': False,
        'sort_order': 2,
        'image': 'honda-vezel.png',
        'specs': {
            'power': '151 hp',
            'acceleration': '9.4 sec',
            'topSpeed': '175 km/h',
            'transmission': 'e-CVT',
            'length': '4.33 m',
        },
        'features': ['Hybrid powertrain', 'Honda Sensing', 'High driving position', 'LED headlights'],
    },
    {
        'slug': 'suzuki-baleno',
        'name': 'Suzuki Baleno',
        'category': Vehicle.Category.EXECUTIVE,
        'status_label': 'Family hatch',
        'summary': 'A tall hatch that does school runs and motorway Fridays without making a speech.',
        'description': (
            'Baleno is the practical Suzuki on the floor: space, light controls, and enough presence '
            'to sit next to the sedans without apologising.'
        ),
        'interior_story': '',
        'price_from': 4599000,
        'featured_on_home': False,
        'sort_order': 3,
        'image': 'suzuki-baleno.png',
        'specs': {
            'power': '91 hp',
            'acceleration': '11.5 sec',
            'topSpeed': '170 km/h',
            'transmission': '5-speed',
            'length': '3.99 m',
        },
        'features': ['1.3L K-series', 'ABS and dual airbags', 'Touch infotainment', 'Rear parking sensors'],
    },
    {
        'slug': 'suzuki-hustler',
        'name': 'Suzuki Hustler',
        'category': Vehicle.Category.PERFORMANCE,
        'status_label': 'Kei crossover',
        'summary': 'A boxy kei that turns tight streets into a private game.',
        'description': (
            'Hustler is the small one with a point of view: tall glass, a square stance, and a turning circle '
            'built for packed inner-city lanes.'
        ),
        'interior_story': '',
        'price_from': 4350000,
        'featured_on_home': False,
        'sort_order': 4,
        'image': 'suzuki-hustler.png',
        'specs': {
            'power': '64 hp',
            'acceleration': '13.8 sec',
            'topSpeed': '140 km/h',
            'transmission': 'CVT',
            'length': '3.40 m',
        },
        'features': ['Kei platform', 'High roof', 'Light steering', 'Compact footprint'],
    },
]


def store_seed_image(filename: str, dest_name: str) -> tuple[str, str]:
    source = SEED_IMAGES / filename
    if not filename or not source.exists():
        return '', ''
    dest_path = Path(settings.MEDIA_ROOT) / dest_name
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    copy2(source, dest_path)
    return f'{settings.MEDIA_URL}{dest_name}', dest_name


class Command(BaseCommand):
    help = 'Seed locations, site copy, and the Pakistan showroom catalog.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--skip-vehicles',
            action='store_true',
            help='Seed studio content only; do not write vehicles.',
        )

    def handle(self, *args, **options):
        for row in LOCATIONS:
            StudioLocation.objects.update_or_create(city=row['city'], defaults=row)
        self.stdout.write(self.style.SUCCESS(f'Seeded {len(LOCATIONS)} locations'))

        content = SiteContent.load()
        for field, value in CONTENT.items():
            setattr(content, field, value)
        content.save()
        self.stdout.write(self.style.SUCCESS('Seeded site content'))

        studio = StudioSettings.load()
        studio.studio_display_name = 'Kaka Motors'
        studio.default_currency = 'PKR'
        studio.save()
        self.stdout.write(self.style.SUCCESS('Seeded studio settings (PKR)'))

        if options['skip_vehicles']:
            return

        known_slugs = {item['slug'] for item in VEHICLES}
        for item in VEHICLES:
            ext = item['image'].rsplit('.', 1)[-1]
            slug = item['slug']
            card_url, card_key = store_seed_image(item['image'], f'vehicles/{slug}-card.{ext}')
            hero_url, hero_key = store_seed_image(item['image'], f'vehicles/{slug}-hero.{ext}')
            exterior_url, exterior_key = store_seed_image(item['image'], f'vehicles/{slug}-exterior.{ext}')
            interior_name = item.get('interior') or ''
            interior_ext = interior_name.rsplit('.', 1)[-1] if interior_name else ''
            interior_url, interior_key = (
                store_seed_image(interior_name, f'vehicles/{slug}-interior.{interior_ext}')
                if interior_name
                else ('', '')
            )
            vehicle, _created = Vehicle.objects.update_or_create(
                slug=slug,
                defaults={
                    'name': item['name'],
                    'category': item['category'],
                    'status': Vehicle.Status.PUBLISHED,
                    'status_label': item['status_label'],
                    'summary': item['summary'],
                    'description': item['description'],
                    'interior_story': item['interior_story'],
                    'price_from': item['price_from'],
                    'currency': 'PKR',
                    'specs': item['specs'],
                    'features': item['features'],
                    'sort_order': item['sort_order'],
                    'featured_on_home': item['featured_on_home'],
                    'hero_image_url': hero_url,
                    'hero_image_key': hero_key,
                    'card_image_url': card_url,
                    'card_image_key': card_key,
                },
            )
            vehicle.gallery.all().delete()
            if exterior_url:
                GalleryMedia.objects.create(
                    vehicle=vehicle,
                    kind=GalleryMedia.Kind.IMAGE,
                    image_url=exterior_url,
                    object_key=exterior_key,
                    alt=f'{vehicle.name} exterior',
                    object_position='center',
                    sort_order=0,
                    is_default_exterior=True,
                )
            if interior_url:
                GalleryMedia.objects.create(
                    vehicle=vehicle,
                    kind=GalleryMedia.Kind.IMAGE,
                    image_url=interior_url,
                    object_key=interior_key,
                    alt=f'{vehicle.name} interior',
                    object_position='center',
                    sort_order=1,
                    is_default_interior=True,
                )

        extras = Vehicle.objects.exclude(slug__in=known_slugs)
        extra_count = extras.count()
        if extra_count:
            self.stdout.write(self.style.WARNING(f'Left {extra_count} non-seed vehicles untouched'))

        self.stdout.write(self.style.SUCCESS(f'Seeded {len(VEHICLES)} vehicles'))
