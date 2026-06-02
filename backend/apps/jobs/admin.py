from django.contrib import admin
from .models import JobPost, JobApplication, Interview, JobCategory, SavedJob


@admin.register(JobPost)
class JobPostAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "company",
        "status",
        "employment_type",
        "experience_level",
        "applications_count",
        "published_at",
    ]
    list_filter = ["status", "employment_type", "experience_level", "is_featured", "is_urgent"]
    search_fields = ["title", "description", "company__company_name"]
    raw_id_fields = ["company", "posted_by", "category", "skills", "targeted_colleges"]
    date_hierarchy = "published_at"


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ["applicant", "job", "status", "match_score", "applied_at"]
    list_filter = ["status"]
    search_fields = ["applicant__username", "job__title"]
    date_hierarchy = "applied_at"


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ["application", "interview_type", "status", "scheduled_at", "scheduled_by"]
    list_filter = ["status", "interview_type"]
    date_hierarchy = "scheduled_at"


@admin.register(JobCategory)
class JobCategoryAdmin(admin.ModelAdmin):
    list_display = ["name_ar", "sort_order", "is_active"]
    search_fields = ["name_ar", "name_en"]


@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ["user", "job", "saved_at"]
