import type { TourContent } from "../../content-types";

export const centroHistoricoContentEs: TourContent = {
  title: "Centro Histórico",
  steps: [
    {
      id: "inicio-centro",
      title: "Centro Histórico",
      voiceText: `Bienvenido al Centro Histórico de Lima.
        (pausa)

        Estás a punto de caminar por el lugar exacto donde nació esta ciudad, hace casi 500 años.
        (micro pausa)
        En 1991, la UNESCO declaró todo este centro Patrimonio de la Humanidad — no por un solo edificio, sino por el conjunto completo.

        (pausa)

        Vamos a recorrer dos plazas, una casa que ha tenido la misma familia por generaciones, una catedral con secretos bajo tierra, y los restos de la muralla que alguna vez protegió toda la ciudad.

        Primero te llevo hasta el punto de partida, y cuando estés listo, comenzamos.`,
      summary: `El corazón fundacional de Lima,
Patrimonio de la Humanidad
desde 1991.`,
      highlights: [],
      startRoute: {
        destinationTitle: "Plaza San Martín",
        buttonLabel: "Ver ruta a Plaza San Martín",
      },
    },

    {
      id: "plaza-san-martin",
      title: "Plaza San Martín",
      voiceText: `Estás en la Plaza San Martín.
        (pausa)

        Se inauguró el 28 de julio de 1921, para celebrar el primer siglo de la independencia del Perú.
        (micro pausa)
        Antes de ser plaza, aquí hubo un hospital, y después dos estaciones de trenes distintas — la plaza que ves es, en realidad, la tercera vida de este mismo terreno.

        (pausa)

        En 1825, en lo que hoy es parte de esta misma plaza, asesinaron a Bernardo de Monteagudo — un político revolucionario, cercano al propio San Martín.
        (micro pausa)
        La plaza que hoy celebra la independencia también guarda, en el mismo suelo, una de sus muertes políticas más violentas.

        (pausa)

        Busca la estatua central. Es José de San Martín, el libertador.
        (micro pausa)
        El diseño se eligió en un concurso, y ganó un escultor español, Mariano Benlliure.

        (pausa)

        Pero mira bien la base del monumento — hay una figura femenina con algo sobre la cabeza.
        (micro pausa)
        Aquí pasó algo curioso: Benlliure pidió una estatua con una "llama" encima, refiriéndose al fuego, símbolo de la patria. En español de España, "llama" es solo fuego.
        (pausa)
        Pero en Perú, "llama" también es un animal. Y así, por una simple confusión de palabras, la ciudad terminó con una llama de verdad — el animal — coronando el monumento a su libertador.

        (silencio 3s)

        Cuando quieras, caminamos hacia la Plaza Mayor.`,
      summary: `Inaugurada en 1921,
con una curiosa confusión
en su monumento central.`,
      highlights: [
        "Inaugurada en 1921",
        "Asesinato de Monteagudo (1825)",
        "Escultor Mariano Benlliure",
        "La confusión de la llama",
      ],
      nextStepPreview: { time: "5–7 min a pie" },
    },

    {
      id: "plaza-mayor",
      title: "Plaza Mayor",
      voiceText: `Estás en la Plaza Mayor de Lima.
        (pausa)

        Aquí, el 18 de enero de 1535, Francisco Pizarro fundó esta ciudad.
        (micro pausa)
        Lo primero que hizo fue plantar una picota — un poste de madera usado para ajusticiar condenados — justo en el centro de este mismo espacio. Antes de que existiera cualquier otra cosa aquí, ya existía un símbolo de justicia y castigo.

        (pausa)

        Todo lo demás que existe en Lima se trazó tomando este punto como referencia.
        (micro pausa)
        La fuente de bronce que ves en el centro es de 1651, obra de Pedro de Noguera — reemplazó, años después, a esa primera picota.

        (pausa)

        Esta plaza ha sido mercado, plaza de toros, y escenario de los autos de fe de la Inquisición — de hecho, aquí ocurrió la primera condena a morir quemado de toda América.
        (micro pausa)
        Pero también tuvo momentos casi imposibles de creer: en 1659, un funámbulo llamado Francisco de Morales cruzó deslizándose desde una de las torres de la Catedral hasta esta misma plaza, como espectáculo público.

        (pausa)

        Y el 28 de julio de 1821, José de San Martín proclamó desde aquí mismo la independencia del Perú.

        (silencio 3s)

        A tu alrededor: el Palacio de Gobierno, la Catedral, el Palacio Municipal. Vamos a visitar algunos de cerca.

        Cuando quieras, seguimos hacia una casa con una historia distinta a todas las demás.`,
      summary: `El sitio fundacional de Lima,
desde el 18 de enero de 1535.`,
      highlights: [
        "Fundación de Lima (1535)",
        "Fuente de bronce (1651)",
        "Autos de fe de la Inquisición",
        "Independencia proclamada (1821)",
      ],
      previewText: "Siguiente paso: camina hacia la Casa de Aliaga",
      nextStepPreview: { time: "1–2 min a pie" },
    },

    {
      id: "casa-aliaga",
      title: "Casa de Aliaga",
      voiceText: `Esta es la Casa de Aliaga.
        (pausa)

        Se construyó en 1535 — el mismo año de la fundación de Lima — sobre una huaca, un templo prehispánico que ya existía antes de que llegaran los españoles.
        (micro pausa)
        Pizarro se la entregó a Jerónimo de Aliaga, uno de sus hombres de mayor confianza.

        (pausa)

        Aquí viene lo más extraordinario: desde entonces, la misma familia ha vivido en esta casa, generación tras generación.
        (micro pausa)
        Diecisiete generaciones. Casi 500 años. La misma sangre, bajo el mismo techo.

        (pausa)

        Un terremoto la destruyó en 1746. La reconstruyeron.
        (micro pausa)
        Y hoy es considerada la residencia privada habitada más antigua de toda Latinoamérica.

        (silencio 3s)

        Cuando quieras, seguimos hacia la Catedral.
        (confirmación requerida)`,
      summary: `La misma familia,
17 generaciones,
casi 500 años.`,
      highlights: [
        "Construida en 1535, sobre una huaca",
        "Entregada a Jerónimo de Aliaga",
        "17 generaciones de la misma familia",
        "Residencia privada más antigua de Latinoamérica",
      ],
      actionCard: {
        tag: "Recorrido por confirmación",
        title: "Camina hacia la Casa de Aliaga",
        subtitle: "Cuando llegues, toca \"Siguiente\".",
      },
    },

    {
      id: "catedral",
      title: "Catedral de Lima",
      voiceText: `Esta es la Catedral de Lima.
        (pausa)

        Pizarro ordenó construirla en 1535, sobre un santuario indígena que ya existía en este mismo lugar.
        (micro pausa)
        Ese primer templo era modesto: una sola nave, techo de madera. Nada que ver con lo que ves hoy.

        (pausa)

        Esta catedral no ha tenido una vida tranquila.
        (micro pausa)
        Un terremoto la dañó en 1609. Otro en 1687. Y el de 1746 fue tan fuerte que prácticamente la destruyó por completo — obligó a reconstruirla desde las bases.

        (pausa)

        Y ahí pasó algo ingenioso.
        (micro pausa)
        Para que un desastre así no volviera a pasar, los constructores reemplazaron las pesadas columnas de piedra por una técnica ancestral peruana: la quincha — estructuras huecas de caña, recubiertas de yeso.
        (micro pausa)
        Más livianas, más flexibles. Un edificio pensado para doblarse un poco durante un temblor, en vez de partirse.

        (pausa)

        Todavía tuvo que reconstruirse otra vez, después del terremoto de 1940.
        (micro pausa)
        Y adentro descansan los restos de Francisco Pizarro — el mismo hombre que trazó esta plaza está enterrado a pocos metros de donde la trazó.

        (silencio 3s)

        Cuando quieras, caminamos hacia el pasaje de al lado.
        (confirmación requerida)`,
      summary: `Casi 5 siglos en pie,
reconstruida una y otra vez
tras los terremotos.`,
      highlights: [
        "Construida sobre un santuario indígena (1535)",
        "Reconstruida tras los terremotos de 1609, 1687 y 1746",
        "Técnica antisísmica de quincha",
        "Tumba de Francisco Pizarro",
      ],
      actionCard: {
        tag: "Recorrido por confirmación",
        title: "Camina hacia la Catedral",
        subtitle: "Cuando llegues, toca \"Siguiente\".",
      },
    },

    {
      id: "pasaje-santa-rosa",
      title: "Pasaje Santa Rosa",
      voiceText: `Esto que ves aquí tiene una historia larga, y todavía no termina de escribirse.
        (pausa)

        Es una estatua ecuestre de Francisco Pizarro.
        (micro pausa)
        Estuvo primero junto al Palacio de Gobierno. En 2003, la retiraron de ahí por las protestas de quienes la veían como un símbolo de conquista y sometimiento. La trasladaron al Parque de la Muralla en 2004.

        (pausa)

        En enero de 2025, coincidiendo con el aniversario 490 de Lima, la trajeron aquí, a este pasaje.
        (micro pausa)
        Y la pusieron junto a otro monumento: uno dedicado a Taulichusco, el curaca —el líder indígena— que gobernaba este valle cuando llegaron los españoles.

        (pausa)

        No te voy a decir qué pensar de esto.
        (micro pausa)
        Pero sí te invito a mirar a los dos, uno junto al otro, y notar que la propia ciudad sigue decidiendo cómo contar su historia completa — no solo una parte de ella.

        (silencio 3s)

        Cuando quieras, caminamos hacia el Convento de San Francisco.
        (confirmación requerida)`,
      summary: `Una historia que
todavía se sigue escribiendo.`,
      highlights: [
        "Estatua retirada en 2003",
        "Trasladada varias veces",
        "Reinstalada en enero de 2025",
        "Junto al monumento a Taulichusco",
      ],
      actionCard: {
        tag: "Recorrido por confirmación",
        title: "Camina hacia el Pasaje Santa Rosa",
        subtitle: "Cuando llegues, toca \"Siguiente\".",
      },
    },

    {
      id: "san-francisco",
      title: "Convento de San Francisco",
      voiceText: `Estás en la Basílica y Convento de San Francisco.
        (pausa)

        Se empezó a construir en 1535 y se terminó recién en 1672 — casi siglo y medio después.
        (micro pausa)
        Es una de las joyas del barroco colonial en toda Sudamérica.

        (pausa)

        Pero lo que hizo famoso a este lugar está bajo tus pies: las catacumbas.
        (micro pausa)
        Durante la época colonial, decenas de miles de personas fueron enterradas aquí abajo — fue el cementerio principal de Lima hasta 1808.

        (pausa)

        Después de eso, las catacumbas se cerraron y, con el tiempo, la ciudad simplemente se olvidó de que existían.
        (micro pausa)
        No las volvieron a descubrir hasta 1943 — más de cien años después.

        (silencio 3s)

        Cuando quieras, caminamos hacia el último punto, cerca del río.
        (confirmación requerida)`,
      summary: `Catacumbas olvidadas
por más de un siglo.`,
      highlights: [
        "Construido entre 1535 y 1672",
        "Cementerio principal de Lima hasta 1808",
        "Catacumbas olvidadas",
        "Redescubiertas en 1943",
      ],
      actionCard: {
        tag: "Recorrido por confirmación",
        title: "Camina hacia el Convento de San Francisco",
        subtitle: "Cuando llegues, toca \"Siguiente\".",
      },
    },

    {
      id: "parque-muralla",
      title: "Parque de la Muralla",
      voiceText: `Has llegado al Parque de la Muralla, justo al borde del río Rímac.
        (pausa)

        Lo que ves aquí son los restos reales de la muralla que rodeó Lima entera — construida en 1684, por orden del virrey Duque de la Palata.
        (micro pausa)
        Durante más de dos siglos, esta muralla marcó literalmente dónde terminaba la ciudad y empezaba todo lo demás.

        (pausa)

        Con el tiempo, la muralla se derribó casi por completo para que Lima pudiera crecer.
        (micro pausa)
        Este parque, inaugurado en 2004, rescató uno de los pocos tramos que sobrevivieron.

        (pausa)

        Fíjate en el río.
        (silencio 3s)
        Todo lo que caminamos hoy — la plaza donde nació la ciudad, la casa con 17 generaciones, la catedral, las catacumbas — estuvo alguna vez adentro de estos límites que tienes al frente.

        (pausa)

        Con esto, llegamos al final de este recorrido por el Centro Histórico de Lima.`,
      summary: `Los restos reales
de la muralla que protegió
toda la ciudad.`,
      highlights: [
        "Muralla construida en 1684",
        "Marcó el límite de la ciudad",
        "Derribada para permitir el crecimiento",
        "Parque inaugurado en 2004",
      ],
      previewText: "Siguiente paso: cierre del recorrido",
      nextStepPreview: { time: "1–2 min a pie" },
    },

    {
      id: "fin-tour-centro",
      title: "Fin del recorrido",
      voiceText: `Hemos llegado al final de este recorrido por el Centro Histórico de Lima.

        Caminamos por el lugar donde nació la ciudad, entramos a una casa con casi 500 años de la misma familia, y vimos cómo Lima ha reconstruido sus templos una y otra vez, sin dejar de ser la misma.

        Gracias por recorrer el Centro Histórico conmigo.`,
      summary: `Fin del recorrido
por el Centro Histórico
de Lima.`,
      highlights: [],
      previewText: "Recorrido terminado",
    },
  ],
};
