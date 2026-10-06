import type { TourContent } from "../../content-types";

export const barrancoContentEs: TourContent = {
  title: "Barranco",
  steps: [
    {
      id: "inicio-barranco",
      title: "Barranco",
      voiceText: `Bienvenido a Barranco.
        (pausa)

        Este distrito no siempre se llamó así. Empezó como un caserío de pescadores, junto a una quebrada natural que bajaba directo al mar.
        (micro pausa)
        Hoy es conocido como el barrio bohemio de Lima — el hogar de artistas, músicos y escritores, con murales en cada esquina y una vida cultural que no se detiene.

        (pausa)

        En este recorrido vamos a caminar entre su plaza principal, su puente más famoso, y el camino que todavía baja hasta el mar — la misma ruta que usaban los primeros pescadores, hace siglos.

        Primero te llevo hasta el punto de partida, y cuando estés listo, comenzamos.`,
      summary: `El barrio bohemio de Lima,
donde el arte, la historia
y el mar se encuentran.`,
      highlights: [],
      startRoute: {
        destinationTitle: "Parque Municipal de Barranco",
        buttonLabel: "Ver ruta al Parque Municipal",
      },
    },

    {
      id: "parque-municipal",
      title: "Parque Municipal",
      voiceText: `Bienvenido a Barranco.
        (pausa)

        Estás parado en el corazón de todo esto: el Parque Municipal, inaugurado el 13 de febrero de 1898 por el alcalde Pedro Solari.
        (micro pausa)
        Todo lo demás que vas a ver hoy — el puente, la bajada, las callecitas — creció alrededor de este mismo punto.

        (pausa)

        Busca la fuente del centro. Se llama "La Danaide".
        (micro pausa)
        En la mitología griega, las Danaides eran 50 hermanas, y 49 de ellas mataron a sus esposos la misma noche de bodas. No sé por qué alguien eligió justo esa historia para una plaza familiar, pero ahí sigue, sin que nadie la haya movido en más de un siglo.

        (pausa)

        Mira a tu alrededor.
        (micro pausa)
        Ese edificio con aire de biblioteca lo era desde el inicio: se inauguró en 1922 como la municipalidad misma. Y la iglesia que ves al lado, la Santísima Cruz, junto con todo este conjunto, Perú lo declaró "Ambiente Urbano Monumental" en 1972 — protegido para siempre.

        (pausa)

        Este parque tampoco se salvó de los terremotos.
        (micro pausa)
        El de 1940 lo dañó bastante, y fue el alcalde Manuel Montero Bernales quien lo remodeló después, dejándolo prácticamente como lo ves hoy.

        (pausa)

        Barranco no siempre fue el barrio bohemio que conoces.
        (micro pausa)
        Empezó siendo un caserío de pescadores. Después, el balneario favorito de familias limeñas adineradas. Y con los años, se convirtió en refugio de artistas, escritores y músicos — los mismos que todavía le dan ese aire distinto al resto de Lima.

        (silencio 3s)

        Cuando quieras, caminamos hacia el puente.`,
      summary: `La plaza central de Barranco,
inaugurada en 1898,
corazón de todo el distrito.`,
      highlights: [
        "Inaugurado en 1898",
        "Fuente La Danaide",
        "Ambiente Urbano Monumental (1972)",
        "De pescadores a barrio bohemio",
      ],
      nextStepPreview: { time: "3–5 min a pie" },
    },

    {
      id: "murales",
      title: "Calles con Murales",
      voiceText: `Fíjate en las paredes mientras caminamos.
        (pausa)

        Esto no es casualidad ni descuido urbano — Barranco decidió, hace ya varios años, dejar que sus calles hablaran.
        (micro pausa)
        Artistas peruanos y de otros países han pintado estos muros, uno por uno, convirtiendo un paseo cualquiera en una especie de galería al aire libre.

        (pausa)

        No hay un orden ni un tema único.
        (micro pausa)
        Vas a ver rostros, colores, frases, animales — cada mural con su propia firma, su propia historia detrás.

        (pausa)

        Tómate un momento.
        (silencio 3s)
        No hace falta entenderlos todos. Solo mirarlos.

        (pausa)

        Seguimos hacia el puente.`,
      summary: `Un tramo del distrito
convertido en galería
de arte urbano.`,
      highlights: [],
      nextStepPreview: { time: "2–3 min a pie" },
    },

    {
      id: "puente-suspiros",
      title: "Puente de los Suspiros",
      voiceText: `Este es el Puente de los Suspiros.
        (pausa)

        Aquí había un problema real que resolver: una quebrada natural partía este pedazo de Barranco en dos.
        (micro pausa)
        Así que en 1876, el primer alcalde de Barranco, Francisco García Monterroso, mandó construir este puente de madera para unir los dos lados.

        (pausa)

        Toca la baranda que tienes al costado.
        (micro pausa)
        Esa madera no es la original — ni siquiera es la segunda ni la tercera. Este puente medía 44 metros al inicio. Hoy mide 31. Cada golpe que ha recibido — guerras, terremotos, el simple paso del tiempo — lo ha ido recortando, un poco cada vez.

        (pausa)

        El primer golpe fuerte fue en 1881: tropas chilenas, durante la guerra con Chile, incendiaron parte de Barranco, y este puente no se salvó.
        (micro pausa)
        Lo reconstruyeron. Y lo repararon otra vez, y otra, década tras década.

        (pausa)

        En 2026, mientras cumplía sus primeros 150 años, Barranco le hizo otra restauración completa — medio año cerrado para lograrlo.
        (micro pausa)
        Esta madera bajo tus pies, esta luz que ves si vienes de noche, es de ese trabajo más reciente.

        (pausa)

        Y este puente tiene una tradición rara, pero bonita:
        dicen que si lo cruzas aguantando la respiración, sin soltar el aire,
        el deseo que pidas se cumple.
        (micro pausa)
        No te voy a decir si es cierto. Solo te digo que mucha gente lo intenta.

        (pausa)

        En 1960, una compositora llamada Chabuca Granda le escribió un vals.
        Ese vals es la razón por la que hoy le decimos "de los suspiros" —
        antes tenía nombres bastante menos poéticos, como el de un par de alcaldes.
        (micro pausa)
        Hay una estatua suya, cerquita, mirando hacia acá.

        (silencio 3s)

        Cuando quieras, seguimos.
        (confirmación requerida)`,
      summary: `El puente más icónico
de Barranco,
con 150 años de historia.`,
      highlights: [
        "Construido en 1876",
        "Reconstruido tras 1881",
        "Restaurado en 2026 (150 años)",
        "Vals de Chabuca Granda (1960)",
      ],
      previewText: "Siguiente paso: camina hacia la Ermita",
      nextStepPreview: { time: "1 min a pie" },
    },

    {
      id: "ermita",
      title: "La Ermita",
      voiceText: `Esto que ves, en ruinas, es la Ermita de Barranco.
        (pausa)

        La construyó, a mediados del siglo dieciocho, un panadero llamado Caicedo — una capilla humilde, pensada para pescadores y viajeros que pasaban por acá.
        (micro pausa)
        Caicedo murió sin verla terminada. Un clérigo de Surco, Pedro Bernardino Villalta, se encargó de acabar sus dos torres.

        (pausa)

        Y aquí viene algo que probablemente no esperabas: en 1874, este mismo templo fue elegido como capital de un pueblo que se llamaba San José de Surco.
        (micro pausa)
        Ese pueblo, con el tiempo, se convirtió en el Barranco que conoces hoy. Literalmente empezó aquí, en este edificio que ahora ves cerrado.

        (pausa)

        La guerra con Chile la dañó en 1881, igual que al puente. La reconstruyeron al año siguiente.
        (micro pausa)
        Pero en 1940, un terremoto volvió a golpearla — esta vez tan fuerte que tuvieron que cerrarla, y desde entonces sigue así.

        (pausa)

        No es una ruina olvidada.
        (micro pausa)
        En 2016, una organización internacional de conservación la incluyó en su lista mundial de sitios en riesgo. Hoy sigue en proceso de restauración, esperando su turno de volver a abrirse.

        (silencio 3s)

        Cuando quieras, caminamos hacia el mirador.
        (confirmación requerida)`,
      summary: `Una capilla del siglo XVIII,
cerrada desde 1940,
donde nació Barranco.`,
      highlights: [
        "Capilla del siglo XVIII",
        "Capital de San José de Surco (1874)",
        "Cerrada desde el terremoto de 1940",
        "Lista de sitios en riesgo (2016)",
      ],
      actionCard: {
        tag: "Recorrido por confirmación",
        title: "Camina hacia la Ermita",
        subtitle: "Cuando llegues, toca \"Siguiente\".",
      },
    },

    {
      id: "mirador",
      title: "Mirador",
      voiceText: `Desde aquí, olvídate un momento de las fechas y los datos.
        (pausa)

        Frente a ti tienes gran parte de la Costa Verde — el litoral que conecta Barranco con el resto de Lima, kilómetro tras kilómetro de acantilado y océano.
        (micro pausa)
        Este mirador existe por una razón simple: alguien, hace mucho, decidió que este rincón merecía quedarse solo para mirar.

        (pausa)

        Si es de tarde, quédate un momento para el atardecer.
        (silencio 3s)
        Si no, igual vale la pena.

        (pausa)

        Cuando quieras, bajamos hacia la Bajada de Baños.
        (confirmación requerida)`,
      summary: `Una vista abierta
hacia la Costa Verde
y el océano Pacífico.`,
      highlights: [],
      actionCard: {
        tag: "Recorrido por confirmación",
        title: "Camina hacia el mirador",
        subtitle: "Cuando llegues, toca \"Siguiente\".",
      },
    },

    {
      id: "bajada-banos",
      title: "Bajada de Baños",
      voiceText: `Esto que estás bajando tiene más historia de la que parece.
        (pausa)

        Antes de que existiera Barranco como lo conoces, esta era una quebrada natural — el camino que usaban los pescadores para bajar desde Surco hasta el mar.
        (micro pausa)
        Con los años, la sembraron de olivos y sauces. Después los cambiaron por ficus, los mismos árboles que todavía te dan sombra ahora mismo.

        (pausa)

        Fíjate en las buganvilias — esas enredaderas con flores fucsia.
        (micro pausa)
        Le deben el nombre a un botánico francés que las descubrió del otro lado del mundo. Y sin embargo, aquí, en este camino puntual, se volvieron parte de la identidad misma de Barranco.

        (pausa)

        Desde principios del siglo veinte, en los acantilados de este mismo descenso se construyeron ranchos hermosos, algunos de los cuales todavía siguen en pie.
        (micro pausa)
        Cuenta cuántos alcanzas a ver desde donde estás parado.
        (pausa)
        Y si preguntas por ahí, alguien seguro te cuenta sobre la "casa de los duendes" — una leyenda local que todavía circula entre vecinos.

        (silencio 3s)

        Con esto, llegamos al final del camino, justo donde Barranco se encuentra con el mar.`,
      summary: `El antiguo camino
de pescadores
hacia el mar.`,
      highlights: [
        "Antigua quebrada natural",
        "Camino de pescadores desde Surco",
        "Buganvilias y ficus",
        "Ranchos de inicios del siglo XX",
      ],
      previewText: "Siguiente paso: cierre del recorrido",
      nextStepPreview: { time: "5 min a pie" },
    },

    {
      id: "fin-tour-barranco",
      title: "Fin del recorrido",
      voiceText: `Hemos llegado al final de este recorrido por Barranco.

        Lo caminamos juntos — desde la plaza donde todo empezó, hasta este punto donde la ciudad se encuentra con el océano.

        Ahora ya sabes que estas calles no siempre fueron bohemias. Fueron de pescadores, después de veraneantes, y con el tiempo, de artistas.

        Gracias por recorrer Barranco conmigo.`,
      summary: `Fin del recorrido por Barranco,
el barrio bohemio
de Lima.`,
      highlights: [],
      previewText: "Recorrido terminado",
    },
  ],
};
