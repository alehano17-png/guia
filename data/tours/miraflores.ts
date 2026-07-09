

import type { Tour } from "./types";


export const mirafloresCompleto: Tour = {
  id: "miraflores-completo",
  title: "Miraflores",
  steps: [



{
id: "inicio-miraflores",
startRoute: {
  destinationTitle: "Faro de la Marina",
  latitude: -12.123722,
  longitude: -77.040097,
  nextStepId: "faro",
  buttonLabel: "Ver ruta al Faro",
},
latitude: -12.123722,
longitude: -77.040097,
title: "Miraflores",
summary: `Un distrito costero de Lima
donde ciudad moderna y océano
se encuentran frente al Pacífico.`,
voiceText: `
Bienvenido a Miraflores,
uno de los distritos más importantes del Perú.

Hoy combina comercio, ciudad y mar,
pero también conserva una historia mucho más antigua
de lo que parece.

En este recorrido vamos a caminar por algunos de los puntos más simbólicos de Miraflores,
entre el malecón, los acantilados y espacios que forman parte de la Lima costera actual.


  `.trim(),
highlights: [],

},

{
id: "faro",
nextStepPreview: {
  time: "2–4 min a pie",
},
title: "Faro de la Marina",
latitude: -12.123722,
longitude: -77.040097,
summary: `Un faro urbano construido en 1990
que marca el límite entre Lima
y el océano Pacífico.`,
voiceText: `
Estás en uno de los puntos más simbólicos de Miraflores.
(pausa)



Este faro se construyó en 1900, a comienzos del siglo XX, cuando Lima empezó a mirar de verdad hacia el mar.
(micro pausa)
No es antiguo en términos arqueológicos, pero sí es clave para entender la ciudad moderna.
(pausa)

Su función era guiar a las embarcaciones que se acercaban a esta parte de la costa,  en una época en la que el puerto del Callao concentraba el comercio y el tránsito marítimo del país.
(pausa)

Y hay un detalle bien interesante: el faro no apunta al mar, apunta hacia la ciudad.
(micro pausa)
No es un error.
Su luz servía tanto para orientar barcos como para marcar presencia urbana, como diciendo: “aquí hay ciudad”.
(pausa)

Quédate un momento mirando hacia Lima.
(silencio 3s)
Este faro no mira el océano, mira la ciudad.
(pausa)

Si te das vuelta y miras alrededor, estás justo entre dos tiempos:
(micro pausa)
detrás de ti, Lima contemporánea;
delante, un océano que ha sido ruta, frontera y sustento desde hace miles de años.
(pausa)

Cuando quieras, caminamos hacia el malecón.
      `.trim(),
highlights: [
"Construido en 1990",
"Faro urbano, no marítimo",
"Marca presencia de ciudad",
"Límite entre Lima y el oceáno",
],
nextId: "malecon",
},

{
id: "malecon",
nextStepPreview: {
  time: "3–5 min a pie",
},
title: "Malecón de Miraflores",
latitude: -12.124500,
longitude: -77.038690,
summary: `Un paseo elevado sobre acantilados
que conecta parques y miradores
a lo largo de la costa de Miraflores.`,
voiceText: `
Este tramo del malecón no es solo un paseo bonito.
(pausa)

Estás caminando sobre un acantilado natural formado hace miles de años.
Abajo tienes el Pacífico;
arriba, uno de los distritos más visitados del Perú.
(pausa)

La Costa Verde no siempre fue como la ves ahora.
Para construirla, durante el siglo XX se ganaron terrenos al mar con rellenos y obras de ingeniería que cambiaron por completo la relación de Lima con su litoral.
(pausa)

Mucho antes de todo eso, las culturas prehispánicas ya usaban esta franja para observar el mar, pescar y establecer rutas costeras.
(pausa)

Hoy sigue cumpliendo una función parecida: conectar.
(micro pausa)
Gente caminando, corriendo, conversando, mirando.
(pausa)

Si te provoca, guarda el celular un momento y camina unos metros mirando solo el horizonte.
(silencio 3s)
Yo te aviso cuando retomamos.
      `.trim(),
highlights: [
"Acantilado natural",
"Costa Verde bajo tus pies",
"Uso prehispánico del litoral",
"Espacio de conexión urbana",
],
nextId: "parque-amor",
},

{
id: "parque-amor",
nextStepPreview: {
  time: "2–4 min a pie",
},
title: "Parque del Amor",
latitude: -12.1267984,
longitude: -77.0365665,
summary: `Un parque frente al mar dedicado al encuentro y la contemplación
en el malecón de Miraflores.`,
voiceText: `
Este parque no es antiguo, pero sí es simbólico.
(pausa)

Se creó en la década de 1990 como un espacio para el encuentro, el descanso y la contemplación.
(micro pausa)
El mural que ves está inspirado en motivos precolombinos.
No es solo decoración, es un homenaje a las culturas que habitaron esta costa.
(pausa)

Aquí el amor no se plantea solo como pareja.
Se entiende como vínculo:
con el paisaje,
con la ciudad,
con el momento.
(pausa)

Desde este punto, el mar deja de ser fondo y se vuelve protagonista.
(pausa)

Si te provoca, disfruta el lugar unos minutos.
(silencio 3s)
No todo necesita explicación.
(pausa)

Cuando quieras, seguimos.
Ahora el recorrido cambia de tono.
      `.trim(),
highlights: [
"Parque creado en los años 90",
"Mural de inspiración precolombina",
"Espacio de contemplación",
"El mar como protagonista",
],
nextId: "villena",
},

{
id: "villena",
nextStepPreview: {
  time: "5–7 min a pie",
},
title: "Puente Villena Rey",
latitude: -12.127552,
longitude: -77.035575,
summary: `Un puente que atraviesa los acantilados
y conecta distintas zonas
del malecón de Miraflores.`,
voiceText: `
Aquí la ciudad cambia de escala.
(pausa)

El puente Villena Rey, construido en el siglo XX, conecta zonas altas del distrito y cruza un vacío natural profundo marcado por los acantilados.
(pausa)

Lima no fue pensada como una ciudad plana.
Se fue adaptando al terreno, a los desniveles, a este borde tan marcado entre ciudad y mar.
(pausa)

Durante años, este punto también estuvo asociado a episodios duros.
El puente fue conocido por suicidios, lo que llevó a reforzar su estructura y a replantear su design urbano.
(pausa)

No es una parte bonita de la historia, pero también es parte de la ciudad.
(pausa)

Hoy funciona como un recordatorio silencioso de que Lima no es solo postal.
(pausa)

Desde aquí puedes ver el malecón extendiéndose como una línea continua, casi como si la ciudad quisiera acompañar al mar sin invadirlo del todo.
(pausa)

Seguimos.
      `.trim(),
highlights: [
"Cruza un vacío natural",
"Infraestructura del siglo XX",
"Ciudad adaptada al terreno",
"Mirador del malecón",
],
nextId: "larcomar",
},



{
id: "larcomar",
title: "Larcomar",
latitude: -12.1322691,
longitude: -77.0301446,
summary: `Un centro comercial inaugurado en 1998, construido dentro del acantilado
frente al océano Pacífico.`,
voiceText: `
Estás en Larcomar.
(pausa)

Este lugar se inauguró en 1998 y, para su momento, fue una idea poco común en Lima.
En vez de levantar un gran edificio, se decidió construir dentro del acantilado.
(pausa)

Eso no fue algo que todos celebraran.
Hubo críticas, dudas y mucha discusión sobre si debía hacerse o no.
(pausa)

La idea principal fue no tapar el paisaje.
Por eso Larcomar es abierto, con terrazas, pasillos y espacios que siempre miran al mar.
(pausa)

Aquí no se viene solo a comprar.
Se viene a caminar, a sentarse un rato, a mirar el horizonte.
(pausa)

Con el tiempo, este lugar se volvió un punto fijo en la ciudad.
Un espacio donde Lima moderna se asoma al océano sin darle la espalda.
(pausa)

Y hay algo interesante en eso.
Porque Larcomar resume bastante bien una idea de Miraflores:
ciudad, paisaje y vida contemporánea compartiendo el mismo borde frente al mar.
(pausa)

Con esto cerramos el recorrido.
(pausa)

Continuamos.
`.trim(),
highlights: [
"Inaugurado en 1998",
"Construido sobre un acantilado",
"Proyecto con debate urbano",
"Ingeniería de estabilización",
],
nextId: "fin-tour-miraflores"
},


{
id: "fin-tour-miraflores",
previewText: "Recorrido terminado",
title: "Fin del recorrido",
summary: `Fin del recorrido por Miraflores,
donde historia antigua
y ciudad moderna conviven.`,
voiceText: `
Hemos llegado al final de este recorrido por Miraflores.

Lo caminamos juntos, pero ahora el lugar es tuyo.
Si te quedas un rato más, disfrútalo sin el teléfono.

Gracias por recorrer Miraflores conmigo.
  `.trim(),
highlights: [],
end: true,
},
],
};

