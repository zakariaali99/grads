import factory
import uuid
from apps.chat.models import Conversation, Message


class ConversationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Conversation

    id = factory.LazyFunction(uuid.uuid4)
    subject = factory.Faker("sentence", nb_words=4)
    is_active = True

    @factory.post_generation
    def participants(self, create, extracted, **kwargs):
        if not create:
            return
        if extracted:
            for user in extracted:
                self.participants.add(user)


class MessageFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Message

    id = factory.LazyFunction(uuid.uuid4)
    conversation = factory.SubFactory(ConversationFactory)
    sender = factory.SubFactory("apps.accounts.factories.UserFactory")
    content = factory.Faker("text", max_nb_chars=200)
    is_read = False
