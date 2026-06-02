from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("admin/ads", views.AdvertisementViewSet, basename="ad-admin")
router.register("ads", views.PublicAdViewSet, basename="ad-public")

urlpatterns = [
    path("", include(router.urls)),
]
