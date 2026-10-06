// Momento del día según la hora local del dispositivo (su zona horaria),
// no la del servidor ni una fija: mañana 5:00–11:59, tarde 12:00–18:59,
// noche 19:00–4:59.
export type TimeOfDay = "morning" | "afternoon" | "night";

export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 19) return "afternoon";
  return "night";
}
