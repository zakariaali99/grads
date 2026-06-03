import factory
import uuid
from io import BytesIO
from django.core.files.base import ContentFile
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
)
from apps.accounts.factories import UserFactory


class SkillCategoryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SkillCategory

    name_ar = factory.Sequence(lambda n: f"تصنيف مهارة {n}")
    name_en = factory.Sequence(lambda n: f"Skill Category {n}")
    sort_order = 0


class SkillFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Skill

    name_ar = factory.Sequence(lambda n: f"مهارة {n}")
    name_en = factory.Sequence(lambda n: f"Skill {n}")
    category = factory.SubFactory(SkillCategoryFactory)
    demand_score = 50.0
    is_active = True


class CollegeFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = College

    name_ar = factory.Sequence(lambda n: f"كلية {n}")
    name_en = factory.Sequence(lambda n: f"College {n}")
    code = factory.Sequence(lambda n: f"COL{n:03d}")
    city = "طرابلس"
    is_active = True


class GraduateProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = GraduateProfile

    user = factory.SubFactory(UserFactory)
    headline = factory.Faker("job")
    college = factory.SubFactory(CollegeFactory)
    graduation_year = 2024
    major = factory.Faker("job")
    city = "طرابلس"
    available_for_work = True

    @factory.post_generation
    def skills(self, create, extracted, **kwargs):
        if not create:
            return
        if extracted:
            for skill in extracted:
                self.skills.add(skill)


class GraduateSkillFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = GraduateSkill

    graduate = factory.SubFactory(GraduateProfileFactory)
    skill = factory.SubFactory(SkillFactory)
    proficiency = GraduateSkill.Proficiency.INTERMEDIATE
    years_experience = 2
    is_top_skill = False


class EducationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Education

    graduate = factory.SubFactory(GraduateProfileFactory)
    degree = "بكالوريوس"
    field_of_study = factory.Faker("job")
    institution = factory.Faker("company")
    start_date = factory.Faker("date_this_decade")
    end_date = factory.Faker("date_this_year")
    is_current = False
    sort_order = 0


class ExperienceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Experience

    graduate = factory.SubFactory(GraduateProfileFactory)
    title = factory.Faker("job")
    company = factory.Faker("company")
    employment_type = "full_time"
    start_date = factory.Faker("date_this_decade")
    is_current = False
    sort_order = 0
    description = factory.Faker("text", max_nb_chars=200)


class CertificationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Certification

    graduate = factory.SubFactory(GraduateProfileFactory)
    name = factory.Faker("job")
    issuer = factory.Faker("company")
    issue_date = factory.Faker("date_this_year")
    is_verified = False


class ProjectFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Project

    graduate = factory.SubFactory(GraduateProfileFactory)
    title = factory.Faker("job")
    description = factory.Faker("text", max_nb_chars=200)
    technologies = "Python, Django"
    is_ongoing = False
    sort_order = 0


class CVFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CV

    graduate = factory.SubFactory(GraduateProfileFactory)
    title = "السيرة الذاتية"
    language = "ar"
    is_default = False
    is_parsed = False
    file_size = 1024
    file_type = "application/pdf"

    @factory.lazy_attribute
    def file(self):
        return ContentFile(
            b"%PDF-1.4 fake pdf content for testing",
            f"cv_{uuid.uuid4().hex[:8]}.pdf",
        )
