import pytest
from rest_framework import status
from apps.chat.factories import ConversationFactory, MessageFactory
from apps.accounts.factories import UserFactory

CONVERSATIONS_URL = "/api/v1/chat/conversations/"
MESSAGES_URL = "/api/v1/chat/messages/"


@pytest.mark.django_db
class TestConversationAPI:
    def test_list_conversations(self, auth_client):
        client, user = auth_client
        other = UserFactory()
        conv = ConversationFactory()
        conv.participants.add(user, other)
        response = client.get(CONVERSATIONS_URL)
        assert response.status_code == status.HTTP_200_OK

    def test_create_conversation(self, auth_client):
        client, user = auth_client
        other = UserFactory()
        response = client.post(
            CONVERSATIONS_URL,
            {"participant_ids": [str(other.pk)], "subject": "موضوع المحادثة"},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED, str(response.data)

    def test_retrieve_conversation(self, auth_client):
        client, user = auth_client
        other = UserFactory()
        conv = ConversationFactory()
        conv.participants.add(user, other)
        response = client.get(f"{CONVERSATIONS_URL}{conv.pk}/")
        assert response.status_code == status.HTTP_200_OK

    def test_get_messages(self, auth_client):
        client, user = auth_client
        other = UserFactory()
        conv = ConversationFactory()
        conv.participants.add(user, other)
        MessageFactory(conversation=conv, sender=other)
        response = client.get(f"{CONVERSATIONS_URL}{conv.pk}/messages/")
        assert response.status_code == status.HTTP_200_OK

    def test_unauthenticated(self, api_client):
        response = api_client.get(CONVERSATIONS_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestMessageAPI:
    def test_list_messages(self, auth_client):
        client, user = auth_client
        other = UserFactory()
        conv = ConversationFactory()
        conv.participants.add(user, other)
        MessageFactory(conversation=conv, sender=other)
        response = client.get(MESSAGES_URL)
        assert response.status_code == status.HTTP_200_OK

    def test_send_message(self, auth_client):
        client, user = auth_client
        other = UserFactory()
        conv = ConversationFactory()
        conv.participants.add(user, other)
        response = client.post(
            MESSAGES_URL,
            {"conversation": conv.pk, "content": "مرحباً!"},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_send_message_unauthenticated(self, api_client):
        response = api_client.post(MESSAGES_URL, {"content": "test"}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
