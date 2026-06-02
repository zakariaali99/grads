from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import CompanyProfile, Industry, HRTeamMember, CompanyReview


@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    list_display = ["company_name", "user", "industry", "city", "is_verified", "is_featured", "total_jobs"]
    list_filter = ["is_verified", "is_featured", "industry", "city"]
    search_fields = ["company_name", "commercial_registration", "user__email"]


@admin.register(Industry)
class IndustryAdmin(admin.ModelAdmin):
    list_display = ["name_ar", "is_active"]
    search_fields = ["name_ar", "name_en"]


@admin.register(HRTeamMember)
class HRTeamMemberAdmin(admin.ModelAdmin):
    list_display = ["company", "user", "role", "is_active"]
    list_filter = ["role", "is_active"]


@admin.register(CompanyReview)
class CompanyReviewAdmin(admin.ModelAdmin):
    list_display = ["company", "graduate", "rating", "is_approved"]
    list_filter = ["is_approved", "rating"]
