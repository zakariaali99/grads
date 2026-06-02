from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import (
    GraduateProfile, GraduateSkill, Skill, SkillCategory,
    Education, Certification, Experience, Project, CV,
    College, SavedGraduate,
)
from apps.accounts.serializers import UserSerializer


class SkillCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillCategory
        fields = ["id", "name_ar", "name_en", "parent", "icon", "sort_order"]


class SkillSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name_ar", read_only=True)

    class Meta:
        model = Skill
        fields = ["id", "name_ar", "name_en", "category", "category_name", "demand_score", "is_active"]


class GraduateSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source="skill.name_ar", read_only=True)

    class Meta:
        model = GraduateSkill
        fields = ["id", "skill", "skill_name", "proficiency", "years_experience", "is_top_skill"]


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = "__all__"
        read_only_fields = ["graduate"]


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = "__all__"
        read_only_fields = ["graduate"]


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = "__all__"
        read_only_fields = ["graduate"]


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ["graduate"]


class CVSerializer(serializers.ModelSerializer):
    class Meta:
        model = CV
        fields = "__all__"
        read_only_fields = ["graduate", "file_size", "file_type", "parsed_data", "is_parsed"]


class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = "__all__"


class SavedGraduateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedGraduate
        fields = "__all__"
        read_only_fields = ["employer", "saved_at"]


class GraduateProfileListSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    skills_count = serializers.SerializerMethodField()
    college_name = serializers.CharField(source="college.name_ar", read_only=True)
    is_verified = serializers.BooleanField(source="user.is_verified", read_only=True)

    class Meta:
        model = GraduateProfile
        fields = [
            "id", "user", "headline", "college", "college_name", "graduation_year",
            "major", "city", "skills_count", "available_for_work",
            "profile_views", "is_verified", "created_at",
        ]

    def get_skills_count(self, obj):
        return obj.skills.count()


class GraduateProfileDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    skills = GraduateSkillSerializer(source="graduateskill_set", many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    experience = ExperienceSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    cvs = CVSerializer(many=True, read_only=True)
    college_name = serializers.CharField(source="college.name_ar", read_only=True)
    is_verified = serializers.BooleanField(source="user.is_verified", read_only=True)

    class Meta:
        model = GraduateProfile
        fields = [
            "id", "user", "headline", "college", "college_name", "graduation_year",
            "major", "gpa", "city", "is_employed", "current_company", "current_position",
            "skills", "education", "certifications", "experience", "projects", "cvs",
            "available_for_work", "expected_salary",
            "linkedin_url", "github_url", "portfolio_url", "behance_url",
            "profile_views", "search_appearances", "employer_interactions",
            "is_verified", "created_at", "updated_at",
        ]
        read_only_fields = [
            "user", "profile_views", "search_appearances", "employer_interactions",
            "created_at", "updated_at",
        ]


class GraduateProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = GraduateProfile
        fields = [
            "headline", "college", "graduation_year", "major", "gpa", "city",
            "is_employed", "current_company", "current_position",
            "available_for_work", "expected_salary",
            "linkedin_url", "github_url", "portfolio_url", "behance_url",
        ]
