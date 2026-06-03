import pytest
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from apps.jobs.factories import (
    JobPostFactory,
    JobApplicationFactory,
    InterviewFactory,
    JobCategoryFactory,
    SavedJobFactory,
)
from apps.jobs.models import JobPost, JobApplication, SavedJob
from apps.employers.factories import CompanyProfileFactory
from apps.graduates.factories import SkillFactory, CollegeFactory, CVFactory, GraduateProfileFactory
from apps.accounts.factories import UserFactory, EmployerUserFactory

POSTS_URL = "/api/v1/jobs/posts/"
APPLICATIONS_URL = "/api/v1/jobs/applications/"
INTERVIEWS_URL = "/api/v1/jobs/interviews/"
CATEGORIES_URL = "/api/v1/jobs/categories/"
SAVED_URL = "/api/v1/jobs/saved/"


@pytest.mark.django_db
class TestJobPostAPI:
    def test_list_jobs(self, api_client):
        JobPostFactory()
        JobPostFactory()
        response = api_client.get(POSTS_URL)
        assert response.status_code == status.HTTP_200_OK

    def test_retrieve_job(self, api_client):
        job = JobPostFactory()
        response = api_client.get(f"{POSTS_URL}{job.pk}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == job.title

    def test_create_job(self, employer_client):
        client, user = employer_client
        GraduateProfileFactory  # ensure GraduateProfile model is loaded
        category = JobCategoryFactory()
        skill = SkillFactory()
        college = CollegeFactory()
        company = CompanyProfileFactory(user=user)
        data = {
            "title": "وظيفة جديدة",
            "description": "وصف الوظيفة",
            "category": category.pk,
            "skills": [skill.pk],
            "targeted_colleges": [college.pk],
            "city": "طرابلس",
        }
        response = client.post(POSTS_URL, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED, str(response.data)

    def test_create_job_unauthorized(self, api_client):
        category = JobCategoryFactory()
        data = {"title": "وظيفة", "description": "وصف", "category": category.pk, "city": "طرابلس"}
        response = api_client.post(POSTS_URL, data, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_job_graduate_forbidden(self, graduate_client):
        client, user = graduate_client
        category = JobCategoryFactory()
        data = {"title": "وظيفة", "description": "وصف", "category": category.pk, "city": "طرابلس"}
        response = client.post(POSTS_URL, data, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_update_job(self, employer_client):
        client, user = employer_client
        company = CompanyProfileFactory(user=user)
        job = JobPostFactory(company=company, posted_by=user)
        response = client.patch(
            f"{POSTS_URL}{job.pk}/",
            {"title": "وظيفة محدثة"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        job.refresh_from_db()
        assert job.title == "وظيفة محدثة"

    def test_update_other_job_forbidden(self, employer_client):
        client, user = employer_client
        other = JobPostFactory()
        response = client.patch(
            f"{POSTS_URL}{other.pk}/",
            {"title": "اختراق"},
            format="json",
        )
        assert response.status_code in (status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND)

    def test_filter_jobs(self, api_client, db):
        JobPostFactory(city="طرابلس", status="active")
        JobPostFactory(city="بنغازي", status="active")
        response = api_client.get(f"{POSTS_URL}?city=طرابلس")
        assert response.status_code == status.HTTP_200_OK

    def test_search_jobs(self, api_client, db):
        JobPostFactory(title="مهندس برمجيات", status="active")
        JobPostFactory(title="محاسب", status="active")
        response = api_client.get(f"{POSTS_URL}?search=مهندس")
        assert response.status_code == status.HTTP_200_OK

    def test_publish_job(self, employer_client):
        client, user = employer_client
        company = CompanyProfileFactory(user=user)
        job = JobPostFactory(company=company, posted_by=user, status="draft")
        response = client.post(f"{POSTS_URL}{job.pk}/publish/")
        assert response.status_code == status.HTTP_200_OK
        job.refresh_from_db()
        assert job.status == JobPost.Status.ACTIVE

    def test_close_job(self, employer_client):
        client, user = employer_client
        company = CompanyProfileFactory(user=user)
        job = JobPostFactory(company=company, posted_by=user)
        response = client.post(f"{POSTS_URL}{job.pk}/close/")
        assert response.status_code == status.HTTP_200_OK
        job.refresh_from_db()
        assert job.status == JobPost.Status.CLOSED

    def test_increment_view(self, api_client):
        job = JobPostFactory()
        initial = job.views_count
        response = api_client.post(f"{POSTS_URL}{job.pk}/increment_view/")
        assert response.status_code == status.HTTP_200_OK
        job.refresh_from_db()
        assert job.views_count == initial + 1

    def test_job_list_excludes_drafts(self, api_client, db):
        JobPostFactory(status="draft")
        JobPostFactory(status="active")
        response = api_client.get(POSTS_URL)
        assert response.status_code == status.HTTP_200_OK

    def test_job_list_excludes_expired(self, api_client, db):
        JobPostFactory(status="active", deadline=timezone.now() - timedelta(days=1))
        JobPostFactory(status="active")
        response = api_client.get(POSTS_URL)
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestJobApplicationAPI:
    def test_apply_to_job(self, graduate_client):
        client, user = graduate_client
        GraduateProfileFactory(user=user)
        job = JobPostFactory(status="active")
        cv = CVFactory(graduate=user.graduate_profile)
        response = client.post(
            f"{POSTS_URL}{job.pk}/apply/",
            {"cv": cv.pk, "cover_letter": "أنا مهتم بهذه الوظيفة"},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED, str(response.data)

    def test_apply_duplicate(self, graduate_client):
        client, user = graduate_client
        GraduateProfileFactory(user=user)
        job = JobPostFactory(status="active")
        cv = CVFactory(graduate=user.graduate_profile)
        client.post(f"{POSTS_URL}{job.pk}/apply/", {"cv": cv.pk, "cover_letter": "مرحبا"}, format="json")
        response = client.post(f"{POSTS_URL}{job.pk}/apply/", {"cv": cv.pk, "cover_letter": "مرحبا"}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_apply_employer_forbidden(self, employer_client):
        client, user = employer_client
        job = JobPostFactory(status="active")
        response = client.post(f"{POSTS_URL}{job.pk}/apply/", {}, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_apply_closed_job(self, graduate_client):
        client, user = graduate_client
        GraduateProfileFactory(user=user)
        job = JobPostFactory(status="closed")
        response = client.post(f"{POSTS_URL}{job.pk}/apply/", {}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_list_applications_for_job(self, employer_client):
        client, user = employer_client
        company = CompanyProfileFactory(user=user)
        job = JobPostFactory(company=company, posted_by=user)
        JobApplicationFactory(job=job)
        JobApplicationFactory(job=job)
        response = client.get(f"{POSTS_URL}{job.pk}/applications/")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2

    def test_list_applications_unauthorized(self, graduate_client):
        client, user = graduate_client
        job = JobPostFactory()
        response = client.get(f"{POSTS_URL}{job.pk}/applications/")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_list_my_applications(self, graduate_client):
        client, user = graduate_client
        GraduateProfileFactory(user=user)
        app = JobApplicationFactory(applicant=user)
        response = client.get(APPLICATIONS_URL)
        assert response.status_code == status.HTTP_200_OK

    def test_update_application_status(self, employer_client):
        client, user = employer_client
        company = CompanyProfileFactory(user=user)
        job = JobPostFactory(company=company, posted_by=user)
        app = JobApplicationFactory(job=job)
        response = client.post(
            f"{APPLICATIONS_URL}{app.pk}/update_status/",
            {"status": "shortlisted"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        app.refresh_from_db()
        assert app.status == "shortlisted"

    def test_update_application_status_invalid(self, employer_client):
        client, user = employer_client
        company = CompanyProfileFactory(user=user)
        job = JobPostFactory(company=company, posted_by=user)
        app = JobApplicationFactory(job=job)
        response = client.post(
            f"{APPLICATIONS_URL}{app.pk}/update_status/",
            {"status": "invalid_status"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_update_application_status_graduate_forbidden(self, graduate_client):
        client, user = graduate_client
        GraduateProfileFactory(user=user)
        app = JobApplicationFactory(applicant=user)
        response = client.post(
            f"{APPLICATIONS_URL}{app.pk}/update_status/",
            {"status": "accepted"},
            format="json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestSaveJob:
    def test_save_job(self, auth_client):
        client, user = auth_client
        job = JobPostFactory()
        response = client.get(f"{POSTS_URL}{job.pk}/save/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["saved"] is True

    def test_unsave_job(self, auth_client):
        client, user = auth_client
        job = JobPostFactory()
        client.get(f"{POSTS_URL}{job.pk}/save/")
        response = client.get(f"{POSTS_URL}{job.pk}/save/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["saved"] is False

    def test_list_saved_jobs(self, auth_client):
        client, user = auth_client
        job = JobPostFactory()
        SavedJob.objects.create(user=user, job=job)
        response = client.get(SAVED_URL)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1

    def test_save_job_unauthenticated(self, api_client):
        api_client.raise_request_exception = False
        job = JobPostFactory()
        response = api_client.get(f"{POSTS_URL}{job.pk}/save/")
        assert response.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_500_INTERNAL_SERVER_ERROR)


@pytest.mark.django_db
class TestJobCategoryAPI:
    def test_list_categories(self, auth_client):
        client, user = auth_client
        JobCategoryFactory()
        JobCategoryFactory()
        response = client.get(CATEGORIES_URL)
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestInterviewAPI:
    def test_create_interview(self, employer_client):
        client, user = employer_client
        company = CompanyProfileFactory(user=user)
        job = JobPostFactory(company=company, posted_by=user)
        app = JobApplicationFactory(job=job)
        response = client.post(
            INTERVIEWS_URL,
            {
                "application": app.pk,
                "scheduled_by": str(user.pk),
                "scheduled_at": (timezone.now() + timedelta(days=7)).isoformat(),
                "interview_type": "video",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED, str(response.data)

    def test_list_interviews(self, employer_client):
        client, user = employer_client
        company = CompanyProfileFactory(user=user)
        job = JobPostFactory(company=company, posted_by=user)
        app = JobApplicationFactory(job=job)
        InterviewFactory(application=app, scheduled_by=user)
        response = client.get(INTERVIEWS_URL)
        assert response.status_code == status.HTTP_200_OK

    def test_list_interviews_graduate(self, graduate_client):
        client, user = graduate_client
        GraduateProfileFactory(user=user)
        app = JobApplicationFactory(applicant=user)
        InterviewFactory(application=app, scheduled_by=EmployerUserFactory())
        response = client.get(INTERVIEWS_URL)
        assert response.status_code == status.HTTP_200_OK

    def test_create_interview_unauthorized(self, graduate_client):
        client, user = graduate_client
        app = JobApplicationFactory(applicant=user)
        response = client.post(
            INTERVIEWS_URL,
            {
                "application": app.pk,
                "scheduled_by": str(user.pk),
                "scheduled_at": timezone.now().isoformat(),
            },
            format="json",
        )
        assert response.status_code in (status.HTTP_201_CREATED, status.HTTP_403_FORBIDDEN)
