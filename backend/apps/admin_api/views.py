from rest_framework import viewsets, permissions, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from apps.graduates.models import GraduateProfile
from apps.employers.models import CompanyProfile
from apps.jobs.models import JobPost
from apps.analytics.models import DailyStat, PlatformEvent
from apps.accounts.models import AuditLog
from apps.accounts.serializers import UserSerializer

User = get_user_model()


class UserListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "user_type",
            "full_name",
            "first_name",
            "last_name",
            "gender",
            "date_of_birth",
            "is_verified",
            "is_active",
            "is_banned",
            "profile_completion",
            "date_joined",
            "last_login",
        ]

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class AdminPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAdminUser]
    search_fields = ["username", "email", "first_name", "last_name"]
    filterset_fields = ["user_type", "is_verified", "is_banned", "is_active"]
    pagination_class = StandardResultsSetPagination

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
            "id",
            "user",
            "headline",
            "college",
            "college_name",
            "graduation_year",
            "major",
            "gpa",
            "city",
            "is_employed",
            "current_company",
            "current_position",
            "skills_count",
            "is_verified",
            "profile_completion",
            "available_for_work",
            "created_at",
        ]

    def get_skills_count(self, obj):
        return obj.skills.count()


class AdminGraduateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GraduateProfile.objects.select_related("user", "college").all()
    serializer_class = AdminGraduateSerializer
    permission_classes = [permissions.IsAdminUser]
    search_fields = ["user__first_name", "user__last_name", "user__username", "major", "college__name_ar"]
    filterset_fields = ["college", "city", "graduation_year"]
    pagination_class = StandardResultsSetPagination

    @action(detail=True, methods=["post"])
    def verify(self, request, pk=None):
        graduate = self.get_object()
        graduate.user.is_verified = True
        graduate.user.verified_at = timezone.now()
        graduate.user.save()
        return Response({"success": True, "message": _("تم توثيق الخريج.")})

    def destroy(self, request, *args, **kwargs):
        graduate = self.get_object()
        graduate.user.is_active = False
        graduate.user.save()
        return Response({"success": True, "message": _("تم حذف الخريج.")})


class AdminCompanySerializer(serializers.ModelSerializer):
    industry_name = serializers.CharField(source="industry.name_ar", read_only=True)
    job_count = serializers.SerializerMethodField()
    user = UserSerializer(read_only=True)

    class Meta:
        model = CompanyProfile
        fields = [
            "id",
            "company_name",
            "industry",
            "industry_name",
            "company_size",
            "city",
            "website",
            "description",
            "is_verified",
            "is_featured",
            "total_jobs",
            "job_count",
            "total_hires",
            "profile_views",
            "created_at",
            "user",
        ]

    def get_job_count(self, obj):
        return obj.company_jobs.count()


class AdminCompanyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CompanyProfile.objects.select_related("user", "industry").all()
    serializer_class = AdminCompanySerializer
    permission_classes = [permissions.IsAdminUser]
    search_fields = ["company_name", "city", "industry__name_ar"]
    filterset_fields = ["city", "industry", "is_verified"]
    pagination_class = StandardResultsSetPagination

    @action(detail=True, methods=["post"])
    def verify(self, request, pk=None):
        company = self.get_object()
        company.is_verified = True
        company.verified_at = timezone.now()
        company.save()
        return Response({"success": True, "message": _("تم توثيق الشركة.")})

    @action(detail=True, methods=["post"])
    def toggle_featured(self, request, pk=None):
        company = self.get_object()
        company.is_featured = not company.is_featured
        company.save(update_fields=["is_featured"])
        status = _("مميزة") if company.is_featured else _("غير مميزة")
        return Response({"success": True, "is_featured": company.is_featured, "message": status})

    def destroy(self, request, *args, **kwargs):
        company = self.get_object()
        company.user.is_active = False
        company.user.save()
        return Response({"success": True, "message": _("تم حذف الشركة.")})


class AdminJobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.company_name", read_only=True)
    company_logo = serializers.ImageField(source="company.logo", read_only=True)
    company_verified = serializers.BooleanField(source="company.is_verified", read_only=True)
    category_name = serializers.CharField(source="category.name_ar", read_only=True)

    class Meta:
        model = JobPost
        fields = [
            "id",
            "title",
            "company",
            "company_name",
            "company_logo",
            "company_verified",
            "category",
            "category_name",
            "employment_type",
            "experience_level",
            "city",
            "is_remote",
            "salary_min",
            "salary_max",
            "salary_currency",
            "vacancies",
            "status",
            "is_featured",
            "is_urgent",
            "views_count",
            "applications_count",
            "shortlisted_count",
            "deadline",
            "published_at",
            "created_at",
        ]


class AdminJobViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = JobPost.objects.select_related("company", "category").all()
    serializer_class = AdminJobSerializer
    permission_classes = [permissions.IsAdminUser]
    search_fields = ["title", "company__company_name", "city"]
    filterset_fields = ["status", "employment_type", "is_featured", "company"]
    pagination_class = StandardResultsSetPagination

    @action(detail=True, methods=["post"])
    def toggle_featured(self, request, pk=None):
        job = self.get_object()
        job.is_featured = not job.is_featured
        job.save(update_fields=["is_featured"])
        status = _("مميزة") if job.is_featured else _("غير مميزة")
        return Response({"success": True, "is_featured": job.is_featured, "message": status})

    def destroy(self, request, *args, **kwargs):
        job = self.get_object()
        job.status = JobPost.Status.CLOSED
        job.save(update_fields=["status"])
        return Response({"success": True, "message": _("تم إغلاق الوظيفة.")})


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(source="timestamp", read_only=True)

    class Meta:
        model = AuditLog
        fields = ["id", "user", "user_name", "action", "model_name", "object_id", "ip_address", "created_at"]

    def get_user_name(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.username
        return _("غير معروف")


class AdminAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related("user").all()
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAdminUser]
    search_fields = ["action", "model_name", "user__username", "user__first_name", "user__last_name"]
    filterset_fields = ["action", "model_name"]
    pagination_class = StandardResultsSetPagination


class PlatformEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformEvent
        fields = ["id", "event_type", "description", "created_at"]


class AdminPlatformEventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PlatformEvent.objects.all()
    serializer_class = PlatformEventSerializer
    permission_classes = [permissions.IsAdminUser]
    search_fields = ["event_type", "description"]
    filterset_fields = ["event_type"]
    pagination_class = StandardResultsSetPagination


class DailyStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyStat
        fields = ["date", "new_graduates", "new_employers", "new_jobs", "applications", "profile_views", "searches", "interviews", "hirings"]


class AdminDailyStatViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DailyStat.objects.all()
    serializer_class = DailyStatSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = super().get_queryset()
        days = self.request.query_params.get("days")
        if days:
            from django.utils import timezone
            from datetime import timedelta
            cutoff = timezone.now().date() - timedelta(days=int(days))
            qs = qs.filter(date__gte=cutoff)
        return qs
