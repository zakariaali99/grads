from rest_framework import serializers
from .models import Conversation, Message


class ConversationSerializer(serializers.ModelSerializer):
    participant_names = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = "__all__"

    def get_participant_names(self, obj):
        return [p.get_full_name() or p.username for p in obj.participants.all()]

    def get_last_message(self, obj):
        msg = obj.messages.order_by("-created_at").first()
        if msg:
            return {
                "content": msg.content[:100],
                "sender": str(msg.sender.id),
                "created_at": msg.created_at.isoformat(),
            }
        return None


class ConversationCreateSerializer(serializers.ModelSerializer):
    participant_ids = serializers.ListField(child=serializers.UUIDField(), write_only=True)

    class Meta:
        model = Conversation
        fields = ["id", "subject", "job", "participant_ids"]

    def create(self, validated_data):
        participant_ids = validated_data.pop("participant_ids")
        conversation = Conversation.objects.create(**validated_data)
        conversation.participants.add(*participant_ids)
        return conversation


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.get_full_name", read_only=True)

    class Meta:
        model = Message
        fields = "__all__"
        read_only_fields = ["sender", "is_read", "read_at"]
