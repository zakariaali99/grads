from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"profiles", views.InstitutionProfileViewSet, basename="institution-profile")
router.register(r"graduates", views.GraduateTrackingViewSet, basename="institution-graduate")
router.register(r"partnerships", views.InstitutionPartnershipViewSet, basename="institution-partnership")
router.register(r"feedback", views.CurriculumFeedbackViewSet, basename="institution-feedback")
router.register(r"dashboard", views.InstitutionDashboardView, basename="institution-dashboard")

urlpatterns = router.urls
