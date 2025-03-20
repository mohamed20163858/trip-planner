import React, { useState, useCallback } from "react";
import TripForm from "./components/TripForm";
import MapComponent from "./components/MapComponent";
import ELDLogSheet from "./components/ELDLogSheet";
import { calculateELDLogs } from "./services/eldCalculations";

const App = () => {
  // Changed from function App() to const App = () =>
  const [tripData, setTripData] = useState(null);
  const [eldLogs, setEldLogs] = useState(null);

  const handleRouteCalculated = useCallback(
    (distance) => {
      console.log("App - Route distance received:", distance);
      if (tripData && distance) {
        console.log("App - Calculating ELD logs with:", { tripData, distance });
        const logs = calculateELDLogs(tripData, distance);
        console.log("App - Generated ELD logs:", logs);
        setEldLogs(logs);
      }
    },
    [tripData]
  );

  const handleTripSubmit = useCallback((data) => {
    console.log("App - New trip data submitted:", data);
    setTripData(data);
    setEldLogs(null);
  }, []);

  return (
    <div className="App">
      <h1>Trip Planner</h1>
      <TripForm onTripSubmit={handleTripSubmit} />
      {tripData && (
        <MapComponent
          currentLocation={tripData.current_location}
          pickupLocation={tripData.pickup_location}
          dropoffLocation={tripData.dropoff_location}
          onRouteCalculated={handleRouteCalculated}
        />
      )}
      {eldLogs && (
        <ELDLogSheet
          date={new Date().toISOString().split("T")[0]}
          logs={eldLogs.logs}
          summary={eldLogs.summary}
        />
      )}
    </div>
  );
};

export default App;
