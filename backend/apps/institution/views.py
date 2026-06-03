from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from .models import InstitutionProfile, GraduateTracking, InstitutionPartnership, CurriculumFeedback
from .serializers import (
    InstitutionProfileSerializer,
    InstitutionProfileUpdateSerializer,
    GraduateTrackingSerializer,
    GraduateTrackingImportSerializer,
    InstitutionPartnershipSerializer,
    CurriculumFeedbackSerializer,
)
from apps.accounts.permissions import IsInstitution


class InstitutionProfileViewSet(viewsets.ModelViewSet):
    queryset = InstitutionProfile.objects.select_related("user").all()

    def get_serializer_class(self):
        if self.action in ("update", "partial_update"):
            return InstitutionProfileUpdateSerializer
        return InstitutionProfileSerializer

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsInstitution()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def me(self, request):
        try:
            profile = InstitutionProfile.objects.get(user=request.user)
        except InstitutionProfile.DoesNotExist:
            return Response(
                {"detail": _("لم يتم العثور على الملف الشخصي.")},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = self.get_serializer(profile)
        return Response(serializer.data)


class GraduateTrackingViewSet(viewsets.ModelViewSet):
    serializer_class = GraduateTrackingSerializer

    def get_permissions(self):
        if self.action == "list":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsInstitution()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return GraduateTracking.objects.select_related("graduate", "institution").all()

        try:
            profile = InstitutionProfile.objects.get(user=user)
        except InstitutionProfile.DoesNotExist:
            return GraduateTracking.objects.none()

        qs = GraduateTracking.objects.filter(institution=profile).select_related("graduate")

        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)

        major = self.request.query_params.get("major")
        if major:
            qs = qs.filter(major__icontains=major)

        year = self.request.query_params.get("graduation_year")
        if year:
            qs = qs.filter(graduation_year=year)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(graduate__first_name__icontains=search) |
                Q(graduate__last_name__icontains=search) |
                Q(student_id__icontains=search) |
                Q(major__icontains=search)
            )

        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        institution = InstitutionProfile.objects.get(user=self.request.user)
        serializer.save(institution=institution)

    @action(detail=False, methods=["post"])
    def import_csv(self, request):
        institution = InstitutionProfile.objects.get(user=request.user)
        serializer = GraduateTrackingImportSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)

        created = 0
        updated = 0
        errors = []

        for row in serializer.validated_data:
            try:
                graduate_user = None
                if row.get("graduate_email"):
                    try:
                        graduate_user = get_user_model().objects.get(email=row["graduate_email"])
                    except get_user_model().DoesNotExist:
                        pass
                defaults = {
                    "major": row["major"],
                    "college": row.get("college", ""),
                    "enrollment_year": row["enrollment_year"],
                    "graduation_year": row.get("graduation_year"),
                    "gpa": row.get("gpa"),
                    "status": row.get("status", "enrolled"),
                }
                if graduate_user:
                    defaults["graduate"] = graduate_user
                obj, was_created = GraduateTracking.objects.update_or_create(
                    institution=institution,
                    student_id=row["student_id"],
                    defaults=defaults,
                )
                if was_created:
                    created += 1
                else:
                    updated += 1
            except Exception as e:
                errors.append({"row": row, "error": str(e)})

        return Response({
            "created": created,
            "updated": updated,
            "errors": errors,
        })

    @action(detail=True, methods=["patch"])
    def update_employment(self, request, pk=None):
        tracking = self.get_object()
        tracking.is_employed = request.data.get("is_employed", tracking.is_employed)
        tracking.employment_details = request.data.get("employment_details", tracking.employment_details)
        tracking.save()
        serializer = self.get_serializer(tracking)
        return Response(serializer.data)


class InstitutionPartnershipViewSet(viewsets.ModelViewSet):
    serializer_class = InstitutionPartnershipSerializer

    def get_permissions(self):
        if self.action == "list":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsInstitution()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return InstitutionPartnership.objects.select_related("institution", "company").all()

        try:
            profile = InstitutionProfile.objects.get(user=user)
        except InstitutionProfile.DoesNotExist:
            return InstitutionPartnership.objects.none()

        return InstitutionPartnership.objects.filter(institution=profile).select_related("company")

    def perform_create(self, serializer):
        institution = InstitutionProfile.objects.get(user=self.request.user)
        serializer.save(institution=institution)

    @action(detail=True, methods=["post"])
    def upload_agreement(self, request, pk=None):
        partnership = self.get_object()
        file = request.FILES.get("agreement_file")
        if not file:
            return Response({"error": _("الملف مطلوب.")}, status=status.HTTP_400_BAD_REQUEST)
        partnership.agreement_file = file
        partnership.save()
        return Response({"status": "uploaded"})


class CurriculumFeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = CurriculumFeedbackSerializer

    def get_permissions(self):
        if self.action in ("create",):
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return CurriculumFeedback.objects.select_related("institution", "graduate").all()

        try:
            profile = InstitutionProfile.objects.get(user=user)
            return CurriculumFeedback.objects.filter(institution=profile).select_related("graduate")
        except InstitutionProfile.DoesNotExist:
            pass

        return CurriculumFeedback.objects.filter(graduate=user)

    def perform_create(self, serializer):
        serializer.save(graduate=self.request.user)


class InstitutionDashboardView(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated, IsInstitution]

    def list(self, request):
        try:
            institution = InstitutionProfile.objects.get(user=request.user)
        except InstitutionProfile.DoesNotExist:
            return Response({"detail": _("لم يتم العثور على المؤسسة.")}, status=status.HTTP_404_NOT_FOUND)

        graduates_qs = GraduateTracking.objects.filter(institution=institution)

        total_graduates = graduates_qs.count()
        employed = graduates_qs.filter(is_employed=True).count()
        employed_rate = round((employed / total_graduates * 100), 1) if total_graduates > 0 else 0

        by_status = graduates_qs.values("status").annotate(count=Count("id"))
        by_year = graduates_qs.values("graduation_year").annotate(count=Count("id")).order_by("graduation_year")
        by_major = graduates_qs.values("major").annotate(count=Count("id")).order_by("-count")[:10]
        active_partnerships = InstitutionPartnership.objects.filter(institution=institution, status="active").count()

        majors = graduates_qs.values("major").distinct().count()
        avg_gpa = graduates_qs.aggregate(avg=Avg("gpa"))["avg"]

        feedback_count = CurriculumFeedback.objects.filter(institution=institution).count()
        avg_rating = CurriculumFeedback.objects.filter(institution=institution).aggregate(
            avg=Avg("rating")
        )["avg"]

        return Response({
            "total_graduates": total_graduates,
            "employed_count": employed,
            "employed_rate": employed_rate,
            "seeking_count": graduates_qs.filter(is_employed=False, status="graduated").count(),
            "active_partnerships": active_partnerships,
            "majors_count": majors,
            "average_gpa": round(avg_gpa, 2) if avg_gpa else None,
            "feedback_count": feedback_count,
            "average_rating": round(avg_rating, 1) if avg_rating else None,
            "graduates_by_status": list(by_status),
            "graduates_by_year": list(by_year),
            "top_majors": list(by_major),
        })
