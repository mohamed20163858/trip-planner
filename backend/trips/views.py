# backend/trips/views.py
from rest_framework import viewsets
from rest_framework.response import Response
from .models import Trip, ELDLog
from .serializers import TripSerializer, ELDLogSerializer

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        trip = serializer.save()
        
        # Here we'll later add logic for route calculation and ELD log generation
        
        return Response(serializer.data)

class ELDLogViewSet(viewsets.ModelViewSet):
    queryset = ELDLog.objects.all()
    serializer_class = ELDLogSerializer