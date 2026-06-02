from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import VerificationCode, ActivityLog

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD  # 'username'

    def validate(self, attrs):
        # Accept email as username
        username = attrs.get(self.username_field)
        password = attrs.get("password")
        if username and password:
            from django.contrib.auth import authenticate
            user = authenticate(request=self.context.get("request"), username=username, password=password)
            if user is None and "@" in username:
                # Try looking up by email
                try:
                    user_obj = User.objects.get(email=username)
                    user = authenticate(request=self.context.get("request"), username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass
            if user is None:
                raise AuthenticationFailed(
                    _("لم يتم العثور على حساب نشط للبيانات المقدمة"),
                    "no_active_account",
                )
            attrs[self.username_field] = user.username
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user, context=self.context).data
        return data


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "phone", "user_type", "full_name",
            "first_name", "last_name", "gender", "date_of_birth", "avatar",
            "bio", "is_verified", "profile_completion", "date_joined",
        ]
        read_only_fields = ["id", "is_verified", "profile_completion", "date_joined"]

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def validate_phone(self, value):
        if value and User.objects.filter(phone=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError(_("رقم الهاتف مستخدم بالفعل."))
        return value


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username", "email", "password", "password_confirm",
            "first_name", "last_name", "phone", "user_type", "gender",
            "date_of_birth", "accepted_terms",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": _("كلمتا المرور غير متطابقتين.")})
        if not attrs.get("accepted_terms"):
            raise serializers.ValidationError({"accepted_terms": _("يجب قبول الشروط والأحكام.")})
        return attrs

    def create(self, validated_data):
        validated_data.pop("accepted_terms", None)
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError(_("كلمة المرور القديمة غير صحيحة."))
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError({"new_password_confirm": _("كلمتا المرور غير متطابقتين.")})
        return attrs


class VerifyCodeSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6)
    purpose = serializers.ChoiceField(choices=["email", "phone", "password_reset", "two_factor"])


class RequestVerificationSerializer(serializers.Serializer):
    purpose = serializers.ChoiceField(choices=["email", "phone"])


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6)
    password = serializers.CharField(validators=[validate_password])
    password_confirm = serializers.CharField()

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": _("كلمتا المرور غير متطابقتين.")})
        return attrs


class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ["id", "activity_type", "description", "metadata", "created_at"]
        read_only_fields = ["id", "created_at"]
