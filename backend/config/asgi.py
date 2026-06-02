import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.production")
django_asgi_app = get_asgi_application()

from apps.notifications.routing import websocket_urlpatterns as notif_ws  # noqa: E402
from apps.chat.routing import websocket_urlpatterns as chat_ws  # noqa: E402

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            notif_ws + chat_ws
        )
    ),
})
