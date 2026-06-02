import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from apps.graduates.models import Skill, College
from apps.employers.models import CompanyProfile


class JobCategory(models.Model):
    name_ar = models.CharField(max_length=255, verbose_name=_("الاسم (عربي)"))
    name_en = models.CharField(max_length=255, null=True, blank=True, verbose_name=_("الاسم (إنجليزي)"))
    icon = models.CharField(max_length=50, null=True, blank=True, verbose_name=_("الأيقونة"))
    sort_order = models.IntegerField(default=0, verbose_name=_("الترتيب"))
    is_active = models.BooleanField(default=True, verbose_name=_("نشط"))

    class Meta:
        verbose_name = _("تصنيف وظيفي")
        verbose_name_plural = _("التصنيفات الوظيفية")
        ordering = ["sort_order", "name_ar"]

    def __str__(self):
        return self.name_ar


class JobPost(models.Model):
    class EmploymentType(models.TextChoices):
        FULL_TIME = "full_time", _("دوام كامل")
        PART_TIME = "part_time", _("دوام جزئي")
        FREELANCE = "freelance", _("حر")
        CONTRACT = "contract", _("عقد")
        INTERNSHIP = "internship", _("تدريب")
        REMOTE = "remote", _("عن بعد")

    class ExperienceLevel(models.TextChoices):
        ENTRY = "entry", _("مبتدئ")
        JUNIOR = "junior", _("مبتدئ مع خبرة")
        MID = "mid", _("متوسط")
        SENIOR = "senior", _("كبير")
        LEAD = "lead", _("قائد فريق")
        EXECUTIVE = "executive", _("تنفيذي")

    class Status(models.TextChoices):
        DRAFT = "draft", _("مسودة")
        ACTIVE = "active", _("منشورة")
        PAUSED = "paused", _("موقفة")
        CLOSED = "closed", _("مغلقة")
        FILLED = "filled", _("تم التوظيف")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name="company_jobs", verbose_name=_("الشركة"))
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("ناشر الوظيفة"))
    category = models.ForeignKey(JobCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="jobs", verbose_name=_("التصنيف"))
    title = models.CharField(max_length=255, verbose_name=_("المسمى الوظيفي"))
    description = models.TextField(verbose_name=_("الوصف"))
    requirements = models.TextField(null=True, blank=True, verbose_name=_("المتطلبات"))
    responsibilities = models.TextField(null=True, blank=True, verbose_name=_("المسؤوليات"))
    benefits = models.TextField(null=True, blank=True, verbose_name=_("المزايا"))
    skills = models.ManyToManyField(Skill, related_name="job_posts", verbose_name=_("المهارات المطلوبة"))
    employment_type = models.CharField(max_length=20, choices=EmploymentType.choices, default=EmploymentType.FULL_TIME, verbose_name=_("نوع التوظيف"))
    experience_level = models.CharField(max_length=20, choices=ExperienceLevel.choices, default=ExperienceLevel.MID, verbose_name=_("مستوى الخبرة"))
    years_experience_min = models.IntegerField(default=0, verbose_name=_("الحد الأدنى لسنوات الخبرة"))
    years_experience_max = models.IntegerField(null=True, blank=True, verbose_name=_("الحد الأقصى لسنوات الخبرة"))
    salary_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name=_("الحد الأدنى للراتب"))
    salary_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name=_("الحد الأقصى للراتب"))
    salary_currency = models.CharField(max_length=10, default="LYD", verbose_name=_("عملة الراتب"))
    city = models.CharField(max_length=255, null=True, blank=True, verbose_name=_("المدينة"))
    is_remote = models.BooleanField(default=False, verbose_name=_("عن بعد"))
    targeted_colleges = models.ManyToManyField(College, blank=True, related_name="targeted_jobs", verbose_name=_("الكليات المستهدفة"))
    vacancies = models.IntegerField(default=1, verbose_name=_("عدد الوظائف الشاغرة"))
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT, verbose_name=_("الحالة"))
    is_featured = models.BooleanField(default=False, verbose_name=_("مميزة"))
    is_urgent = models.BooleanField(default=False, verbose_name=_("عاجلة"))
    views_count = models.IntegerField(default=0, verbose_name=_("عدد المشاهدات"))
    applications_count = models.IntegerField(default=0, verbose_name=_("عدد المتقدمين"))
    shortlisted_count = models.IntegerField(default=0, verbose_name=_("عدد المرشحين"))
    deadline = models.DateTimeField(null=True, blank=True, verbose_name=_("آخر موعد للتقديم"))
    published_at = models.DateTimeField(null=True, blank=True, verbose_name=_("تاريخ النشر"))
    closed_at = models.DateTimeField(null=True, blank=True, verbose_name=_("تاريخ الإغلاق"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("وظيفة")
        verbose_name_plural = _("الوظائف")
        ordering = ["-published_at", "-created_at"]
        indexes = [
            models.Index(fields=["status", "employment_type"]),
            models.Index(fields=["company", "status"]),
            models.Index(fields=["city", "experience_level"]),
        ]

    def __str__(self):
        return f"{self.title} - {self.company.company_name}"


class JobApplication(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", _("قيد المراجعة")
        REVIEWED = "reviewed", _("تمت المراجعة")
        SHORTLISTED = "shortlisted", _("مدرج في القائمة المختصرة")
        INTERVIEW = "interview", _("مقابلة")
        ACCEPTED = "accepted", _("مقبول")
        REJECTED = "rejected", _("مرفوض")
        WITHDRAWN = "withdrawn", _("منسحب")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name="applications", verbose_name=_("الوظيفة"))
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="job_applications", verbose_name=_("المتقدم"))
    cv = models.ForeignKey("graduates.CV", on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("السيرة الذاتية"))
    cover_letter = models.TextField(null=True, blank=True, verbose_name=_("خطاب التقديم"))
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, verbose_name=_("الحالة"))
    notes = models.TextField(null=True, blank=True, verbose_name=_("ملاحظات"))
    employer_notes = models.TextField(null=True, blank=True, verbose_name=_("ملاحظات صاحب العمل"))
    match_score = models.FloatField(null=True, blank=True, verbose_name=_("نسبة المطابقة"))
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["job", "applicant"]
        verbose_name = _("تقديم وظيفة")
        verbose_name_plural = _("تقديم الوظائف")
        ordering = ["-applied_at"]

    def __str__(self):
        return f"{self.applicant.username} -> {self.job.title}"


class Interview(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = "scheduled", _("مجدولة")
        CONFIRMED = "confirmed", _("مؤكدة")
        COMPLETED = "completed", _("مكتملة")
        CANCELLED = "cancelled", _("ملغية")
        RESCHEDULED = "rescheduled", _("معاد جدولتها")

    class Type(models.TextChoices):
        PHONE = "phone", _("هاتفي")
        VIDEO = "video", _("فيديو")
        IN_PERSON = "in_person", _("حضوري")
        TECHNICAL = "technical", _("تقني")

    application = models.ForeignKey(JobApplication, on_delete=models.CASCADE, related_name="interviews", verbose_name=_("الطلب"))
    scheduled_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="scheduled_interviews", verbose_name=_("المجدول بواسطة"))
    interview_type = models.CharField(max_length=20, choices=Type.choices, default=Type.VIDEO, verbose_name=_("نوع المقابلة"))
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED, verbose_name=_("الحالة"))
    scheduled_at = models.DateTimeField(verbose_name=_("موعد المقابلة"))
    duration_minutes = models.IntegerField(default=30, verbose_name=_("المدة (دقيقة)"))
    location = models.TextField(null=True, blank=True, verbose_name=_("الموقع / الرابط"))
    notes = models.TextField(null=True, blank=True, verbose_name=_("ملاحظات"))
    feedback = models.TextField(null=True, blank=True, verbose_name=_("التقييم"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("مقابلة")
        verbose_name_plural = _("المقابلات")


class SavedJob(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_jobs")
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name="saved_by_users")
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "job"]
        verbose_name = _("وظيفة محفوظة")
        verbose_name_plural = _("الوظائف المحفوظة")
