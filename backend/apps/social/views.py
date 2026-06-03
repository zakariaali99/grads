from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _

from .models import Post, PostReaction, Comment, Follow
from .serializers import PostSerializer, PostReactionSerializer, CommentSerializer, FollowSerializer


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Post.objects.filter(is_active=True).select_related("author")
        author_id = self.request.query_params.get("author")
        if author_id:
            qs = qs.filter(author_id=author_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            self.permission_denied(self.request)
        instance.is_active = False
        instance.save()

    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        post = self.get_object()
        reaction_type = request.data.get("reaction_type", "like")

        reaction, created = PostReaction.objects.get_or_create(
            post=post,
            user=request.user,
            defaults={"reaction_type": reaction_type},
        )

        if not created:
            if reaction.reaction_type == reaction_type:
                reaction.delete()
                return Response({"liked": False})
            else:
                reaction.reaction_type = reaction_type
                reaction.save()

        if post.author != request.user:
            from apps.notifications.consumers import send_notification
            send_notification(
                recipient=post.author,
                notification_type="system",
                title=_("تفاعل جديد"),
                message=f"{request.user.get_full_name() or request.user.username} {_('تفاعل مع منشورك')}",
                data={"post_id": str(post.id), "reaction_type": reaction_type},
            )

        return Response({"liked": True, "reaction_type": reaction_type})

    @action(detail=True, methods=["get"])
    def comments(self, request, pk=None):
        post = self.get_object()
        comments = Comment.objects.filter(post=post, parent=None, is_active=True)
        serializer = CommentSerializer(comments, many=True, context={"request": request})
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(is_active=True).select_related("author")

    def perform_create(self, serializer):
        post_id = self.request.data.get("post")
        post = get_object_or_404(Post, id=post_id, is_active=True)
        comment = serializer.save(author=self.request.user, post=post)
        if post.author != self.request.user:
            from apps.notifications.consumers import send_notification
            send_notification(
                recipient=post.author,
                notification_type="system",
                title=_("تعليق جديد"),
                message=f"{self.request.user.get_full_name() or self.request.user.username} {_('علق على منشورك')}",
                data={"post_id": str(post.id), "comment_id": str(comment.id)},
            )

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            self.permission_denied(self.request)
        instance.is_active = False
        instance.save()


class FollowViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["post"], url_path=r"(?P<user_id>[^/.]+)")
    def follow(self, request, user_id=None):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        target = get_object_or_404(User, id=user_id)

        if target == request.user:
            return Response(
                {"error": "Cannot follow yourself"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        _, created = Follow.objects.get_or_create(
            follower=request.user, following=target
        )

        if created:
            from apps.notifications.consumers import send_notification
            send_notification(
                recipient=target,
                notification_type="system",
                title=_("متابعة جديدة"),
                message=f"{request.user.get_full_name() or request.user.username} {_('بدأ متابعتك')}",
                data={"follower_id": str(request.user.id)},
            )
            return Response({"following": True})
        return Response({"following": True, "detail": "Already following"})

    @action(detail=False, methods=["delete"], url_path=r"(?P<user_id>[^/.]+)")
    def unfollow(self, request, user_id=None):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        target = get_object_or_404(User, id=user_id)

        deleted, _ = Follow.objects.filter(
            follower=request.user, following=target
        ).delete()

        if deleted:
            return Response({"following": False})
        return Response(
            {"error": "Not following this user"},
            status=status.HTTP_404_NOT_FOUND,
        )

    @action(detail=False, methods=["get"], url_path=r"status/(?P<user_id>[^/.]+)")
    def status(self, request, user_id=None):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        target = get_object_or_404(User, id=user_id)

        is_following = Follow.objects.filter(
            follower=request.user, following=target
        ).exists()
        followers_count = Follow.objects.filter(following=target).count()
        following_count = Follow.objects.filter(follower=target).count()

        return Response({
            "is_following": is_following,
            "followers_count": followers_count,
            "following_count": following_count,
        })


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = get_object_or_404(User, id=user_id, is_active=True)

        followers_count = Follow.objects.filter(following=user).count()
        following_count = Follow.objects.filter(follower=user).count()
        posts_count = Post.objects.filter(author=user, is_active=True).count()
        is_following = Follow.objects.filter(follower=request.user, following=user).exists() if request.user != user else False

        return Response({
            "id": str(user.id),
            "username": user.username,
            "full_name": user.get_full_name() or user.username,
            "avatar": user.avatar.url if user.avatar else None,
            "user_type": user.user_type,
            "followers_count": followers_count,
            "following_count": following_count,
            "posts_count": posts_count,
            "is_following": is_following,
            "is_own_profile": request.user == user,
        })


class FeedViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        following_users = Follow.objects.filter(
            follower=request.user
        ).values_list("following", flat=True)

        posts = Post.objects.filter(
            Q(author__in=following_users) | Q(author=request.user),
            is_active=True,
        ).select_related("author").order_by("-created_at")

        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = PostSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)

        serializer = PostSerializer(posts, many=True, context={"request": request})
        return Response(serializer.data)

    @property
    def paginator(self):
        if not hasattr(self, "_paginator"):
            from rest_framework.pagination import PageNumberPagination
            self._paginator = PageNumberPagination()
            self._paginator.page_size = 20
        return self._paginator

    def paginate_queryset(self, queryset):
        return self.paginator.paginate_queryset(queryset, self.request)

    def get_paginated_response(self, data):
        return self.paginator.get_paginated_response(data)
