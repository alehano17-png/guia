import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { getTimeOfDay, type TimeOfDay } from "../lib/timeOfDay";

// Devuelve el momento del día y lo recalcula cada vez que la app vuelve a
// primer plano, para que el saludo y el cielo no se queden "congelados" si
// la persona deja la app abierta desde la tarde hasta la noche.
export function useTimeOfDay(): TimeOfDay {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => getTimeOfDay());

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") setTimeOfDay(getTimeOfDay());
    });
    return () => subscription.remove();
  }, []);

  return timeOfDay;
}
