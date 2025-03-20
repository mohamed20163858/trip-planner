// src/tests/testELD.js

import { calculateELDLogs } from "../services/eldCalculations";
import { HOS_REGULATIONS } from "../constants/hosRegulations";

export const testELDCalculations = () => {
  // Test Case 1: New York to Washington DC route
  const testTripData = {
    id: 1,
    current_location: "New York, NY",
    pickup_location: "Boston, MA",
    dropoff_location: "Washington, DC",
    current_cycle_hours: 0,
    created_at: new Date().toISOString(),
  };

  // Distance in miles (approximate for this route)
  const testDistance = 450;

  console.log("\n=== Starting ELD Calculation Test ===");
  console.log("Test Input:", {
    tripData: testTripData,
    distance: testDistance,
    expectedDrivingHours: testDistance / HOS_REGULATIONS.AVERAGE_SPEED,
  });

  const result = calculateELDLogs(testTripData, testDistance);

  // Calculate expected values
  const expectedNewDrivingHours = testDistance / HOS_REGULATIONS.AVERAGE_SPEED;
  const expectedTotalDrivingHours =
    expectedNewDrivingHours + testTripData.current_cycle_hours;
  const expectedTotalDrivingHoursDuringDay =
    expectedTotalDrivingHours > 11
      ? (
          HOS_REGULATIONS.DAILY_DRIVING_LIMIT - testTripData.current_cycle_hours
        ).toFixed(2)
      : expectedNewDrivingHours.toFixed(2);
  const expectedBreaks =
    Math.ceil(expectedNewDrivingHours / HOS_REGULATIONS.BREAK_REQUIRED_AFTER) -
    1;
  //   const expectedTotalTime = expectedNewDrivingHours + 2 + expectedBreaks * 0.5; // driving + pickup/dropoff + breaks

  console.log("\n=== Detailed Test Results ===");

  // Log Analysis
  console.log("\nLog Entry Analysis:");
  result.logs.forEach((log, index) => {
    console.log(`Entry ${index + 1}:`, {
      status: log.status,
      duration: log.hours,
      timeRange: `${log.start_time} - ${log.end_time}`,
      activity: log.activity || "Driving",
    });
  });

  // Driving Time Analysis
  console.log("\nDriving Time Analysis:");
  const drivingEntries = result.logs.filter((log) => log.status === "driving");
  const totalDrivingTime = drivingEntries.reduce(
    (sum, log) => sum + log.hours,
    0
  );
  console.log("Driving Entries:", drivingEntries.length);
  console.log("Total Driving Hours:", totalDrivingTime);
  console.log("Previous Cycle Hours:", testTripData.current_cycle_hours);
  console.log(
    "New Driving Hours:",
    totalDrivingTime - testTripData.current_cycle_hours
  );

  // Break Analysis
  console.log("\nBreak Analysis:");
  const breakEntries = result.logs.filter((log) => log.status === "off_duty");
  console.log("Break Entries:", breakEntries.length);
  console.log(
    "Total Break Time:",
    breakEntries.reduce((sum, log) => sum + log.hours, 0)
  );

  // Validation Checks
  console.log("\n=== Validation Checks ===");

  const validations = [
    {
      test: "New driving hours calculation",
      expected: expectedTotalDrivingHoursDuringDay,

      actual: result.summary.newDrivingHours.toFixed(2),
      pass:
        Math.abs(
          result.summary.newDrivingHours - expectedTotalDrivingHoursDuringDay
        ) < 0.1,
    },
    {
      test: "Total driving hours limit",
      expected: "≤ 11",
      actual: result.summary.totalDrivingHours,
      pass:
        result.summary.totalDrivingHours <= HOS_REGULATIONS.DAILY_DRIVING_LIMIT,
    },
    {
      test: "Total duty hours limit",
      expected: "≤ 14",
      actual: result.summary.totalOnDutyHours,
      pass: result.summary.totalOnDutyHours <= HOS_REGULATIONS.DAILY_DUTY_LIMIT,
    },
    {
      test: "Break requirement",
      expected: expectedBreaks,
      actual: breakEntries.length,
      pass: breakEntries.length === expectedBreaks,
    },
    {
      test: "Previous cycle hours included",
      expected: testTripData.current_cycle_hours,
      actual: result.summary.previousCycleHours,
      pass:
        result.summary.previousCycleHours === testTripData.current_cycle_hours,
    },
  ];

  validations.forEach((validation) => {
    console.log(`\n${validation.test}:`);
    console.log(`Expected: ${validation.expected}`);
    console.log(`Actual: ${validation.actual}`);
    console.log(`Status: ${validation.pass ? "✅ PASS" : "❌ FAIL"}`);
  });

  // Summary
  console.log("\n=== Test Summary ===");
  const passedTests = validations.filter((v) => v.pass).length;
  console.log(`Passed: ${passedTests}/${validations.length} tests`);
  console.log("Final Status:", result.summary.status);

  // Recommendations
  console.log("\n=== Recommendations ===");
  if (result.summary.remainingDriving > 0) {
    console.log("⚠️ Trip cannot be completed in one shift due to HOS limits");
    console.log(
      "Remaining driving needed:",
      result.summary.remainingDriving.toFixed(2),
      "hours"
    );
  }
  if (result.summary.requiresBreak) {
    console.log("⚠️ Break required before next driving segment");
  }

  return result;
};
