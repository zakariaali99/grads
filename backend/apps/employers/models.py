import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Industry(models.Model):
    name_ar = models.CharField(max_length=255, verbose_name=_("الاسم (عربي)"))
    name_en = models.CharField(max_length=255, null=True, blank=True, verbose_name=_("الاسم (إنجليزي)"))
    icon = models.CharField(max_length=50, null=True, blank=True, verbose_name=_("الأيقونة"))
    is_active = models.BooleanField(default=True, verbose_name=_("نشط"))

    class Meta:
        verbose_name = _("قطاع")
        verbose_name_plural = _("القطاعات")
        ordering = ["name_ar"]

    def __str__(self):
        return self.name_ar


class CompanyProfile(models.Model):
    class CompanySize(models.TextChoices):
        STARTUP = "1-10", "1-10 موظف"
        SMALL = "11-50", "11-50 موظف"
        MEDIUM = "51-200", "51-200 موظف"
        LARGE = "201-1000", "201-1000 موظف"
        ENTERPRISE = "1000+", "أكثر من 1000 موظف"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="company_profile")
    company_name = models.CharField(max_length=255, verbose_name=_("اسم الشركة"))
    company_name_en = models.CharField(max_length=255, null=True, blank=True, verbose_name=_("اسم الشركة (إنجليزي)"))
    commercial_registration = models.CharField(max_length=100, unique=True, verbose_name=_("السجل التجاري"))
    industry = models.ForeignKey(Industry, on_delete=models.SET_NULL, null=True, blank=True, related_name="companies", verbose_name=_("القطاع"))
    company_size = models.CharField(max_length=20, choices=CompanySize.choices, default=CompanySize.SMALL, verbose_name=_("حجم الشركة"))
    website = models.URLField(null=True, blank=True, verbose_name=_("الموقع الإلكتروني"))
    logo = models.ImageField(upload_to="company_logos/", null=True, blank=True, verbose_name=_("الشعار"))
    cover_image = models.ImageField(upload_to="company_covers/", null=True, blank=True, verbose_name=_("صورة الغلاف"))
    description = models.TextField(null=True, blank=True, verbose_name=_("وصف الشركة"))
    city = models.CharField(max_length=255, verbose_name=_("المدينة"))
    address = models.TextField(null=True, blank=True, verbose_name=_("العنوان"))
    phone = models.CharField(max_length=20, null=True, blank=True, verbose_name=_("رقم الهاتف"))
    linkedin_url = models.URLField(null=True, blank=True, verbose_name=_("رابط LinkedIn"))
    twitter_url = models.URLField(null=True, blank=True, verbose_name=_("رابط Twitter"))
    is_verified = models.BooleanField(default=False, verbose_name=_("موثقة"))
    verified_at = models.DateTimeField(null=True, blank=True, verbose_name=_("تاريخ التوثيق"))
    is_featured = models.BooleanField(default=False, verbose_name=_("مميزة"))
    profile_views = models.IntegerField(default=0, verbose_name=_("عدد المشاهدات"))
    total_jobs = models.IntegerField(default=0, verbose_name=_("إجمالي الوظائف"))
    total_hires = models.IntegerField(default=0, verbose_name=_("إجمالي التوظيف"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("ملف شركة")
        verbose_name_plural = _("ملفات الشركات")
        indexes = [
            models.Index(fields=["city", "industry"]),
            models.Index(fields=["is_verified", "is_featured"]),
        ]

    def __str__(self):
        return self.company_name


class HRTeamMember(models.Model):
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name="hr_team")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="hr_memberships")
    role = models.CharField(max_length=50, choices=[
        ("admin", _("مدير")),
        ("recruiter", _("مسؤول توظيف")),
        ("viewer", _("مشاهد")),
    ], default="recruiter", verbose_name=_("الدور"))
    is_active = models.BooleanField(default=True, verbose_name=_("نشط"))
    invited_at = models.DateTimeField(auto_now_add=True)
    joined_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ["company", "user"]
        verbose_name = _("عضو فريق HR")
        verbose_name_plural = _("فريق الموارد البشرية")


class CompanyReview(models.Model):
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name="reviews")
    graduate = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)], verbose_name=_("التقييم"))
    review = models.TextField(null=True, blank=True, verbose_name=_("المراجعة"))
    is_approved = models.BooleanField(default=False, verbose_name=_("معتمدة"))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["company", "graduate"]
        verbose_name = _("تقييم شركة")
        verbose_name_plural = _("تقييمات الشركات")
