from .base import *

DEBUG = True
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS += ["debug_toolbar"]
MIDDLEWARE = ["debug_toolbar.middleware.DebugToolbarMiddleware"] + MIDDLEWARE

INTERNAL_IPS = ["127.0.0.1", "localhost"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    }
}

CELERY_TASK_ALWAYS_EAGER = True
CELERY_BROKER_URL = "memory://"
CELERY_RESULT_BACKEND = "cache+memory://"

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"

CORS_ALLOW_ALL_ORIGINS = True

LOGGING["root"]["level"] = "DEBUG"

# Remove services that need external dependencies for dev
INSTALLED_APPS = [app for app in INSTALLED_APPS if app not in [
    "django_elasticsearch_dsl",
    "django_elasticsearch_dsl_drf",
    "axes",
    "captcha",
    "anymail",
    "storages",
    "health_check.contrib.celery",
]]

MIDDLEWARE = [m for m in MIDDLEWARE if "axes" not in m]

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer", "JWT"),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "TOKEN_OBTAIN_SERIALIZER": "apps.accounts.serializers.CustomTokenObtainPairSerializer",
    "TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSerializer",
}
