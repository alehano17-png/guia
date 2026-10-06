import type { TourContent } from "../../content-types";

export const barrancoContentEn: TourContent = {
  title: "Barranco",
  steps: [
    {
      id: "inicio-barranco",
      title: "Barranco",
      voiceText: `Welcome to Barranco.
        (pausa)

        This district wasn't always called that. It began as a small fishing hamlet, beside a natural ravine that ran straight down to the sea.
        (micro pausa)
        Today it's known as Lima's bohemian neighborhood — home to artists, musicians, and writers, with murals on every corner and a cultural life that never stops.

        (pausa)

        On this walk, we'll go through its main square, its most famous bridge, and the path that still leads down to the sea — the same route the first fishermen used, centuries ago.

        First, I'll take you to the starting point, and when you're ready, we begin.`,
      summary: `Lima's bohemian neighborhood,
where art, history,
and the sea come together.`,
      highlights: [],
      startRoute: {
        destinationTitle: "Barranco Municipal Park",
        buttonLabel: "See route to the Municipal Park",
      },
    },

    {
      id: "parque-municipal",
      title: "Municipal Park",
      voiceText: `Welcome to Barranco.
        (pausa)

        You're standing at the heart of it all: the Municipal Park, inaugurated on February 13, 1898, by Mayor Pedro Solari.
        (micro pausa)
        Everything else you'll see today — the bridge, the descent, the little streets — grew up around this very spot.

        (pausa)

        Look for the fountain in the center. It's called "La Danaide."
        (micro pausa)
        In Greek mythology, the Danaids were 50 sisters, and 49 of them killed their husbands on their wedding night. I don't know why anyone chose that particular story for a family-friendly square, but there it is, and nobody has moved it in over a century.

        (pausa)

        Look around you.
        (micro pausa)
        That building with the look of a library was a municipal building from the start: it opened in 1922 as the town hall itself. And the church you see next to it, the Santísima Cruz, along with this whole area — Peru declared it a "Monumental Urban Environment" in 1972, protected for good.

        (pausa)

        This park didn't escape the earthquakes either.
        (micro pausa)
        The one in 1940 damaged it badly, and it was Mayor Manuel Montero Bernales who remodeled it afterward, leaving it very much as you see it today.

        (pausa)

        Barranco wasn't always the bohemian neighborhood you know.
        (micro pausa)
        It started as a fishing hamlet. Then it became the favorite seaside resort of wealthy Lima families. And over the years, it turned into a refuge for artists, writers, and musicians — the same people who still give it that different feel from the rest of Lima.

        (silencio 3s)

        Whenever you're ready, let's walk toward the bridge.`,
      summary: `Barranco's central square,
inaugurated in 1898,
the heart of the whole district.`,
      highlights: [
        "Inaugurated in 1898",
        "La Danaide fountain",
        "Monumental Urban Environment (1972)",
        "From fishing village to bohemian neighborhood",
      ],
      nextStepPreview: { time: "3–5 min walk" },
    },

    {
      id: "murales",
      title: "Mural Streets",
      voiceText: `Take a look at the walls as we walk.
        (pausa)

        This isn't an accident or urban neglect — Barranco decided, several years ago, to let its streets speak.
        (micro pausa)
        Peruvian artists and artists from other countries have painted these walls one by one, turning an ordinary stroll into a kind of open-air gallery.

        (pausa)

        There's no single order or theme.
        (micro pausa)
        You'll see faces, colors, phrases, animals — each mural with its own signature, its own story behind it.

        (pausa)

        Take a moment.
        (silencio 3s)
        You don't have to understand them all. Just look at them.

        (pausa)

        On to the bridge.`,
      summary: `A stretch of the district
turned into a gallery
of urban art.`,
      highlights: [],
      nextStepPreview: { time: "2–3 min walk" },
    },

    {
      id: "puente-suspiros",
      title: "Bridge of Sighs",
      voiceText: `This is the Bridge of Sighs — the Puente de los Suspiros.
        (pausa)

        There was a real problem to solve here: a natural ravine split this part of Barranco in two.
        (micro pausa)
        So in 1876, Barranco's first mayor, Francisco García Monterroso, had this wooden bridge built to join the two sides.

        (pausa)

        Touch the railing next to you.
        (micro pausa)
        That wood isn't the original — it isn't even the second or the third. This bridge was 44 meters long at first. Today it's 31. Every blow it has taken — wars, earthquakes, the simple passing of time — has trimmed it down, a little at a time.

        (pausa)

        The first big blow came in 1881: Chilean troops, during the war with Chile, set part of Barranco on fire, and this bridge didn't escape.
        (micro pausa)
        They rebuilt it. And they repaired it again, and again, decade after decade.

        (pausa)

        In 2026, as it turned 150 years old, Barranco gave it another complete restoration — closed for half a year to get it done.
        (micro pausa)
        This wood under your feet, this light you see if you come at night, comes from that most recent work.

        (pausa)

        And this bridge has an odd but lovely tradition:
        they say that if you cross it holding your breath, without letting the air out,
        the wish you make will come true.
        (micro pausa)
        I won't tell you whether it's true. I'll only say that a lot of people try.

        (pausa)

        In 1960, a composer named Chabuca Granda wrote a waltz about it.
        That waltz is the reason we now call it "of sighs" —
        before that, it had much less poetic names, like those of a couple of mayors.
        (micro pausa)
        There's a statue of her nearby, looking this way.

        (silencio 3s)

        Whenever you're ready, we'll continue.
        (confirmación requerida)`,
      summary: `Barranco's most iconic bridge,
with 150 years of history.`,
      highlights: [
        "Built in 1876",
        "Rebuilt after 1881",
        "Restored in 2026 (150 years)",
        "Chabuca Granda's waltz (1960)",
      ],
      previewText: "Next step: walk to the Ermita",
      nextStepPreview: { time: "1 min walk" },
    },

    {
      id: "ermita",
      title: "La Ermita",
      voiceText: `What you see here, in ruins, is Barranco's Ermita — its old hermitage chapel.
        (pausa)

        In the middle of the eighteenth century, a baker named Caicedo built it — a humble chapel meant for fishermen and travelers passing through.
        (micro pausa)
        Caicedo died before seeing it finished. A cleric from Surco, Pedro Bernardino Villalta, took charge of completing its two towers.

        (pausa)

        And here's something you probably didn't expect: in 1874, this very church was chosen as the capital of a town called San José de Surco.
        (micro pausa)
        Over time, that town became the Barranco you know today. It literally began here, in this building you now see closed.

        (pausa)

        The war with Chile damaged it in 1881, just like the bridge. They rebuilt it the following year.
        (micro pausa)
        But in 1940, an earthquake struck it again — this time so hard that they had to close it, and it has stayed that way ever since.

        (pausa)

        It isn't a forgotten ruin.
        (micro pausa)
        In 2016, an international conservation organization included it on its world list of sites at risk. Today it's still being restored, waiting for its turn to open again.

        (silencio 3s)

        Whenever you're ready, let's walk to the viewpoint.
        (confirmación requerida)`,
      summary: `An eighteenth-century chapel,
closed since 1940,
where Barranco was born.`,
      highlights: [
        "Eighteenth-century chapel",
        "Capital of San José de Surco (1874)",
        "Closed since the 1940 earthquake",
        "List of sites at risk (2016)",
      ],
      actionCard: {
        tag: "Confirm to continue",
        title: "Walk to the Ermita",
        subtitle: "When you arrive, tap \"Next\".",
      },
    },

    {
      id: "mirador",
      title: "Viewpoint",
      voiceText: `From here, forget the dates and the facts for a moment.
        (pausa)

        In front of you lies much of the Costa Verde — the coastline that connects Barranco with the rest of Lima, kilometer after kilometer of cliff and ocean.
        (micro pausa)
        This viewpoint exists for a simple reason: someone, long ago, decided this corner deserved to be kept just for looking.

        (pausa)

        If it's afternoon, stay a while for the sunset.
        (silencio 3s)
        If not, it's still worth it.

        (pausa)

        Whenever you're ready, we'll head down the Bajada de Baños.
        (confirmación requerida)`,
      summary: `An open view
toward the Costa Verde
and the Pacific Ocean.`,
      highlights: [],
      actionCard: {
        tag: "Confirm to continue",
        title: "Walk to the viewpoint",
        subtitle: "When you arrive, tap \"Next\".",
      },
    },

    {
      id: "bajada-banos",
      title: "Bajada de Baños",
      voiceText: `This path you're walking down has more history than it seems.
        (pausa)

        Before Barranco existed as you know it, this was a natural ravine — the way fishermen used to go down from Surco to the sea.
        (micro pausa)
        Over the years, it was planted with olive and willow trees. Later they were replaced with ficus trees, the same ones that are still giving you shade right now.

        (pausa)

        Notice the bougainvillea — those climbing vines with fuchsia flowers.
        (micro pausa)
        They owe their name to a French botanist who discovered them on the other side of the world. And yet here, on this very path, they became part of Barranco's identity itself.

        (pausa)

        Since the early twentieth century, beautiful seaside houses, known as ranchos, were built along the cliffs of this same descent, and some of them are still standing.
        (micro pausa)
        Count how many you can see from where you're standing.
        (pausa)
        And if you ask around, someone will surely tell you about the "house of the goblins" — a local legend that still circulates among the neighbors.

        (silencio 3s)

        With this, we reach the end of the path, right where Barranco meets the sea.`,
      summary: `The old fishermen's path
down to the sea.`,
      highlights: [
        "Old natural ravine",
        "Fishermen's path from Surco",
        "Bougainvillea and ficus trees",
        "Early twentieth-century ranchos",
      ],
      previewText: "Next step: end of the tour",
      nextStepPreview: { time: "5 min walk" },
    },

    {
      id: "fin-tour-barranco",
      title: "End of the Tour",
      voiceText: `We've reached the end of this tour of Barranco.

        We walked it together — from the square where it all began, to this point where the city meets the ocean.

        Now you know that these streets weren't always bohemian. They belonged to fishermen, then to summer vacationers, and over time, to artists.

        Thank you for walking through Barranco with me.`,
      summary: `End of the tour of Barranco,
Lima's bohemian
neighborhood.`,
      highlights: [],
      previewText: "Tour complete",
    },
  ],
};
