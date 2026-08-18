from .base import *  # noqa: F403

DEBUG = True
ALLOW_LOCAL_MEDIA = True
ALLOWED_HOSTS = ['127.0.0.1', 'localhost']
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5175',
]
