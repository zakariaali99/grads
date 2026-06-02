import os
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.production")
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from apps.notifications.routing import websocket_urlpatterns as notif_ws
from apps.chat.routing import websocket_urlpatterns as chat_ws

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            notif_ws + chat_ws
        )
    ),
})
