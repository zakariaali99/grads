from uuid import uuid4
from django.db import models
from django.conf import settings
from django.db.models import Q, F


class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="posts"
    )
    content = models.TextField(max_length=5000)
    image = models.ImageField(upload_to="social/posts/", null=True, blank=True)
    is_pinned = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Post"
        verbose_name_plural = "Posts"

    def __str__(self):
        return f"Post by {self.author} at {self.created_at}"


class PostReaction(models.Model):
    class ReactionType(models.TextChoices):
        LIKE = "like", "Like"
        CELEBRATE = "celebrate", "Celebrate"
        SUPPORT = "support", "Support"
        INSIGHTFUL = "insightful", "Insightful"
        LOVE = "love", "Love"

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="reactions")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reactions"
    )
    reaction_type = models.CharField(max_length=20, choices=ReactionType.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["post", "user"]
        verbose_name = "Post Reaction"
        verbose_name_plural = "Post Reactions"

    def __str__(self):
        return f"{self.user} reacted {self.reaction_type} on {self.post}"


class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="comments"
    )
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="replies",
    )
    content = models.TextField(max_length=2000)
    image = models.ImageField(upload_to="social/comments/", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]
        verbose_name = "Comment"
        verbose_name_plural = "Comments"

    def __str__(self):
        return f"Comment by {self.author} on {self.post}"


class Follow(models.Model):
    follower = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="following"
    )
    following = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="followers"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["follower", "following"]
        constraints = [
            models.CheckConstraint(
                check=~Q(follower=F("following")), name="cannot_follow_self"
            )
        ]
        verbose_name = "Follow"
        verbose_name_plural = "Follows"

    def __str__(self):
        return f"{self.follower} follows {self.following}"
