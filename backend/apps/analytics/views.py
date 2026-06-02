from rest_framework import views, permissions
from rest_framework.response import Response
from django.db.models import Count
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from datetime import timedelta
from apps.accounts.models import User
from apps.graduates.models import GraduateProfile
from apps.employers.models import CompanyProfile
from apps.jobs.models import JobPost, JobApplication
from .models import StatSummary, PlatformEvent


class AdminAnalyticsView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        now = timezone.now()
        today = now.date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)

        summary, _ = StatSummary.objects.get_or_create(pk=1)

        data = {
            "total_users": User.objects.count(),
            "total_graduates": User.objects.filter(user_type="graduate").count(),
            "total_employers": User.objects.filter(user_type="employer").count(),
            "total_companies": CompanyProfile.objects.count(),
            "verified_graduates": User.objects.filter(user_type="graduate", is_verified=True).count(),
            "verified_companies": CompanyProfile.objects.filter(is_verified=True).count(),
            "total_jobs": JobPost.objects.count(),
            "active_jobs": JobPost.objects.filter(status="active").count(),
            "total_applications": JobApplication.objects.count(),
            "trends": {
                "daily_registrations": User.objects.filter(date_joined__date=today).count(),
                "weekly_registrations": User.objects.filter(date_joined__date__gte=week_ago).count(),
                "monthly_registrations": User.objects.filter(date_joined__date__gte=month_ago).count(),
                "daily_jobs": JobPost.objects.filter(created_at__date=today).count(),
                "daily_applications": JobApplication.objects.filter(applied_at__date=today).count(),
            },
            "top_cities": list(
                GraduateProfile.objects.values("city").annotate(count=Count("id")).order_by("-count")[:10]
            ),
            "top_colleges": list(
                GraduateProfile.objects.values("college__name_ar").annotate(count=Count("id")).order_by("-count")[:10]
            ),
            "employment_types": list(
                JobPost.objects.values("employment_type").annotate(count=Count("id")).order_by("-count")
            ),
            "recent_activity": list(PlatformEvent.objects.values("event_type", "description", "created_at")[:20]),
        }
        return Response(data)


class EmployerAnalyticsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.user_type != "employer":
            return Response({"error": _("غير مصرح")}, status=403)

        company = request.user.company_profile
        now = timezone.now()
        month_ago = now - timedelta(days=30)

        jobs = JobPost.objects.filter(company=company)
        applications = JobApplication.objects.filter(job__in=jobs)

        data = {
            "jobs": {
                "total": jobs.count(),
                "active": jobs.filter(status="active").count(),
                "closed": jobs.filter(status="closed").count(),
                "this_month": jobs.filter(created_at__gte=month_ago).count(),
            },
            "applications": {
                "total": applications.count(),
                "pending": applications.filter(status="pending").count(),
                "shortlisted": applications.filter(status="shortlisted").count(),
                "interviewed": applications.filter(status="interview").count(),
                "accepted": applications.filter(status="accepted").count(),
                "rejected": applications.filter(status="rejected").count(),
                "this_month": applications.filter(applied_at__gte=month_ago).count(),
            },
            "conversion_funnel": {
                "views": sum(j.views_count for j in jobs),
                "applications": applications.count(),
                "shortlisted": applications.filter(status__in=["shortlisted", "interview", "accepted"]).count(),
                "interviews": applications.filter(status="interview").count(),
                "hires": applications.filter(status="accepted").count(),
            },
            "top_skills": list(
                applications.values("job__skills__name_ar").annotate(count=Count("id")).order_by("-count")[:10]
            ),
        }
        return Response(data)


class GraduateAnalyticsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.user_type != "graduate":
            return Response({"error": _("غير مصرح")}, status=403)

        profile = request.user.graduate_profile
        applications = JobApplication.objects.filter(applicant=request.user)

        data = {
            "profile": {
                "views": profile.profile_views,
                "search_appearances": profile.search_appearances,
                "employer_interactions": profile.employer_interactions,
                "completion": profile.user.profile_completion,
            },
            "applications": {
                "total": applications.count(),
                "pending": applications.filter(status="pending").count(),
                "reviewed": applications.filter(status="reviewed").count(),
                "shortlisted": applications.filter(status="shortlisted").count(),
                "interviews": applications.filter(status="interview").count(),
                "accepted": applications.filter(status="accepted").count(),
                "rejected": applications.filter(status="rejected").count(),
            },
            "skills": list(profile.graduateskill_set.values("skill__name_ar", "proficiency", "is_top_skill")),
        }
        return Response(data)
