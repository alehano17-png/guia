import type { Tour } from "./types";

export const huacaPucllana: Tour = {
  id: "huaca-pucllana",
  title: "Huaca Pucllana",
  steps: [

    {
  id: "inicio-huaca-pucllana",
  startRoute: {
    destinationTitle: "Huaca Pucllana",
    latitude: -12.110807,
    longitude: -77.034034,
    nextStepId: "huaca-exterior",
    buttonLabel: "Ver ruta a la Huaca",
  },
  title: "Huaca Pucllana",
  latitude: -12.110807,
  longitude: -77.034034,
  summary: `Un sitio arqueológico de Lima
levantado por la cultura Lima
en pleno corazón de Miraflores.`,
  voiceText: `
Bienvenido a la Huaca Pucllana,
uno de los espacios arqueológicos más importantes de Lima.

Hoy no vamos a recorrer un distrito completo,
vamos a entrar directo a un lugar que existía muchos siglos antes de la ciudad moderna.

Primero te llevo hasta el punto correcto
y cuando estés listo, comenzamos el recorrido.
  `.trim(),
  highlights: [],
},

    {
      id: "huaca-exterior",
      previewText: "Siguiente paso: elige si recorres por fuera o entras",
      title: "Huaca Pucllana (Exterior)",
      latitude: -12.110807,
      longitude: -77.034034,
      summary: `Un complejo ceremonial de Lima 
  construido entre los años 200 y 700 d.C. en el corazón de Miraflores.`,
      voiceText: `
Lo que ves frente a ti no pertenece a la Lima moderna.
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

Desde aquí tienes dos opciones, y ambas valen la pena:
– recorrer la huaca desde fuera
– o entrar y conocerla por dentro, paso a paso
      `.trim(),
      highlights: [
        "Cultura Lima (200–700 d.C.)",
        "Centro ceremonial y político",
        "Adobes antisísmicos",
        "Más antigua que los incas",
      ],
      choices: [
        { label: "Recorrer por fuera", nextId: "huaca-exterior-recorrido" },
        { label: "Entrar", nextId: "huaca-interior-decision" },
      ],
    },

    {
      id: "huaca-exterior-recorrido",
      previewText: "Siguiente paso: cierre del recorrido",
      title: "Huaca Pucllana — Recorrido Exterior",
      summary: `Una pirámide ceremonial prehispánica
levantada como centro de poder
en la antigua Lima.`,
      voiceText: `
Perfecto.
La recorremos desde afuera.
(pausa)

Quédate con esto mientras la observas con calma.
(pausa)

Esta huaca no fue pensada para ser admirada desde lejos.
Fue pensada para imponer presencia.
(pausa)

Los niveles escalonados, los muros altos y la forma del conjunto marcan jerarquía y control.
Nada aquí es casual.
(pausa)

La técnica de adobes verticales —como libros parados— permitía que los muros absorbieran la energía de los sismos sin colapsar.
(pausa)

Eso explica por qué esta estructura sigue en pie después de más de mil quinientos años.
(pausa)

Desde afuera se entiende algo clave:
esto no era una casa.
No era un barrio.
Era un centro de poder.
(pausa)

Aquí se decidía.
Aquí se ritualizaba.
Aquí se gobernaba.
(pausa)

Cuando quieras, seguimos con el recorrido.
      `.trim(),
      highlights: [
        "Arquitectura de poder",
        "Estructura jerárquica",
        "Técnica en librero",
        "Presencia ritual dominante",
      ],
      nextId: "fin-tour-huaca",
    },

    {
      id: "huaca-interior-decision",
      previewText: "Siguiente paso: elige historia base o profunda",
      title: "Huaca Pucllana — Interior",
      summary: `Un complejo ceremonial
que puede recorrerse paso a paso
para entender su historia.`,
      voiceText: `
Si decides entrar, seguimos con un recorrido guiado por confirmación.

Y dime algo antes de empezar:
¿Quieres solo la historia base bien clara
o prefieres que profundicemos más en el contexto histórico?
      `.trim(),
      highlights: [],
      choices: [
        { label: "Historia base", nextId: "huaca-base-1" },
        { label: "Historia profunda", nextId: "huaca-power-1" },
      ],
    },

    {
      id: "huaca-base-1",
      actionCard: {
  tag: "Recorrido por confirmación",
  title: "Avanza hacia la rampa principal",
  subtitle: 'Cuando llegues, toca "Siguiente".',
},
      title: "Entrada — Base",
      summary: `La entrada a un complejo ceremonial
construido hace más de 1500 años
por la cultura Lima.`,
      
      voiceText: `
Estás entrando a la Huaca Pucllana, un centro ceremonial construido entre los años 200 y 700 d.C., mucho antes de los incas.
(pausa)

Fue levantado por la cultura Lima, cuando en Europa aún existía el Imperio Romano.
(pausa)

No era una ciudad ni una fortaleza.
Era un espacio ritual y administrativo donde religión y poder estaban completamente conectados.
(pausa)

Desde aquí puedes notar algo importante: los muros están hechos con adobes colocados verticalmente.
(micro pausa)
Esa técnica permitía que las estructuras resistieran los terremotos sin colapsar.
(pausa)

Cuando estés listo, avanza hacia la rampa principal.
(confirmación requerida)
      `.trim(),
      highlights: [
        "Ingreso ceremonial",
        "Cultura Lima",
        "Religión y poder unidos",
        "Arquitectura antisísmica",
      ],
      nextId: "huaca-base-2",
    },

    {
      id: "huaca-base-2",
      actionCard: {
  tag: "Recorrido por confirmación",
  title: "Sube con calma hasta la parte alta",
  subtitle: 'Cuando estés arriba, toca "Siguiente".',
},
      title: "Rampa — Base",
      summary: `Una rampa ceremonial
que marcaba el ascenso
hacia zonas de mayor jerarquía.`,
      
      voiceText: `
Esta rampa marca un cambio real de jerarquía y de función.
(pausa)

Mientras subes, dejas atrás espacios más abiertos y te acercas a zonas donde se concentraba el poder ritual.
No cualquiera podía estar aquí.
(pausa)

La Huaca Pucllana fue levantada por etapas, entre los años 200 y 700 d.C.
Cada ampliación elevaba físicamente el poder de quienes la controlaban.
(pausa)

Subir no era solo caminar.
Era entrar en otro nivel de autoridad, donde el acceso estaba regulado.
(pausa)

Tómalo con calma.
Avísame cuando llegues arriba.
(confirmación requerida)
      `.trim(),
      highlights: [
        "Ascenso jerárquico",
        "Acceso restringido",
        "Construcción por etapas",
        "Control del espacio",
      ],
      nextId: "huaca-base-3",
    },

    {
      id: "huaca-base-3",
      actionCard: {
  tag: "Recorrido por confirmación",
  title: "Detente en la zona ceremonial",
  subtitle: 'Cuando estés listo, toca "Siguiente".',
},
      title: "Zona ceremonial — Base",
      summary: `El espacio donde se realizaban
los principales rituales
de la cultura Lima.`,
      
      voiceText: `
Aquí se realizaban los rituales más importantes.
(pausa)

Se han encontrado ofrendas marinas, cerámica fina y evidencia de sacrificios humanos, fechados entre los siglos V y VII d.C.
(pausa)

Estos rituales estaban ligados al mar, a la fertilidad y al equilibrio natural.
(pausa)

Para la cultura Lima, el océano no era solo recurso.
Era una fuerza viva e impredecible.
(pausa)

Nada aquí era improvisado.
Todo estaba pensado para rituales que involucraban a la comunidad, aunque no todos pudieran presenciarlos.
(pausa)

Estás en el centro ceremonial de la huaca.
      `.trim(),
      highlights: [
        "Rituales principales",
        "Ofrendas marinas",
        "Relación con el océano",
        "Espacio sagrado",
      ],
      nextId: "huaca-base-4",
    },

    {
      id: "huaca-base-4",
      actionCard: {
  tag: "Recorrido por confirmación",
  title: "Avanza hacia la zona central",
  subtitle: 'Cuando llegues, toca "Siguiente".',
},
      title: "Zona central — Base",
      summary: `Un área de soporte
donde se preparaban ofrendas
para la actividad ritual.`,
      
      voiceText: `
Aquí se conectaba lo sagrado con lo cotidiano.
(pausa)

Se preparaban alimentos rituales, se organizaban ofrendas y se almacenaban elementos necesarios para las ceremonias superiores.
(pausa)

Sin este espacio, la huaca no funcionaba.
(pausa)

Es el engranaje del complejo.
      `.trim(),
      highlights: [
        "Soporte del ritual",
        "Preparación de ofrendas",
        "Organización interna",
        "Función logística",
      ],
      nextId: "huaca-base-5",
    },

    {
      id: "huaca-base-5",
      actionCard: {
  tag: "Recorrido por confirmación",
  title: "Este tramo está por terminar",
  subtitle: 'Cuando quieras continuar, toca "Siguiente".',
},
      title: "Cierre — Base",
      summary: `Un sitio ceremonial activo
durante siglos antes
de la Lima colonial.`,
      voiceText: `
Antes de salir, quédate con esta idea.
(pausa)

Este lugar ya estaba aquí muchos siglos antes de que existiera la Lima actual.
(pausa)

Durante generaciones, funcionó como un centro ceremonial y administrativo,
organizado, activo y conectado con su entorno.
(pausa)

No era un espacio aislado.
Formaba parte de una red de asentamientos en la costa central,
con reglas, jerarquías y continuidad en el tiempo.
(pausa)
      `.trim(),
      highlights: [
        "Anterior a los incas",
        "Centro de poder duradero",
        "Continuidad cultural",
        "Lima prehispánica",
      ],
      nextId: "fin-tour-huaca",
    },

    {
      id: "huaca-power-1",
      actionCard: {
  tag: "Recorrido por confirmación",
  title: "Avanza hacia la rampa principal",
  subtitle: 'Cuando llegues, toca "Siguiente".',
},
      title: "Entrada — Profunda",
      summary: `Un centro ceremonial regional
activo entre los siglos III y VII
en la costa central del Perú.`,
      
      voiceText: `
Estás entrando a un complejo construido entre los años 200 y 700 d.C., durante el periodo conocido como Intermedio Temprano en los Andes Centrales.
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
(confirmación requerida)
      `.trim(),
      highlights: [
        "Intermedio Temprano",
        "Roma en crisis",
        "Red regional ceremonial",
        "Poder político-religioso",
      ],
      nextId: "huaca-power-2",
    },

    {
      id: "huaca-power-2",
      actionCard: {
  tag: "Recorrido por confirmación",
  title: "Sube con calma hasta la parte alta",
  subtitle: 'Cuando estés arriba, toca "Siguiente".',
},
      title: "Rampa — Profunda",
      summary: `Una estructura escalonada
que expresaba jerarquía
y poder ritual.`,
      
      voiceText: `
Entre los siglos III y VII d.C., la arquitectura monumental en la costa central del Perú adoptó una organización piramidal escalonada.
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
(confirmación requerida)
      `.trim(),
      highlights: [
        "Arquitectura política",
        "Separación social",
        "Modelo piramidal",
        "Acceso simbólico al poder",
      ],
      nextId: "huaca-power-3",
    },

    {
      id: "huaca-power-3",
      actionCard: {
  tag: "Recorrido por confirmación",
  title: "Detente en la zona ceremonial",
  subtitle: 'Cuando quieras descender, toca "Siguiente".',
},
      title: "Zona ceremonial — Profunda",
      summary: `Un espacio ritual asociado
a ceremonias complejas
y sacrificios humanos.`,
      
      voiceText: `
Las excavaciones realizadas desde la década de 1980 han fechado sacrificios humanos entre los años 450 y 650 d.C.
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
(confirmación requerida)
      `.trim(),
      highlights: [
        "Sacrificios humanos",
        "Negociación con la naturaleza",
        "Fenómeno El Niño",
        "Planificación ritual",
      ],
      nextId: "huaca-power-4",
    },

    {
      id: "huaca-power-4",
      actionCard: {
  tag: "Recorrido por confirmación",
  title: "Avanza hacia la zona central",
  subtitle: 'Cuando estés listo, toca "Siguiente".',
},
      title: "Zona central — Profunda",
      summary: `Un área administrativa
que sostenía la actividad ritual
del complejo ceremonial.`,
      
      voiceText: `
Hay evidencia de actividad constante entre los siglos IV y VII d.C.
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

Mientras en Europa se consolidaban los reinos germánicos tras la caída de Roma, aquí había estabilidad ritual prolongada.
      `.trim(),
      highlights: [
        "Administración permanente",
        "Especialistas rituales",
        "Excedente agrícola",
        "Sociedad organizada",
      ],
      nextId: "huaca-power-5",
    },

    {
      id: "huaca-power-5",
      actionCard: {
  tag: "Recorrido por confirmación",
  title: "Este tramo está por terminar",
  subtitle: 'Cuando quieras cerrar, toca "Siguiente".',
},
      title: "Cierre — Profunda",
      summary: `Un centro ceremonial activo
durante más de cinco siglos
antes del mundo inca.`,
      voiceText: `
Antes de salir, vale la pena ordenar el tiempo.
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
(pausa)
      `.trim(),
      highlights: [
        "Cinco siglos de uso",
        "Antes de Wari e incas",
        "Tradición arquitectónica",
        "Ruina no aislada",
      ],
      nextId: "fin-tour-huaca",
    },

   {
  id: "fin-tour-huaca",
  previewText: "Recorrido terminado",
  title: "Fin del recorrido",
  summary: `Fin del recorrido por Huaca Pucllana,
uno de los espacios arqueológicos
más importantes de Lima.`,
      voiceText: `
Hemos llegado al final de este recorrido por la Huaca Pucllana.

Ahora ya no la estás viendo solo como una ruina,
sino como el rastro de una sociedad organizada,
con poder, ritual y continuidad histórica.

Gracias por recorrerla conmigo.
      `.trim(),
      highlights: [],
      end: true,
    },
  ],
};