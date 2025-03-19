# backend/trips/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet, ELDLogViewSet

router = DefaultRouter()
router.register(r'trips', TripViewSet)
router.register(r'eld-logs', ELDLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
]