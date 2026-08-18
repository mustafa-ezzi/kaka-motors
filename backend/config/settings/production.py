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

railway_domain = env('RAILWAY_PUBLIC_DOMAIN', default='')  # noqa: F405
if railway_domain:
    ALLOWED_HOSTS = list({*ALLOWED_HOSTS, railway_domain, '.up.railway.app'})  # noqa: F405
    origin = f'https://{railway_domain}'
    if origin not in CSRF_TRUSTED_ORIGINS:  # noqa: F405
        CSRF_TRUSTED_ORIGINS = [*CSRF_TRUSTED_ORIGINS, origin]  # noqa: F405

frontend = (FRONTEND_URL or '').rstrip('/')  # noqa: F405
if frontend.startswith('http') and frontend not in CORS_ALLOWED_ORIGINS:  # noqa: F405
    CORS_ALLOWED_ORIGINS = [*CORS_ALLOWED_ORIGINS, frontend]  # noqa: F405
if frontend.startswith('http') and frontend not in CSRF_TRUSTED_ORIGINS:  # noqa: F405
    CSRF_TRUSTED_ORIGINS = [*CSRF_TRUSTED_ORIGINS, frontend]  # noqa: F405

if not ALLOWED_HOSTS:  # noqa: F405
    ALLOWED_HOSTS = ['.up.railway.app', '127.0.0.1', 'localhost']  # noqa: F405

if not CORS_ALLOWED_ORIGINS:  # noqa: F405
    raise ImproperlyConfigured(
        'Set FRONTEND_URL or CORS_ALLOWED_ORIGINS to your public site origin, e.g. https://kaka-motors.up.railway.app'
    )

if not CSRF_TRUSTED_ORIGINS:  # noqa: F405
    raise ImproperlyConfigured('Set CSRF_TRUSTED_ORIGINS or FRONTEND_URL to an https origin.')

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
