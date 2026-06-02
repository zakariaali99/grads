from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils.translation import gettext_lazy as _
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    GraduateProfile,
    Education,
    Certification,
    Experience,
    Project,
    CV,
    Skill,
    SkillCategory,
    College,
    SavedGraduate,
    GraduateSkill,
)
from .serializers import (
    GraduateProfileListSerializer,
    GraduateProfileDetailSerializer,
    GraduateProfileUpdateSerializer,
    EducationSerializer,
    CertificationSerializer,
    ExperienceSerializer,
    ProjectSerializer,
    CVSerializer,
    SkillSerializer,
    SkillCategorySerializer,
    CollegeSerializer,
    SavedGraduateSerializer,
    GraduateSkillSerializer,
)
from apps.accounts.permissions import IsGraduate, IsEmployer


class GraduateProfileViewSet(viewsets.ModelViewSet):
    queryset = GraduateProfile.objects.select_related("user", "college").prefetch_related(
        "skills", "education", "certifications", "experience", "projects", "cvs"
    )
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["college", "graduation_year", "city", "available_for_work", "is_employed"]

    def get_serializer_class(self):
        if self.action == "list":
            return GraduateProfileListSerializer
        elif self.action in ("update", "partial_update"):
            return GraduateProfileUpdateSerializer
        return GraduateProfileDetailSerializer

    @action(detail=False, methods=["get"])
    def me(self, request):
        try:
            profile = GraduateProfile.objects.get(user=request.user)
        except GraduateProfile.DoesNotExist:
            return Response({"detail": _("لم يتم العثور على الملف الشخصي.")}, status=status.HTTP_404_NOT_FOUND)
        serializer = GraduateProfileDetailSerializer(profile, context={"request": request})
        return Response(serializer.data)

    def get_permissions(self):
        if self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsGraduate()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action == "list":
            qs = qs.filter(user__is_active=True, user__is_banned=False)
        return qs

    @action(detail=True, methods=["post"])
    def add_skill(self, request, pk=None):
        profile = self.get_object()
        if profile.user != request.user:
            return Response({"error": _("غير مصرح")}, status=status.HTTP_403_FORBIDDEN)
        serializer = GraduateSkillSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(graduate=profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["delete"])
    def remove_skill(self, request, pk=None):
        profile = self.get_object()
        if profile.user != request.user:
            return Response({"error": _("غير مصرح")}, status=status.HTTP_403_FORBIDDEN)
        skill_id = request.data.get("skill_id")
        if not skill_id:
            return Response({"error": _("معرف المهارة مطلوب")}, status=status.HTTP_400_BAD_REQUEST)
        GraduateSkill.objects.filter(graduate=profile, skill_id=skill_id).delete()
        return Response({"success": True, "message": _("تم حذف المهارة.")})

    @action(detail=True, methods=["get"])
    def saved_status(self, request, pk=None):
        profile = self.get_object()
        if request.user.user_type == "employer":
            saved = SavedGraduate.objects.filter(employer=request.user, graduate=profile).exists()
            return Response({"saved": saved})
        return Response({"saved": False})


class EducationViewSet(viewsets.ModelViewSet):
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated, IsGraduate]
    pagination_class = None

    def get_queryset(self):
        profile = GraduateProfile.objects.get(user=self.request.user)
        return Education.objects.filter(graduate=profile)

    def perform_create(self, serializer):
        profile = GraduateProfile.objects.get(user=self.request.user)
        serializer.save(graduate=profile)


class CertificationViewSet(viewsets.ModelViewSet):
    serializer_class = CertificationSerializer
    permission_classes = [permissions.IsAuthenticated, IsGraduate]
    pagination_class = None

    def get_queryset(self):
        profile = GraduateProfile.objects.get(user=self.request.user)
        return Certification.objects.filter(graduate=profile)

    def perform_create(self, serializer):
        profile = GraduateProfile.objects.get(user=self.request.user)
        serializer.save(graduate=profile)


class ExperienceViewSet(viewsets.ModelViewSet):
    serializer_class = ExperienceSerializer
    permission_classes = [permissions.IsAuthenticated, IsGraduate]
    pagination_class = None

    def get_queryset(self):
        profile = GraduateProfile.objects.get(user=self.request.user)
        return Experience.objects.filter(graduate=profile)

    def perform_create(self, serializer):
        profile = GraduateProfile.objects.get(user=self.request.user)
        serializer.save(graduate=profile)


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsGraduate]
    pagination_class = None

    def get_queryset(self):
        profile = GraduateProfile.objects.get(user=self.request.user)
        return Project.objects.filter(graduate=profile)

    def perform_create(self, serializer):
        profile = GraduateProfile.objects.get(user=self.request.user)
        serializer.save(graduate=profile)


class CVViewSet(viewsets.ModelViewSet):
    serializer_class = CVSerializer
    permission_classes = [permissions.IsAuthenticated, IsGraduate]
    pagination_class = None

    def get_queryset(self):
        profile = GraduateProfile.objects.get(user=self.request.user)
        return CV.objects.filter(graduate=profile)

    def perform_create(self, serializer):
        profile = GraduateProfile.objects.get(user=self.request.user)
        serializer.save(graduate=profile)

    @action(detail=True, methods=["post"])
    def set_default(self, request, pk=None):
        cv = self.get_object()
        profile = GraduateProfile.objects.get(user=request.user)
        profile.cvs.update(is_default=False)
        cv.is_default = True
        cv.save()
        return Response({"success": True, "message": _("تم تعيين السيرة الافتراضية.")})


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Skill.objects.filter(is_active=True)
    serializer_class = SkillSerializer
    search_fields = ["name_ar", "name_en"]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["category"]


class SkillCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SkillCategory.objects.all()
    serializer_class = SkillCategorySerializer


class CollegeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = College.objects.filter(is_active=True)
    serializer_class = CollegeSerializer
    search_fields = ["name_ar", "name_en"]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["city"]


class SavedGraduateViewSet(viewsets.ModelViewSet):
    serializer_class = SavedGraduateSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployer]

    def get_queryset(self):
        return SavedGraduate.objects.filter(employer=self.request.user).select_related("graduate__user")

    def perform_create(self, serializer):
        serializer.save(employer=self.request.user)

    @action(detail=False, methods=["delete"])
    def remove(self, request):
        graduate_id = request.data.get("graduate_id")
        if not graduate_id:
            return Response({"error": _("معرف الخريج مطلوب")}, status=status.HTTP_400_BAD_REQUEST)
        SavedGraduate.objects.filter(employer=request.user, graduate_id=graduate_id).delete()
        return Response({"success": True, "message": _("تم الحذف من المحفوظات.")})
