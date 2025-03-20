import React, { useState } from "react";
import { createTrip } from "../services/api";

const TripForm = ({ onTripSubmit }) => {
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
      onTripSubmit(response); // Pass data up to parent
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
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.inputGroup}>
        <label>Current Location:</label>
        <input
          type="text"
          name="current_location"
          value={formData.current_location}
          onChange={handleChange}
          style={styles.input}
        />
      </div>
      <div style={styles.inputGroup}>
        <label>Pickup Location:</label>
        <input
          type="text"
          name="pickup_location"
          value={formData.pickup_location}
          onChange={handleChange}
          style={styles.input}
        />
      </div>
      <div style={styles.inputGroup}>
        <label>Dropoff Location:</label>
        <input
          type="text"
          name="dropoff_location"
          value={formData.dropoff_location}
          onChange={handleChange}
          style={styles.input}
        />
      </div>
      <div style={styles.inputGroup}>
        <label>Current Cycle Hours:</label>
        <input
          type="number"
          name="current_cycle_hours"
          value={formData.current_cycle_hours}
          onChange={handleChange}
          style={styles.input}
        />
      </div>
      <button type="submit" style={styles.button}>
        Create Trip
      </button>
    </form>
  );
};

const styles = {
  form: {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "20px",
  },
  inputGroup: {
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginTop: "5px",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
  button: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default TripForm;
