from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import JobPost, JobApplication, Interview, JobCategory, SavedJob
from apps.graduates.serializers import SkillSerializer
from apps.employers.serializers import CompanyProfileSerializer


class JobCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobCategory
        fields = "__all__"


class JobPostListSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.company_name", read_only=True)
    company_logo = serializers.ImageField(source="company.logo", read_only=True)
    company_city = serializers.CharField(source="company.city", read_only=True)
    company_verified = serializers.BooleanField(source="company.is_verified", read_only=True)
    category_name = serializers.CharField(source="category.name_ar", read_only=True)
    skills_list = SkillSerializer(source="skills", many=True, read_only=True)
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = JobPost
        fields = [
            "id", "title", "company", "company_name", "company_logo",
            "company_city", "company_verified", "category", "category_name",
            "employment_type", "experience_level", "city", "is_remote",
            "salary_min", "salary_max", "salary_currency",
            "skills_list", "vacancies", "status", "is_featured", "is_urgent",
            "views_count", "applications_count", "deadline", "published_at", "time_ago",
        ]
        read_only_fields = ["views_count", "applications_count"]

    def get_time_ago(self, obj):
        from django.utils.timesince import timesince
        if obj.published_at:
            return timesince(obj.published_at)
        return ""


class JobPostDetailSerializer(serializers.ModelSerializer):
    company = CompanyProfileSerializer(read_only=True)
    category_name = serializers.CharField(source="category.name_ar", read_only=True)
    skills_list = SkillSerializer(source="skills", many=True, read_only=True)
    is_saved = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()

    class Meta:
        model = JobPost
        fields = "__all__"

    def get_is_saved(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return SavedJob.objects.filter(user=request.user, job=obj).exists()
        return False

    def get_has_applied(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return JobApplication.objects.filter(job=obj, applicant=request.user).exists()
        return False


class JobPostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPost
        exclude = [
            "company", "posted_by", "views_count", "applications_count",
            "shortlisted_count", "published_at", "closed_at", "created_at", "updated_at",
        ]

    def create(self, validated_data):
        skills = validated_data.pop("skills", [])
        targeted_colleges = validated_data.pop("targeted_colleges", [])
        job = JobPost.objects.create(**validated_data)
        job.skills.set(skills)
        job.targeted_colleges.set(targeted_colleges)
        return job


class JobApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.SerializerMethodField()
    applicant_avatar = serializers.ImageField(source="applicant.avatar", read_only=True)
    job_title = serializers.CharField(source="job.title", read_only=True)
    company_name = serializers.CharField(source="job.company.company_name", read_only=True)

    class Meta:
        model = JobApplication
        fields = "__all__"
        read_only_fields = ["applicant", "applied_at", "updated_at", "match_score"]

    def get_applicant_name(self, obj):
        return obj.applicant.get_full_name() or obj.applicant.username


class JobApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ["cv", "cover_letter"]


class InterviewSerializer(serializers.ModelSerializer):
    applicant_name = serializers.CharField(source="application.applicant.get_full_name", read_only=True)
    job_title = serializers.CharField(source="application.job.title", read_only=True)
    company_name = serializers.CharField(source="application.job.company.company_name", read_only=True)

    class Meta:
        model = Interview
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]


class SavedJobSerializer(serializers.ModelSerializer):
    job = JobPostListSerializer(read_only=True)

    class Meta:
        model = SavedJob
        fields = "__all__"
        read_only_fields = ["user", "saved_at"]
