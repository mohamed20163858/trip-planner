import React, { useState } from "react";
import TripForm from "./components/TripForm";
import MapComponent from "./components/MapComponent";
import ELDLogSheet from "./components/ELDLogSheet";
import { calculateELDLogs } from "./services/eldCalculations";

function App() {
  const [tripData, setTripData] = useState(null);
  const [eldLogs, setEldLogs] = useState(null);

  const handleTripSubmit = (data) => {
    setTripData(data);
    const logs = calculateELDLogs(data);
    setEldLogs(logs);
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
      {eldLogs && (
        <ELDLogSheet
          date={new Date().toISOString().split("T")[0]}
          logs={eldLogs}
        />
      )}
    </div>
  );
}

export default App;
