"""Responsive image URLs via Cloudflare Image Resizing.

Vehicle bytes stay on R2. When CLOUDFLARE_IMAGE_RESIZE_BASE is set
(e.g. https://kakamotors.com/cdn-cgi/image), we emit width/format
derivatives. Local /media URLs are left untouched.
"""

from django.conf import settings

DERIVATIVE_WIDTHS = (480, 768, 1200, 1600, 1920)


def is_remote_url(url: str) -> bool:
    return bool(url) and url.startswith(('http://', 'https://'))


def resized_url(url: str, width: int, fmt: str = 'auto') -> str:
    base = (getattr(settings, 'CLOUDFLARE_IMAGE_RESIZE_BASE', '') or '').rstrip('/')
    if not url or not base or not is_remote_url(url):
        return url
    options = f'width={width},format={fmt},quality=78,fit=cover'
    return f'{base}/{options}/{url}'


def srcset(url: str, fmt: str = 'auto') -> str:
    if not url or not (getattr(settings, 'CLOUDFLARE_IMAGE_RESIZE_BASE', '') or '').strip():
        return ''
    if not is_remote_url(url):
        return ''
    return ', '.join(f'{resized_url(url, width, fmt)} {width}w' for width in DERIVATIVE_WIDTHS)


def display_url(url: str, width: int = 1600) -> str:
    return resized_url(url, width) if url else ''
