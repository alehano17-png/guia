import type { TourContent } from "../../content-types";

export const centroHistoricoContentEn: TourContent = {
  title: "Historic Center",
  steps: [
    {
      id: "inicio-centro",
      title: "Historic Center",
      voiceText: `Welcome to the Historic Center of Lima.
        (pausa)

        You're about to walk through the exact place where this city was born, almost 500 years ago.
        (micro pausa)
        In 1991, UNESCO declared this entire center a World Heritage Site — not for a single building, but for the complete ensemble.

        (pausa)

        We'll visit two squares, a house that has belonged to the same family for generations, a cathedral with secrets underground, and the remains of the wall that once protected the entire city.

        First, I'll take you to the starting point, and when you're ready, we begin.`,
      summary: `The founding heart of Lima,
a World Heritage Site
since 1991.`,
      highlights: [],
      startRoute: {
        destinationTitle: "Plaza San Martín",
        buttonLabel: "See route to Plaza San Martín",
      },
    },

    {
      id: "plaza-san-martin",
      title: "Plaza San Martín",
      voiceText: `You're at Plaza San Martín.
        (pausa)

        It was inaugurated on July 28, 1921, to celebrate the first century of Peru's independence.
        (micro pausa)
        Before it was a square, there was a hospital here, and later two different train stations — the plaza you see is, in fact, the third life of this same piece of land.

        (pausa)

        In 1825, on what is now part of this very square, Bernardo de Monteagudo was assassinated — a revolutionary politician, close to San Martín himself.
        (micro pausa)
        The square that today celebrates independence also holds, in that same ground, one of its most violent political deaths.

        (pausa)

        Look for the central statue. It's José de San Martín, the liberator.
        (micro pausa)
        The design was chosen in a competition, and it was won by a Spanish sculptor, Mariano Benlliure.

        (pausa)

        But look closely at the base of the monument — there's a female figure with something on her head.
        (micro pausa)
        Something curious happened here: Benlliure asked for a statue with a "llama" on top, meaning a flame, the symbol of the homeland. In Spain's Spanish, "llama" only means fire.
        (pausa)
        But in Peru, "llama" is also an animal. And so, because of a simple mix-up of words, the city ended up with a real llama — the animal — crowning the monument to its liberator.

        (silencio 3s)

        Whenever you're ready, let's walk toward the Plaza Mayor.`,
      summary: `Inaugurated in 1921,
with a curious mix-up
in its central monument.`,
      highlights: [
        "Inaugurated in 1921",
        "Assassination of Monteagudo (1825)",
        "Sculptor Mariano Benlliure",
        "The llama mix-up",
      ],
      nextStepPreview: { time: "5–7 min walk" },
    },

    {
      id: "plaza-mayor",
      title: "Plaza Mayor",
      voiceText: `You're in Lima's Plaza Mayor.
        (pausa)

        Here, on January 18, 1535, Francisco Pizarro founded this city.
        (micro pausa)
        The first thing he did was set up a picota — a wooden post used to execute the condemned — right in the center of this very space. Before anything else existed here, there was already a symbol of justice and punishment.

        (pausa)

        Everything else in Lima was laid out using this point as a reference.
        (micro pausa)
        The bronze fountain you see in the center dates from 1651, the work of Pedro de Noguera — it replaced, years later, that first picota.

        (pausa)

        This square has been a market, a bullring, and the stage for the Inquisition's autos-da-fé — in fact, the first sentence of death by burning in all of the Americas took place here.
        (micro pausa)
        But it also saw moments that are almost impossible to believe: in 1659, a tightrope walker named Francisco de Morales slid across from one of the Cathedral's towers down to this very square, as a public spectacle.

        (pausa)

        And on July 28, 1821, José de San Martín proclaimed Peru's independence right here.

        (silencio 3s)

        All around you: the Government Palace, the Cathedral, the Municipal Palace. We'll visit some of them up close.

        Whenever you're ready, let's continue to a house with a history unlike any other.`,
      summary: `The founding site of Lima,
since January 18, 1535.`,
      highlights: [
        "Founding of Lima (1535)",
        "Bronze fountain (1651)",
        "Autos-da-fé of the Inquisition",
        "Independence proclaimed (1821)",
      ],
      previewText: "Next step: walk to the Casa de Aliaga",
      nextStepPreview: { time: "1–2 min walk" },
    },

    {
      id: "casa-aliaga",
      title: "Casa de Aliaga",
      voiceText: `This is the Casa de Aliaga.
        (pausa)

        It was built in 1535 — the same year Lima was founded — on top of a huaca, a pre-Hispanic temple that already stood here before the Spaniards arrived.
        (micro pausa)
        Pizarro gave it to Jerónimo de Aliaga, one of his most trusted men.

        (pausa)

        And here's the most extraordinary part: ever since then, the same family has lived in this house, generation after generation.
        (micro pausa)
        Seventeen generations. Almost 500 years. The same blood, under the same roof.

        (pausa)

        An earthquake destroyed it in 1746. They rebuilt it.
        (micro pausa)
        And today it's considered the oldest inhabited private residence in all of Latin America.

        (silencio 3s)

        Whenever you're ready, let's continue to the Cathedral.
        (confirmación requerida)`,
      summary: `The same family,
17 generations,
almost 500 years.`,
      highlights: [
        "Built in 1535, on a huaca",
        "Given to Jerónimo de Aliaga",
        "17 generations of the same family",
        "Oldest private residence in Latin America",
      ],
      actionCard: {
        tag: "Confirm to continue",
        title: "Walk to the Casa de Aliaga",
        subtitle: "When you arrive, tap \"Next\".",
      },
    },

    {
      id: "catedral",
      title: "Lima Cathedral",
      voiceText: `This is the Cathedral of Lima.
        (pausa)

        Pizarro ordered it built in 1535, on top of an indigenous sanctuary that already stood in this same place.
        (micro pausa)
        That first temple was modest: a single nave, a wooden roof. Nothing like what you see today.

        (pausa)

        This cathedral hasn't had a quiet life.
        (micro pausa)
        An earthquake damaged it in 1609. Another in 1687. And the one in 1746 was so powerful that it practically destroyed it completely — it had to be rebuilt from the foundations.

        (pausa)

        And that's where something ingenious happened.
        (micro pausa)
        To keep a disaster like that from happening again, the builders replaced the heavy stone columns with an ancestral Peruvian technique: quincha — hollow structures made of cane, covered in plaster.
        (micro pausa)
        Lighter, more flexible. A building designed to bend a little during a tremor instead of breaking apart.

        (pausa)

        It still had to be rebuilt once more, after the 1940 earthquake.
        (micro pausa)
        And inside rest the remains of Francisco Pizarro — the same man who laid out this square is buried just a few meters from where he laid it out.

        (silencio 3s)

        Whenever you're ready, let's walk to the passage next door.
        (confirmación requerida)`,
      summary: `Almost five centuries standing,
rebuilt again and again
after earthquakes.`,
      highlights: [
        "Built on an indigenous sanctuary (1535)",
        "Rebuilt after the earthquakes of 1609, 1687, and 1746",
        "Anti-seismic quincha technique",
        "Tomb of Francisco Pizarro",
      ],
      actionCard: {
        tag: "Confirm to continue",
        title: "Walk to the Cathedral",
        subtitle: "When you arrive, tap \"Next\".",
      },
    },

    {
      id: "pasaje-santa-rosa",
      title: "Pasaje Santa Rosa",
      voiceText: `What you see here has a long history, and it's still being written.
        (pausa)

        It's an equestrian statue of Francisco Pizarro.
        (micro pausa)
        It first stood next to the Government Palace. In 2003, it was removed from there after protests by people who saw it as a symbol of conquest and subjugation. It was moved to the Parque de la Muralla in 2004.

        (pausa)

        In January 2025, coinciding with Lima's 490th anniversary, it was brought here, to this passage.
        (micro pausa)
        And it was placed beside another monument: one dedicated to Taulichusco, the curaca — the indigenous leader — who ruled this valley when the Spaniards arrived.

        (pausa)

        I won't tell you what to think about this.
        (micro pausa)
        But I do invite you to look at the two of them, side by side, and notice that the city itself is still deciding how to tell its whole history — not just one part of it.

        (silencio 3s)

        Whenever you're ready, let's walk to the Convent of San Francisco.
        (confirmación requerida)`,
      summary: `A history that
is still being written.`,
      highlights: [
        "Statue removed in 2003",
        "Moved several times",
        "Reinstalled in January 2025",
        "Next to the monument to Taulichusco",
      ],
      actionCard: {
        tag: "Confirm to continue",
        title: "Walk to Pasaje Santa Rosa",
        subtitle: "When you arrive, tap \"Next\".",
      },
    },

    {
      id: "san-francisco",
      title: "San Francisco Convent",
      voiceText: `You're at the Basilica and Convent of San Francisco.
        (pausa)

        Construction began in 1535 and wasn't finished until 1672 — almost a century and a half later.
        (micro pausa)
        It's one of the jewels of colonial Baroque in all of South America.

        (pausa)

        But what made this place famous is under your feet: the catacombs.
        (micro pausa)
        During the colonial era, tens of thousands of people were buried down here — it was Lima's main cemetery until 1808.

        (pausa)

        After that, the catacombs were closed, and over time the city simply forgot they existed.
        (micro pausa)
        They weren't rediscovered until 1943 — more than a hundred years later.

        (silencio 3s)

        Whenever you're ready, let's walk to the last stop, near the river.
        (confirmación requerida)`,
      summary: `Catacombs forgotten
for more than a century.`,
      highlights: [
        "Built between 1535 and 1672",
        "Lima's main cemetery until 1808",
        "Forgotten catacombs",
        "Rediscovered in 1943",
      ],
      actionCard: {
        tag: "Confirm to continue",
        title: "Walk to the San Francisco Convent",
        subtitle: "When you arrive, tap \"Next\".",
      },
    },

    {
      id: "parque-muralla",
      title: "Parque de la Muralla",
      voiceText: `You've arrived at the Parque de la Muralla, right at the edge of the Rímac River.
        (pausa)

        What you see here are the real remains of the wall that once surrounded all of Lima — built in 1684, by order of the viceroy, the Duke of La Palata.
        (micro pausa)
        For more than two centuries, this wall literally marked where the city ended and everything else began.

        (pausa)

        Over time, the wall was torn down almost completely so that Lima could grow.
        (micro pausa)
        This park, opened in 2004, saved one of the few sections that survived.

        (pausa)

        Look at the river.
        (silencio 3s)
        Everything we walked through today — the square where the city was born, the house with 17 generations, the cathedral, the catacombs — once stood inside these limits you have in front of you.

        (pausa)

        With this, we reach the end of this tour of Lima's Historic Center.`,
      summary: `The real remains
of the wall that protected
the entire city.`,
      highlights: [
        "Wall built in 1684",
        "Marked the city's limit",
        "Torn down to allow growth",
        "Park opened in 2004",
      ],
      previewText: "Next step: end of the tour",
      nextStepPreview: { time: "1–2 min walk" },
    },

    {
      id: "fin-tour-centro",
      title: "End of the Tour",
      voiceText: `We've reached the end of this tour of Lima's Historic Center.

        We walked through the place where the city was born, stepped into a house with almost 500 years of the same family, and saw how Lima has rebuilt its temples again and again without ever ceasing to be itself.

        Thank you for walking through the Historic Center with me.`,
      summary: `End of the tour
of Lima's
Historic Center.`,
      highlights: [],
      previewText: "Tour complete",
    },
  ],
};
