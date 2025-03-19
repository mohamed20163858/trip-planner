# backend/trips/models.py
from django.db import models

class Trip(models.Model):
    current_location = models.CharField(max_length=200)
    pickup_location = models.CharField(max_length=200)
    dropoff_location = models.CharField(max_length=200)
    current_cycle_hours = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Trip from {self.pickup_location} to {self.dropoff_location}"

class ELDLog(models.Model):
    trip = models.ForeignKey(Trip, related_name='eld_logs', on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=50)  # driving, on_duty, off_duty, sleeper
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"Log for {self.trip} on {self.date}"