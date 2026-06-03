from django.contrib import admin
from .models import InstitutionProfile, GraduateTracking, InstitutionPartnership, CurriculumFeedback


@admin.register(InstitutionProfile)
class InstitutionProfileAdmin(admin.ModelAdmin):
    list_display = ["institution_name", "user", "institution_type", "city", "is_verified", "graduate_count"]
    list_filter = ["is_verified", "institution_type", "city"]
    search_fields = ["institution_name", "license_number", "user__email"]


@admin.register(GraduateTracking)
class GraduateTrackingAdmin(admin.ModelAdmin):
    list_display = ["student_id", "institution", "graduate", "major", "status", "is_employed", "graduation_year"]
    list_filter = ["status", "is_employed", "institution"]
    search_fields = ["student_id", "major", "graduate__email"]


@admin.register(InstitutionPartnership)
class InstitutionPartnershipAdmin(admin.ModelAdmin):
    list_display = ["institution", "company", "partnership_type", "status", "start_date"]
    list_filter = ["status", "partnership_type"]
    search_fields = ["institution__institution_name", "company__company_name"]


@admin.register(CurriculumFeedback)
class CurriculumFeedbackAdmin(admin.ModelAdmin):
    list_display = ["graduate", "institution", "course_name", "rating", "is_public"]
    list_filter = ["rating", "is_public", "institution"]
