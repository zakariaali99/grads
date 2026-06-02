from django.urls import path
from . import views

urlpatterns = [
    path("", views.NotificationViewSet.as_view({"get": "list"}), name="notification-list"),
    path("unread-count/", views.NotificationViewSet.as_view({"get": "unread_count"}), name="notification-unread"),
    path("<int:pk>/mark-read/", views.NotificationViewSet.as_view({"post": "mark_read"}), name="notification-mark-read"),
    path("mark-all-read/", views.NotificationViewSet.as_view({"post": "mark_all_read"}), name="notification-mark-all-read"),
]
