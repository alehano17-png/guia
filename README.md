# GUÍA

GUÍA es una app turística con IA pensada para acompañar al usuario durante un recorrido, usando la voz como canal principal y la pantalla como apoyo visual.

## Flujo actual

- Pantalla inicial
- Recomendaciones (tours y lugares en una sola lista)
- Tour guiado

## Tours activos

- Miraflores
- Barranco
- Centro Histórico

## Tecnologías principales

- Expo
- React Native
- Expo Router
- React Native Maps
- Backend local para voz y chat

## Comandos útiles

Instalar dependencias:

```bash
npm install
```

Iniciar la app:

```bash
npx expo start
```

Revisar errores de TypeScript:

```bash
npx tsc --noEmit
```

## Nota

La ruta `recomendations` se mantiene con ese nombre por compatibilidad interna del proyecto.

## Contornos de un tour nuevo

La app sabe que la persona llegó a un lugar cuando está a 15 m o menos de su contorno (o dentro de él), o de su punto. Los contornos se guardan en `data/tours/outlines/<tourId>.json` y los genera una herramienta de desarrollo; nadie los edita a mano.

1. La primera vez, la herramienta baja sola el archivo de Perú de Geofabrik (unos 250 MB) a `.cache/osm/`, que no va al repositorio. También se puede bajar a mano desde https://download.geofabrik.de/south-america/peru-latest.osm.pbf a `.cache/osm/peru-latest.osm.pbf`. Para tener el mapa al día, borra ese archivo y vuelve a correr la herramienta.
2. Corre `npm run medir-lugares`. Mide solo los pasos que todavía no tienen contorno (por ejemplo, los del tour nuevo). Para recalcular todos: `npm run medir-lugares -- --reemplazar`.
3. Revisa en la tabla solo los marcados:
   - `revisar`: no hay un lugar con nombre parecido; se usó el contorno más chico que contiene el punto. Confirma que sea el lugar correcto.
   - `sin contorno`, `lugar largo` o `muy grande`: la app usa el círculo de 15 m alrededor del punto. Si un lugar quedó sin contorno y no debería, revisa que el punto del esqueleto esté bien ubicado.

Datos de mapas: © colaboradores de OpenStreetMap, licencia ODbL (https://www.openstreetmap.org/copyright). Antes de publicar, la app debe mostrar esta atribución en sus créditos.
