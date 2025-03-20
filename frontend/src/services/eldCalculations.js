// frontend/src/services/eldCalculations.js

const HOS_REGULATIONS = {
  MAX_DRIVING_HOURS: 11,
  MAX_ON_DUTY_HOURS: 14,
  REQUIRED_BREAK_AFTER: 8,
  BREAK_DURATION: 0.5,
  MAX_HOURS_IN_CYCLE: 70,
  AVERAGE_SPEED: 55, // mph
};

const calculateDrivingTime = (distance) => {
  return distance / HOS_REGULATIONS.AVERAGE_SPEED;
};

const calculateRequiredBreaks = (drivingHours) => {
  const numBreaks = Math.floor(
    drivingHours / HOS_REGULATIONS.REQUIRED_BREAK_AFTER
  );
  return numBreaks * HOS_REGULATIONS.BREAK_DURATION;
};

const calculateELDLogs = (tripData, routeDistance) => {
  const logs = [];
  const currentDate = new Date();
  let currentTime = new Date(currentDate);

  // Convert hours to milliseconds
  const hoursToMs = (hours) => hours * 60 * 60 * 1000;

  // Helper function to format time
  const formatTime = (date) => {
    return date.toTimeString().split(" ")[0].substr(0, 5);
  };

  // Calculate total driving time based on route distance
  const totalDrivingHours = calculateDrivingTime(routeDistance);
  const requiredBreakHours = calculateRequiredBreaks(totalDrivingHours);

  // Add previous driving time if any
  if (tripData.current_cycle_hours > 0) {
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

  currentTime = new Date(currentTime.getTime() + hoursToMs(1));

  // Add driving segments with breaks
  let remainingDriving = totalDrivingHours;
  while (remainingDriving > 0) {
    const drivingSegment = Math.min(
      remainingDriving,
      HOS_REGULATIONS.REQUIRED_BREAK_AFTER
    );

    // Add driving period
    logs.push({
      status: "driving",
      start_time: formatTime(currentTime),
      end_time: formatTime(
        new Date(currentTime.getTime() + hoursToMs(drivingSegment))
      ),
      date: currentDate.toISOString().split("T")[0],
    });

    currentTime = new Date(currentTime.getTime() + hoursToMs(drivingSegment));
    remainingDriving -= drivingSegment;

    // Add break if needed
    if (remainingDriving > 0) {
      logs.push({
        status: "off_duty",
        start_time: formatTime(currentTime),
        end_time: formatTime(
          new Date(
            currentTime.getTime() + hoursToMs(HOS_REGULATIONS.BREAK_DURATION)
          )
        ),
        date: currentDate.toISOString().split("T")[0],
      });
      currentTime = new Date(
        currentTime.getTime() + hoursToMs(HOS_REGULATIONS.BREAK_DURATION)
      );
    }
  }

  // Add dropoff time (1 hour)
  logs.push({
    status: "on_duty",
    start_time: formatTime(currentTime),
    end_time: formatTime(new Date(currentTime.getTime() + hoursToMs(1))),
    date: currentDate.toISOString().split("T")[0],
  });

  return {
    logs,
    summary: {
      totalDrivingHours,
      requiredBreakHours,
      totalTripHours: totalDrivingHours + requiredBreakHours + 2, // +2 for pickup and dropoff
      remainingCycleHours:
        HOS_REGULATIONS.MAX_HOURS_IN_CYCLE -
        (tripData.current_cycle_hours + totalDrivingHours),
    },
  };
};

export { calculateELDLogs };
