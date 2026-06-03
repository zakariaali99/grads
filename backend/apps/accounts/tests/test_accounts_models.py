import pytest
from apps.accounts.models import User, VerificationCode, AuditLog, LoginAttempt
from apps.accounts.factories import UserFactory, VerificationCodeFactory


@pytest.mark.django_db
class TestUserModel:
    def test_create_user(self):
        user = UserFactory()
        assert user.pk is not None
        assert user.username.startswith("user_")
        assert user.check_password("TestPass123")

    def test_user_str_representation(self):
        user = UserFactory(first_name="أحمد", last_name="علي", username="ahmed")
        assert "أحمد علي" in str(user)

    def test_user_str_without_full_name(self):
        user = UserFactory(first_name="", last_name="", username="testuser")
        assert "testuser" in str(user)

    def test_user_type_default(self):
        user = UserFactory()
        assert user.user_type == User.UserType.GRADUATE

    def test_user_type_choices(self):
        user1 = UserFactory(user_type=User.UserType.EMPLOYER)
        assert user1.user_type == "employer"
        user2 = UserFactory(user_type=User.UserType.ADMIN)
        assert user2.user_type == "admin"

    def test_unique_username(self):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        User.objects.create(username="unique_guy")
        with pytest.raises(Exception):
            User.objects.create(username="unique_guy")

    def test_unique_phone(self):
        UserFactory(phone="+218911234567")
        with pytest.raises(Exception):
            user2 = User()
            user2.username = "phone_dup_user"
            user2.email = "phone_dup@example.com"
            user2.phone = "+218911234567"
            user2.set_password("TestPass123")
            user2.save()

    def test_is_active_default_true(self):
        user = UserFactory()
        assert user.is_active is True

    def test_is_banned_default_false(self):
        user = UserFactory()
        assert user.is_banned is False

    def test_profile_completion_default(self):
        user = UserFactory()
        assert user.profile_completion == 0.0

    def test_accepted_terms_required(self):
        user = UserFactory(accepted_terms=True)
        assert user.accepted_terms is True

    def test_user_ordering(self):
        UserFactory(username="z_last")
        UserFactory(username="a_first")
        users = User.objects.all()
        assert users[0] == users.latest("date_joined")

    def test_user_indexes_exist(self):
        index_fields = [idx.fields for idx in User._meta.indexes]
        assert ["user_type", "is_verified"] in index_fields
        assert ["email"] in index_fields
        assert ["phone"] in index_fields


@pytest.mark.django_db
class TestVerificationCodeModel:
    def test_create_verification_code(self):
        vcode = VerificationCodeFactory()
        assert vcode.pk is not None
        assert vcode.code == "123456"
        assert vcode.purpose == "email"

    def test_code_expiry(self):
        vcode = VerificationCodeFactory()
        assert vcode.expires_at is not None

    def test_is_used_default(self):
        vcode = VerificationCodeFactory()
        assert vcode.is_used is False

    def test_code_user_relation(self):
        user = UserFactory()
        vcode = VerificationCodeFactory(user=user)
        assert vcode.user == user

    def test_code_str(self):
        pass


@pytest.mark.django_db
class TestAuditLogModel:
    def test_create_audit_log(self):
        user = UserFactory()
        log = AuditLog.objects.create(
            user=user,
            action="test_action",
            model_name="User",
            object_id=str(user.id),
        )
        assert log.pk is not None
        assert log.action == "test_action"

    def test_audit_log_ordering(self):
        AuditLog.objects.create(action="first")
        AuditLog.objects.create(action="second")
        logs = AuditLog.objects.all()
        assert logs[0].action == "second"


@pytest.mark.django_db
class TestLoginAttemptModel:
    def test_create_login_attempt(self):
        attempt = LoginAttempt.objects.create(
            username="testuser",
            ip_address="127.0.0.1",
            successful=False,
        )
        assert attempt.pk is not None
        assert attempt.successful is False

    def test_login_attempt_ordering(self):
        LoginAttempt.objects.create(username="a", ip_address="1.1.1.1")
        LoginAttempt.objects.create(username="b", ip_address="2.2.2.2")
        attempts = LoginAttempt.objects.all()
        assert len(attempts) == 2
