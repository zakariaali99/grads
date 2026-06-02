from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, VerificationCode, AuditLog, LoginAttempt


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["username", "email", "user_type", "is_verified", "is_active", "profile_completion", "date_joined"]
    list_filter = ["user_type", "is_verified", "is_active", "gender"]
    search_fields = ["username", "email", "phone", "first_name", "last_name"]
    ordering = ["-date_joined"]
    fieldsets = list(BaseUserAdmin.fieldsets) + [
        (_("معلومات إضافية"), {"fields": ("user_type", "phone", "gender", "date_of_birth", "bio", "avatar")}),
        (
            _("التوثيق والأمان"),
            {"fields": ("is_verified", "verified_at", "email_verified", "phone_verified", "two_factor_enabled")},
        ),
        (_("الحظر"), {"fields": ("is_banned", "ban_reason")}),
        (_("التتبع"), {"fields": ("last_ip", "last_device", "profile_completion")}),
    ]


@admin.register(VerificationCode)
class VerificationCodeAdmin(admin.ModelAdmin):
    list_display = ["user", "purpose", "is_used", "expires_at", "created_at"]
    list_filter = ["purpose", "is_used"]


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ["user", "action", "ip_address", "timestamp"]
    list_filter = ["action", "timestamp"]
    search_fields = ["user__username", "action"]


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    list_display = ["username", "successful", "ip_address", "timestamp"]
    list_filter = ["successful", "timestamp"]
