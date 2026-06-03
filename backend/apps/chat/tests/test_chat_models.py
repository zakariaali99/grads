import pytest
from apps.chat.models import Conversation, Message
from apps.chat.factories import ConversationFactory, MessageFactory
from apps.accounts.factories import UserFactory


@pytest.mark.django_db
class TestConversationModel:
    def test_create_conversation(self):
        conv = ConversationFactory()
        assert conv.pk is not None

    def test_conversation_str(self):
        conv = ConversationFactory()
        assert "Conversation" in str(conv)

    def test_conversation_participants(self):
        user1 = UserFactory()
        user2 = UserFactory()
        conv = ConversationFactory()
        conv.participants.add(user1, user2)
        assert conv.participants.count() == 2

    def test_conversation_default_active(self):
        conv = ConversationFactory()
        assert conv.is_active is True


@pytest.mark.django_db
class TestMessageModel:
    def test_create_message(self):
        msg = MessageFactory()
        assert msg.pk is not None

    def test_message_str(self):
        user = UserFactory(username="testuser")
        msg = MessageFactory(sender=user, content="Hello World")
        assert "testuser" in str(msg)
        assert "Hello World" in str(msg)

    def test_message_read_default(self):
        msg = MessageFactory()
        assert msg.is_read is False

    def test_message_ordering(self):
        conv = ConversationFactory()
        msg1 = MessageFactory(conversation=conv)
        msg2 = MessageFactory(conversation=conv)
        messages = Message.objects.filter(conversation=conv)
        assert messages[0] == msg1

    def test_message_conversation_relation(self):
        conv = ConversationFactory()
        msg = MessageFactory(conversation=conv)
        assert msg.conversation == conv
