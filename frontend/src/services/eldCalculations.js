const calculateELDLogs = (tripData) => {
  const logs = [];
  const currentDate = new Date();

  // Convert hours to milliseconds
  const hoursToMs = (hours) => hours * 60 * 60 * 1000;

  // Helper function to format time
  const formatTime = (date) => {
    return date.toTimeString().split(" ")[0].substr(0, 5);
  };

  // Start with current cycle hours
  let currentTime = new Date(currentDate);

  if (tripData.current_cycle_hours > 0) {
    // Add previous driving time
    const startTime = new Date(
      currentTime - hoursToMs(tripData.current_cycle_hours)
    );
    logs.push({
      status: "driving",
      start_time: formatTime(startTime),
      end_time: formatTime(currentTime),
      date: currentDate.toISOString().split("T")[0],
    });
  }

  // Add pickup time (1 hour)
  logs.push({
    status: "on_duty",
    start_time: formatTime(currentTime),
    end_time: formatTime(new Date(currentTime.getTime() + hoursToMs(1))),
    date: currentDate.toISOString().split("T")[0],
  });

  // Add estimated driving time (simplified for now)
  currentTime = new Date(currentTime.getTime() + hoursToMs(1)); // After pickup
  const estimatedDrivingHours = 8; // This will be calculated based on route later

  logs.push({
    status: "driving",
    start_time: formatTime(currentTime),
    end_time: formatTime(
      new Date(currentTime.getTime() + hoursToMs(estimatedDrivingHours))
    ),
    date: currentDate.toISOString().split("T")[0],
  });

  return logs;
};

export { calculateELDLogs };
