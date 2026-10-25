import type { TourContent } from "../../content-types";

export const huacaPucllanaContentEs: TourContent = {
  title: "Huaca Pucllana",
  steps: [
    {
      id: "inicio-huaca-pucllana",
      title: "Huaca Pucllana",
      voiceText: `Bienvenido a la Huaca Pucllana,
uno de los espacios arqueológicos más importantes de Lima.

Hoy no vamos a recorrer un distrito completo,
vamos a entrar directo a un lugar que existía muchos siglos antes de la ciudad moderna.

Primero te llevo hasta el punto correcto
y cuando estés listo, comenzamos el recorrido.

Ten en cuenta que para entrar necesitas una entrada, que se compra en la boletería.`,
      summary: `Un sitio arqueológico de Lima
levantado por la cultura Lima
en pleno corazón de Miraflores.`,
      highlights: [],
      startRoute: {
        destinationTitle: "Huaca Pucllana",
        buttonLabel: "Ver ruta a la Huaca",
      },
    },

    {
      id: "huaca-exterior",
      title: "Antes de entrar",
      voiceText: `Lo que ves frente a ti no pertenece a la Lima moderna.
(pausa)

La Huaca Pucllana fue construida entre los años 200 y 700 d.C., por la cultura Lima, más de mil años antes de los incas.
(pausa)

No era una vivienda ni una fortaleza.
Era un centro ceremonial y administrativo, donde se tomaban decisiones religiosas y políticas vinculadas al equilibrio con la naturaleza.
(pausa)

Mira los muros.
Los adobes están colocados verticalmente, como libros parados.
(micro pausa)
No es decoración.
Esa técnica está pensada para resistir terremotos, algo clave en esta costa sísmica.
(pausa)

Cuando aquí se levantaban estos muros, en Europa aún existía el Imperio Romano y pueblos como los francos o visigodos recién comenzaban a organizarse.
(pausa)

Antes de seguir, un detalle importante: el ingreso a la Huaca es con entrada, y se compra en la boletería.
(pausa)
Cuando ya tengas tu entrada, toca "Siguiente" y entramos juntos.`,
      summary: `Un complejo ceremonial de Lima 
  construido entre los años 200 y 700 d.C. en el corazón de Miraflores.`,
      highlights: [
        "Cultura Lima (200–700 d.C.)",
        "Centro ceremonial y político",
        "Adobes antisísmicos",
        "Más antigua que los incas",
      ],
      previewText: "Siguiente paso: entrar a la Huaca",
      actionCard: {
        tag: "Recorrido por confirmación",
        title: "Compra tu entrada en boletería",
        subtitle: "Cuando la tengas, toca \"Siguiente\".",
      },
    },

    {
      id: "huaca-power-1",
      title: "Entrada",
      voiceText: `Estás entrando a un complejo construido entre los años 200 y 700 d.C., durante el periodo conocido como Intermedio Temprano en los Andes Centrales.
(pausa)

En ese mismo periodo, entre los siglos III y V d.C., el Imperio Romano atravesaba su crisis más profunda, con emperadores que duraban meses en el poder.
En el 476 d.C., Roma occidental colapsaría definitivamente.
(pausa)

Mientras eso ocurría en Europa, aquí la cultura Lima desarrollaba una red de centros ceremoniales en el valle del Rímac y el valle del Lurín.
(pausa)

La Huaca Pucllana no se construyó en un solo momento.
Su núcleo inicial data aproximadamente del siglo III d.C., y fue ampliada hasta el siglo VII.
(pausa)

La técnica “en librero” no solo absorbía energía sísmica.
Permitía reemplazar secciones dañadas sin comprometer toda la estructura.
(pausa)

Este no era un asentamiento marginal.
Era un centro de poder regional.
(pausa)

Cuando quieras, comenzamos a subir por la rampa.
(confirmación requerida)`,
      summary: `Un centro ceremonial regional
activo entre los siglos III y VII
en la costa central del Perú.`,
      highlights: [
        "Intermedio Temprano",
        "Roma en crisis",
        "Red regional ceremonial",
        "Poder político-religioso",
      ],
      actionCard: {
        tag: "Recorrido por confirmación",
        title: "Avanza hacia la rampa principal",
        subtitle: "Cuando llegues, toca \"Siguiente\".",
      },
    },

    {
      id: "huaca-power-2",
      title: "Rampa",
      voiceText: `Entre los siglos III y VII d.C., la arquitectura monumental en la costa central del Perú adoptó una organización piramidal escalonada.
(pausa)

No era estética.
Era política.
(pausa)

La cultura Lima separaba claramente niveles sociales: población común abajo, élite ritual arriba.
(pausa)

Este patrón se repetirá después en Pachacámac y más tarde en el mundo inca, en el siglo XV.
(pausa)

La elevación representaba cercanía simbólica con lo sagrado.
(pausa)

La rampa no es solo tránsito físico.
Es filtro de acceso.
(pausa)

Cuando llegues arriba, dime.
(confirmación requerida)`,
      summary: `Una estructura escalonada
que expresaba jerarquía
y poder ritual.`,
      highlights: [
        "Arquitectura política",
        "Separación social",
        "Modelo piramidal",
        "Acceso simbólico al poder",
      ],
      actionCard: {
        tag: "Recorrido por confirmación",
        title: "Sube con calma hasta la parte alta",
        subtitle: "Cuando estés arriba, toca \"Siguiente\".",
      },
    },

    {
      id: "huaca-power-3",
      title: "Zona ceremonial",
      voiceText: `Las excavaciones realizadas desde la década de 1980 han fechado sacrificios humanos entre los años 450 y 650 d.C.
(pausa)

Los cuerpos muestran entierros ordenados, sin señales de tortura descontrolada.
(pausa)

Algunas víctimas estaban acompañadas de vasijas ceremoniales y restos marinos.
(pausa)

La cultura Lima dependía de corrientes como la de Humboldt, que regulaban pesca, clima y fertilidad agrícola.
(pausa)

Un fenómeno como El Niño podía alterar todo ese equilibrio.
(pausa)

Estos sacrificios formaban parte de ceremonias de negociación simbólica con fuerzas naturales impredecibles.
(pausa)

Mientras en Europa los visigodos se asentaban en Hispania y el Imperio Romano occidental se fragmentaba, aquí existía planificación estatal ritual.
(pausa)

No era improvisación.
Era estructura.
(pausa)

Cuando quieras, descendemos.
(confirmación requerida)`,
      summary: `Un espacio ritual asociado
a ceremonias complejas
y sacrificios humanos.`,
      highlights: [
        "Sacrificios humanos",
        "Negociación con la naturaleza",
        "Fenómeno El Niño",
        "Planificación ritual",
      ],
      actionCard: {
        tag: "Recorrido por confirmación",
        title: "Detente en la zona ceremonial",
        subtitle: "Cuando quieras descender, toca \"Siguiente\".",
      },
    },

    {
      id: "huaca-power-4",
      title: "Zona central",
      voiceText: `Hay evidencia de actividad constante entre los siglos IV y VII d.C.
(pausa)

Se han encontrado fogones, áreas de almacenamiento y cerámica utilitaria junto a piezas ceremoniales.
(pausa)

Eso indica administración permanente y especialistas dedicados al mantenimiento ritual.
(pausa)

Para sostener esta estructura durante casi 400 años, la cultura Lima necesitaba excedente agrícola, control territorial y jerarquías definidas.
(pausa)

No era un grupo tribal pequeño.
Era una sociedad organizada regionalmente.
(pausa)

Mientras en Europa se consolidaban los reinos germánicos tras la caída de Roma, aquí había estabilidad ritual prolongada.`,
      summary: `Un área administrativa
que sostenía la actividad ritual
del complejo ceremonial.`,
      highlights: [
        "Administración permanente",
        "Especialistas rituales",
        "Excedente agrícola",
        "Sociedad organizada",
      ],
      actionCard: {
        tag: "Recorrido por confirmación",
        title: "Avanza hacia la zona central",
        subtitle: "Cuando estés listo, toca \"Siguiente\".",
      },
    },

    {
      id: "huaca-power-5",
      title: "Cierre",
      voiceText: `Antes de salir, vale la pena ordenar el tiempo.
(pausa)

Entre los años 200 y 700 d.C.,
este lugar funcionó de manera continua durante varios siglos.
(pausa)

Después, otras culturas ocuparon o influyeron en este territorio,
hasta que siglos más tarde sería integrado al mundo inca.
(pausa)

Eso significa que, incluso para los incas,
este sitio ya pertenecía a un pasado antiguo.
(pausa)

Lo que queda hoy no es una ruina aislada,
sino el registro material de una sociedad organizada,
con decisiones sostenidas en el tiempo.
(pausa)`,
      summary: `Un centro ceremonial activo
durante más de cinco siglos
antes del mundo inca.`,
      highlights: [
        "Cinco siglos de uso",
        "Antes de Wari e incas",
        "Tradición arquitectónica",
        "Ruina no aislada",
      ],
      actionCard: {
        tag: "Recorrido por confirmación",
        title: "Este tramo está por terminar",
        subtitle: "Cuando quieras cerrar, toca \"Siguiente\".",
      },
    },

    {
      id: "fin-tour-huaca",
      title: "Fin del recorrido",
      voiceText: `Hemos llegado al final de este recorrido por la Huaca Pucllana.

Ahora ya no la estás viendo solo como una ruina,
sino como el rastro de una sociedad organizada,
con poder, ritual y continuidad histórica.

Gracias por recorrerla conmigo.`,
      summary: `Fin del recorrido por Huaca Pucllana,
uno de los espacios arqueológicos
más importantes de Lima.`,
      highlights: [],
      previewText: "Recorrido terminado",
    },
  ],
};
