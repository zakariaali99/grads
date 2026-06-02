from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer, ConversationCreateSerializer


class ConversationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_serializer_class(self):
        if self.action == "create":
            return ConversationCreateSerializer
        return ConversationSerializer

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user).prefetch_related("participants")

    def perform_create(self, serializer):
        conversation = serializer.save()
        conversation.participants.add(self.request.user)
        return conversation

    @action(detail=True, methods=["get"])
    def messages(self, request, pk=None):
        conversation = self.get_object()
        messages = Message.objects.filter(conversation=conversation)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Message.objects.filter(conversation__participants=self.request.user)

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
