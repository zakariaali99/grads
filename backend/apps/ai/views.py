from rest_framework import views, permissions
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from .recommendations import RecommendationEngine, FraudDetection
from apps.graduates.models import CV, GraduateProfile, Skill
from apps.jobs.models import JobPost, JobApplication
from .tasks import parse_cv_task


class ParseCVView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        cv_id = request.data.get("cv_id")
        if not cv_id:
            return Response({"error": _("معرف السيرة الذاتية مطلوب")}, status=400)

        try:
            cv = CV.objects.get(id=cv_id, graduate__user=request.user)
        except CV.DoesNotExist:
            return Response({"error": _("السيرة الذاتية غير موجودة")}, status=404)

        task = parse_cv_task.delay(str(cv.id))
        return Response(
            {
                "success": True,
                "message": _("جاري تحليل السيرة الذاتية"),
                "task_id": task.id,
            }
        )


class CandidateRankingView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, job_id):
        try:
            job = JobPost.objects.get(id=job_id)
        except JobPost.DoesNotExist:
            return Response({"error": _("الوظيفة غير موجودة")}, status=404)

        if request.user.user_type == "employer" and job.company.user != request.user:
            return Response({"error": _("غير مصرح")}, status=403)

        applications = JobApplication.objects.filter(job=job).select_related("applicant__graduate_profile")

        ranked = []
        for app in applications:
            try:
                profile = app.applicant.graduate_profile
                score = app.match_score or RecommendationEngine.calculate_match_score(profile, job)
                gaps = RecommendationEngine.get_skill_gaps(profile, job)
                ranked.append(
                    {
                        "application_id": str(app.id),
                        "applicant_id": str(app.applicant.id),
                        "name": app.applicant.get_full_name() or app.applicant.username,
                        "match_score": score,
                        "status": app.status,
                        "skill_gaps": gaps,
                        "applied_at": app.applied_at.isoformat(),
                    }
                )
            except GraduateProfile.DoesNotExist:
                continue

        ranked.sort(key=lambda x: x["match_score"], reverse=True)
        return Response(ranked)


class JobRecommendationsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.user_type != "graduate":
            return Response({"error": _("فقط للخريجين")}, status=403)

        try:
            profile = request.user.graduate_profile
        except GraduateProfile.DoesNotExist:
            return Response({"error": _("الملف غير موجود")}, status=404)

        jobs = RecommendationEngine.recommend_jobs_for_graduate(profile)
        from apps.jobs.serializers import JobPostListSerializer

        serializer = JobPostListSerializer(jobs, many=True, context={"request": request})
        return Response(serializer.data)


class GraduateRecommendationsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, job_id):
        try:
            job = JobPost.objects.get(id=job_id)
        except JobPost.DoesNotExist:
            return Response({"error": _("الوظيفة غير موجودة")}, status=404)

        if job.company.user != request.user:
            return Response({"error": _("غير مصرح")}, status=403)

        graduates = RecommendationEngine.recommend_graduates_for_job(job)
        from apps.graduates.serializers import GraduateProfileListSerializer

        serializer = GraduateProfileListSerializer(graduates, many=True, context={"request": request})
        return Response(serializer.data)


class FraudCheckView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.user_type != "graduate":
            return Response({"error": _("غير مصرح")}, status=403)

        try:
            profile = request.user.graduate_profile
        except GraduateProfile.DoesNotExist:
            return Response({"error": _("الملف غير موجود")}, status=404)

        result = FraudDetection.check_fake_profile(profile)
        return Response(result)


class SkillAnalysisView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.user_type != "graduate":
            return Response({"error": _("غير مصرح")}, status=403)

        try:
            profile = request.user.graduate_profile
        except GraduateProfile.DoesNotExist:
            return Response({"error": _("الملف غير موجود")}, status=404)

        user_skills = set(profile.skills.values_list("name_ar", flat=True))
        all_skills = Skill.objects.filter(is_active=True).order_by("-demand_score")[:20]
        market_demand = [{"skill": s.name_ar, "demand_score": s.demand_score} for s in all_skills]

        suggested = []
        for s in all_skills:
            if s.name_ar not in user_skills:
                suggested.append({"skill": s.name_ar, "demand_score": s.demand_score})

        return Response(
            {
                "current_skills": list(user_skills),
                "market_demand": market_demand,
                "suggested_skills": suggested[:10],
                "completion": profile.user.profile_completion,
            }
        )
