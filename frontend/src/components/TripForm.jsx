// frontend/src/components/TripForm.js
import React, { useState } from "react";
import { createTrip } from "../services/api";

const TripForm = () => {
  const [formData, setFormData] = useState({
    current_location: "",
    pickup_location: "",
    dropoff_location: "",
    current_cycle_hours: 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createTrip(formData);
      console.log("Trip created:", response);
      // We'll add more functionality here later
    } catch (error) {
      console.error("Error creating trip:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Current Location:</label>
        <input
          type="text"
          name="current_location"
          value={formData.current_location}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Pickup Location:</label>
        <input
          type="text"
          name="pickup_location"
          value={formData.pickup_location}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Dropoff Location:</label>
        <input
          type="text"
          name="dropoff_location"
          value={formData.dropoff_location}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Current Cycle Hours:</label>
        <input
          type="number"
          name="current_cycle_hours"
          value={formData.current_cycle_hours}
          onChange={handleChange}
        />
      </div>
      <button type="submit">Create Trip</button>
    </form>
  );
};

export default TripForm;
