import pytest
from apps.graduates.models import (
    SkillCategory,
    Skill,
    College,
    GraduateProfile,
    GraduateSkill,
    Education,
    Experience,
    Certification,
    Project,
    CV,
    ProfileView,
    SavedGraduate,
)
from apps.graduates.factories import (
    SkillCategoryFactory,
    SkillFactory,
    CollegeFactory,
    GraduateProfileFactory,
    GraduateSkillFactory,
    EducationFactory,
    ExperienceFactory,
    CertificationFactory,
    ProjectFactory,
    CVFactory,
)
from apps.accounts.factories import UserFactory, EmployerUserFactory


@pytest.mark.django_db
class TestSkillCategoryModel:
    def test_create_category(self):
        category = SkillCategoryFactory()
        assert category.pk is not None
        assert category.name_ar.startswith("تصنيف مهارة")

    def test_category_str(self):
        category = SkillCategoryFactory(name_ar="تقنية المعلومات")
        assert str(category) == "تقنية المعلومات"

    def test_category_ordering(self):
        cat1 = SkillCategoryFactory(sort_order=2)
        cat2 = SkillCategoryFactory(sort_order=1)
        cats = SkillCategory.objects.all()
        assert cats[0] == cat2


@pytest.mark.django_db
class TestSkillModel:
    def test_create_skill(self):
        skill = SkillFactory()
        assert skill.pk is not None

    def test_skill_str(self):
        skill = SkillFactory(name_ar="بايثون")
        assert str(skill) == "بايثون"

    def test_skill_category_relation(self):
        category = SkillCategoryFactory()
        skill = SkillFactory(category=category)
        assert skill.category == category

    def test_skill_is_active_default(self):
        skill = SkillFactory()
        assert skill.is_active is True

    def test_skill_ordering(self):
        SkillFactory(name_ar="ز")
        SkillFactory(name_ar="أ")
        skills = Skill.objects.all()
        assert skills[0].name_ar == "أ"


@pytest.mark.django_db
class TestCollegeModel:
    def test_create_college(self):
        college = CollegeFactory()
        assert college.pk is not None

    def test_college_str(self):
        college = CollegeFactory(name_ar="كلية الهندسة")
        assert str(college) == "كلية الهندسة"

    def test_college_unique_code(self):
        CollegeFactory(code="UNI001")
        with pytest.raises(Exception):
            CollegeFactory(code="UNI001")

    def test_college_is_active_default(self):
        college = CollegeFactory()
        assert college.is_active is True


@pytest.mark.django_db
class TestGraduateProfileModel:
    def test_create_profile(self):
        profile = GraduateProfileFactory()
        assert profile.pk is not None

    def test_profile_str(self):
        user = UserFactory(first_name="محمد", last_name="أحمد")
        college = CollegeFactory(name_ar="كلية العلوم")
        profile = GraduateProfileFactory(user=user, college=college)
        assert "محمد أحمد" in str(profile)
        assert "كلية العلوم" in str(profile)

    def test_profile_user_one_to_one(self):
        user = UserFactory()
        profile = GraduateProfileFactory(user=user)
        assert profile.user == user
        assert user.graduate_profile == profile

    def test_profile_default_values(self):
        profile = GraduateProfileFactory()
        assert profile.available_for_work is True
        assert profile.is_employed is False
        assert profile.profile_views == 0
        assert profile.search_appearances == 0
        assert profile.employer_interactions == 0

    def test_profile_skills_many_to_many(self):
        profile = GraduateProfileFactory()
        skill1 = SkillFactory()
        skill2 = SkillFactory()
        profile.skills.add(skill1, skill2)
        assert profile.skills.count() == 2

    def test_profile_graduation_year_nullable(self):
        profile = GraduateProfileFactory(graduation_year=None)
        assert profile.graduation_year is None


@pytest.mark.django_db
class TestGraduateSkillModel:
    def test_create_graduate_skill(self):
        gs = GraduateSkillFactory()
        assert gs.pk is not None

    def test_unique_graduate_skill(self):
        gs = GraduateSkillFactory()
        with pytest.raises(Exception):
            GraduateSkillFactory(graduate=gs.graduate, skill=gs.skill)

    def test_proficiency_default(self):
        gs = GraduateSkillFactory()
        assert gs.proficiency == GraduateSkill.Proficiency.INTERMEDIATE


@pytest.mark.django_db
class TestEducationModel:
    def test_create_education(self):
        edu = EducationFactory()
        assert edu.pk is not None

    def test_education_graduate_relation(self):
        profile = GraduateProfileFactory()
        edu = EducationFactory(graduate=profile)
        assert edu.graduate == profile
        assert profile.education.count() == 1

    def test_education_default_is_current(self):
        edu = EducationFactory()
        assert edu.is_current is False


@pytest.mark.django_db
class TestExperienceModel:
    def test_create_experience(self):
        exp = ExperienceFactory()
        assert exp.pk is not None

    def test_experience_graduate_relation(self):
        profile = GraduateProfileFactory()
        exp = ExperienceFactory(graduate=profile)
        assert exp.graduate == profile

    def test_experience_employment_type_default(self):
        exp = ExperienceFactory()
        assert exp.employment_type == "full_time"


@pytest.mark.django_db
class TestCertificationModel:
    def test_create_certification(self):
        cert = CertificationFactory()
        assert cert.pk is not None

    def test_certification_verification_default(self):
        cert = CertificationFactory()
        assert cert.is_verified is False


@pytest.mark.django_db
class TestProjectModel:
    def test_create_project(self):
        project = ProjectFactory()
        assert project.pk is not None

    def test_project_ongoing_default(self):
        project = ProjectFactory()
        assert project.is_ongoing is False


@pytest.mark.django_db
class TestCVModel:
    def test_create_cv(self):
        cv = CVFactory()
        assert cv.pk is not None
        assert cv.title == "السيرة الذاتية"
        assert cv.language == "ar"

    def test_cv_parsed_default(self):
        cv = CVFactory()
        assert cv.is_parsed is False

    def test_cv_file_size_default(self):
        cv = CVFactory()
        assert cv.file_size == 1024


@pytest.mark.django_db
class TestProfileViewModel:
    def test_create_profile_view(self):
        profile = GraduateProfileFactory()
        view = ProfileView.objects.create(graduate=profile)
        assert view.pk is not None


@pytest.mark.django_db
class TestSavedGraduateModel:
    def test_create_saved_graduate(self):
        employer = EmployerUserFactory()
        profile = GraduateProfileFactory()
        saved = SavedGraduate.objects.create(employer=employer, graduate=profile)
        assert saved.pk is not None

    def test_unique_saved_graduate(self):
        employer = EmployerUserFactory()
        profile = GraduateProfileFactory()
        SavedGraduate.objects.create(employer=employer, graduate=profile)
        with pytest.raises(Exception):
            SavedGraduate.objects.create(employer=employer, graduate=profile)
