from django.contrib import admin
from .models import Post, PostReaction, Comment, Follow


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ["id", "author", "content_preview", "is_pinned", "is_active", "created_at"]
    list_filter = ["is_pinned", "is_active", "created_at"]
    search_fields = ["author__username", "author__full_name", "content"]

    def content_preview(self, obj):
        return obj.content[:75] + "..." if len(obj.content) > 75 else obj.content
    content_preview.short_description = "Content"


@admin.register(PostReaction)
class PostReactionAdmin(admin.ModelAdmin):
    list_display = ["id", "post", "user", "reaction_type", "created_at"]
    list_filter = ["reaction_type"]


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ["id", "post", "author", "content_preview", "is_active", "created_at"]
    list_filter = ["is_active", "created_at"]
    search_fields = ["author__username", "author__full_name", "content"]

    def content_preview(self, obj):
        return obj.content[:75] + "..." if len(obj.content) > 75 else obj.content
    content_preview.short_description = "Content"


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ["id", "follower", "following", "created_at"]
    list_filter = ["created_at"]
