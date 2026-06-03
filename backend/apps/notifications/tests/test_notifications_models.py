import pytest
from apps.notifications.models import Notification, Announcement
from apps.notifications.factories import NotificationFactory
from apps.accounts.factories import UserFactory


@pytest.mark.django_db
class TestNotificationModel:
    def test_create_notification(self):
        notif = NotificationFactory()
        assert notif.pk is not None

    def test_notification_str(self):
        notif = NotificationFactory(title="مرحباً", notification_type=Notification.Type.SYSTEM)
        assert "النظام" in str(notif)
        assert "مرحباً" in str(notif)

    def test_notification_read_default(self):
        notif = NotificationFactory()
        assert notif.is_read is False

    def test_notification_recipient_relation(self):
        user = UserFactory()
        notif = NotificationFactory(recipient=user)
        assert notif.recipient == user
        assert user.notifications.count() == 1

    def test_notification_ordering(self):
        NotificationFactory()
        NotificationFactory()
        notifs = Notification.objects.all()
        assert len(notifs) == 2

    def test_notification_indexes(self):
        index_fields = [idx.fields for idx in Notification._meta.indexes]
        assert ["recipient", "is_read"] in index_fields
        assert ["notification_type"] in index_fields


@pytest.mark.django_db
class TestAnnouncementModel:
    def test_create_announcement(self):
        announcement = Announcement.objects.create(
            title="إعلان مهم",
            content="محتوى الإعلان",
            target_roles=["graduate", "employer"],
        )
        assert announcement.pk is not None
        assert announcement.is_active is True
