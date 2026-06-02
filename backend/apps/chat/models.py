import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Conversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="conversations", verbose_name=_("المشاركون"))
    job = models.ForeignKey("jobs.JobPost", on_delete=models.SET_NULL, null=True, blank=True, related_name="conversations", verbose_name=_("الوظيفة"))
    subject = models.CharField(max_length=255, null=True, blank=True, verbose_name=_("الموضوع"))
    is_active = models.BooleanField(default=True, verbose_name=_("نشط"))
    last_message_at = models.DateTimeField(null=True, blank=True, verbose_name=_("آخر رسالة"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("محادثة")
        verbose_name_plural = _("المحادثات")
        ordering = ["-last_message_at", "-updated_at"]

    def __str__(self):
        return f"Conversation {self.id}"


class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages", verbose_name=_("المحادثة"))
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages", verbose_name=_("المرسل"))
    content = models.TextField(verbose_name=_("المحتوى"))
    file = models.FileField(upload_to="chat_files/", null=True, blank=True, verbose_name=_("ملف"))
    is_read = models.BooleanField(default=False, verbose_name=_("مقروء"))
    read_at = models.DateTimeField(null=True, blank=True, verbose_name=_("تاريخ القراءة"))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("رسالة")
        verbose_name_plural = _("الرسائل")
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.sender.username}: {self.content[:50]}"
