import factory
import uuid
from django.utils import timezone
from datetime import timedelta
from apps.jobs.models import JobCategory, JobPost, JobApplication, Interview, SavedJob
from apps.employers.factories import CompanyProfileFactory
from apps.graduates.factories import SkillFactory, CollegeFactory, CVFactory
from apps.accounts.factories import GraduateUserFactory, EmployerUserFactory


class JobCategoryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = JobCategory

    name_ar = factory.Sequence(lambda n: f"تصنيف وظيفي {n}")
    name_en = factory.Sequence(lambda n: f"Job Category {n}")
    sort_order = 0
    is_active = True


class JobPostFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = JobPost

    id = factory.LazyFunction(uuid.uuid4)
    company = factory.SubFactory(CompanyProfileFactory)
    posted_by = factory.SelfAttribute("company.user")
    category = factory.SubFactory(JobCategoryFactory)
    title = factory.Sequence(lambda n: f"وظيفة {n}")
    description = factory.Faker("text", max_nb_chars=500)
    employment_type = JobPost.EmploymentType.FULL_TIME
    experience_level = JobPost.ExperienceLevel.MID
    city = "طرابلس"
    status = JobPost.Status.ACTIVE
    published_at = factory.LazyFunction(timezone.now)

    @factory.post_generation
    def skills(self, create, extracted, **kwargs):
        if not create:
            return
        if extracted:
            for skill in extracted:
                self.skills.add(skill)

    @factory.post_generation
    def targeted_colleges(self, create, extracted, **kwargs):
        if not create:
            return
        if extracted:
            for college in extracted:
                self.targeted_colleges.add(college)


class JobApplicationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = JobApplication

    id = factory.LazyFunction(uuid.uuid4)
    job = factory.SubFactory(JobPostFactory)
    applicant = factory.SubFactory(GraduateUserFactory)
    cv = factory.SubFactory(CVFactory)
    status = JobApplication.Status.PENDING


class InterviewFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Interview

    application = factory.SubFactory(JobApplicationFactory)
    scheduled_by = factory.SubFactory(EmployerUserFactory)
    interview_type = Interview.Type.VIDEO
    status = Interview.Status.SCHEDULED
    scheduled_at = factory.LazyFunction(lambda: timezone.now() + timedelta(days=7))
    duration_minutes = 30


class SavedJobFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SavedJob

    user = factory.SubFactory(GraduateUserFactory)
    job = factory.SubFactory(JobPostFactory)
