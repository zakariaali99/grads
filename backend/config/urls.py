from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

api_patterns = [
    path("auth/", include("apps.accounts.urls")),
    path("graduates/", include("apps.graduates.urls")),
    path("employers/", include("apps.employers.urls")),
    path("jobs/", include("apps.jobs.urls")),
    path("analytics/", include("apps.analytics.urls")),
    path("notifications/", include("apps.notifications.urls")),
    path("chat/", include("apps.chat.urls")),
    path("search/", include("apps.search.urls")),
    path("ai/", include("apps.ai.urls")),
    path("admin/", include("apps.admin_api.urls")),
    path("", include("apps.ads.urls")),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include(api_patterns)),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

    if "debug_toolbar" in settings.INSTALLED_APPS:
        urlpatterns += [path("__debug__/", include("debug_toolbar.urls"))]
