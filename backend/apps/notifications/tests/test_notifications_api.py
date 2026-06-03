import pytest
from rest_framework import status
from apps.notifications.factories import NotificationFactory

NOTIFICATIONS_URL = "/api/v1/notifications/"


@pytest.mark.django_db
class TestNotificationAPI:
    def test_list_notifications(self, auth_client):
        client, user = auth_client
        NotificationFactory(recipient=user)
        NotificationFactory(recipient=user)
        response = client.get(NOTIFICATIONS_URL)
        assert response.status_code == status.HTTP_200_OK

    def test_unread_count(self, auth_client):
        client, user = auth_client
        NotificationFactory(recipient=user, is_read=False)
        NotificationFactory(recipient=user, is_read=True)
        response = client.get(f"{NOTIFICATIONS_URL}unread-count/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1

    def test_mark_read(self, auth_client):
        client, user = auth_client
        notif = NotificationFactory(recipient=user, is_read=False)
        response = client.post(f"{NOTIFICATIONS_URL}{notif.pk}/mark-read/")
        assert response.status_code == status.HTTP_200_OK
        notif.refresh_from_db()
        assert notif.is_read is True

    def test_mark_all_read(self, auth_client):
        client, user = auth_client
        NotificationFactory(recipient=user, is_read=False)
        NotificationFactory(recipient=user, is_read=False)
        response = client.post(f"{NOTIFICATIONS_URL}mark-all-read/")
        assert response.status_code == status.HTTP_200_OK
        assert user.notifications.filter(is_read=False).count() == 0

    def test_unauthenticated(self, api_client):
        response = api_client.get(NOTIFICATIONS_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
