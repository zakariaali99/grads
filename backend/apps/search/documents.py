from django_elasticsearch_dsl import Document, Index, fields
from django_elasticsearch_dsl.registries import registry
from apps.graduates.models import GraduateProfile, Skill
from apps.jobs.models import JobPost
from apps.employers.models import CompanyProfile

GRADUATE_INDEX = Index("graduates")
JOB_INDEX = Index("jobs")
COMPANY_INDEX = Index("companies")

GRADUATE_INDEX.settings(number_of_shards=1, number_of_replicas=1)
JOB_INDEX.settings(number_of_shards=1, number_of_replicas=1)
COMPANY_INDEX.settings(number_of_shards=1, number_of_replicas=1)


@registry.register_document
@GRADUATE_INDEX.doc_type
class GraduateDocument(Document):
    user_id = fields.IntegerField(attr="user_id")
    full_name = fields.TextField(attr="user.get_full_name")
    headline = fields.TextField()
    college_name = fields.TextField(attr="college.name_ar")
    major = fields.TextField()
    city = fields.TextField()
    skill_names = fields.ListField(fields.TextField())
    available_for_work = fields.BooleanField()

    class Django:
        model = GraduateProfile
        fields = ["graduation_year", "gpa", "profile_views"]
        related_models = ["user", "college", "skills"]

    def get_queryset(self):
        return super().get_queryset().select_related("user", "college").prefetch_related("skills")

    def get_instances_from_related(self, related_instance):
        if isinstance(related_instance, Skill):
            return related_instance.graduates.all()
        return None

    def prepare_skill_names(self, instance):
        return [s.name_ar for s in instance.skills.all()]


@registry.register_document
@JOB_INDEX.doc_type
class JobDocument(Document):
    company_name = fields.TextField(attr="company.company_name")
    company_city = fields.TextField(attr="company.city")
    category_name = fields.TextField(attr="category.name_ar")
    skill_names = fields.ListField(fields.TextField())
    description = fields.TextField()
    requirements = fields.TextField()

    class Django:
        model = JobPost
        fields = ["title", "city", "employment_type", "experience_level", "salary_min", "salary_max"]
        related_models = ["company", "category", "skills"]

    def get_queryset(self):
        return super().get_queryset().select_related("company", "category").prefetch_related("skills")

    def prepare_skill_names(self, instance):
        return [s.name_ar for s in instance.skills.all()]


@registry.register_document
@COMPANY_INDEX.doc_type
class CompanyDocument(Document):
    class Django:
        model = CompanyProfile
        fields = ["company_name", "description", "city", "company_size"]
