from celery import shared_task
from django.utils import timezone
from apps.graduates.models import CV, GraduateProfile, Skill
from apps.analytics.models import DailyStat, PlatformEvent
from apps.ai.cv_parser import CVParser
from apps.ai.recommendations import RecommendationEngine
from apps.accounts.models import User
from apps.jobs.models import JobPost


@shared_task
def parse_cv_task(cv_id):
    try:
        cv = CV.objects.get(id=cv_id)
        known_skills = list(Skill.objects.filter(is_active=True).values_list("name_ar", flat=True))
        parsed = CVParser.parse_full_cv(cv.file, known_skills)
        cv.parsed_data = parsed
        cv.is_parsed = True
        cv.save()
        return {"status": "success", "skills_found": len(parsed["skills"])}
    except CV.DoesNotExist:
        return {"status": "error", "message": "CV not found"}


@shared_task
def calculate_match_scores(job_id):
    from apps.jobs.models import JobPost, JobApplication

    try:
        job = JobPost.objects.get(id=job_id)
        applications = JobApplication.objects.filter(job=job, match_score__isnull=True)
        for app in applications:
            try:
                profile = app.applicant.graduate_profile
                score = RecommendationEngine.calculate_match_score(profile, job)
                app.match_score = score
                app.save(update_fields=["match_score"])
            except GraduateProfile.DoesNotExist:
                pass
        return {"status": "success", "updated": applications.count()}
    except JobPost.DoesNotExist:
        return {"status": "error", "message": "Job not found"}


@shared_task
def update_daily_stats():
    today = timezone.now().date()
    stat, _ = DailyStat.objects.get_or_create(date=today)
    stat.new_graduates = User.objects.filter(user_type="graduate", date_joined__date=today).count()
    stat.new_employers = User.objects.filter(user_type="employer", date_joined__date=today).count()
    stat.new_jobs = JobPost.objects.filter(created_at__date=today).count()
    stat.save()


@shared_task
def check_fraud_accounts():
    from apps.ai.recommendations import FraudDetection

    suspicious = []
    for user in User.objects.filter(is_active=True, is_banned=False):
        result = FraudDetection.check_duplicate_account(user)
        if result["is_suspicious"]:
            suspicious.append({"user_id": str(user.id), "flags": result["flags"]})
            PlatformEvent.objects.create(
                event_type="fraud_alert",
                description=f"حساب مشبوه: {user.username}",
                data=result,
            )
    return {"checked": User.objects.count(), "suspicious": len(suspicious)}
