from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_authenticated:
            self.room_group_name = f"chat_{self.user.id}"
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive_json(self, content):
        action = content.get("action")
        if action == "send_message":
            await self.handle_send_message(content)
        elif action == "mark_read":
            await self.handle_mark_read(content)
        elif action == "typing":
            await self.handle_typing(content)

    async def handle_send_message(self, content):
        conversation_id = content.get("conversation_id")
        message_content = content.get("content")

        message = await self.create_message(conversation_id, message_content)
        if message:
            conversation = await self.get_conversation(conversation_id)
            for participant in conversation.participants.all():
                if participant.id != self.user.id:
                    await self.channel_layer.group_send(
                        f"chat_{participant.id}",
                        {
                            "type": "chat_message",
                            "data": {
                                "type": "new_message",
                                "id": str(message.id),
                                "conversation_id": conversation_id,
                                "sender_id": str(self.user.id),
                                "sender_name": self.user.get_full_name() or self.user.username,
                                "content": message_content,
                                "created_at": message.created_at.isoformat(),
                            },
                        },
                    )

            await self.send_json(
                {
                    "type": "message_sent",
                    "id": str(message.id),
                    "conversation_id": conversation_id,
                    "content": message_content,
                    "created_at": message.created_at.isoformat(),
                }
            )

    async def handle_mark_read(self, content):
        conversation_id = content.get("conversation_id")
        await self.mark_messages_read(conversation_id)

    async def handle_typing(self, content):
        conversation_id = content.get("conversation_id")
        is_typing = content.get("is_typing", False)
        conversation = await self.get_conversation(conversation_id)
        if conversation:
            for participant in conversation.participants.all():
                if participant.id != self.user.id:
                    await self.channel_layer.group_send(
                        f"chat_{participant.id}",
                        {
                            "type": "chat_message",
                            "data": {
                                "type": "typing",
                                "conversation_id": conversation_id,
                                "user_id": str(self.user.id),
                                "is_typing": is_typing,
                            },
                        },
                    )

    async def chat_message(self, event):
        await self.send_json(event["data"])

    @database_sync_to_async
    def create_message(self, conversation_id, content):
        from .models import Conversation, Message

        try:
            conversation = Conversation.objects.get(id=conversation_id)
            if self.user not in conversation.participants.all():
                return None
            message = Message.objects.create(
                conversation=conversation,
                sender=self.user,
                content=content,
            )
            conversation.last_message_at = message.created_at
            conversation.save(update_fields=["last_message_at"])
            return message
        except Conversation.DoesNotExist:
            return None

    @database_sync_to_async
    def get_conversation(self, conversation_id):
        from .models import Conversation

        try:
            return Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return None

    @database_sync_to_async
    def mark_messages_read(self, conversation_id):
        from .models import Message

        Message.objects.filter(
            conversation_id=conversation_id,
            conversation__participants=self.user,
        ).exclude(
            sender=self.user
        ).update(is_read=True)
