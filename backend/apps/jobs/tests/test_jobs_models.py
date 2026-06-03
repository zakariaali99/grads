import pytest
from apps.jobs.models import JobCategory, JobPost, JobApplication, Interview, SavedJob
from apps.jobs.factories import (
    JobCategoryFactory,
    JobPostFactory,
    JobApplicationFactory,
    InterviewFactory,
    SavedJobFactory,
)
from apps.employers.factories import CompanyProfileFactory
from apps.accounts.factories import UserFactory, EmployerUserFactory


@pytest.mark.django_db
class TestJobCategoryModel:
    def test_create_category(self):
        cat = JobCategoryFactory()
        assert cat.pk is not None

    def test_category_str(self):
        cat = JobCategoryFactory(name_ar="هندسة")
        assert str(cat) == "هندسة"

    def test_category_default_active(self):
        cat = JobCategoryFactory()
        assert cat.is_active is True

    def test_category_ordering(self):
        JobCategoryFactory(sort_order=2)
        JobCategoryFactory(sort_order=1)
        cats = JobCategory.objects.all()
        assert cats[0].sort_order == 1


@pytest.mark.django_db
class TestJobPostModel:
    def test_create_job(self):
        job = JobPostFactory()
        assert job.pk is not None

    def test_job_str(self):
        company = CompanyProfileFactory(company_name="شركة التقنية")
        job = JobPostFactory(company=company, title="مهندس برمجيات")
        assert "مهندس برمجيات" in str(job)
        assert "شركة التقنية" in str(job)

    def test_job_default_status(self):
        job = JobPostFactory()
        assert job.status == JobPost.Status.ACTIVE

    def test_job_default_views(self):
        job = JobPostFactory()
        assert job.views_count == 0

    def test_job_default_applications(self):
        job = JobPostFactory()
        assert job.applications_count == 0

    def test_job_skills_relation(self):
        job = JobPostFactory()
        from apps.graduates.factories import SkillFactory
        skill = SkillFactory()
        job.skills.add(skill)
        assert job.skills.count() == 1

    def test_job_company_relation(self):
        company = CompanyProfileFactory()
        job = JobPostFactory(company=company)
        assert job.company == company

    def test_job_indexes(self):
        index_fields = [idx.fields for idx in JobPost._meta.indexes]
        assert ["status", "employment_type"] in index_fields
        assert ["company", "status"] in index_fields
        assert ["city", "experience_level"] in index_fields


@pytest.mark.django_db
class TestJobApplicationModel:
    def test_create_application(self):
        app = JobApplicationFactory()
        assert app.pk is not None

    def test_application_str(self):
        app = JobApplicationFactory()
        assert str(app.applicant.username) in str(app)
        assert str(app.job.title) in str(app)

    def test_application_default_status(self):
        app = JobApplicationFactory()
        assert app.status == JobApplication.Status.PENDING

    def test_application_unique_job_applicant(self):
        app = JobApplicationFactory()
        with pytest.raises(Exception):
            JobApplicationFactory(job=app.job, applicant=app.applicant)

    def test_application_job_relation(self):
        job = JobPostFactory()
        app = JobApplicationFactory(job=job)
        assert app.job == job


@pytest.mark.django_db
class TestInterviewModel:
    def test_create_interview(self):
        interview = InterviewFactory()
        assert interview.pk is not None

    def test_interview_default_status(self):
        interview = InterviewFactory()
        assert interview.status == Interview.Status.SCHEDULED

    def test_interview_default_type(self):
        interview = InterviewFactory()
        assert interview.interview_type == Interview.Type.VIDEO

    def test_interview_duration_default(self):
        interview = InterviewFactory()
        assert interview.duration_minutes == 30


@pytest.mark.django_db
class TestSavedJobModel:
    def test_create_saved_job(self):
        saved = SavedJobFactory()
        assert saved.pk is not None

    def test_saved_job_unique(self):
        saved = SavedJobFactory()
        with pytest.raises(Exception):
            SavedJobFactory(user=saved.user, job=saved.job)
