from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
import json

User = get_user_model()


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_authenticated:
            self.room_group_name = f"notifications_{self.user.id}"
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
            unread = await self.get_unread_count()
            await self.send_json({"type": "unread_count", "count": unread})
        else:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive_json(self, content):
        action = content.get("action")
        if action == "mark_read":
            notification_id = content.get("notification_id")
            await self.mark_notification_read(notification_id)
            unread = await self.get_unread_count()
            await self.send_json({"type": "unread_count", "count": unread})
        elif action == "mark_all_read":
            await self.mark_all_read()
            await self.send_json({"type": "unread_count", "count": 0})

    async def notification_message(self, event):
        await self.send_json(event["data"])

    @database_sync_to_async
    def get_unread_count(self):
        from .models import Notification
        return Notification.objects.filter(recipient=self.user, is_read=False).count()

    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        from .models import Notification
        Notification.objects.filter(id=notification_id, recipient=self.user).update(is_read=True)

    @database_sync_to_async
    def mark_all_read(self):
        from .models import Notification
        Notification.objects.filter(recipient=self.user, is_read=False).update(is_read=True)


def send_notification(recipient, notification_type, title, message, data=None):
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync
    from .models import Notification

    notification = Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        data=data,
    )

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"notifications_{recipient.id}",
        {
            "type": "notification_message",
            "data": {
                "type": "new_notification",
                "id": str(notification.id),
                "notification_type": notification_type,
                "title": title,
                "message": message,
                "data": data,
                "created_at": notification.created_at.isoformat(),
            },
        },
    )
