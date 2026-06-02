from django.urls import path
from . import views

urlpatterns = [
    path("admin/", views.AdminAnalyticsView.as_view(), name="analytics-admin"),
    path("employer/", views.EmployerAnalyticsView.as_view(), name="analytics-employer"),
    path("graduate/", views.GraduateAnalyticsView.as_view(), name="analytics-graduate"),
]
