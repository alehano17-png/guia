import type { TourContent } from "../../content-types";

export const mirafloresContentEs: TourContent = {
  title: "Miraflores",
  steps: [
    {
      id: "inicio-miraflores",
      title: "Miraflores",
      voiceText: `Bienvenido a Miraflores,
uno de los distritos más importantes del Perú.

Hoy combina comercio, ciudad y mar,
pero también conserva una historia mucho más antigua
de lo que parece.

En este recorrido vamos a caminar por algunos de los puntos más simbólicos de Miraflores,
entre el malecón, los acantilados y espacios que forman parte de la Lima costera actual.`,
      summary: `Un distrito costero de Lima
donde ciudad moderna y océano
se encuentran frente al Pacífico.`,
      highlights: [],
      startRoute: {
        destinationTitle: "Faro de la Marina",
        buttonLabel: "Ver ruta al Faro",
      },
    },

    {
      id: "faro",
      title: "Faro de la Marina",
      voiceText: `Estás en uno de los puntos más fotografiados de Miraflores — pero este faro no nació aquí.
(pausa)

Lo construyeron en 1900, y en 1921 empezó a funcionar a cientos de kilómetros de acá, en Punta Coles, un puerto cerca de Ilo, al sur del Perú.
(micro pausa)
Ahí guió barcos durante más de cinco décadas.
(pausa)

En 1973, la Marina de Guerra lo desarmó pieza por pieza, perno por perno, y lo volvió a levantar exactamente donde estás parado ahora.
(micro pausa)
Hasta hoy, en Ilo todavía hay quien lo reclama como suyo — y Miraflores hace tiempo que lo siente propio.
(pausa)

Quédate un momento mirando hacia el mar.
(silencio 3s)
Ese mismo océano conectó, casi sin que nadie lo note, un pequeño puerto del sur con esta esquina de Lima.
(pausa)

Cuando quieras, caminamos hacia el malecón.`,
      summary: `Un faro construido en 1900 en Ilo,
trasladado a Miraflores en 1973,
pieza por pieza.`,
      highlights: [
        "Construido en 1900, en Ilo",
        "Operó 52 años en Punta Coles",
        "Trasladado a Miraflores en 1973",
        "Desarmado y reconstruido pieza por pieza",
      ],
      nextStepPreview: { time: "2–4 min a pie" },
    },

    {
      id: "malecon",
      title: "Malecón de Miraflores",
      voiceText: `Este tramo del malecón no es solo un paseo bonito.
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
Yo te aviso cuando retomamos.`,
      summary: `Un paseo elevado sobre acantilados
que conecta parques y miradores
a lo largo de la costa de Miraflores.`,
      highlights: [
        "Acantilado natural",
        "Costa Verde bajo tus pies",
        "Uso prehispánico del litoral",
        "Espacio de conexión urbana",
      ],
      nextStepPreview: { time: "3–5 min a pie" },
    },

    {
      id: "parque-amor",
      title: "Parque del Amor",
      voiceText: `Este parque no es antiguo, pero sí es simbólico.
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
Ahora el recorrido cambia de tono.`,
      summary: `Un parque frente al mar dedicado al encuentro y la contemplación
en el malecón de Miraflores.`,
      highlights: [
        "Parque creado en los años 90",
        "Mural de inspiración precolombina",
        "Espacio de contemplación",
        "El mar como protagonista",
      ],
      nextStepPreview: { time: "2–4 min a pie" },
    },

    {
      id: "villena",
      title: "Puente Villena Rey",
      voiceText: `Aquí la ciudad cambia de escala.
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

Seguimos.`,
      summary: `Un puente que atraviesa los acantilados
y conecta distintas zonas
del malecón de Miraflores.`,
      highlights: [
        "Cruza un vacío natural",
        "Infraestructura del siglo XX",
        "Ciudad adaptada al terreno",
        "Mirador del malecón",
      ],
      nextStepPreview: { time: "5–7 min a pie" },
    },

    {
      id: "larcomar",
      title: "Larcomar",
      voiceText: `Estás en Larcomar.
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

Continuamos.`,
      summary: `Un centro comercial inaugurado en 1998, construido dentro del acantilado
frente al océano Pacífico.`,
      highlights: [
        "Inaugurado en 1998",
        "Construido sobre un acantilado",
        "Proyecto con debate urbano",
        "Ingeniería de estabilización",
      ],
      previewText: "Siguiente paso: cierre del recorrido",
    },

    {
      id: "fin-tour-miraflores",
      title: "Fin del recorrido",
      voiceText: `Hemos llegado al final de este recorrido por Miraflores.

Lo caminamos juntos, pero ahora el lugar es tuyo.
Si te quedas un rato más, disfrútalo sin el teléfono.

Gracias por recorrer Miraflores conmigo.`,
      summary: `Fin del recorrido por Miraflores,
donde historia antigua
y ciudad moderna conviven.`,
      highlights: [],
      previewText: "Recorrido terminado",
    },
  ],
};
