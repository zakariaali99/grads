from django.contrib import admin
from .models import (
    GraduateProfile,
    Skill,
    SkillCategory,
    Education,
    Certification,
    Experience,
    Project,
    CV,
    College,
    SavedGraduate,
)


@admin.register(GraduateProfile)
class GraduateProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "college", "graduation_year", "major", "city", "available_for_work", "profile_views"]
    list_filter = ["college", "graduation_year", "available_for_work", "is_employed"]
    search_fields = ["user__username", "user__email", "major", "city"]
    raw_id_fields = ["user", "college", "skills"]


@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    list_display = ["name_ar", "parent", "sort_order"]
    list_filter = ["parent"]
    search_fields = ["name_ar", "name_en"]


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ["name_ar", "category", "demand_score", "is_active"]
    list_filter = ["category", "is_active"]
    search_fields = ["name_ar", "name_en"]


@admin.register(College)
class CollegeAdmin(admin.ModelAdmin):
    list_display = ["name_ar", "code", "city", "is_active"]
    list_filter = ["city", "is_active"]
    search_fields = ["name_ar", "name_en", "code"]


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ["graduate", "degree", "institution", "start_date", "end_date"]
    search_fields = ["graduate__user__username", "institution"]


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ["name", "issuer", "issue_date", "is_verified"]
    list_filter = ["is_verified"]


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ["graduate", "title", "company", "start_date", "is_current"]
    search_fields = ["title", "company"]


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["title", "graduate", "start_date", "is_ongoing"]


@admin.register(CV)
class CVAdmin(admin.ModelAdmin):
    list_display = ["graduate", "title", "language", "is_default", "is_parsed", "download_count"]
    list_filter = ["language", "is_default", "is_parsed"]


@admin.register(SavedGraduate)
class SavedGraduateAdmin(admin.ModelAdmin):
    list_display = ["employer", "graduate", "saved_at"]
