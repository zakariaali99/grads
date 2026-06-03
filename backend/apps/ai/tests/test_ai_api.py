import pytest
from rest_framework import status
from unittest.mock import patch, MagicMock
from django.contrib.auth import get_user_model

User = get_user_model()

PARSE_CV_URL = "/api/v1/ai/parse-cv/"
JOB_RECOMMENDATIONS_URL = "/api/v1/ai/job-recommendations/"
SKILL_ANALYSIS_URL = "/api/v1/ai/skill-analysis/"
RANK_CANDIDATES_URL = "/api/v1/ai/rank-candidates/"
GRAD_RECOMMENDATIONS_URL = "/api/v1/ai/graduate-recommendations/"
FRAUD_CHECK_URL = "/api/v1/ai/fraud-check/"


@pytest.mark.django_db
class TestParseCV:
    def test_parse_cv_success(self, graduate_client):
        client, user = graduate_client
        from apps.graduates.factories import GraduateProfileFactory, CVFactory
        profile = GraduateProfileFactory(user=user)
        cv = CVFactory(graduate=profile)

        with patch("apps.ai.views.parse_cv_task.delay") as mock_task:
            mock_task.return_value.id = "mock-task-id"
            response = client.post(PARSE_CV_URL, {"cv_id": str(cv.id)}, format="json")
            assert response.status_code == status.HTTP_200_OK
            assert response.data["task_id"] == "mock-task-id"

    def test_parse_cv_not_found(self, graduate_client):
        client, user = graduate_client
        response = client.post(PARSE_CV_URL, {"cv_id": 99999}, format="json")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_parse_cv_missing_id(self, graduate_client):
        client, user = graduate_client
        response = client.post(PARSE_CV_URL, {}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_parse_cv_unauthenticated(self, api_client):
        response = api_client.post(PARSE_CV_URL, {"cv_id": "mock"}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestJobRecommendations:
    def test_recommendations_success(self, graduate_client):
        client, user = graduate_client
        from apps.graduates.factories import GraduateProfileFactory, SkillCategoryFactory, SkillFactory
        profile = GraduateProfileFactory(user=user)
        category = SkillCategoryFactory()
        skill = SkillFactory(category=category)
        profile.skills.add(skill)

        with patch("apps.ai.views.RecommendationEngine.recommend_jobs_for_graduate") as mock_recommend:
            mock_recommend.return_value = []
            response = client.get(JOB_RECOMMENDATIONS_URL)
            assert response.status_code == status.HTTP_200_OK

    def test_recommendations_no_profile(self, graduate_client):
        client, user = graduate_client
        response = client.get(JOB_RECOMMENDATIONS_URL)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_recommendations_employer_forbidden(self, employer_client):
        client, user = employer_client
        response = client.get(JOB_RECOMMENDATIONS_URL)
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestSkillAnalysis:
    def test_skill_analysis_success(self, graduate_client):
        client, user = graduate_client
        from apps.graduates.factories import GraduateProfileFactory
        profile = GraduateProfileFactory(user=user)
        response = client.get(SKILL_ANALYSIS_URL)
        assert response.status_code == status.HTTP_200_OK
        assert "current_skills" in response.data
        assert "suggested_skills" in response.data

    def test_skill_analysis_no_profile(self, graduate_client):
        client, user = graduate_client
        response = client.get(SKILL_ANALYSIS_URL)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_skill_analysis_employer_forbidden(self, employer_client):
        client, user = employer_client
        response = client.get(SKILL_ANALYSIS_URL)
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestCandidateRanking:
    def test_rank_candidates(self, employer_client):
        client, user = employer_client
        from apps.employers.factories import CompanyProfileFactory
        from apps.jobs.factories import JobPostFactory
        company = CompanyProfileFactory(user=user)
        job = JobPostFactory(company=company, posted_by=user)

        with patch("apps.ai.views.RecommendationEngine") as mock_engine:
            mock_engine.calculate_match_score.return_value = 85.0
            mock_engine.get_skill_gaps.return_value = []
            response = client.get(f"{RANK_CANDIDATES_URL}{job.pk}/")
            assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestFraudCheck:
    def test_fraud_check(self, graduate_client):
        client, user = graduate_client
        from apps.graduates.factories import GraduateProfileFactory
        profile = GraduateProfileFactory(user=user)

        with patch("apps.ai.views.FraudDetection.check_fake_profile") as mock_check:
            mock_check.return_value = {"is_fake": False, "score": 0}
            response = client.get(FRAUD_CHECK_URL)
            assert response.status_code == status.HTTP_200_OK
