import type { TourContent } from "../../content-types";

export const huacaPucllanaContentEn: TourContent = {
  title: "Huaca Pucllana",
  steps: [
    {
      id: "inicio-huaca-pucllana",
      title: "Huaca Pucllana",
      voiceText: `Welcome to Huaca Pucllana,
one of the most important archaeological sites in Lima.

Today we're not going to walk through an entire district.
We're going straight into a place that existed many centuries before the modern city.

First, I'll take you to the right spot,
and when you're ready, we begin the tour.`,
      summary: `An archaeological site in Lima
built by the Lima culture
in the heart of Miraflores.`,
      highlights: [],
      startRoute: {
        destinationTitle: "Huaca Pucllana",
        buttonLabel: "See route to the Huaca",
      },
    },

    {
      id: "huaca-exterior",
      title: "Huaca Pucllana (Exterior)",
      voiceText: `What you see in front of you doesn't belong to modern Lima.
(pausa)

Huaca Pucllana was built between the years 200 and 700 AD, by the Lima culture, more than a thousand years before the Incas.
(pausa)

It wasn't a dwelling or a fortress.
It was a ceremonial and administrative center, where religious and political decisions were made, tied to keeping balance with nature.
(pausa)

Look at the walls.
The adobe bricks are placed vertically, like books standing on a shelf.
(micro pausa)
It's not decoration.
That technique is designed to withstand earthquakes, which is essential on this seismic coast.
(pausa)

When these walls were going up here, the Roman Empire still existed in Europe, and peoples like the Franks and the Visigoths were only beginning to organize themselves.
(pausa)

From here you have two options, and both are worth it:
– walk around the huaca from the outside
– or go in and get to know it from the inside, step by step`,
      summary: `A ceremonial complex in Lima
built between 200 and 700 AD
in the heart of Miraflores.`,
      highlights: [
        "Lima culture (200–700 AD)",
        "Ceremonial and political center",
        "Earthquake-resistant adobe",
        "Older than the Incas",
      ],
      previewText: "Next step: choose to walk around the outside or go in",
      choices: [
        { id: "recorrer-por-fuera", label: "Walk around the outside" },
        { id: "entrar", label: "Go inside" },
      ],
    },

    {
      id: "huaca-exterior-recorrido",
      title: "Huaca Pucllana — Exterior Walk",
      voiceText: `Perfect.
We'll walk around it from the outside.
(pausa)

Keep this in mind as you take it in calmly.
(pausa)

This huaca wasn't designed to be admired from far away.
It was designed to impose presence.
(pausa)

The stepped levels, the tall walls, and the shape of the whole complex signal hierarchy and control.
Nothing here is accidental.
(pausa)

The vertical adobe technique — like books standing on a shelf — allowed the walls to absorb the energy of earthquakes without collapsing.
(pausa)

That explains why this structure is still standing after more than fifteen hundred years.
(pausa)

From the outside you can understand something key:
this was not a house.
It was not a neighborhood.
It was a center of power.
(pausa)

Here, decisions were made.
Here, rituals were performed.
Here, people governed.
(pausa)

Whenever you're ready, we'll continue the tour.`,
      summary: `A pre-Hispanic ceremonial pyramid
built as a center of power
in ancient Lima.`,
      highlights: [
        "Architecture of power",
        "Hierarchical structure",
        "Bookshelf technique",
        "Dominant ritual presence",
      ],
      previewText: "Next step: end of the tour",
    },

    {
      id: "huaca-interior-decision",
      title: "Huaca Pucllana — Interior",
      voiceText: `If you decide to go in, we'll continue with a guided tour that moves on your confirmation.

And tell me something before we start:
Do you want just the basic history, nice and clear,
or would you rather we go deeper into the historical context?`,
      summary: `A ceremonial complex
that can be explored step by step
to understand its history.`,
      highlights: [],
      previewText: "Next step: choose basic or in-depth history",
      choices: [
        { id: "historia-base", label: "Basic history" },
        { id: "historia-profunda", label: "In-depth history" },
      ],
    },

    {
      id: "huaca-base-1",
      title: "Entrance — Basic",
      voiceText: `You're entering Huaca Pucllana, a ceremonial center built between the years 200 and 700 AD, long before the Incas.
(pausa)

It was built by the Lima culture, when the Roman Empire still existed in Europe.
(pausa)

It wasn't a city or a fortress.
It was a ritual and administrative space where religion and power were completely connected.
(pausa)

From here you can notice something important: the walls are made of adobe bricks placed vertically.
(micro pausa)
That technique allowed the structures to withstand earthquakes without collapsing.
(pausa)

When you're ready, move toward the main ramp.
(confirmación requerida)`,
      summary: `The entrance to a ceremonial complex
built more than 1,500 years ago
by the Lima culture.`,
      highlights: [
        "Ceremonial entrance",
        "Lima culture",
        "Religion and power united",
        "Earthquake-resistant architecture",
      ],
      actionCard: {
        tag: "Confirm to continue",
        title: "Head toward the main ramp",
        subtitle: "When you arrive, tap \"Next\".",
      },
    },

    {
      id: "huaca-base-2",
      title: "Ramp — Basic",
      voiceText: `This ramp marks a real change in hierarchy and in function.
(pausa)

As you climb, you leave behind more open spaces and approach areas where ritual power was concentrated.
Not just anyone could be here.
(pausa)

Huaca Pucllana was built in stages, between the years 200 and 700 AD.
Each expansion physically raised the power of those who controlled it.
(pausa)

Climbing wasn't just walking.
It meant entering another level of authority, where access was regulated.
(pausa)

Take it easy.
Let me know when you reach the top.
(confirmación requerida)`,
      summary: `A ceremonial ramp
that marked the ascent
toward areas of higher rank.`,
      highlights: [
        "Hierarchical ascent",
        "Restricted access",
        "Built in stages",
        "Control of space",
      ],
      actionCard: {
        tag: "Confirm to continue",
        title: "Climb calmly to the upper part",
        subtitle: "When you're at the top, tap \"Next\".",
      },
    },

    {
      id: "huaca-base-3",
      title: "Ceremonial Area — Basic",
      voiceText: `Here, the most important rituals took place.
(pausa)

Marine offerings, fine ceramics, and evidence of human sacrifice have been found, dated between the fifth and seventh centuries AD.
(pausa)

These rituals were tied to the sea, to fertility, and to natural balance.
(pausa)

For the Lima culture, the ocean wasn't just a resource.
It was a living, unpredictable force.
(pausa)

Nothing here was improvised.
Everything was designed for rituals that involved the community, even if not everyone could witness them.
(pausa)

You're standing in the ceremonial center of the huaca.`,
      summary: `The space where the main rituals
of the Lima culture
took place.`,
      highlights: [
        "Main rituals",
        "Marine offerings",
        "Relationship with the ocean",
        "Sacred space",
      ],
      actionCard: {
        tag: "Confirm to continue",
        title: "Stop at the ceremonial area",
        subtitle: "When you're ready, tap \"Next\".",
      },
    },

    {
      id: "huaca-base-4",
      title: "Central Area — Basic",
      voiceText: `Here, the sacred was connected with the everyday.
(pausa)

Ritual food was prepared, offerings were organized, and items needed for the higher ceremonies were stored.
(pausa)

Without this space, the huaca wouldn't function.
(pausa)

It's the gear that keeps the complex running.`,
      summary: `A support area
where offerings were prepared
for ritual activity.`,
      highlights: [
        "Support for ritual",
        "Preparation of offerings",
        "Internal organization",
        "Logistical function",
      ],
      actionCard: {
        tag: "Confirm to continue",
        title: "Head toward the central area",
        subtitle: "When you arrive, tap \"Next\".",
      },
    },

    {
      id: "huaca-base-5",
      title: "Closing — Basic",
      voiceText: `Before you leave, keep this idea with you.
(pausa)

This place was already here many centuries before today's Lima existed.
(pausa)

For generations, it worked as a ceremonial and administrative center,
organized, active, and connected to its surroundings.
(pausa)

It wasn't an isolated space.
It was part of a network of settlements on the central coast,
with rules, hierarchies, and continuity over time.
(pausa)`,
      summary: `A ceremonial site active
for centuries before
colonial Lima.`,
      highlights: [
        "Before the Incas",
        "Long-lasting center of power",
        "Cultural continuity",
        "Pre-Hispanic Lima",
      ],
      actionCard: {
        tag: "Confirm to continue",
        title: "This part is about to end",
        subtitle: "When you want to continue, tap \"Next\".",
      },
    },

    {
      id: "huaca-power-1",
      title: "Entrance — In-Depth",
      voiceText: `You're entering a complex built between the years 200 and 700 AD, during the period known as the Early Intermediate Period in the Central Andes.
(pausa)

In that same period, between the third and fifth centuries AD, the Roman Empire was going through its deepest crisis, with emperors who lasted only months in power.
In 476 AD, the Western Roman Empire would collapse for good.
(pausa)

While that was happening in Europe, here the Lima culture was developing a network of ceremonial centers in the Rímac Valley and the Lurín Valley.
(pausa)

Huaca Pucllana was not built in a single moment.
Its initial core dates to roughly the third century AD, and it was expanded until the seventh.
(pausa)

The "bookshelf" technique didn't just absorb seismic energy.
It allowed damaged sections to be replaced without compromising the whole structure.
(pausa)

This was not a marginal settlement.
It was a regional center of power.
(pausa)

Whenever you're ready, we'll start climbing the ramp.
(confirmación requerida)`,
      summary: `A regional ceremonial center
active between the third and seventh centuries
on Peru's central coast.`,
      highlights: [
        "Early Intermediate Period",
        "Rome in crisis",
        "Regional ceremonial network",
        "Political-religious power",
      ],
      actionCard: {
        tag: "Confirm to continue",
        title: "Head toward the main ramp",
        subtitle: "When you arrive, tap \"Next\".",
      },
    },

    {
      id: "huaca-power-2",
      title: "Ramp — In-Depth",
      voiceText: `Between the third and seventh centuries AD, monumental architecture on Peru's central coast adopted a stepped pyramid layout.
(pausa)

It wasn't about aesthetics.
It was about politics.
(pausa)

The Lima culture clearly separated social levels: ordinary people below, the ritual elite above.
(pausa)

This pattern would be repeated later at Pachacámac and, later still, in the Inca world, in the fifteenth century.
(pausa)

Elevation represented symbolic closeness to the sacred.
(pausa)

The ramp is not just physical passage.
It is an access filter.
(pausa)

When you reach the top, tell me.
(confirmación requerida)`,
      summary: `A stepped structure
that expressed hierarchy
and ritual power.`,
      highlights: [
        "Political architecture",
        "Social separation",
        "Pyramid model",
        "Symbolic access to power",
      ],
      actionCard: {
        tag: "Confirm to continue",
        title: "Climb calmly to the upper part",
        subtitle: "When you're at the top, tap \"Next\".",
      },
    },

    {
      id: "huaca-power-3",
      title: "Ceremonial Area — In-Depth",
      voiceText: `Excavations carried out since the 1980s have dated human sacrifices between the years 450 and 650 AD.
(pausa)

The bodies show orderly burials, with no signs of uncontrolled torture.
(pausa)

Some victims were accompanied by ceremonial vessels and marine remains.
(pausa)

The Lima culture depended on currents like the Humboldt, which regulated fishing, climate, and agricultural fertility.
(pausa)

A phenomenon like El Niño could upset that entire balance.
(pausa)

These sacrifices were part of ceremonies of symbolic negotiation with unpredictable natural forces.
(pausa)

While in Europe the Visigoths were settling in Hispania and the Western Roman Empire was breaking apart, here there was state-level ritual planning.
(pausa)

It wasn't improvisation.
It was structure.
(pausa)

Whenever you're ready, we'll go back down.
(confirmación requerida)`,
      summary: `A ritual space associated
with complex ceremonies
and human sacrifice.`,
      highlights: [
        "Human sacrifice",
        "Negotiation with nature",
        "El Niño phenomenon",
        "Ritual planning",
      ],
      actionCard: {
        tag: "Confirm to continue",
        title: "Stop at the ceremonial area",
        subtitle: "When you want to go back down, tap \"Next\".",
      },
    },

    {
      id: "huaca-power-4",
      title: "Central Area — In-Depth",
      voiceText: `There is evidence of constant activity between the fourth and seventh centuries AD.
(pausa)

Hearths, storage areas, and utilitarian ceramics have been found alongside ceremonial pieces.
(pausa)

That points to permanent administration and specialists devoted to ritual upkeep.
(pausa)

To sustain this structure for almost 400 years, the Lima culture needed agricultural surplus, territorial control, and defined hierarchies.
(pausa)

This was not a small tribal group.
It was a regionally organized society.
(pausa)

While in Europe the Germanic kingdoms were consolidating after the fall of Rome, here there was long-lasting ritual stability.`,
      summary: `An administrative area
that sustained the ritual activity
of the ceremonial complex.`,
      highlights: [
        "Permanent administration",
        "Ritual specialists",
        "Agricultural surplus",
        "Organized society",
      ],
      actionCard: {
        tag: "Confirm to continue",
        title: "Head toward the central area",
        subtitle: "When you're ready, tap \"Next\".",
      },
    },

    {
      id: "huaca-power-5",
      title: "Closing — In-Depth",
      voiceText: `Before you leave, it's worth putting the timeline in order.
(pausa)

Between the years 200 and 700 AD,
this place operated continuously for several centuries.
(pausa)

Afterward, other cultures occupied or influenced this territory,
until, centuries later, it would be integrated into the Inca world.
(pausa)

That means that even for the Incas,
this site already belonged to an ancient past.
(pausa)

What remains today is not an isolated ruin,
but the material record of an organized society,
with decisions sustained over time.
(pausa)`,
      summary: `A ceremonial center active
for more than five centuries
before the Inca world.`,
      highlights: [
        "Five centuries of use",
        "Before the Wari and the Incas",
        "Architectural tradition",
        "Not an isolated ruin",
      ],
      actionCard: {
        tag: "Confirm to continue",
        title: "This part is about to end",
        subtitle: "When you want to wrap up, tap \"Next\".",
      },
    },

    {
      id: "fin-tour-huaca",
      title: "End of the Tour",
      voiceText: `We've reached the end of this tour of Huaca Pucllana.

Now you're no longer seeing it as just a ruin,
but as the trace of an organized society,
with power, ritual, and historical continuity.

Thank you for walking through it with me.`,
      summary: `End of the tour of Huaca Pucllana,
one of the most important archaeological sites
in Lima.`,
      highlights: [],
      previewText: "Tour complete",
    },
  ],
};
