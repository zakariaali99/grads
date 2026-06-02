from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.db.models import F
from django_filters.rest_framework import DjangoFilterBackend
from .models import JobPost, JobApplication, Interview, JobCategory, SavedJob
from .serializers import (
    JobPostListSerializer, JobPostDetailSerializer, JobPostCreateSerializer,
    JobApplicationSerializer, JobApplicationCreateSerializer,
    InterviewSerializer, JobCategorySerializer, SavedJobSerializer,
)
from apps.accounts.permissions import IsEmployer, IsGraduate, IsOwnerOrAdmin
from apps.graduates.models import GraduateProfile


class JobPostViewSet(viewsets.ModelViewSet):
    queryset = JobPost.objects.select_related(
        "company", "category", "posted_by"
    ).prefetch_related("skills", "targeted_colleges")
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        "employment_type": ["exact"],
        "experience_level": ["exact"],
        "city": ["exact"],
        "is_remote": ["exact"],
        "status": ["exact"],
        "is_featured": ["exact"],
        "is_urgent": ["exact"],
        "company": ["exact"],
        "category": ["exact"],
        "skills": ["exact"],
        "created_at": ["gte", "lte"],
        "salary_min": ["gte"],
        "salary_max": ["lte"],
    }
    search_fields = ["title", "description", "requirements"]
    ordering_fields = ["created_at", "published_at", "views_count", "applications_count", "salary_min"]
    ordering = ["-published_at", "-created_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return JobPostListSerializer
        elif self.action in ("create", "update", "partial_update"):
            return JobPostCreateSerializer
        return JobPostDetailSerializer

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsEmployer()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if self.action == "list":
            qs = qs.filter(status=JobPost.Status.ACTIVE).exclude(deadline__lt=timezone.now())
        elif self.action in ("update", "partial_update", "destroy"):
            qs = qs.filter(posted_by=user) if user.is_authenticated else qs.none()
        return qs

    def perform_create(self, serializer):
        company = self.request.user.company_profile
        serializer.save(
            company=company,
            posted_by=self.request.user,
            status=JobPost.Status.DRAFT,
        )

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        job = self.get_object()
        if job.posted_by != request.user:
            return Response({"error": _("غير مصرح")}, status=status.HTTP_403_FORBIDDEN)
        job.status = JobPost.Status.ACTIVE
        job.published_at = timezone.now()
        job.save()
        return Response({"success": True, "message": _("تم نشر الوظيفة.")})

    @action(detail=True, methods=["post"])
    def close(self, request, pk=None):
        job = self.get_object()
        if job.posted_by != request.user:
            return Response({"error": _("غير مصرح")}, status=status.HTTP_403_FORBIDDEN)
        job.status = JobPost.Status.CLOSED
        job.closed_at = timezone.now()
        job.save()
        return Response({"success": True, "message": _("تم إغلاق الوظيفة.")})

    @action(detail=True, methods=["post"])
    def apply(self, request, pk=None):
        job = self.get_object()
        if request.user.user_type != "graduate":
            return Response({"error": _("فقط الخريجون يمكنهم التقديم.")}, status=status.HTTP_403_FORBIDDEN)
        if JobApplication.objects.filter(job=job, applicant=request.user).exists():
            return Response({"error": _("لقد تقدمت لهذه الوظيفة مسبقاً.")}, status=status.HTTP_400_BAD_REQUEST)
        if job.status != JobPost.Status.ACTIVE:
            return Response({"error": _("هذه الوظيفة غير متاحة حالياً.")}, status=status.HTTP_400_BAD_REQUEST)

        serializer = JobApplicationCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        application = serializer.save(job=job, applicant=request.user)

        job.applications_count = job.applications.count()
        job.save(update_fields=["applications_count"])

        return Response(JobApplicationSerializer(application).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def increment_view(self, request, pk=None):
        job = self.get_object()
        JobPost.objects.filter(pk=job.pk).update(views_count=models.F("views_count") + 1)
        return Response({"success": True})

    @action(detail=True, methods=["get"])
    def applications(self, request, pk=None):
        job = self.get_object()
        if job.company.user != request.user and request.user not in [m.user for m in job.company.hr_team.all()]:
            return Response({"error": _("غير مصرح")}, status=status.HTTP_403_FORBIDDEN)
        applications = JobApplication.objects.filter(job=job).select_related("applicant", "cv")
        serializer = JobApplicationSerializer(applications, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def save(self, request, pk=None):
        job = self.get_object()
        saved, created = SavedJob.objects.get_or_create(user=request.user, job=job)
        if not created:
            saved.delete()
            return Response({"saved": False, "message": _("تم إزالة الوظيفة من المحفوظات.")})
        return Response({"saved": True, "message": _("تم حفظ الوظيفة.")})


class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == "graduate":
            return JobApplication.objects.filter(applicant=user)
        elif user.user_type == "employer":
            return JobApplication.objects.filter(job__company__user=user)
        return JobApplication.objects.none()

    def get_serializer_class(self):
        if self.action == "create":
            return JobApplicationCreateSerializer
        return JobApplicationSerializer

    @action(detail=True, methods=["post"])
    def update_status(self, request, pk=None):
        application = self.get_object()
        status_value = request.data.get("status")
        if status_value not in dict(JobApplication.Status.choices):
            return Response({"error": _("حالة غير صالحة.")}, status=status.HTTP_400_BAD_REQUEST)

        if request.user.user_type not in ("employer", "admin"):
            return Response({"error": _("غير مصرح")}, status=status.HTTP_403_FORBIDDEN)

        application.status = status_value
        application.save()

        if status_value in ("shortlisted",):
            job = application.job
            job.shortlisted_count = job.applications.filter(status__in=["shortlisted", "interview", "accepted"]).count()
            job.save(update_fields=["shortlisted_count"])

        return Response(JobApplicationSerializer(application).data)


class InterviewViewSet(viewsets.ModelViewSet):
    serializer_class = InterviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        if user.user_type == "employer":
            return Interview.objects.filter(application__job__company__user=user)
        elif user.user_type == "graduate":
            return Interview.objects.filter(application__applicant=user)
        return Interview.objects.none()

    def perform_create(self, serializer):
        serializer.save(scheduled_by=self.request.user)


class JobCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = JobCategory.objects.filter(is_active=True)
    serializer_class = JobCategorySerializer


class SavedJobViewSet(viewsets.ModelViewSet):
    serializer_class = SavedJobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedJob.objects.filter(user=self.request.user).select_related("job__company")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
