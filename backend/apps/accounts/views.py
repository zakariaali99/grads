from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    ChangePasswordSerializer,
    VerifyCodeSerializer,
    RequestVerificationSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    CustomTokenObtainPairSerializer,
)
from .utils import generate_verification_code, send_verification_email, calculate_profile_completion
from .models import VerificationCode

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user.profile_completion = calculate_profile_completion(user)
        user.save(update_fields=["profile_completion"])
        return Response(
            {
                "success": True,
                "message": _("تم إنشاء الحساب بنجاح. يرجى تفعيل البريد الإلكتروني."),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            response.data["success"] = True
            response.data["message"] = _("تم تسجيل الدخول بنجاح.")
        return response


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = self.get_object()
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"success": True, "message": _("تم تغيير كلمة المرور بنجاح.")})


class RequestVerificationView(generics.GenericAPIView):
    serializer_class = RequestVerificationSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        purpose = serializer.validated_data["purpose"]
        code = generate_verification_code(request.user, purpose)
        if purpose == "email":
            send_verification_email(request.user, code)
        return Response({"success": True, "message": _("تم إرسال رمز التحقق.")})


class VerifyCodeView(generics.GenericAPIView):
    serializer_class = VerifyCodeSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data["code"]
        purpose = serializer.validated_data["purpose"]

        try:
            vcode = VerificationCode.objects.filter(
                user=request.user, code=code, purpose=purpose, is_used=False, expires_at__gt=timezone.now()
            ).latest("created_at")
        except VerificationCode.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": _("رمز التحقق غير صحيح أو منتهي الصلاحية."),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        vcode.is_used = True
        vcode.save()

        if purpose == "email":
            request.user.email_verified = True
        elif purpose == "phone":
            request.user.phone_verified = True

        request.user.profile_completion = calculate_profile_completion(request.user)
        request.user.save()

        return Response({"success": True, "message": _("تم التحقق بنجاح.")})


class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        try:
            user = User.objects.get(email=email)
            code = generate_verification_code(user, "password_reset")
            send_verification_email(user, code)
        except User.DoesNotExist:
            pass
        return Response(
            {
                "success": True,
                "message": _("إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة التحقق."),
            }
        )


class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            vcode = VerificationCode.objects.filter(
                code=serializer.validated_data["code"],
                purpose="password_reset",
                is_used=False,
                expires_at__gt=timezone.now(),
            ).latest("created_at")
        except VerificationCode.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": _("رمز التحقق غير صحيح أو منتهي الصلاحية."),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = vcode.user
        user.set_password(serializer.validated_data["password"])
        user.save()
        vcode.is_used = True
        vcode.save()

        return Response({"success": True, "message": _("تم إعادة تعيين كلمة المرور بنجاح.")})


class DeleteAccountView(generics.DestroyAPIView):
    def get_object(self):
        return self.request.user

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({"success": True, "message": _("تم حذف الحساب.")})
