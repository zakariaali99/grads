from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"users", views.AdminUserViewSet, basename="admin-user")
router.register(r"graduates", views.AdminGraduateViewSet, basename="admin-graduate")
router.register(r"companies", views.AdminCompanyViewSet, basename="admin-company")
router.register(r"jobs", views.AdminJobViewSet, basename="admin-job")
router.register(r"audit-logs", views.AdminAuditLogViewSet, basename="admin-audit-log")
router.register(r"platform-events", views.AdminPlatformEventViewSet, basename="admin-platform-event")
router.register(r"daily-stats", views.AdminDailyStatViewSet, basename="admin-daily-stat")

urlpatterns = router.urls
