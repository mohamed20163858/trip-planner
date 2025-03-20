import React from "react";

const ELDLogSheet = ({ date, logs }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const gridHeight = 200;
  const gridWidth = 720; // 30px per hour

  // Status colors
  const statusColors = {
    driving: "#4CAF50",
    on_duty: "#2196F3",
    off_duty: "#FFC107",
    sleeper: "#9C27B0",
  };

  const getStatusLine = (status, startTime, endTime) => {
    const startHour =
      parseFloat(startTime.split(":")[0]) +
      parseFloat(startTime.split(":")[1]) / 60;
    const endHour =
      parseFloat(endTime.split(":")[0]) +
      parseFloat(endTime.split(":")[1]) / 60;

    const x1 = startHour * 30;
    const x2 = endHour * 30;

    return {
      x1,
      x2,
      color: statusColors[status],
    };
  };

  return (
    <div
      className="eld-log-sheet"
      style={{ margin: "20px 0", padding: "20px" }}
    >
      <h3>ELD Log Sheet - {date}</h3>

      {/* Grid Container */}
      <div style={{ position: "relative", marginTop: "20px" }}>
        {/* Time markers */}
        <div style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
          {hours.map((hour) => (
            <div
              key={hour}
              style={{
                width: "30px",
                textAlign: "center",
                borderLeft: "1px solid #ccc",
              }}
            >
              {hour}
            </div>
          ))}
        </div>

        {/* Status grid */}
        <div
          style={{
            height: `${gridHeight}px`,
            width: `${gridWidth}px`,
            position: "relative",
            border: "1px solid #ccc",
            borderTop: "none",
          }}
        >
          {/* Status labels */}
          <div
            style={{
              position: "absolute",
              left: "-80px",
              top: "0",
              height: "100%",
            }}
          >
            <div
              style={{ height: "25%", display: "flex", alignItems: "center" }}
            >
              Off Duty
            </div>
            <div
              style={{ height: "25%", display: "flex", alignItems: "center" }}
            >
              Sleeper
            </div>
            <div
              style={{ height: "25%", display: "flex", alignItems: "center" }}
            >
              Driving
            </div>
            <div
              style={{ height: "25%", display: "flex", alignItems: "center" }}
            >
              On Duty
            </div>
          </div>

          {/* Grid lines */}
          {hours.map((hour) => (
            <div
              key={hour}
              style={{
                position: "absolute",
                left: `${hour * 30}px`,
                top: 0,
                width: "1px",
                height: "100%",
                backgroundColor: "#eee",
              }}
            />
          ))}

          {/* Status lines */}
          {logs &&
            logs.map((log, index) => {
              const line = getStatusLine(
                log.status,
                log.start_time,
                log.end_time
              );
              const yPosition = {
                off_duty: "12.5%",
                sleeper: "37.5%",
                driving: "62.5%",
                on_duty: "87.5%",
              }[log.status];

              return (
                <div
                  key={index}
                  style={{
                    position: "absolute",
                    left: `${line.x1}px`,
                    top: yPosition,
                    width: `${line.x2 - line.x1}px`,
                    height: "2px",
                    backgroundColor: line.color,
                  }}
                />
              );
            })}
        </div>
      </div>

      {/* Summary */}
      <div style={{ marginTop: "20px" }}>
        <h4>Daily Summary</h4>
        <div style={{ display: "flex", gap: "20px" }}>
          {Object.entries(statusColors).map(([status, color]) => (
            <div
              key={status}
              style={{ display: "flex", alignItems: "center", gap: "5px" }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: color,
                  borderRadius: "2px",
                }}
              />
              <span style={{ textTransform: "capitalize" }}>
                {status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ELDLogSheet;
