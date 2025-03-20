// services/geocoding.js
export const geocodeAddress = async (address) => {
  try {
    console.log("Geocoding - Fetching coordinates for address:", address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}`
    );
    const data = await response.json();
    console.log("Geocoding - Response received:", data);

    if (data && data.length > 0) {
      const result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
      console.log("Geocoding - Coordinates found:", result);
      return result;
    }
    console.log("Geocoding - No coordinates found for address");
    throw new Error("Location not found");
  } catch (error) {
    console.error("Geocoding error:", error);
    throw error;
  }
};
