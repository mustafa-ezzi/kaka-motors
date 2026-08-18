from pathlib import Path

import environ
from csp.constants import NONE, SELF
from django.urls import reverse_lazy
from django.utils.translation import gettext_lazy as _

BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env(
    DEBUG=(bool, False),
    ALLOWED_HOSTS=(list, []),
    CORS_ALLOWED_ORIGINS=(list, []),
)

environ.Env.read_env(BASE_DIR / '.env')

SECRET_KEY = env('SECRET_KEY', default='insecure-dev-key-only')
DEBUG = env('DEBUG')
ALLOWED_HOSTS = env('ALLOWED_HOSTS')
FRONTEND_URL = env('FRONTEND_URL', default='http://localhost:5173')

INSTALLED_APPS = [
    'unfold',
    'unfold.contrib.filters',
    'unfold.contrib.forms',
    'unfold.contrib.inlines',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'django_filters',
    'corsheaders',
    'axes',
    'catalog',
    'leads',
    'studio',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'csp.middleware.CSPMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'axes.middleware.AxesMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

database_url = env('DATABASE_URL', default='')
if database_url:
    DATABASES = {'default': env.db('DATABASE_URL')}
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Karachi'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
EMAIL_BACKEND = env('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='Kaka Motors <studio@kakamotors.local>')

AUTHENTICATION_BACKENDS = [
    'axes.backends.AxesStandaloneBackend',
    'django.contrib.auth.backends.ModelBackend',
]

SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = 'same-origin'
X_FRAME_OPTIONS = 'DENY'
CSRF_TRUSTED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS', default=[])

CONTENT_SECURITY_POLICY = {
    'DIRECTIVES': {
        'default-src': [SELF],
        'base-uri': [SELF],
        'form-action': [SELF],
        'frame-ancestors': [NONE],
        'object-src': [NONE],
        'img-src': [SELF, 'data:', 'blob:', 'https:'],
        'font-src': [SELF, 'data:'],
        'style-src': [SELF, 'unsafe-inline'],
        'script-src': [SELF, 'unsafe-inline'],
        'connect-src': [SELF, 'https://*.sentry.io', 'https://*.ingest.sentry.io'],
    }
}

SENTRY_DSN = env('SENTRY_DSN', default='')
SENTRY_TRACES_SAMPLE_RATE = env.float('SENTRY_TRACES_SAMPLE_RATE', default=0.05)
CLOUDFLARE_IMAGE_RESIZE_BASE = env('CLOUDFLARE_IMAGE_RESIZE_BASE', default='')

AXES_FAILURE_LIMIT = 6
AXES_COOLOFF_TIME = 0.25
AXES_RESET_ON_SUCCESS = True
AXES_LOCKOUT_PARAMETERS = ['username', 'ip_address']
AXES_LOCKOUT_CALLABLE = None

UNFOLD = {
    'SITE_TITLE': 'Kaka Motors',
    'SITE_HEADER': 'Kaka Motors',
    'SITE_SUBHEADER': 'Studio control',
    'SITE_URL': FRONTEND_URL,
    'SITE_SYMBOL': 'directions_car',
    'SHOW_HISTORY': True,
    'SHOW_VIEW_ON_SITE': True,
    'DASHBOARD_CALLBACK': 'config.dashboard.dashboard_callback',
    'ENVIRONMENT': ['Development', 'warning'] if DEBUG else ['Production', 'danger'],
    'COLORS': {
        'primary': {
            '50': 'oklch(97% 0.02 25)',
            '100': 'oklch(94% 0.04 25)',
            '200': 'oklch(88% 0.08 25)',
            '300': 'oklch(78% 0.14 25)',
            '400': 'oklch(68% 0.19 25)',
            '500': 'oklch(63% 0.22 25)',
            '600': 'oklch(57% 0.23 25)',
            '700': 'oklch(50% 0.21 25)',
            '800': 'oklch(42% 0.17 25)',
            '900': 'oklch(35% 0.14 25)',
            '950': 'oklch(24% 0.1 25)',
        },
    },
    'ACCOUNT': {
        'navigation': [
            {
                'title': _('Change password'),
                'link': reverse_lazy('admin:password_change'),
            },
        ],
    },
    'SIDEBAR': {
        'show_search': True,
        'show_all_applications': False,
        'navigation': [
            {
                'title': _('Overview'),
                'items': [
                    {
                        'title': _('Dashboard'),
                        'icon': 'dashboard',
                        'link': reverse_lazy('admin:index'),
                    },
                ],
            },
            {
                'title': _('Catalog'),
                'items': [
                    {
                        'title': _('Vehicles'),
                        'icon': 'directions_car',
                        'link': reverse_lazy('admin:catalog_vehicle_changelist'),
                    },
                ],
            },
            {
                'title': _('Leads'),
                'collapsible': True,
                'items': [
                    {
                        'title': _('Test drives'),
                        'icon': 'event',
                        'link': reverse_lazy('admin:leads_testdriverequest_changelist'),
                        'badge': 'config.dashboard.new_leads_badge',
                    },
                ],
            },
            {
                'title': _('Studio'),
                'collapsible': True,
                'items': [
                    {
                        'title': _('Locations'),
                        'icon': 'location_on',
                        'link': reverse_lazy('admin:studio_studiolocation_changelist'),
                    },
                    {
                        'title': _('Content'),
                        'icon': 'article',
                        'link': reverse_lazy('admin:studio_sitecontent_changelist'),
                    },
                    {
                        'title': _('Settings'),
                        'icon': 'settings',
                        'link': reverse_lazy('admin:studio_studiosettings_changelist'),
                    },
                ],
            },
            {
                'title': _('Access'),
                'separator': True,
                'items': [
                    {
                        'title': _('Staff'),
                        'icon': 'group',
                        'link': reverse_lazy('admin:auth_user_changelist'),
                        'permission': 'config.dashboard.superuser_only',
                    },
                    {
                        'title': _('Audit log'),
                        'icon': 'history',
                        'link': reverse_lazy('admin:admin_logentry_changelist'),
                    },
                ],
            },
        ],
    },
}

CORS_ALLOWED_ORIGINS = env('CORS_ALLOWED_ORIGINS')

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '120/min',
        'user': '300/min',
        'test_drive': '8/min',
    },
    'DEFAULT_PAGINATION_CLASS': None,
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'loggers': {
        'django.request': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Cloudflare R2 — binary files live here. Railway stores image_url only.
CLOUDFLARE_R2_ACCOUNT_ID = env('CLOUDFLARE_R2_ACCOUNT_ID', default='')
CLOUDFLARE_R2_ACCESS_KEY_ID = env('CLOUDFLARE_R2_ACCESS_KEY_ID', default='')
CLOUDFLARE_R2_SECRET_ACCESS_KEY = env('CLOUDFLARE_R2_SECRET_ACCESS_KEY', default='')
CLOUDFLARE_R2_BUCKET_NAME = env('CLOUDFLARE_R2_BUCKET_NAME', default='')
CLOUDFLARE_R2_ENDPOINT_URL = env(
    'CLOUDFLARE_R2_ENDPOINT_URL',
    default='',
)
CLOUDFLARE_R2_PUBLIC_BASE_URL = env('CLOUDFLARE_R2_PUBLIC_BASE_URL', default='')
CLOUDFLARE_R2_MAX_BYTES = 8 * 1024 * 1024
CLOUDFLARE_R2_ALLOWED_TYPES = {
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
}

from config.sentry import init_sentry

init_sentry()
