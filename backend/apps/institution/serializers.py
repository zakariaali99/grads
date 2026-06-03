from rest_framework import serializers
from .models import InstitutionProfile, GraduateTracking, InstitutionPartnership, CurriculumFeedback
from apps.accounts.serializers import UserSerializer


class InstitutionProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = InstitutionProfile
        fields = "__all__"
        read_only_fields = ["user", "graduate_count", "is_verified", "verified_at"]


class InstitutionProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitutionProfile
        fields = [
            "institution_name", "institution_name_en", "institution_type", "logo",
            "cover_image", "website", "phone", "address", "city", "country",
            "description", "student_count",
        ]


class GraduateTrackingSerializer(serializers.ModelSerializer):
    graduate_name = serializers.SerializerMethodField()
    graduate_email = serializers.EmailField(source="graduate.email", read_only=True)

    class Meta:
        model = GraduateTracking
        fields = "__all__"
        read_only_fields = ["institution", "created_at", "updated_at"]

    def get_graduate_name(self, obj):
        return obj.graduate.get_full_name() or obj.graduate.username

    def validate_graduate(self, value):
        if value.user_type != "graduate":
            raise serializers.ValidationError("User must be a graduate.")
        return value


class GraduateTrackingImportSerializer(serializers.Serializer):
    student_id = serializers.CharField(max_length=100)
    graduate_email = serializers.EmailField(required=False, allow_blank=True)
    full_name = serializers.CharField(max_length=255)
    major = serializers.CharField(max_length=255)
    college = serializers.CharField(max_length=255, required=False, allow_blank=True)
    enrollment_year = serializers.IntegerField()
    graduation_year = serializers.IntegerField(required=False, allow_null=True)
    gpa = serializers.FloatField(required=False, allow_null=True)
    status = serializers.ChoiceField(
        choices=["enrolled", "graduated", "withdrew", "suspended"], default="enrolled"
    )


class InstitutionPartnershipSerializer(serializers.ModelSerializer):
    institution_name = serializers.CharField(source="institution.institution_name", read_only=True)
    company_name = serializers.CharField(source="company.company_name", read_only=True)

    class Meta:
        model = InstitutionPartnership
        fields = "__all__"
        read_only_fields = ["institution", "created_at", "updated_at"]


class CurriculumFeedbackSerializer(serializers.ModelSerializer):
    graduate_name = serializers.SerializerMethodField()

    class Meta:
        model = CurriculumFeedback
        fields = "__all__"
        read_only_fields = ["graduate", "created_at"]

    def get_graduate_name(self, obj):
        return obj.graduate.get_full_name() or obj.graduate.username
