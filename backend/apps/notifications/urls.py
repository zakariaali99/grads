from django.urls import path
from . import views

viewset = views.NotificationViewSet

urlpatterns = [
    path("", viewset.as_view({"get": "list"}), name="notification-list"),
    path("<int:pk>/", viewset.as_view({"get": "retrieve"}), name="notification-detail"),
    path("unread-count/", viewset.as_view({"get": "unread_count"}), name="notification-unread"),
    path(
        "<int:pk>/mark-read/", viewset.as_view({"post": "mark_read"}), name="notification-mark-read"
    ),
    path(
        "mark-all-read/",
        viewset.as_view({"post": "mark_all_read"}),
        name="notification-mark-all-read",
    ),
]
