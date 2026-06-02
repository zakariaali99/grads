from django.db import models
from django.utils.translation import gettext_lazy as _


class DailyStat(models.Model):
    date = models.DateField(unique=True, verbose_name=_("التاريخ"))
    new_graduates = models.IntegerField(default=0, verbose_name=_("خريجون جدد"))
    new_employers = models.IntegerField(default=0, verbose_name=_("أصحاب عمل جدد"))
    new_jobs = models.IntegerField(default=0, verbose_name=_("وظائف جديدة"))
    applications = models.IntegerField(default=0, verbose_name=_("تقديم وظائف"))
    profile_views = models.IntegerField(default=0, verbose_name=_("مشاهدات الملفات"))
    searches = models.IntegerField(default=0, verbose_name=_("عمليات البحث"))
    interviews = models.IntegerField(default=0, verbose_name=_("مقابلات"))
    hirings = models.IntegerField(default=0, verbose_name=_("توظيف"))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("إحصاء يومي")
        verbose_name_plural = _("الإحصاءات اليومية")
        ordering = ["-date"]


class StatSummary(models.Model):
    total_users = models.IntegerField(default=0)
    total_graduates = models.IntegerField(default=0)
    total_employers = models.IntegerField(default=0)
    total_companies = models.IntegerField(default=0)
    total_jobs = models.IntegerField(default=0)
    total_applications = models.IntegerField(default=0)
    total_hires = models.IntegerField(default=0)
    verified_graduates = models.IntegerField(default=0)
    verified_companies = models.IntegerField(default=0)
    active_jobs = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("ملخص إحصائي")
        verbose_name_plural = _("ملخص إحصائي")


class PlatformEvent(models.Model):
    event_type = models.CharField(max_length=100, verbose_name=_("نوع الحدث"))
    description = models.TextField(verbose_name=_("الوصف"))
    data = models.JSONField(null=True, blank=True, verbose_name=_("البيانات"))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("حدث منصة")
        verbose_name_plural = _("أحداث المنصة")
        ordering = ["-created_at"]
