from .base import *

DEBUG = False
ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", ".jreejoon.ly").split(",")

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"

CORS_ALLOWED_ORIGINS = os.environ.get("CORS_ALLOWED_ORIGINS", "https://app.jreejoon.ly").split(",")

LOGGING["handlers"]["sentry"] = {
    "class": "sentry_sdk.integrations.logging.EventHandler",
    "level": "ERROR",
}

LOGGING["root"]["handlers"].append("sentry")
