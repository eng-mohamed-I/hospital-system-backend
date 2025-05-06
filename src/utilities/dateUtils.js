export const getNextDateOfDay = (day) => {
  const pad = (num) => num.toString().padStart(2, "0");
  const daysMap = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const today = new Date();
  const resultDate = new Date(today);

  const delta = (7 + daysMap[day] - today.getDay()) % 7 || 7;
  resultDate.setDate(today.getDate() + delta);

  const year = resultDate.getFullYear();
  const month = pad(resultDate.getMonth() + 1);
  const dayOfMonth = pad(resultDate.getDate());

  return `${year}-${month}-${dayOfMonth}`;
};

export const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};
