from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from apps.graduates.models import GraduateProfile
from apps.employers.models import CompanyProfile
from apps.graduates.serializers import GraduateProfileListSerializer
from apps.employers.serializers import CompanyProfileSerializer
from apps.accounts.serializers import UserSerializer

User = get_user_model()


class UserListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "phone", "user_type", "full_name",
            "first_name", "last_name", "gender", "date_of_birth",
            "is_verified", "is_active", "is_banned", "profile_completion",
            "date_joined", "last_login",
        ]

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAdminUser]
    search_fields = ["username", "email", "first_name", "last_name"]
    filterset_fields = ["user_type", "is_verified", "is_banned", "is_active"]

    @action(detail=True, methods=["post"])
    def ban(self, request, pk=None):
        user = self.get_object()
        user.is_banned = True
        user.is_active = False
        user.ban_reason = request.data.get("reason", "")
        user.save()
        return Response({"success": True, "message": _("تم حظر المستخدم.")})

    @action(detail=True, methods=["post"])
    def unban(self, request, pk=None):
        user = self.get_object()
        user.is_banned = False
        user.is_active = True
        user.ban_reason = ""
        user.save()
        return Response({"success": True, "message": _("تم إلغاء حظر المستخدم.")})

    @action(detail=True, methods=["post"])
    def verify(self, request, pk=None):
        user = self.get_object()
        user.is_verified = True
        user.verified_at = timezone.now()
        user.save()
        return Response({"success": True, "message": _("تم توثيق المستخدم.")})

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({"success": True, "message": _("تم حذف المستخدم.")})


class AdminGraduateSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    college_name = serializers.CharField(source="college.name_ar", read_only=True)
    is_verified = serializers.BooleanField(source="user.is_verified", read_only=True)
    profile_completion = serializers.FloatField(source="user.profile_completion", read_only=True)
    skills_count = serializers.SerializerMethodField()

    class Meta:
        model = GraduateProfile
        fields = [
            "id", "user", "headline", "college", "college_name", "graduation_year",
            "major", "gpa", "city", "is_employed", "current_company",
            "current_position", "skills_count", "is_verified",
            "profile_completion", "available_for_work", "created_at",
        ]

    def get_skills_count(self, obj):
        return obj.skills.count()


class AdminGraduateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GraduateProfile.objects.select_related("user", "college").all()
    serializer_class = AdminGraduateSerializer
    permission_classes = [permissions.IsAdminUser]
    search_fields = ["user__first_name", "user__last_name", "user__username", "major", "college__name_ar"]
    filterset_fields = ["college", "city", "graduation_year"]

    @action(detail=True, methods=["post"])
    def verify(self, request, pk=None):
        graduate = self.get_object()
        graduate.user.is_verified = True
        graduate.user.verified_at = timezone.now()
        graduate.user.save()
        return Response({"success": True, "message": _("تم توثيق الخريج.")})


class AdminCompanySerializer(serializers.ModelSerializer):
    industry_name = serializers.CharField(source="industry.name_ar", read_only=True)
    job_count = serializers.SerializerMethodField()
    user = UserSerializer(read_only=True)

    class Meta:
        model = CompanyProfile
        fields = [
            "id", "company_name", "industry", "industry_name", "company_size",
            "city", "website", "description", "is_verified", "is_featured",
            "total_jobs", "job_count", "total_hires", "profile_views",
            "created_at", "user",
        ]

    def get_job_count(self, obj):
        return obj.company_jobs.count()


class AdminCompanyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CompanyProfile.objects.select_related("user", "industry").all()
    serializer_class = AdminCompanySerializer
    permission_classes = [permissions.IsAdminUser]
    search_fields = ["company_name", "city", "industry__name_ar"]
    filterset_fields = ["city", "industry", "is_verified"]

    @action(detail=True, methods=["post"])
    def verify(self, request, pk=None):
        company = self.get_object()
        company.is_verified = True
        company.verified_at = timezone.now()
        company.save()
        return Response({"success": True, "message": _("تم توثيق الشركة.")})
