from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"posts", views.JobPostViewSet, basename="job")
router.register(r"applications", views.JobApplicationViewSet, basename="application")
router.register(r"interviews", views.InterviewViewSet, basename="interview")
router.register(r"categories", views.JobCategoryViewSet, basename="job-category")
router.register(r"saved", views.SavedJobViewSet, basename="saved-job")

urlpatterns = router.urls
