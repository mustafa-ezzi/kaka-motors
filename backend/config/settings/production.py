from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403

DEBUG = False
ALLOW_LOCAL_MEDIA = False
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = env.bool('SECURE_SSL_REDIRECT', default=True)  # noqa: F405
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
CORS_ALLOW_ALL_ORIGINS = False
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

if not CORS_ALLOWED_ORIGINS:  # noqa: F405
    raise ImproperlyConfigured('Production requires CORS_ALLOWED_ORIGINS. Do not allow all origins.')

if not CSRF_TRUSTED_ORIGINS:  # noqa: F405
    raise ImproperlyConfigured('Production requires CSRF_TRUSTED_ORIGINS (https://your-domain).')

if not (
    CLOUDFLARE_R2_ACCESS_KEY_ID  # noqa: F405
    and CLOUDFLARE_R2_SECRET_ACCESS_KEY  # noqa: F405
    and CLOUDFLARE_R2_BUCKET_NAME  # noqa: F405
    and CLOUDFLARE_R2_PUBLIC_BASE_URL  # noqa: F405
    and (CLOUDFLARE_R2_ENDPOINT_URL or CLOUDFLARE_R2_ACCOUNT_ID)  # noqa: F405
):
    raise ImproperlyConfigured(
        'Production requires Cloudflare R2. Image bytes must not live on Railway.'
    )
