import factory
from apps.notifications.models import Notification


class NotificationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Notification

    recipient = factory.SubFactory("apps.accounts.factories.UserFactory")
    notification_type = Notification.Type.SYSTEM
    title = factory.Sequence(lambda n: f"إشعار {n}")
    message = factory.Faker("text", max_nb_chars=200)
    is_read = False
