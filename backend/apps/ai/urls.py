from django.urls import path
from . import views

urlpatterns = [
    path("parse-cv/", views.ParseCVView.as_view(), name="ai-parse-cv"),
    path("rank-candidates/<uuid:job_id>/", views.CandidateRankingView.as_view(), name="ai-rank-candidates"),
    path("job-recommendations/", views.JobRecommendationsView.as_view(), name="ai-job-recommendations"),
    path(
        "graduate-recommendations/<uuid:job_id>/",
        views.GraduateRecommendationsView.as_view(),
        name="ai-graduate-recommendations",
    ),
    path("fraud-check/", views.FraudCheckView.as_view(), name="ai-fraud-check"),
    path("skill-analysis/", views.SkillAnalysisView.as_view(), name="ai-skill-analysis"),
]
