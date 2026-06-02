from typing import List, Dict, Tuple
from apps.graduates.models import GraduateProfile, Skill
from apps.jobs.models import JobPost, JobApplication, JobCategory
from django.db.models import Q


class RecommendationEngine:
    @staticmethod
    def recommend_jobs_for_graduate(graduate_profile, limit: int = 10):
        skills = list(graduate_profile.skills.values_list("id", flat=True))
        city = graduate_profile.city
        major = graduate_profile.major

        jobs = JobPost.objects.filter(status="active")

        score_map = {}
        for job in jobs:
            score = 0
            job_skills = set(job.skills.values_list("id", flat=True))
            if skills and job_skills:
                overlap = len(set(skills) & job_skills)
                score += overlap * 10

            if city and job.city and city.lower() == job.city.lower():
                score += 20

            if major and job.category and (
                major.lower() in job.category.name_ar.lower()
                or major.lower() in job.category.name_en.lower()
            ):
                score += 15

            score_map[job.id] = score

        sorted_jobs = sorted(score_map.items(), key=lambda x: x[1], reverse=True)
        job_ids = [j[0] for j in sorted_jobs if j[1] > 0][:limit]

        return JobPost.objects.filter(id__in=job_ids).select_related("company", "category")

    @staticmethod
    def recommend_graduates_for_job(job_post, limit: int = 20):
        required_skills = set(job_post.skills.values_list("id", flat=True))
        city = job_post.city

        graduates = GraduateProfile.objects.filter(
            user__is_active=True, user__is_banned=False, available_for_work=True
        ).prefetch_related("skills")

        score_map = {}
        for grad in graduates:
            score = 0
            grad_skills = set(grad.skills.values_list("id", flat=True))
            if required_skills and grad_skills:
                overlap = len(required_skills & grad_skills)
                total = len(required_skills)
                score += (overlap / total) * 50 if total > 0 else 0

            if city and grad.city and city.lower() == grad.city.lower():
                score += 20

            score_map[grad.id] = score

        sorted_grads = sorted(score_map.items(), key=lambda x: x[1], reverse=True)
        grad_ids = [g[0] for g in sorted_grads if g[1] > 0][:limit]

        return GraduateProfile.objects.filter(id__in=grad_ids).select_related("user", "college")

    @staticmethod
    def calculate_match_score(graduate_profile, job_post) -> float:
        skill_score = 0
        required_skills = set(job_post.skills.values_list("id", flat=True))
        grad_skills = set(graduate_profile.skills.values_list("id", flat=True))

        if required_skills and grad_skills:
            overlap = len(required_skills & grad_skills)
            skill_score = (overlap / len(required_skills)) * 60

        location_score = 0
        if job_post.city and graduate_profile.city:
            if job_post.city.lower() == graduate_profile.city.lower():
                location_score = 20
            elif job_post.company.city and graduate_profile.city:
                if job_post.company.city.lower() == graduate_profile.city.lower():
                    location_score = 15

        experience_score = 0
        total_exp = sum(
            e.years_experience for e in graduate_profile.graduateskill_set.all()
        )
        if total_exp >= job_post.years_experience_min:
            experience_score = 20
        else:
            ratio = total_exp / max(job_post.years_experience_min, 1)
            experience_score = min(ratio * 20, 20)

        return round(min(skill_score + location_score + experience_score, 100), 2)

    @staticmethod
    def get_skill_gaps(graduate_profile, job_post) -> List[str]:
        required = set(job_post.skills.values_list("name_ar", flat=True))
        owned = set(graduate_profile.skills.values_list("name_ar", flat=True))
        return list(required - owned)


class FraudDetection:
    @staticmethod
    def check_duplicate_account(user) -> Dict:
        from apps.accounts.models import User
        from django.conf import settings

        suspicious = []
        same_email = User.objects.filter(email=user.email).exclude(pk=user.pk)
        if same_email.exists():
            suspicious.append("البريد الإلكتروني مستخدم في حساب آخر")

        same_phone = User.objects.filter(phone=user.phone).exclude(pk=user.pk)
        if same_phone.exists():
            suspicious.append("رقم الهاتف مستخدم في حساب آخر")

        recent_same_ip = User.objects.filter(last_ip=user.last_ip).exclude(pk=user.pk)
        if recent_same_ip.count() > 3:
            suspicious.append("نشاط مشبوه من نفس عنوان IP")

        return {
            "is_suspicious": len(suspicious) > 0,
            "flags": suspicious,
        }

    @staticmethod
    def check_fake_profile(graduate_profile) -> Dict:
        flags = []
        user = graduate_profile.user

        if not user.email_verified and not user.phone_verified:
            flags.append("لم يتم توثيق البريد أو الهاتف")

        if not graduate_profile.education.exists():
            flags.append("لا يوجد مؤهلات تعليمية")

        if not graduate_profile.skills.exists():
            flags.append("لا يوجد مهارات")

        if not graduate_profile.headline and not graduate_profile.bio:
            flags.append("الملف الشخصي غير مكتمل")

        return {
            "is_fake": len(flags) >= 3,
            "confidence": min(len(flags) * 25, 100),
            "flags": flags,
        }
