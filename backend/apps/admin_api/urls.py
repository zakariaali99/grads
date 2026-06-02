from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"users", views.AdminUserViewSet, basename="admin-user")
router.register(r"graduates", views.AdminGraduateViewSet, basename="admin-graduate")
router.register(r"companies", views.AdminCompanyViewSet, basename="admin-company")

urlpatterns = router.urls
