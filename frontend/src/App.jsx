import React, { useState } from "react";
import TripForm from "./components/TripForm";
import MapComponent from "./components/MapComponent";

function App() {
  const [tripData, setTripData] = useState(null);

  const handleTripSubmit = (data) => {
    setTripData(data);
  };

  return (
    <div className="App">
      <h1>Trip Planner</h1>
      <TripForm onTripSubmit={handleTripSubmit} />
      <MapComponent
        currentLocation={tripData?.current_location}
        pickupLocation={tripData?.pickup_location}
        dropoffLocation={tripData?.dropoff_location}
      />
    </div>
  );
}

export default App;
