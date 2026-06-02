from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import CompanyProfile, Industry, HRTeamMember, CompanyReview
from apps.accounts.serializers import UserSerializer


class IndustrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Industry
        fields = "__all__"


class CompanyProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    industry_name = serializers.CharField(source="industry.name_ar", read_only=True)
    job_count = serializers.SerializerMethodField()

    class Meta:
        model = CompanyProfile
        fields = "__all__"
        read_only_fields = ["user", "profile_views", "total_jobs", "total_hires", "is_verified", "verified_at"]

    def get_job_count(self, obj):
        return obj.company_jobs.count()


class CompanyProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyProfile
        fields = [
            "company_name", "company_name_en", "industry", "company_size",
            "website", "logo", "cover_image", "description",
            "city", "address", "phone", "linkedin_url", "twitter_url",
        ]


class HRTeamMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = HRTeamMember
        fields = "__all__"
        read_only_fields = ["company", "invited_at", "joined_at"]


class CompanyReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyReview
        fields = "__all__"
        read_only_fields = ["graduate", "is_approved", "created_at"]
