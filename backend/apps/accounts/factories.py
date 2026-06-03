import factory
import uuid
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from apps.accounts.models import VerificationCode

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        django_get_or_create = ("username",)

    id = factory.LazyFunction(uuid.uuid4)
    username = factory.Sequence(lambda n: f"user_{n}")
    email = factory.Sequence(lambda n: f"user_{n}@example.com")
    password = factory.PostGenerationMethodCall("set_password", "TestPass123")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    user_type = User.UserType.GRADUATE
    is_active = True
    is_verified = False
    accepted_terms = True

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        password = kwargs.pop("password", None)
        instance = super()._create(model_class, *args, **kwargs)
        if password:
            instance.set_password(password)
            instance.save()
        return instance


class GraduateUserFactory(UserFactory):
    user_type = User.UserType.GRADUATE


class EmployerUserFactory(UserFactory):
    user_type = User.UserType.EMPLOYER


class AdminUserFactory(UserFactory):
    user_type = User.UserType.ADMIN
    is_staff = True
    is_superuser = True


class VerificationCodeFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = VerificationCode

    user = factory.SubFactory(UserFactory)
    code = "123456"
    purpose = "email"
    is_used = False
    expires_at = factory.LazyFunction(lambda: timezone.now() + timedelta(minutes=10))
