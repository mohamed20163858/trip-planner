import { HOS_REGULATIONS } from "../constants/hosRegulations";
import { formatTime, formatDate, addHours } from "../utils/timeUtils";

export const calculateELDLogs = (tripData, distance) => {
  console.log("Starting calculation with:", { tripData, distance });

  const logs = [];
  const currentDate = new Date();
  let currentTime = new Date(currentDate);

  // Calculate required new driving time
  const newDrivingNeeded = distance / HOS_REGULATIONS.AVERAGE_SPEED;
  console.log("New driving needed:", newDrivingNeeded);

  // Initialize counters
  let totalDrivingHours = 0;
  let newDrivingCompleted = 0;
  let totalOnDutyHours = 0;
  let currentDrivingSegment = 0;
  let remainingNewDriving = newDrivingNeeded;

  // Step 1: Add previous cycle hours
  if (tripData.current_cycle_hours > 0) {
    logs.push({
      status: "driving",
      start_time: formatTime(
        addHours(currentTime, -tripData.current_cycle_hours)
      ),
      end_time: formatTime(currentTime),
      date: formatDate(currentTime),
      hours: tripData.current_cycle_hours,
      isPreviousCycle: true,
    });
    totalDrivingHours = tripData.current_cycle_hours;
    totalOnDutyHours = tripData.current_cycle_hours;
    currentDrivingSegment = tripData.current_cycle_hours;
  }

  // Step 2: Add pickup time
  logs.push({
    status: "on_duty",
    start_time: formatTime(currentTime),
    end_time: formatTime(addHours(currentTime, 1)),
    date: formatDate(currentTime),
    location: tripData.pickup_location,
    activity: "Pickup",
    hours: 1,
  });
  currentTime = addHours(currentTime, 1);
  totalOnDutyHours += 1;

  // Step 3: Calculate available driving time
  const availableNewDriving =
    HOS_REGULATIONS.DAILY_DRIVING_LIMIT - totalDrivingHours;
  console.log("Available new driving:", availableNewDriving);

  // Step 4: Process new driving segments
  while (
    remainingNewDriving > 0 &&
    totalDrivingHours < HOS_REGULATIONS.DAILY_DRIVING_LIMIT &&
    totalOnDutyHours < HOS_REGULATIONS.DAILY_DUTY_LIMIT
  ) {
    // Add break if needed
    if (currentDrivingSegment >= HOS_REGULATIONS.BREAK_REQUIRED_AFTER) {
      console.log("Adding break after segment:", currentDrivingSegment);
      logs.push({
        status: "off_duty",
        start_time: formatTime(currentTime),
        end_time: formatTime(
          addHours(currentTime, HOS_REGULATIONS.MINIMUM_BREAK_DURATION)
        ),
        date: formatDate(currentTime),
        activity: "Required 30-minute break",
        hours: HOS_REGULATIONS.MINIMUM_BREAK_DURATION,
      });
      currentTime = addHours(
        currentTime,
        HOS_REGULATIONS.MINIMUM_BREAK_DURATION
      );
      currentDrivingSegment = 0;
    }

    // Calculate next driving segment
    const nextSegment = Math.min(
      remainingNewDriving,
      HOS_REGULATIONS.DAILY_DRIVING_LIMIT - totalDrivingHours,
      HOS_REGULATIONS.BREAK_REQUIRED_AFTER - currentDrivingSegment
    );

    if (nextSegment > 0) {
      console.log("Adding driving segment:", {
        segment: nextSegment,
        remaining: remainingNewDriving,
      });

      logs.push({
        status: "driving",
        start_time: formatTime(currentTime),
        end_time: formatTime(addHours(currentTime, nextSegment)),
        date: formatDate(currentTime),
        hours: nextSegment,
        isNewDriving: true,
      });

      currentTime = addHours(currentTime, nextSegment);
      totalDrivingHours += nextSegment;
      newDrivingCompleted += nextSegment;
      currentDrivingSegment += nextSegment;
      remainingNewDriving -= nextSegment;

      // Add break if this isn't the last segment and we'll need more driving
      if (
        remainingNewDriving > 0 &&
        currentDrivingSegment >= HOS_REGULATIONS.BREAK_REQUIRED_AFTER
      ) {
        console.log("Adding mid-route break");
        logs.push({
          status: "off_duty",
          start_time: formatTime(currentTime),
          end_time: formatTime(
            addHours(currentTime, HOS_REGULATIONS.MINIMUM_BREAK_DURATION)
          ),
          date: formatDate(currentTime),
          activity: "Required 30-minute break",
          hours: HOS_REGULATIONS.MINIMUM_BREAK_DURATION,
        });
        currentTime = addHours(
          currentTime,
          HOS_REGULATIONS.MINIMUM_BREAK_DURATION
        );
        currentDrivingSegment = 0;
      }
    }
  }

  // Step 5: Add dropoff time
  if (totalOnDutyHours < HOS_REGULATIONS.DAILY_DUTY_LIMIT) {
    logs.push({
      status: "on_duty",
      start_time: formatTime(currentTime),
      end_time: formatTime(addHours(currentTime, 1)),
      date: formatDate(currentTime),
      location: tripData.dropoff_location,
      activity: "Dropoff",
      hours: 1,
    });
    totalOnDutyHours += 1;
  }

  // Calculate summary
  const breakEntries = logs.filter((log) => log.status === "off_duty");
  // const newDrivingEntries = logs.filter(log => log.status === 'driving' && log.isNewDriving);

  const summary = {
    totalDrivingHours,
    newDrivingHours: newDrivingCompleted,
    totalOnDutyHours,
    actualBreakHours: breakEntries.reduce((sum, log) => sum + log.hours, 0),
    expectedBreaks: Math.ceil(
      newDrivingNeeded / HOS_REGULATIONS.BREAK_REQUIRED_AFTER
    ),
    actualBreaks: breakEntries.length,
    estimatedTotalTime: newDrivingNeeded + 2, // +2 for pickup and dropoff
    remainingDailyDrivingHours:
      HOS_REGULATIONS.DAILY_DRIVING_LIMIT - totalDrivingHours,
    remainingDailyDutyHours:
      HOS_REGULATIONS.DAILY_DUTY_LIMIT - totalOnDutyHours,
    requiresBreak:
      currentDrivingSegment >= HOS_REGULATIONS.BREAK_REQUIRED_AFTER,
    estimatedCompletionTime: logs[logs.length - 1].end_time,
    estimatedCompletionDate: logs[logs.length - 1].date,
    isCompliant:
      totalDrivingHours <= HOS_REGULATIONS.DAILY_DRIVING_LIMIT &&
      totalOnDutyHours <= HOS_REGULATIONS.DAILY_DUTY_LIMIT,
    requiredNewDriving: newDrivingNeeded,
    remainingNewDriving,
    previousCycleHours: tripData.current_cycle_hours,
    status:
      remainingNewDriving > 0 ? "Incomplete - HOS limits reached" : "Complete",
  };

  return { logs, summary };
};
