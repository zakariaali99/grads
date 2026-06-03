from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"posts", views.JobPostViewSet, basename="job")
router.register(r"applications", views.JobApplicationViewSet, basename="application")
router.register(r"interviews", views.InterviewViewSet, basename="interview")
router.register(r"categories", views.JobCategoryViewSet, basename="job-category")
router.register(r"saved", views.SavedJobViewSet, basename="saved-job")
router.register(r"pipeline-stages", views.PipelineStageViewSet, basename="pipeline-stage")
router.register(r"scorecards", views.ScorecardViewSet, basename="scorecard")
router.register(r"scorecard-results", views.ScorecardResultViewSet, basename="scorecard-result")

urlpatterns = router.urls + [
    path(
        "applications/<uuid:application_pk>/stage/",
        views.ApplicationStageViewSet.as_view({"get": "list", "post": "create"}),
        name="application-stage",
    ),
    path(
        "scorecards/<int:scorecard_pk>/criteria/",
        views.ScorecardCriterionViewSet.as_view({"get": "list", "post": "create", "put": "update", "patch": "partial_update", "delete": "destroy"}),
        name="scorecard-criteria",
    ),
]
