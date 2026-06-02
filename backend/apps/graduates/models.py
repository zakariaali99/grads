from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from mptt.models import MPTTModel, TreeForeignKey


class SkillCategory(MPTTModel):
    name_ar = models.CharField(max_length=255, verbose_name=_("الاسم (عربي)"))
    name_en = models.CharField(max_length=255, null=True, blank=True, verbose_name=_("الاسم (إنجليزي)"))
    parent = TreeForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="children", verbose_name=_("التصنيف الأب")
    )
    icon = models.CharField(max_length=50, null=True, blank=True, verbose_name=_("الأيقونة"))
    sort_order = models.IntegerField(default=0, verbose_name=_("الترتيب"))

    class MPTTMeta:
        order_insertion_by = ["sort_order", "name_ar"]

    class Meta:
        verbose_name = _("تصنيف المهارات")
        verbose_name_plural = _("تصنيفات المهارات")

    def __str__(self):
        return self.name_ar


class Skill(models.Model):
    name_ar = models.CharField(max_length=255, verbose_name=_("الاسم (عربي)"))
    name_en = models.CharField(max_length=255, null=True, blank=True, verbose_name=_("الاسم (إنجليزي)"))
    category = models.ForeignKey(
        SkillCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="skills",
        verbose_name=_("التصنيف"),
    )
    demand_score = models.FloatField(default=0.0, verbose_name=_("معدل الطلب"))
    is_active = models.BooleanField(default=True, verbose_name=_("نشط"))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("مهارة")
        verbose_name_plural = _("المهارات")
        ordering = ["name_ar"]

    def __str__(self):
        return self.name_ar


class College(models.Model):
    name_ar = models.CharField(max_length=255, verbose_name=_("الاسم (عربي)"))
    name_en = models.CharField(max_length=255, null=True, blank=True, verbose_name=_("الاسم (إنجليزي)"))
    code = models.CharField(max_length=50, unique=True, verbose_name=_("الكود"))
    city = models.CharField(max_length=255, verbose_name=_("المدينة"))
    is_active = models.BooleanField(default=True, verbose_name=_("نشط"))

    class Meta:
        verbose_name = _("كلية")
        verbose_name_plural = _("الكليات")
        ordering = ["name_ar"]

    def __str__(self):
        return self.name_ar


class GraduateProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="graduate_profile")
    headline = models.CharField(max_length=255, null=True, blank=True, verbose_name=_("العنوان المهني"))
    college = models.ForeignKey(
        College, on_delete=models.SET_NULL, null=True, blank=True, related_name="graduates", verbose_name=_("الكلية")
    )
    graduation_year = models.IntegerField(null=True, blank=True, verbose_name=_("سنة التخرج"))
    major = models.CharField(max_length=255, null=True, blank=True, verbose_name=_("التخصص"))
    gpa = models.FloatField(null=True, blank=True, verbose_name=_("المعدل"))
    city = models.CharField(max_length=255, null=True, blank=True, verbose_name=_("المدينة"))
    is_employed = models.BooleanField(default=False, verbose_name=_("موظف حالياً"))
    current_company = models.CharField(max_length=255, null=True, blank=True, verbose_name=_("الشركة الحالية"))
    current_position = models.CharField(max_length=255, null=True, blank=True, verbose_name=_("المنصب الحالي"))
    skills = models.ManyToManyField(
        Skill, through="GraduateSkill", related_name="graduates", verbose_name=_("المهارات")
    )
    available_for_work = models.BooleanField(default=True, verbose_name=_("متاح للعمل"))
    expected_salary = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True, verbose_name=_("الراتب المتوقع")
    )
    linkedin_url = models.URLField(null=True, blank=True, verbose_name=_("رابط LinkedIn"))
    github_url = models.URLField(null=True, blank=True, verbose_name=_("رابط GitHub"))
    portfolio_url = models.URLField(null=True, blank=True, verbose_name=_("رابط Portfolio"))
    behance_url = models.URLField(null=True, blank=True, verbose_name=_("رابط Behance"))
    profile_views = models.IntegerField(default=0, verbose_name=_("عدد المشاهدات"))
    search_appearances = models.IntegerField(default=0, verbose_name=_("ظهور في البحث"))
    employer_interactions = models.IntegerField(default=0, verbose_name=_("تفاعلات أصحاب العمل"))
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name=_("تاريخ الاكتمال"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("ملف خريج")
        verbose_name_plural = _("ملفات الخريجين")
        indexes = [
            models.Index(fields=["college", "graduation_year"]),
            models.Index(fields=["city", "available_for_work"]),
        ]

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} - {self.college or 'غير محدد'}"


class GraduateSkill(models.Model):
    class Proficiency(models.TextChoices):
        BEGINNER = "beginner", _("مبتدئ")
        INTERMEDIATE = "intermediate", _("متوسط")
        ADVANCED = "advanced", _("متقدم")
        EXPERT = "expert", _("خبير")

    graduate = models.ForeignKey(GraduateProfile, on_delete=models.CASCADE)
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    proficiency = models.CharField(
        max_length=20, choices=Proficiency.choices, default=Proficiency.INTERMEDIATE, verbose_name=_("المستوى")
    )
    years_experience = models.IntegerField(default=0, verbose_name=_("سنوات الخبرة"))
    is_top_skill = models.BooleanField(default=False, verbose_name=_("مهارة رئيسية"))

    class Meta:
        unique_together = ["graduate", "skill"]
        verbose_name = _("مهارة الخريج")
        verbose_name_plural = _("مهارات الخريجين")


class Education(models.Model):
    graduate = models.ForeignKey(GraduateProfile, on_delete=models.CASCADE, related_name="education")
    degree = models.CharField(max_length=255, verbose_name=_("الدرجة العلمية"))
    field_of_study = models.CharField(max_length=255, verbose_name=_("مجال الدراسة"))
    institution = models.CharField(max_length=255, verbose_name=_("المؤسسة التعليمية"))
    country = models.CharField(max_length=100, null=True, blank=True, verbose_name=_("البلد"))
    start_date = models.DateField(verbose_name=_("تاريخ البداية"))
    end_date = models.DateField(null=True, blank=True, verbose_name=_("تاريخ النهاية"))
    is_current = models.BooleanField(default=False, verbose_name=_("حالياً"))
    grade = models.CharField(max_length=50, null=True, blank=True, verbose_name=_("التقدير"))
    description = models.TextField(null=True, blank=True, verbose_name=_("الوصف"))
    sort_order = models.IntegerField(default=0, verbose_name=_("الترتيب"))

    class Meta:
        verbose_name = _("المؤهل التعليمي")
        verbose_name_plural = _("المؤهلات التعليمية")
        ordering = ["-end_date", "sort_order"]


class Certification(models.Model):
    graduate = models.ForeignKey(GraduateProfile, on_delete=models.CASCADE, related_name="certifications")
    name = models.CharField(max_length=255, verbose_name=_("اسم الشهادة"))
    issuer = models.CharField(max_length=255, verbose_name=_("الجهة المانحة"))
    issue_date = models.DateField(verbose_name=_("تاريخ الإصدار"))
    expiry_date = models.DateField(null=True, blank=True, verbose_name=_("تاريخ الانتهاء"))
    credential_id = models.CharField(max_length=255, null=True, blank=True, verbose_name=_("رقم الاعتماد"))
    credential_url = models.URLField(null=True, blank=True, verbose_name=_("رابط التحقق"))
    file = models.FileField(upload_to="certifications/", null=True, blank=True, verbose_name=_("الملف"))
    is_verified = models.BooleanField(default=False, verbose_name=_("موثقة"))

    class Meta:
        verbose_name = _("شهادة")
        verbose_name_plural = _("الشهادات")
        ordering = ["-issue_date"]


class Experience(models.Model):
    graduate = models.ForeignKey(GraduateProfile, on_delete=models.CASCADE, related_name="experience")
    title = models.CharField(max_length=255, verbose_name=_("المسمى الوظيفي"))
    company = models.CharField(max_length=255, verbose_name=_("الشركة"))
    location = models.CharField(max_length=255, null=True, blank=True, verbose_name=_("الموقع"))
    employment_type = models.CharField(
        max_length=50,
        choices=[
            ("full_time", _("دوام كامل")),
            ("part_time", _("دوام جزئي")),
            ("freelance", _("حر")),
            ("internship", _("تدريب")),
            ("contract", _("عقد")),
        ],
        default="full_time",
        verbose_name=_("نوع الوظيفة"),
    )
    start_date = models.DateField(verbose_name=_("تاريخ البداية"))
    end_date = models.DateField(null=True, blank=True, verbose_name=_("تاريخ النهاية"))
    is_current = models.BooleanField(default=False, verbose_name=_("حالياً"))
    description = models.TextField(null=True, blank=True, verbose_name=_("الوصف"))
    sort_order = models.IntegerField(default=0, verbose_name=_("الترتيب"))

    class Meta:
        verbose_name = _("خبرة")
        verbose_name_plural = _("الخبرات")
        ordering = ["-start_date", "sort_order"]


class Project(models.Model):
    graduate = models.ForeignKey(GraduateProfile, on_delete=models.CASCADE, related_name="projects")
    title = models.CharField(max_length=255, verbose_name=_("عنوان المشروع"))
    description = models.TextField(null=True, blank=True, verbose_name=_("الوصف"))
    technologies = models.CharField(max_length=500, null=True, blank=True, verbose_name=_("التقنيات المستخدمة"))
    url = models.URLField(null=True, blank=True, verbose_name=_("الرابط"))
    image = models.ImageField(upload_to="projects/", null=True, blank=True, verbose_name=_("الصورة"))
    start_date = models.DateField(null=True, blank=True, verbose_name=_("تاريخ البداية"))
    end_date = models.DateField(null=True, blank=True, verbose_name=_("تاريخ النهاية"))
    is_ongoing = models.BooleanField(default=False, verbose_name=_("مستمر"))
    sort_order = models.IntegerField(default=0, verbose_name=_("الترتيب"))

    class Meta:
        verbose_name = _("مشروع")
        verbose_name_plural = _("المشاريع")
        ordering = ["-start_date", "sort_order"]


class CV(models.Model):
    graduate = models.ForeignKey(GraduateProfile, on_delete=models.CASCADE, related_name="cvs")
    title = models.CharField(max_length=255, default="السيرة الذاتية", verbose_name=_("العنوان"))
    file = models.FileField(upload_to="cvs/", verbose_name=_("الملف"))
    language = models.CharField(
        max_length=10, choices=[("ar", "العربية"), ("en", "English")], default="ar", verbose_name=_("اللغة")
    )
    is_default = models.BooleanField(default=False, verbose_name=_("افتراضي"))
    is_parsed = models.BooleanField(default=False, verbose_name=_("تم التحليل"))
    parsed_data = models.JSONField(null=True, blank=True, verbose_name=_("بيانات التحليل"))
    file_size = models.IntegerField(default=0, verbose_name=_("حجم الملف"))
    file_type = models.CharField(max_length=50, null=True, blank=True, verbose_name=_("نوع الملف"))
    upload_date = models.DateTimeField(auto_now_add=True)
    download_count = models.IntegerField(default=0, verbose_name=_("عدد التحميلات"))

    class Meta:
        verbose_name = _("السيرة الذاتية")
        verbose_name_plural = _("السير الذاتية")
        ordering = ["-upload_date"]


class ProfileView(models.Model):
    graduate = models.ForeignKey(GraduateProfile, on_delete=models.CASCADE, related_name="profile_views_log")
    viewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("مشاهدة ملف")
        verbose_name_plural = _("مشاهدات الملفات")


class SavedGraduate(models.Model):
    employer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_graduates")
    graduate = models.ForeignKey(GraduateProfile, on_delete=models.CASCADE, related_name="saved_by")
    notes = models.TextField(null=True, blank=True, verbose_name=_("ملاحظات"))
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["employer", "graduate"]
        verbose_name = _("خريج محفوظ")
        verbose_name_plural = _("الخريجين المحفوظين")
