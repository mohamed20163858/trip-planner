// frontend/src/services/api.js
import axios from "axios";

const API_URL = "http://localhost:8000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const createTrip = async (tripData) => {
  try {
    const response = await axiosInstance.post("/trips/", tripData);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const getTrips = async () => {
  try {
    const response = await axiosInstance.get("/trips/");
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
};
