import React, { useState, useCallback } from "react";
import TripForm from "./components/TripForm";
import MapComponent from "./components/MapComponent";
import ELDLogSheet from "./components/ELDLogSheet";
import { calculateELDLogs } from "./services/eldCalculations";
// for testing purposes
// import { testELDCalculations } from "./tests/testELD";

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

  // for testing purposes
  // const handleTestELD = () => {
  //   console.log("Running ELD Calculations Test");
  //   testELDCalculations();
  //   console.log("Test Complete");
  // };

  return (
    <div className="App">
      <h1>Trip Planner</h1>
      {/* Add this button for testing */}
      {/* <button
        onClick={handleTestELD}
        style={{
          padding: "10px",
          margin: "10px",
          backgroundColor: "#f0f0f0",
          border: "1px solid #ccc",
          cursor: "pointer",
        }}
      >
        Test ELD Calculations
      </button> */}
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
