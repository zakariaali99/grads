from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"posts", views.PostViewSet, basename="post")
router.register(r"comments", views.CommentViewSet, basename="comment")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "posts/<uuid:pk>/like/",
        views.PostViewSet.as_view({"post": "like"}),
        name="post-like",
    ),
    path(
        "posts/<uuid:pk>/comments/",
        views.PostViewSet.as_view({"get": "comments"}),
        name="post-comments",
    ),
    path(
        "follow/<uuid:user_id>/",
        views.FollowViewSet.as_view({"post": "follow", "delete": "unfollow"}),
        name="follow-user",
    ),
    path(
        "follow/status/<uuid:user_id>/",
        views.FollowViewSet.as_view({"get": "status"}),
        name="follow-status",
    ),
    path(
        "feed/",
        views.FeedViewSet.as_view({"get": "list"}),
        name="social-feed",
    ),
]
