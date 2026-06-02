from django.contrib import admin
from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ["id", "subject", "is_active", "last_message_at", "created_at"]
    list_filter = ["is_active"]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["sender", "conversation", "is_read", "created_at"]
    list_filter = ["is_read"]
    search_fields = ["sender__username", "content"]
