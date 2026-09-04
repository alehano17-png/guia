// Un turno del chat de texto con GUÍA, tal como se muestra en pantalla
// (TourChatSheet) y se guarda en el estado de app/tour.tsx — antes vivía
// duplicado en los dos archivos. Distinto de ConversationMessage (en
// sendTourChatMessage.ts), que es el formato que viaja al backend
// (usa "content" en vez de "text", y no lleva "id" — ese es solo para
// la key de React en la lista de la UI).
export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};
