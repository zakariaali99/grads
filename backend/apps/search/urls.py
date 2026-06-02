from django.urls import path
from . import views

urlpatterns = [
    path("global/", views.GlobalSearchView.as_view(), name="search-global"),
]
