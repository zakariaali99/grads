from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"companies", views.CompanyProfileViewSet, basename="company")
router.register(r"industries", views.IndustryViewSet, basename="industry")
router.register(r"reviews", views.CompanyReviewViewSet, basename="company-review")

urlpatterns = router.urls
