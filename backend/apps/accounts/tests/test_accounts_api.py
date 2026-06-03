import pytest
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.accounts.factories import UserFactory, VerificationCodeFactory

User = get_user_model()

REGISTER_URL = "/api/v1/auth/register/"
LOGIN_URL = "/api/v1/auth/login/"
REFRESH_URL = "/api/v1/auth/refresh/"
PROFILE_URL = "/api/v1/auth/profile/"
CHANGE_PASSWORD_URL = "/api/v1/auth/change-password/"
DELETE_ACCOUNT_URL = "/api/v1/auth/delete-account/"
PASSWORD_RESET_URL = "/api/v1/auth/password-reset/"
PASSWORD_RESET_CONFIRM_URL = "/api/v1/auth/password-reset/confirm/"
VERIFY_REQUEST_URL = "/api/v1/auth/verify/request/"
VERIFY_CONFIRM_URL = "/api/v1/auth/verify/confirm/"


@pytest.mark.django_db
class TestRegister:
    def test_register_success(self, api_client):
        data = {
            "username": "newuser",
            "email": "new@example.com",
            "password": "StrongPass1",
            "password_confirm": "StrongPass1",
            "first_name": "أحمد",
            "last_name": "علي",
            "user_type": "graduate",
            "accepted_terms": True,
        }
        response = api_client.post(REGISTER_URL, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["success"] is True

    def test_register_duplicate_username(self, api_client):
        UserFactory(username="taken")
        data = {
            "username": "taken",
            "email": "unique@example.com",
            "password": "StrongPass1",
            "password_confirm": "StrongPass1",
            "first_name": "Test",
            "user_type": "graduate",
            "accepted_terms": True,
        }
        response = api_client.post(REGISTER_URL, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_missing_fields(self, api_client):
        response = api_client.post(REGISTER_URL, {}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_password_mismatch(self, api_client):
        data = {
            "username": "user1",
            "email": "user1@example.com",
            "password": "StrongPass1",
            "password_confirm": "DifferentPass1",
            "user_type": "graduate",
            "accepted_terms": True,
        }
        response = api_client.post(REGISTER_URL, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_without_terms(self, api_client):
        data = {
            "username": "user2",
            "email": "user2@example.com",
            "password": "StrongPass1",
            "password_confirm": "StrongPass1",
            "user_type": "graduate",
            "accepted_terms": False,
        }
        response = api_client.post(REGISTER_URL, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_weak_password(self, api_client):
        data = {
            "username": "user3",
            "email": "user3@example.com",
            "password": "short",
            "password_confirm": "short",
            "user_type": "graduate",
            "accepted_terms": True,
        }
        response = api_client.post(REGISTER_URL, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestLogin:
    def test_login_success_with_username(self, api_client):
        UserFactory(username="logintest", password="TestPass123")
        response = api_client.post(LOGIN_URL, {"username": "logintest", "password": "TestPass123"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data

    def test_login_success_with_email(self, api_client):
        UserFactory(username="loginmail", email="login@example.com", password="TestPass123")
        response = api_client.post(LOGIN_URL, {"username": "login@example.com", "password": "TestPass123"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data

    def test_login_wrong_password(self, api_client):
        UserFactory(username="wrongpass", password="TestPass123")
        response = api_client.post(LOGIN_URL, {"username": "wrongpass", "password": "WrongPass123"}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_inactive_user(self, api_client):
        UserFactory(username="inactive", password="TestPass123", is_active=False)
        response = api_client.post(LOGIN_URL, {"username": "inactive", "password": "TestPass123"}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_nonexistent_user(self, api_client):
        response = api_client.post(LOGIN_URL, {"username": "nobody", "password": "TestPass123"}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestTokenRefresh:
    def test_refresh_success(self, api_client):
        from rest_framework_simplejwt.tokens import RefreshToken

        user = UserFactory()
        refresh = RefreshToken.for_user(user)
        response = api_client.post(REFRESH_URL, {"refresh": str(refresh)}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data

    def test_refresh_invalid_token(self, api_client):
        response = api_client.post(REFRESH_URL, {"refresh": "invalid_token"}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestProfile:
    def test_get_profile_authenticated(self, api_client):
        user = UserFactory(first_name="بروفايل", last_name="اختبار")
        from rest_framework_simplejwt.tokens import RefreshToken

        refresh = RefreshToken.for_user(user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        response = api_client.get(PROFILE_URL)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["first_name"] == "بروفايل"

    def test_get_profile_unauthenticated(self, api_client):
        response = api_client.get(PROFILE_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_profile(self, auth_client):
        client, user = auth_client
        response = client.patch(PROFILE_URL, {"first_name": "محدث", "bio": "نبذة عني"}, format="json")
        assert response.status_code == status.HTTP_200_OK, str(response.data)
        user.refresh_from_db()
        assert user.first_name == "محدث"

    def test_partial_update_profile(self, auth_client):
        client, user = auth_client
        response = client.patch(PROFILE_URL, {"bio": "نبذة محدثة"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.bio == "نبذة محدثة"


@pytest.mark.django_db
class TestChangePassword:
    def test_change_password_success(self, auth_client):
        client, user = auth_client
        response = client.put(
            CHANGE_PASSWORD_URL,
            {
                "old_password": "TestPass123",
                "new_password": "NewStrong1",
                "new_password_confirm": "NewStrong1",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True
        user.refresh_from_db()
        assert user.check_password("NewStrong1")

    def test_change_password_wrong_old(self, auth_client):
        client, user = auth_client
        response = client.put(
            CHANGE_PASSWORD_URL,
            {
                "old_password": "WrongOldPass",
                "new_password": "NewStrong1",
                "new_password_confirm": "NewStrong1",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_change_password_mismatch(self, auth_client):
        client, user = auth_client
        response = client.put(
            CHANGE_PASSWORD_URL,
            {
                "old_password": "TestPass123",
                "new_password": "NewStrong1",
                "new_password_confirm": "Different1",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_change_password_unauthenticated(self, api_client):
        response = api_client.put(
            CHANGE_PASSWORD_URL,
            {"old_password": "x", "new_password": "y", "new_password_confirm": "y"},
            format="json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestDeleteAccount:
    def test_delete_account_authenticated(self, auth_client):
        client, user = auth_client
        response = client.delete(DELETE_ACCOUNT_URL)
        assert response.status_code == status.HTTP_200_OK, str(response.data)
        user.refresh_from_db()
        assert user.is_active is False

    def test_delete_account_unauthenticated(self, api_client):
        response = api_client.delete(DELETE_ACCOUNT_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestPasswordReset:
    def test_password_reset_request_valid_email(self, api_client):
        UserFactory(email="reset@example.com")
        response = api_client.post(PASSWORD_RESET_URL, {"email": "reset@example.com"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True

    def test_password_reset_request_invalid_email(self, api_client):
        response = api_client.post(PASSWORD_RESET_URL, {"email": "nonexistent@example.com"}, format="json")
        assert response.status_code == status.HTTP_200_OK

    def test_password_reset_confirm_success(self, api_client):
        user = UserFactory(email="resetconfirm@example.com", password="OldPass123")
        from apps.accounts.factories import VerificationCodeFactory

        vcode = VerificationCodeFactory(user=user, purpose="password_reset")
        response = api_client.post(
            PASSWORD_RESET_CONFIRM_URL,
            {
                "code": vcode.code,
                "password": "NewStrong1",
                "password_confirm": "NewStrong1",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.check_password("NewStrong1")

    def test_password_reset_confirm_invalid_code(self, api_client):
        UserFactory(email="resetbad@example.com", password="OldPass123")
        response = api_client.post(
            PASSWORD_RESET_CONFIRM_URL,
            {
                "code": "000000",
                "password": "NewStrong1",
                "password_confirm": "NewStrong1",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_password_reset_confirm_mismatch(self, api_client):
        user = UserFactory(email="resetmismatch@example.com")
        from apps.accounts.factories import VerificationCodeFactory

        vcode = VerificationCodeFactory(user=user, purpose="password_reset")
        response = api_client.post(
            PASSWORD_RESET_CONFIRM_URL,
            {
                "code": vcode.code,
                "password": "NewStrong1",
                "password_confirm": "Different1",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestVerification:
    def test_verify_request(self, auth_client):
        client, user = auth_client
        response = client.post(VERIFY_REQUEST_URL, {"purpose": "email"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True

    def test_verify_confirm_success(self, auth_client):
        client, user = auth_client
        from apps.accounts.factories import VerificationCodeFactory

        vcode = VerificationCodeFactory(user=user, purpose="email")
        response = client.post(VERIFY_CONFIRM_URL, {"code": vcode.code, "purpose": "email"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.email_verified is True

    def test_verify_confirm_invalid_code(self, auth_client):
        client, user = auth_client
        response = client.post(VERIFY_CONFIRM_URL, {"code": "000000", "purpose": "email"}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_verify_request_unauthenticated(self, api_client):
        response = api_client.post(VERIFY_REQUEST_URL, {"purpose": "email"}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
