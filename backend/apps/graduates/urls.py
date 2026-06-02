from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"profiles", views.GraduateProfileViewSet, basename="graduate")
router.register(r"education", views.EducationViewSet, basename="education")
router.register(r"certifications", views.CertificationViewSet, basename="certification")
router.register(r"experience", views.ExperienceViewSet, basename="experience")
router.register(r"projects", views.ProjectViewSet, basename="project")
router.register(r"cvs", views.CVViewSet, basename="cv")
router.register(r"skills", views.SkillViewSet, basename="skill")
router.register(r"skill-categories", views.SkillCategoryViewSet, basename="skill-category")
router.register(r"colleges", views.CollegeViewSet, basename="college")
router.register(r"saved", views.SavedGraduateViewSet, basename="saved-graduate")

urlpatterns = router.urls
