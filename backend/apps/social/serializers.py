from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Post, PostReaction, Comment, Follow

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "full_name", "username", "avatar"]


class PostReactionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = PostReaction
        fields = ["id", "post", "user", "reaction_type", "created_at"]
        read_only_fields = ["id", "created_at"]


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "post",
            "author",
            "parent",
            "content",
            "image",
            "is_active",
            "created_at",
            "updated_at",
            "replies",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_replies(self, obj):
        if obj.parent is None:
            replies = obj.replies.filter(is_active=True)
            return CommentSerializer(replies, many=True, context=self.context).data
        return []


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    reactions_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    user_reaction = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "author",
            "content",
            "image",
            "is_pinned",
            "created_at",
            "updated_at",
            "reactions_count",
            "comments_count",
            "user_reaction",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_reactions_count(self, obj):
        return obj.reactions.count()

    def get_comments_count(self, obj):
        return obj.comments.filter(is_active=True).count()

    def get_user_reaction(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            reaction = obj.reactions.filter(user=request.user).first()
            if reaction:
                return reaction.reaction_type
        return None


class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = ["id", "follower", "following", "created_at"]
        read_only_fields = ["id", "created_at"]
