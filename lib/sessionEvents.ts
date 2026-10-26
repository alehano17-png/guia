// Aviso central de "sesión terminada": lo dispara tourApiFetch cuando el
// servidor rechaza la sesión y no se pudo renovar, y lo escucha el
// AuthProvider (cierra la sesión local y lleva al login).
//
// Se avisa UNA sola vez aunque varias peticiones fallen a la vez (por
// ejemplo, la narración y una pregunta al mismo tiempo); se rearma cuando
// la persona vuelve a iniciar sesión (rearmSessionExpired).

type Listener = () => void;

const listeners = new Set<Listener>();
let armed = true;

export function notifySessionExpired(): void {
  if (!armed) return;
  armed = false;
  for (const listener of listeners) listener();
}

export function onSessionExpired(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function rearmSessionExpired(): void {
  armed = true;
}
