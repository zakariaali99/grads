from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Notification(models.Model):
    class Type(models.TextChoices):
        APPLICATION = "application", _("تقديم وظيفة")
        INTERVIEW = "interview", _("مقابلة")
        MESSAGE = "message", _("رسالة")
        JOB_MATCH = "job_match", _("مطابقة وظيفة")
        PROFILE_VIEW = "profile_view", _("مشاهدة ملف")
        VERIFICATION = "verification", _("توثيق")
        SYSTEM = "system", _("النظام")
        ANNOUNCEMENT = "announcement", _("إعلان")

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications", verbose_name=_("المستلم"))
    notification_type = models.CharField(max_length=20, choices=Type.choices, verbose_name=_("النوع"))
    title = models.CharField(max_length=255, verbose_name=_("العنوان"))
    message = models.TextField(verbose_name=_("الرسالة"))
    data = models.JSONField(null=True, blank=True, verbose_name=_("البيانات"))
    is_read = models.BooleanField(default=False, verbose_name=_("مقروء"))
    read_at = models.DateTimeField(null=True, blank=True, verbose_name=_("تاريخ القراءة"))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("إشعار")
        verbose_name_plural = _("الإشعارات")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["recipient", "is_read"]),
            models.Index(fields=["notification_type"]),
        ]

    def __str__(self):
        return f"{self.get_notification_type_display()}: {self.title}"


class Announcement(models.Model):
    title = models.CharField(max_length=255, verbose_name=_("العنوان"))
    content = models.TextField(verbose_name=_("المحتوى"))
    target_roles = models.JSONField(default=list, verbose_name=_("المستهدفون"))
    is_active = models.BooleanField(default=True, verbose_name=_("نشط"))
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name=_("المنشئ"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("إعلان")
        verbose_name_plural = _("الإعلانات")
        ordering = ["-created_at"]
