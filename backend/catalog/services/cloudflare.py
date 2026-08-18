from __future__ import annotations

import uuid
from pathlib import Path
from typing import BinaryIO

import boto3
from botocore.client import Config
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured, ValidationError


ALLOWED_TYPES = settings.CLOUDFLARE_R2_ALLOWED_TYPES
EXTENSIONS = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
}
EXT_TO_TYPE = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'avif': 'image/avif',
}


def r2_is_configured() -> bool:
    return bool(
        settings.CLOUDFLARE_R2_ACCESS_KEY_ID
        and settings.CLOUDFLARE_R2_SECRET_ACCESS_KEY
        and settings.CLOUDFLARE_R2_BUCKET_NAME
        and settings.CLOUDFLARE_R2_PUBLIC_BASE_URL
        and (settings.CLOUDFLARE_R2_ENDPOINT_URL or settings.CLOUDFLARE_R2_ACCOUNT_ID)
    )


def sniff_content_type(file_obj) -> str:
    name = (getattr(file_obj, 'name', '') or '').lower()
    if name.endswith('.svg'):
        raise ValidationError('SVG files are not allowed for vehicle photography.')
    declared = (getattr(file_obj, 'content_type', '') or '').split(';')[0].strip()
    if declared in ALLOWED_TYPES:
        return declared
    ext = name.rsplit('.', 1)[-1] if '.' in name else ''
    guessed = EXT_TO_TYPE.get(ext)
    if guessed in ALLOWED_TYPES:
        return guessed
    raise ValidationError('Unsupported image type. Use JPEG, PNG, WebP, or AVIF.')


def _client():
    if not r2_is_configured():
        raise ImproperlyConfigured(
            'Cloudflare R2 is not configured. Set CLOUDFLARE_R2_* in the environment.'
        )

    endpoint = settings.CLOUDFLARE_R2_ENDPOINT_URL
    if not endpoint and settings.CLOUDFLARE_R2_ACCOUNT_ID:
        endpoint = f'https://{settings.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com'

    return boto3.client(
        's3',
        endpoint_url=endpoint,
        aws_access_key_id=settings.CLOUDFLARE_R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
        config=Config(signature_version='s3v4'),
        region_name='auto',
    )


def public_url_for(object_key: str) -> str:
    base = settings.CLOUDFLARE_R2_PUBLIC_BASE_URL.rstrip('/')
    return f'{base}/{object_key}'


def upload_image(file_obj: BinaryIO, content_type: str, folder: str = 'vehicles') -> tuple[str, str]:
    """Upload a file to Cloudflare R2. Returns (public_url, object_key)."""
    if content_type not in ALLOWED_TYPES:
        raise ValidationError('Unsupported image type. Use JPEG, PNG, WebP, or AVIF.')

    size = getattr(file_obj, 'size', None)
    if size is not None and size > settings.CLOUDFLARE_R2_MAX_BYTES:
        raise ValidationError('Image is too large (max 8MB).')

    object_key = f'{folder}/{uuid.uuid4().hex}.{EXTENSIONS[content_type]}'
    _client().upload_fileobj(
        file_obj,
        settings.CLOUDFLARE_R2_BUCKET_NAME,
        object_key,
        ExtraArgs={'ContentType': content_type},
    )
    return public_url_for(object_key), object_key


def delete_image(object_key: str) -> None:
    if not object_key:
        return
    _client().delete_object(Bucket=settings.CLOUDFLARE_R2_BUCKET_NAME, Key=object_key)


def _delete_local(object_key: str) -> None:
    if not object_key:
        return
    path = Path(settings.MEDIA_ROOT) / object_key
    if path.is_file():
        path.unlink()


def delete_stored_image(object_key: str) -> None:
    if not object_key:
        return
    if r2_is_configured():
        try:
            delete_image(object_key)
        except Exception:
            pass
        return
    _delete_local(object_key)


def store_vehicle_image(file_obj, folder: str = 'vehicles', old_key: str = '') -> tuple[str, str]:
    """Store an uploaded image. R2 when configured; local MEDIA_ROOT otherwise.

    Returns (url, object_key). Only the URL (and key) belong in PostgreSQL.
    """
    content_type = sniff_content_type(file_obj)
    size = getattr(file_obj, 'size', None)
    if size is not None and size > settings.CLOUDFLARE_R2_MAX_BYTES:
        raise ValidationError('Image is too large (max 8MB).')

    if r2_is_configured():
        delete_stored_image(old_key)
        if hasattr(file_obj, 'seek'):
            file_obj.seek(0)
        return upload_image(file_obj, content_type, folder)

    if not getattr(settings, 'ALLOW_LOCAL_MEDIA', False):
        raise ImproperlyConfigured(
            'Cloudflare R2 must be configured in production. Image bytes cannot live on Railway.'
        )

    delete_stored_image(old_key)
    object_key = f'{folder}/{uuid.uuid4().hex}.{EXTENSIONS[content_type]}'
    dest = Path(settings.MEDIA_ROOT) / object_key
    dest.parent.mkdir(parents=True, exist_ok=True)
    if hasattr(file_obj, 'chunks'):
        with dest.open('wb') as out:
            for chunk in file_obj.chunks():
                out.write(chunk)
    else:
        if hasattr(file_obj, 'seek'):
            file_obj.seek(0)
        dest.write_bytes(file_obj.read())
    return f'{settings.MEDIA_URL}{object_key}', object_key
