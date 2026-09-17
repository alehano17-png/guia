// Generaliza el patrón `{{variable}}` que ya usaba
// data/discovery/recommendationsCopy.ts (ahí resolvía un solo `{{cityName}}`
// a mano con un .replace() literal) — acá reemplaza cualquier cantidad de
// placeholders distintos, y cada uno tantas veces como aparezca en el
// texto, no solo la primera.
//
// interpolate("Hola {{name}}, tienes {{count}} mensajes de {{name}}", { name: "Ana", count: "3" })
//   -> "Hola Ana, tienes 3 mensajes de Ana"
export function interpolate(
  template: string,
  params: Record<string, string | number>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    const value = params[key];
    // Si no vino el parámetro, se deja el placeholder tal cual en vez de
    // imprimir "undefined" — más fácil de detectar en pantalla que un bug
    // silencioso.
    return value === undefined ? match : String(value);
  });
}
