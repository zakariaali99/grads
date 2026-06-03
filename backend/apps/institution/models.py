from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class InstitutionProfile(models.Model):
    class InstitutionType(models.TextChoices):
        UNIVERSITY = "university", _("جامعة")
        COLLEGE = "college", _("كلية")
        INSTITUTE = "institute", _("معهد")
        SCHOOL = "school", _("مدرسة")
        TRAINING_CENTER = "training_center", _("مركز تدريب")

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="institution_profile"
    )
    institution_name = models.CharField(max_length=255, verbose_name=_("اسم المؤسسة"))
    institution_name_en = models.CharField(max_length=255, null=True, blank=True, verbose_name=_("اسم المؤسسة (إنجليزي)"))
    institution_type = models.CharField(
        max_length=30, choices=InstitutionType.choices, default=InstitutionType.UNIVERSITY, verbose_name=_("نوع المؤسسة")
    )
    logo = models.ImageField(upload_to="institution_logos/", null=True, blank=True, verbose_name=_("الشعار"))
    cover_image = models.ImageField(upload_to="institution_covers/", null=True, blank=True, verbose_name=_("صورة الغلاف"))
    license_number = models.CharField(max_length=100, unique=True, verbose_name=_("رقم الترخيص"))
    website = models.URLField(null=True, blank=True, verbose_name=_("الموقع الإلكتروني"))
    phone = models.CharField(max_length=20, null=True, blank=True, verbose_name=_("رقم الهاتف"))
    address = models.TextField(null=True, blank=True, verbose_name=_("العنوان"))
    city = models.CharField(max_length=255, verbose_name=_("المدينة"))
    country = models.CharField(max_length=255, default="المملكة العربية السعودية", verbose_name=_("الدولة"))
    description = models.TextField(null=True, blank=True, verbose_name=_("الوصف"))
    student_count = models.IntegerField(default=0, verbose_name=_("عدد الطلاب"))
    graduate_count = models.IntegerField(default=0, verbose_name=_("عدد الخريجين المسجلين"))
    is_verified = models.BooleanField(default=False, verbose_name=_("موثقة"))
    verified_at = models.DateTimeField(null=True, blank=True, verbose_name=_("تاريخ التوثيق"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("ملف المؤسسة")
        verbose_name_plural = _("ملفات المؤسسات")
        indexes = [
            models.Index(fields=["city", "institution_type"]),
            models.Index(fields=["is_verified"]),
        ]

    def __str__(self):
        return self.institution_name


class GraduateTracking(models.Model):
    class Status(models.TextChoices):
        ENROLLED = "enrolled", _("ملتحق")
        GRADUATED = "graduated", _("متخرج")
        WITHDREW = "withdrew", _("منسحب")
        SUSPENDED = "suspended", _("موقوف")

    institution = models.ForeignKey(
        InstitutionProfile, on_delete=models.CASCADE, related_name="tracked_graduates", verbose_name=_("المؤسسة")
    )
    graduate = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True,
        related_name="institution_tracking", verbose_name=_("الخريج")
    )
    student_id = models.CharField(max_length=100, verbose_name=_("الرقم الجامعي"))
    major = models.CharField(max_length=255, verbose_name=_("التخصص"))
    college = models.CharField(max_length=255, null=True, blank=True, verbose_name=_("الكلية"))
    enrollment_year = models.IntegerField(verbose_name=_("سنة الالتحاق"))
    graduation_year = models.IntegerField(null=True, blank=True, verbose_name=_("سنة التخرج"))
    gpa = models.FloatField(null=True, blank=True, verbose_name=_("المعدل"))
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.ENROLLED, verbose_name=_("الحالة")
    )
    is_employed = models.BooleanField(default=False, verbose_name=_("موظف"))
    employment_details = models.JSONField(null=True, blank=True, verbose_name=_("تفاصيل التوظيف"))
    last_contact_date = models.DateField(null=True, blank=True, verbose_name=_("آخر تاريخ تواصل"))
    notes = models.TextField(null=True, blank=True, verbose_name=_("ملاحظات"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("تتبع الخريج")
        verbose_name_plural = _("تتبع الخريجين")
        unique_together = ["institution", "student_id"]
        indexes = [
            models.Index(fields=["institution", "status"]),
            models.Index(fields=["institution", "graduation_year"]),
        ]

    def __str__(self):
        return f"{self.graduate.get_full_name()} - {self.student_id}"


class InstitutionPartnership(models.Model):
    class PartnershipType(models.TextChoices):
        RECRUITMENT = "recruitment", _("توظيف")
        TRAINING = "training", _("تدريب")
        RESEARCH = "research", _("بحث علمي")
        SPONSORSHIP = "sponsorship", _("رعاية")

    class Status(models.TextChoices):
        PENDING = "pending", _("قيد الانتظار")
        ACTIVE = "active", _("نشط")
        COMPLETED = "completed", _("مكتمل")
        TERMINATED = "terminated", _("منتهي")

    institution = models.ForeignKey(
        InstitutionProfile, on_delete=models.CASCADE, related_name="partnerships", verbose_name=_("المؤسسة")
    )
    company = models.ForeignKey(
        "employers.CompanyProfile", on_delete=models.CASCADE, related_name="institution_partnerships",
        verbose_name=_("الشركة")
    )
    partnership_type = models.CharField(
        max_length=30, choices=PartnershipType.choices, default=PartnershipType.RECRUITMENT,
        verbose_name=_("نوع الشراكة")
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING, verbose_name=_("الحالة")
    )
    agreement_file = models.FileField(
        upload_to="partnership_agreements/", null=True, blank=True, verbose_name=_("ملف الاتفاقية")
    )
    start_date = models.DateField(null=True, blank=True, verbose_name=_("تاريخ البداية"))
    end_date = models.DateField(null=True, blank=True, verbose_name=_("تاريخ النهاية"))
    contact_person_name = models.CharField(max_length=255, verbose_name=_("اسم جهة الاتصال"))
    contact_email = models.EmailField(verbose_name=_("البريد الإلكتروني"))
    contact_phone = models.CharField(max_length=20, null=True, blank=True, verbose_name=_("رقم الهاتف"))
    notes = models.TextField(null=True, blank=True, verbose_name=_("ملاحظات"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("شراكة مؤسسة")
        verbose_name_plural = _("الشراكات")
        unique_together = ["institution", "company"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.institution.institution_name} ↔ {self.company.company_name}"


class CurriculumFeedback(models.Model):
    institution = models.ForeignKey(
        InstitutionProfile, on_delete=models.CASCADE, related_name="curriculum_feedback",
        verbose_name=_("المؤسسة")
    )
    graduate = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="curriculum_feedback",
        verbose_name=_("الخريج")
    )
    program_name = models.CharField(max_length=255, verbose_name=_("اسم البرنامج"))
    course_name = models.CharField(max_length=255, verbose_name=_("اسم المقرر"))
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)], verbose_name=_("التقييم"))
    feedback = models.TextField(null=True, blank=True, verbose_name=_("الملاحظات"))
    relevance_to_job = models.IntegerField(
        choices=[(i, i) for i in range(1, 6)], null=True, blank=True, verbose_name=_("ملاءمة لسوق العمل")
    )
    skills_acquired = models.JSONField(null=True, blank=True, verbose_name=_("المهارات المكتسبة"))
    is_public = models.BooleanField(default=False, verbose_name=_("عام"))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("تقييم المناهج")
        verbose_name_plural = _("تقييمات المناهج")
        unique_together = ["graduate", "course_name"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.graduate.get_full_name()} - {self.course_name}"
