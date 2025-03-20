export const formatTime = (date) => {
  return date.toTimeString().split(" ")[0].substr(0, 5);
};

export const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

export const addHours = (date, hours) => {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
};
