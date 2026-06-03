import os
from datetime import timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "change-me-in-production")

DEBUG = False

ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "*").split(",")

DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.messages",
    "daphne",
    "django.contrib.staticfiles",
    "django.contrib.humanize",
    "django.contrib.sites",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
    "ckeditor",
    "modeltranslation",
    "import_export",
    "django_extensions",
    "health_check",
    "health_check.db",
    "health_check.cache",
    "health_check.storage",
    "health_check.contrib.celery",
    "channels",
    "drf_spectacular",
    "anymail",
    "phonenumber_field",
    "mptt",
    "guardian",
    "axes",
    "captcha",
    "simple_history",
    "background_task",
    "storages",
    "django_elasticsearch_dsl",
    "django_elasticsearch_dsl_drf",
]

LOCAL_APPS = [
    "apps.accounts",
    "apps.graduates",
    "apps.employers",
    "apps.jobs",
    "apps.analytics",
    "apps.notifications",
    "apps.chat",
    "apps.search",
    "apps.ai",
    "apps.ads",
    "apps.social",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "simple_history.middleware.HistoryRequestMiddleware",
    "axes.middleware.AxesMiddleware",
    "apps.accounts.middleware.AuditLogMiddleware",
    "apps.accounts.middleware.DeviceTrackingMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("POSTGRES_DB", "jreejoon"),
        "USER": os.environ.get("POSTGRES_USER", "jreejoon"),
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD", "jreejoon"),
        "HOST": os.environ.get("POSTGRES_HOST", "localhost"),
        "PORT": os.environ.get("POSTGRES_PORT", "5432"),
        "ATOMIC_REQUESTS": True,
        "CONN_MAX_AGE": 60,
        "OPTIONS": {"connect_timeout": 10},
    }
}

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": os.environ.get("REDIS_URL", "redis://localhost:6379/0"),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "CONNECTION_POOL_CLASS": "redis.BlockingConnectionPool",
            "CONNECTION_POOL_CLASS_KWARGS": {"max_connections": 50, "timeout": 20},
            "MAX_CONNECTIONS": 1000,
            "PICKLE_VERSION": -1,
        },
        "KEY_PREFIX": "jreejoon",
    }
}

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [os.environ.get("REDIS_URL", "redis://localhost:6379/0")],
            "symmetric_encryption_keys": [SECRET_KEY],
        },
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
    {"NAME": "apps.accounts.validators.ArabicPasswordValidator"},
]

LANGUAGE_CODE = "ar"
TIME_ZONE = "Africa/Tripoli"
USE_I18N = True
USE_L10N = True
USE_TZ = True

LANGUAGES = [
    ("ar", "العربية"),
    ("en", "English"),
]

LOCALE_PATHS = [BASE_DIR / "locale"]

SITE_ID = 1

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = "accounts.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_PAGINATION_CLASS": "apps.accounts.pagination.StandardPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.FormParser",
        "rest_framework.parsers.MultiPartParser",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "EXCEPTION_HANDLER": "apps.accounts.exceptions.custom_exception_handler",
    "DATETIME_FORMAT": "%Y-%m-%dT%H:%M:%S%z",
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {"anon": "100/hour", "user": "1000/hour"},
    "NUM_PROXIES": 1,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=24),
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

SPECTACULAR_SETTINGS = {
    "TITLE": "Jreejoon API",
    "DESCRIPTION": "Enterprise Graduate Recruitment & Verification Platform",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SWAGGER_UI_DIST": "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/",
    "SWAGGER_UI_FAVICON_HREF": "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/favicon-32x32.png",
    "REDOC_DIST": "https://cdn.jsdelivr.net/npm/redoc@next/bundles/",
    "COMPONENT_SPLIT_REQUEST": True,
    "POSTPROCESSING_HOOKS": [],
    "ENUM_NAME_OVERRIDES": {
        "UserType": "apps.accounts.models.User.UserType",
        "Gender": "apps.graduates.models.GraduateProfile.Gender",
        "JobStatus": "apps.jobs.models.JobPost.Status",
    },
}

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = os.environ.get("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8000").split(",")
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = ["*"]

CSRF_TRUSTED_ORIGINS = os.environ.get("CSRF_TRUSTED_ORIGINS", "http://localhost:3000").split(",")

CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/1")
CELERY_RESULT_BACKEND = os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379/1")
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "Africa/Tripoli"
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60
CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"

ELASTICSEARCH_DSL = {
    "default": {
        "hosts": os.environ.get("ELASTICSEARCH_HOST", "localhost:9200"),
        "timeout": 30,
        "http_auth": (
            os.environ.get("ELASTICSEARCH_USER", ""),
            os.environ.get("ELASTICSEARCH_PASSWORD", ""),
        ),
    }
}

EMAIL_BACKEND = os.environ.get("EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend")
EMAIL_HOST = os.environ.get("EMAIL_HOST", "")
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", 587))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "noreply@jreejoon.ly")

ANYMAIL = {
    "MAILGUN_API_KEY": os.environ.get("MAILGUN_API_KEY", ""),
    "MAILGUN_SENDER_DOMAIN": os.environ.get("MAILGUN_SENDER_DOMAIN", ""),
}

AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY", "")
AWS_STORAGE_BUCKET_NAME = os.environ.get("AWS_STORAGE_BUCKET_NAME", "jreejoon")
AWS_S3_REGION_NAME = os.environ.get("AWS_S3_REGION_NAME", "eu-west-1")
AWS_S3_CUSTOM_DOMAIN = os.environ.get("AWS_S3_CUSTOM_DOMAIN", "")
AWS_S3_FILE_OVERWRITE = False
AWS_DEFAULT_ACL = "private"
AWS_S3_VERIFY = True
AWS_S3_OBJECT_PARAMETERS = {"CacheControl": "max-age=86400"}

DEFAULT_FILE_STORAGE = os.environ.get(
    "DEFAULT_FILE_STORAGE", "django.core.files.storage.FileSystemStorage"
)

AXES_ENABLED = True
AXES_FAILURE_LIMIT = 5
AXES_COOLOFF_TIME = 1
AXES_LOCK_OUT_BY_COMBINATION_USER_AND_IP = True
AXES_RESET_ON_SUCCESS = True
AXES_ONLY_USER_FAILURES = False

SILENCED_SYSTEM_CHECKS = ["security.W001"]

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
        "simple": {"format": "{levelname} {message}", "style": "{"},
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "verbose"},
        "file": {
            "class": "logging.FileHandler",
            "filename": BASE_DIR / "logs" / "django.log",
            "formatter": "verbose",
        },
    },
    "root": {"handlers": ["console", "file"], "level": "INFO"},
    "loggers": {
        "django": {"handlers": ["console", "file"], "level": "INFO", "propagate": False},
        "apps": {"handlers": ["console", "file"], "level": "DEBUG", "propagate": False},
    },
}

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = os.environ.get("SECURE_SSL_REDIRECT", "False").lower() == "true"
SESSION_COOKIE_SECURE = os.environ.get("SESSION_COOKIE_SECURE", "False").lower() == "true"
CSRF_COOKIE_SECURE = os.environ.get("CSRF_COOKIE_SECURE", "False").lower() == "true"
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
X_FRAME_OPTIONS = "DENY"
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
