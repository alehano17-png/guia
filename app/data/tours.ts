// app/data/tours.ts

export type TourChoice = {
  label: string;
  nextId: string;
};

export type TourStep = {
  id: string
  title: string
  voiceText: string
  summary?: string
  highlights?: string[]
  nextId?: string
  end?: boolean
  confirmation?: boolean
  latitude?: number
  longitude?: number
  choices?: {
    label: string
    nextId: string
  }[]
}

export type Tour = {
  id: string;
  title: string;
  steps: TourStep[];
};

export type MobilityOptionId = "walk" | "taxi" | "public" | "map";

export type MobilityOption = {
  id: MobilityOptionId;
  label: string;
};

export type TransitionBlock = {
  id: string;
  from: string;
  to: string;
  distanceMeters: number;
  voiceIntro: string;
  options: MobilityOption[];
};

const TRANSITIONS: TransitionBlock[] = [
  {
    id: "larcomar-to-huaca",
    from: "larcomar-transition",
    to: "huaca-exterior",
    distanceMeters: 1600,
    voiceIntro: `
El siguiente punto del recorrido está a aproximadamente un kilómetro y medio.
Puedes llegar caminando, tomando un taxi o usando transporte público.
Dime cómo prefieres continuar.
    `.trim(),
    options: [
      { id: "walk", label: "Caminando" },
      { id: "taxi", label: "Taxi" },
      { id: "public", label: "Transporte público" },
    ],
  },
];

const mirafloresCompleto: Tour = {
  id: "miraflores-completo",
  title: "Miraflores",
  steps: [

{
id: "inicio-miraflores",
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

En este recorrido vamos a caminar por el distrito
hasta llegar a la Huaca Pucllana,
un centro ceremonial construido siglos antes de la Lima actual.

El punto habitual de inicio es el Faro de la Marina,
aunque podemos comenzar desde otro lugar
según dónde estés ahora.

Tú decides cómo empezamos.
  `.trim(),
highlights: [],
choices: [
{ label: "Empezar en el Faro (recomendado)", nextId: "faro" },
{ label: "Empezar en Puente Villena Rey", nextId: "villena" },
],
},

{
id: "faro",
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
title: "Malecón de Miraflores",
latitude: -12.124987,
longitude: -77.0371701,
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
nextId: "villena",
},

{
id: "villena",
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
nextId: "parque-amor",
},

{
id: "parque-amor",
title: "Parque del Amor",
latitude: -12.126465,
longitude: -77.036637,
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
nextId: "larcomar",
},

{
id: "larcomar",
title: "Larcomar",
latitude: -12.131977,
longitude: -77.030640,
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
Porque mientras aquí se habla de ciudad, comercio y vida contemporánea,
muy cerca existe una historia mucho más antigua.
(pausa)

Cuando quieras, damos un giro en el recorrido
y nos adentramos en una historia escrita hace más de mil quinientos años.
(pausa)

Continuamos.
`.trim(),
highlights: [
"Inaugurado en 1998",
"Construido sobre un acantilado",
"Proyecto con debate urbano",
"Ingeniería de estabilización",
],
nextId: "larcomar-transition"
},

{
id: "larcomar-transition",
title: "Traslado a Huaca Pucllana",
summary: `La Huaca Pucllana se encuentra
a aproximadamente 1.6 kilómetros
desde este punto del recorrido.`,
confirmation: true,
voiceText: `
La Huaca Pucllana está a aproximadamente un kilómetro y medio desde aquí.

Puedes llegar caminando, en taxi o usando transporte público.
Dime cómo prefieres continuar.
  `.trim(),
highlights: [
"Distancia aproximada: 1.6 km",
"Opciones flexibles de traslado",
"Tú eliges cómo continuar",
],
},

{
id: "traslado-larcomar-huaca-caminando",
title: "Ir caminando",
summary: `Una caminata por Miraflores
hasta llegar al sitio arqueológico
de la Huaca Pucllana.`,
voiceText: `
Perfecto, caminando.

En la práctica, vas a demorar un rato, pero es totalmente posible si te provoca.
Abro la ruta hacia la Huaca Pucllana para que la sigas con tranquilidad.
Te va a marcar la ruta más directa desde donde estás.

Cuando estés listo y ya en camino, me dices “siguiente” y continuamos con la Huaca.
  `.trim(),
highlights: [
"Abre tu mapa y busca: Huaca Pucllana",
"Sigue la ruta directa",
"Cuando quieras: “Siguiente”",
"Luego empieza la Huaca",
],
nextId: "huaca-exterior",
},

{
id: "traslado-larcomar-huaca-taxi",
title: "Ir en taxi",
summary: `La forma más rápida
de llegar desde Larcomar
hasta la Huaca Pucllana.`,
voiceText: `
Perfecto, vamos en taxi.

Voy a abrir una aplicación de taxi
y colocar “Huaca Pucllana” como destino.

Es la forma más rápida y directa desde aquí.

Cuando llegues o cuando quieras,
dime “siguiente” y empezamos el recorrido en la huaca.
  `.trim(),
highlights: [
"Pide taxi por app",
"Destino: Huaca Pucllana",
"Al llegar: “Siguiente”",
"Luego empieza la Huaca",
],
nextId: "huaca-exterior",
},

{
id: "traslado-larcomar-huaca-bus",
title: "Ir en transporte público",
summary: `Varias rutas de transporte
conectan esta zona de Miraflores
con la Huaca Pucllana.`,
voiceText: `
Perfecto, vamos en transporte público.

Las rutas pueden variar según la hora y el punto exacto donde estés,
así que lo más práctico es revisar el mapa en modo transporte.

Voy a abrir el mapa
y marcar “Huaca Pucllana” como destino
para que veas qué buses o combinaciones te dejan más cerca.

Cuando ya estés en camino o cuando llegues,
dime “siguiente” y comenzamos el recorrido en la huaca.
  `.trim(),
highlights: [
"Usa el mapa para transporte público",
"Destino: Huaca Pucllana",
"Revisa paraderos y combinaciones",
"Luego: “Siguiente”",
],
nextId: "huaca-exterior",
},

{
id: "huaca-exterior",
title: "Huaca Pucllana (Exterior)",
latitude: -12.110807,
longitude: -77.034034,
summary: `Una pirámide de adobe construida
entre los años 200 y 700 d.C.
por la cultura Lima.`,
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
title: "Huaca Pucllana — Recorrido Exterior",
summary: `Una pirámide ceremonial prehispánica
que dominaba el valle
de la antigua Lima.`,
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
nextId: "fin-tour-miraflores"
},

{
id: "huaca-interior-decision",
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
title: "Entrada — Base",
summary: `La entrada al complejo ceremonial
de la cultura Lima
construido hace más de 1500 años.`,
confirmation: true,
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
title: "Rampa — Base",
summary: `Una rampa ceremonial
que marcaba el acceso
a zonas de mayor jerarquía.`,
confirmation: true,
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
title: "Zona ceremonial — Base",
summary: `El espacio donde se realizaban
los principales rituales
de la cultura Lima.`,
confirmation: true,
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
title: "Zona central — Base",
summary: `Un área de soporte
donde se preparaban ofrendas
y actividades rituales.`,
confirmation: true,
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
nextId: "fin-tour-miraflores"
},

{
id: "huaca-power-1",
title: "Entrada — Profunda",
summary: `Un centro ceremonial regional
activo entre los siglos III y VII
en la costa central del Perú.`,
confirmation: true,
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
title: "Rampa — Profunda",
summary: `Una estructura escalonada
que representaba jerarquía
y poder ritual.`,
confirmation: true,
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
title: "Zona ceremonial — Profunda",
summary: `Un espacio ritual asociado
a ceremonias complejas
y sacrificios humanos.`,
confirmation: true,
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
title: "Zona central — Profunda",
summary: `Un área administrativa
que sostenía la actividad ritual
del complejo ceremonial.`,
confirmation: true,
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
nextId: "fin-tour-miraflores"
},

{
id: "fin-tour-miraflores",
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

const TOURS: Tour[] = [mirafloresCompleto];

export function getTourById(id: string): Tour | undefined {
return TOURS.find((t) => t.id === id);
}

export function getTransitionFromStep(stepId: string): TransitionBlock | undefined {
return TRANSITIONS.find((t) => t.from === stepId);
}