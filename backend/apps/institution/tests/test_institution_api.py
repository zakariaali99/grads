import pytest
from rest_framework import status
from apps.institution.factories import (
    InstitutionProfileFactory,
    InstitutionUserFactory,
    GraduateTrackingFactory,
    InstitutionPartnershipFactory,
)
from apps.accounts.factories import GraduateUserFactory
from apps.employers.factories import CompanyProfileFactory

PROFILES_URL = "/api/v1/institution/profiles/"
GRADUATES_URL = "/api/v1/institution/graduates/"
PARTNERSHIPS_URL = "/api/v1/institution/partnerships/"
FEEDBACK_URL = "/api/v1/institution/feedback/"
DASHBOARD_URL = "/api/v1/institution/dashboard/"


@pytest.mark.django_db
class TestInstitutionProfileAPI:
    def test_list_profiles(self, api_client):
        InstitutionProfileFactory()
        InstitutionProfileFactory()
        response = api_client.get(PROFILES_URL)
        assert response.status_code == status.HTTP_200_OK

    def test_retrieve_profile(self, api_client):
        profile = InstitutionProfileFactory()
        response = api_client.get(f"{PROFILES_URL}{profile.pk}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["institution_name"] == profile.institution_name

    def test_create_profile(self, institution_client):
        client, user = institution_client
        data = {
            "institution_name": "جامعة جديدة",
            "institution_name_en": "New University",
            "institution_type": "university",
            "license_number": "LIC12345678",
            "city": "الرياض",
            "country": "المملكة العربية السعودية",
        }
        response = client.post(PROFILES_URL, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

    def test_create_profile_unauthenticated(self, api_client):
        data = {
            "institution_name": "غير مصرح",
            "institution_type": "university",
            "license_number": "LIC00000000",
            "city": "الرياض",
        }
        response = api_client.post(PROFILES_URL, data, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_profile_graduate_forbidden(self, graduate_client):
        client, user = graduate_client
        data = {
            "institution_name": "محاولة خريج",
            "institution_type": "university",
            "license_number": "LIC99999999",
            "city": "الرياض",
        }
        response = client.post(PROFILES_URL, data, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_me_endpoint(self, institution_client):
        client, user = institution_client
        InstitutionProfileFactory(user=user)
        response = client.get(f"{PROFILES_URL}me/")
        assert response.status_code == status.HTTP_200_OK

    def test_me_endpoint_not_found(self, institution_client):
        client, user = institution_client
        response = client.get(f"{PROFILES_URL}me/")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_profile(self, institution_client):
        client, user = institution_client
        profile = InstitutionProfileFactory(user=user)
        response = client.patch(
            f"{PROFILES_URL}{profile.pk}/",
            {"institution_name": "اسم محدث"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        profile.refresh_from_db()
        assert profile.institution_name == "اسم محدث"


@pytest.mark.django_db
class TestGraduateTrackingAPI:
    def test_list_graduates(self, institution_client):
        client, user = institution_client
        profile = InstitutionProfileFactory(user=user)
        GraduateTrackingFactory(institution=profile)
        GraduateTrackingFactory(institution=profile)
        response = client.get(GRADUATES_URL)
        assert response.status_code == status.HTTP_200_OK

    def test_create_graduate(self, institution_client):
        client, user = institution_client
        InstitutionProfileFactory(user=user)
        grad_user = GraduateUserFactory()
        data = {
            "graduate": str(grad_user.pk),
            "student_id": "STU99999",
            "major": "علوم حاسوب",
            "enrollment_year": 2021,
        }
        response = client.post(GRADUATES_URL, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

    def test_create_graduate_unauthenticated(self, api_client):
        data = {
            "student_id": "STU00000",
            "major": "هندسة",
            "enrollment_year": 2021,
        }
        response = api_client.post(GRADUATES_URL, data, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_filter_graduates_by_status(self, institution_client):
        client, user = institution_client
        profile = InstitutionProfileFactory(user=user)
        GraduateTrackingFactory(institution=profile, status="graduated")
        GraduateTrackingFactory(institution=profile, status="enrolled")
        response = client.get(f"{GRADUATES_URL}?status=graduated")
        assert response.status_code == status.HTTP_200_OK
        results = response.data.get("results", response.data)
        assert all(g["status"] == "graduated" for g in results)

    def test_search_graduates(self, institution_client):
        client, user = institution_client
        profile = InstitutionProfileFactory(user=user)
        g = GraduateTrackingFactory(institution=profile, student_id="XYZ789")
        response = client.get(f"{GRADUATES_URL}?search=XYZ789")
        assert response.status_code == status.HTTP_200_OK
        results = response.data.get("results", response.data)
        assert len(results) == 1

    def test_update_employment(self, institution_client):
        client, user = institution_client
        profile = InstitutionProfileFactory(user=user)
        tracking = GraduateTrackingFactory(institution=profile)
        data = {
            "is_employed": True,
            "employment_details": {"company": "شركة تقنية", "position": "مطور", "salary": 15000},
        }
        response = client.patch(
            f"{GRADUATES_URL}{tracking.pk}/update_employment/",
            data,
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        tracking.refresh_from_db()
        assert tracking.is_employed is True
        assert tracking.employment_details["company"] == "شركة تقنية"

    def test_import_csv(self, institution_client):
        client, user = institution_client
        InstitutionProfileFactory(user=user)
        grad = GraduateUserFactory()
        data = [
            {"student_id": "IMP001", "full_name": "طالب أول", "major": "هندسة", "enrollment_year": 2020, "graduate_email": grad.email},
            {"student_id": "IMP002", "full_name": "طالب ثاني", "major": "علوم", "enrollment_year": 2021},
        ]
        response = client.post(f"{GRADUATES_URL}import_csv/", data, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["created"] == 2
        assert len(response.data["errors"]) == 0


@pytest.mark.django_db
class TestInstitutionPartnershipAPI:
    def test_list_partnerships(self, institution_client):
        client, user = institution_client
        profile = InstitutionProfileFactory(user=user)
        InstitutionPartnershipFactory(institution=profile)
        response = client.get(PARTNERSHIPS_URL)
        assert response.status_code == status.HTTP_200_OK

    def test_create_partnership(self, institution_client):
        client, user = institution_client
        InstitutionProfileFactory(user=user)
        company = CompanyProfileFactory()
        data = {
            "company": company.pk,
            "partnership_type": "recruitment",
            "contact_person_name": "اتصال",
            "contact_email": "contact@company.com",
        }
        response = client.post(PARTNERSHIPS_URL, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

    def test_create_partnership_unauthenticated(self, api_client):
        company = CompanyProfileFactory()
        data = {
            "company": company.pk,
            "partnership_type": "recruitment",
            "contact_person_name": "مخترق",
            "contact_email": "hack@test.com",
        }
        response = api_client.post(PARTNERSHIPS_URL, data, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestCurriculumFeedbackAPI:
    def test_list_feedback(self, institution_client):
        client, user = institution_client
        response = client.get(FEEDBACK_URL)
        assert response.status_code == status.HTTP_200_OK

    def test_create_feedback(self, graduate_client):
        client, user = graduate_client
        profile = InstitutionProfileFactory()
        data = {
            "institution": profile.pk,
            "program_name": "هندسة",
            "course_name": "قواعد بيانات",
            "rating": 4,
            "feedback": "مقرر ممتاز",
        }
        response = client.post(FEEDBACK_URL, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
class TestInstitutionDashboardAPI:
    def test_dashboard_authenticated(self, institution_client):
        client, user = institution_client
        profile = InstitutionProfileFactory(user=user)
        GraduateTrackingFactory(institution=profile)
        GraduateTrackingFactory(institution=profile, is_employed=True)
        response = client.get(DASHBOARD_URL)
        assert response.status_code == status.HTTP_200_OK
        assert "total_graduates" in response.data
        assert "employed_rate" in response.data
        assert "graduates_by_status" in response.data

    def test_dashboard_unauthenticated(self, api_client):
        response = api_client.get(DASHBOARD_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_dashboard_without_profile(self, institution_client):
        client, user = institution_client
        response = client.get(DASHBOARD_URL)
        assert response.status_code == status.HTTP_404_NOT_FOUND
