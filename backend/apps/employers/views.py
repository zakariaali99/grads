from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from django_filters.rest_framework import DjangoFilterBackend
from .models import CompanyProfile, Industry, HRTeamMember, CompanyReview
from .serializers import (
    CompanyProfileSerializer,
    CompanyProfileUpdateSerializer,
    IndustrySerializer,
    HRTeamMemberSerializer,
    CompanyReviewSerializer,
)
from apps.accounts.permissions import IsEmployer


class CompanyProfileViewSet(viewsets.ModelViewSet):
    queryset = CompanyProfile.objects.select_related("user", "industry").all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["city", "industry", "is_verified", "company_size"]

    def get_serializer_class(self):
        if self.action in ("update", "partial_update"):
            return CompanyProfileUpdateSerializer
        return CompanyProfileSerializer

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsEmployer()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action == "list":
            qs = qs.filter(user__is_active=True)
        return qs

    @action(detail=False, methods=["get"])
    def me(self, request):
        try:
            company = CompanyProfile.objects.get(user=request.user)
        except CompanyProfile.DoesNotExist:
            return Response({"detail": _("لم يتم العثور على الشركة.")}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(company)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def add_hr_member(self, request, pk=None):
        company = self.get_object()
        if company.user != request.user:
            return Response({"error": _("غير مصرح")}, status=status.HTTP_403_FORBIDDEN)
        serializer = HRTeamMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(company=company)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"])
    def hr_team(self, request, pk=None):
        company = self.get_object()
        team = HRTeamMember.objects.filter(company=company, is_active=True)
        serializer = HRTeamMemberSerializer(team, many=True)
        return Response(serializer.data)


class IndustryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Industry.objects.filter(is_active=True)
    serializer_class = IndustrySerializer


class CompanyReviewViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CompanyReview.objects.filter(graduate=self.request.user)

    def perform_create(self, serializer):
        serializer.save(graduate=self.request.user)
