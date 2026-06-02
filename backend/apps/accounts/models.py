from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator
import uuid


class User(AbstractUser):
    class UserType(models.TextChoices):
        GRADUATE = "graduate", _("خريج")
        EMPLOYER = "employer", _("صاحب عمل")
        ADMIN = "admin", _("مدير")
        INSTITUTION = "institution", _("مؤسسة تعليمية")

    class Gender(models.TextChoices):
        MALE = "male", _("ذكر")
        FEMALE = "female", _("أنثى")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_type = models.CharField(
        max_length=20, choices=UserType.choices, default=UserType.GRADUATE, verbose_name=_("نوع المستخدم")
    )
    phone = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True,
        validators=[RegexValidator(r"^\+?1?\d{9,15}$")],
        verbose_name=_("رقم الهاتف"),
    )
    gender = models.CharField(max_length=10, choices=Gender.choices, null=True, blank=True, verbose_name=_("الجنس"))
    date_of_birth = models.DateField(null=True, blank=True, verbose_name=_("تاريخ الميلاد"))
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True, verbose_name=_("الصورة الشخصية"))
    bio = models.TextField(max_length=500, null=True, blank=True, verbose_name=_("نبذة"))
    is_verified = models.BooleanField(default=False, verbose_name=_("موثق"))
    verified_at = models.DateTimeField(null=True, blank=True, verbose_name=_("تاريخ التوثيق"))
    is_active = models.BooleanField(default=True, verbose_name=_("نشط"))
    is_banned = models.BooleanField(default=False, verbose_name=_("محظور"))
    ban_reason = models.TextField(null=True, blank=True, verbose_name=_("سبب الحظر"))
    last_ip = models.GenericIPAddressField(null=True, blank=True, verbose_name=_("آخر IP"))
    last_device = models.CharField(max_length=255, null=True, blank=True, verbose_name=_("آخر جهاز"))
    email_verified = models.BooleanField(default=False, verbose_name=_("البريد مؤكد"))
    phone_verified = models.BooleanField(default=False, verbose_name=_("الهاتف مؤكد"))
    two_factor_enabled = models.BooleanField(default=False, verbose_name=_("مصادقة ثنائية"))
    profile_completion = models.FloatField(default=0.0, verbose_name=_("نسبة اكتمال الملف"))
    accepted_terms = models.BooleanField(default=False, verbose_name=_("قبول الشروط"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("مستخدم")
        verbose_name_plural = _("المستخدمين")
        ordering = ["-date_joined"]
        indexes = [
            models.Index(fields=["user_type", "is_verified"]),
            models.Index(fields=["email"]),
            models.Index(fields=["phone"]),
        ]

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_user_type_display()})"


class VerificationCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="verification_codes")
    code = models.CharField(max_length=6, verbose_name=_("رمز التحقق"))
    purpose = models.CharField(
        max_length=50,
        verbose_name=_("الغرض"),
        choices=[
            ("email", _("البريد الإلكتروني")),
            ("phone", _("رقم الهاتف")),
            ("password_reset", _("إعادة تعيين كلمة المرور")),
            ("two_factor", _("المصادقة الثنائية")),
        ],
    )
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("رمز التحقق")
        verbose_name_plural = _("رموز التحقق")


class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=255, verbose_name=_("الإجراء"))
    model_name = models.CharField(max_length=100, verbose_name=_("اسم النموذج"))
    object_id = models.CharField(max_length=100, null=True, blank=True)
    details = models.JSONField(null=True, blank=True, verbose_name=_("التفاصيل"))
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("سجل التدقيق")
        verbose_name_plural = _("سجلات التدقيق")
        ordering = ["-timestamp"]
        indexes = [models.Index(fields=["user", "timestamp"])]


class LoginAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    username = models.CharField(max_length=150)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(null=True, blank=True)
    successful = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("محاولة تسجيل دخول")
        verbose_name_plural = _("محاولات تسجيل الدخول")
        ordering = ["-timestamp"]
