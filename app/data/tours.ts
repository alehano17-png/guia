export type TourChoice = {
  label: string;
  nextId: string;
};

export type TourStep = {
  id: string;
  title: string;
  voiceText: string;
  highlights: string[]; // SOLO strings
  nextId?: string;
  choices?: TourChoice[];
};

export type Tour = {
  id: string;
  title: string;
  steps: TourStep[];
};

const mirafloresOcio: Tour = {
  id: "miraflores-ocio",
  title: "Miraflores",
  steps: [
    // =============================
    // FARO DE LA MARINA
    // =============================
    {
      id: "faro",
      title: "Faro de la Marina",
      voiceText:
        "Estás en uno de los puntos más simbólicos de Miraflores. Este faro se construyó en 1900, cuando Lima empezó a mirar hacia el mar. No apunta al océano, apunta a la ciudad. No es un error. Es una declaración urbana.",
      highlights: [
        "1900",
        "Siglo XX",
        "Faro urbano",
        "Identidad moderna",
      ],
      nextId: "malecon",
    },

    // =============================
    // MALECÓN
    // =============================
    {
      id: "malecon",
      title: "Malecón de Miraflores",
      voiceText:
        "Estás caminando sobre un acantilado natural formado hace miles de años. Abajo está el Pacífico, arriba uno de los distritos más visitados del Perú. Esta franja siempre fue un punto de conexión.",
      highlights: [
        "Acantilados",
        "Pacífico",
        "Costa Verde",
        "Conexión",
      ],
      nextId: "villena",
    },

    // =============================
    // PUENTE VILLENA
    // =============================
    {
      id: "villena",
      title: "Puente Villena Rey",
      voiceText:
        "Aquí la ciudad cambia de escala. Este puente cruza un vacío natural profundo y recuerda que Lima se adaptó al terreno, no al revés.",
      highlights: [
        "Desnivel",
        "Arquitectura urbana",
        "Borde ciudad-mar",
        "Historia urbana",
      ],
      nextId: "parque-amor",
    },

    // =============================
    // PARQUE DEL AMOR
    // =============================
    {
      id: "parque-amor",
      title: "Parque del Amor",
      voiceText:
        "Este parque se creó en los años noventa como un espacio para contemplar. El mural se inspira en formas precolombinas. Aquí el amor es vínculo con el lugar.",
      highlights: [
        "Década de 1990",
        "Mural precolombino",
        "Encuentro",
        "Contemplación",
      ],
      nextId: "huaca-exterior",
    },

    // =============================
    // HUACA EXTERIOR
    // =============================
    {
      id: "huaca-exterior",
      title: "Huaca Pucllana",
      voiceText:
        "La Huaca Pucllana fue construida entre los años 200 y 700 d.C. por la cultura Lima, más de mil años antes de los incas. Era un centro ceremonial y administrativo.",
      highlights: [
        "200–700 d.C.",
        "Cultura Lima",
        "Centro ceremonial",
        "Preincaico",
      ],
      choices: [
        {
          label: "Recorrer por fuera",
          nextId: "huaca-cierre",
        },
        {
          label: "Entrar a la huaca",
          nextId: "huaca-eleccion",
        },
      ],
    },

    // =============================
    // ELECCIÓN BASE / PROFUNDO
    // =============================
    {
      id: "huaca-eleccion",
      title: "Antes de entrar",
      voiceText:
        "Antes de continuar, dime algo. ¿Quieres la historia clara y directa o prefieres profundizar en el contexto histórico?",
      highlights: [
        "Historia base",
        "Historia profunda",
        "Elección",
        "Recorrido guiado",
      ],
      choices: [
        {
          label: "Historia base",
          nextId: "huaca-interior-1",
        },
        {
          label: "Historia profunda",
          nextId: "huaca-interior-1",
        },
      ],
    },

    // =============================
    // HUACA INTERIOR — 1
    // =============================
    {
      id: "huaca-interior-1",
      title: "Huaca Pucllana — Entrada",
      voiceText:
        "Estás entrando a la Huaca Pucllana. Este centro ceremonial fue construido entre los años 200 y 700 d.C., cuando en Europa aún existía el Imperio Romano.",
      highlights: [
        "Entrada ceremonial",
        "Cultura Lima",
        "Imperio Romano",
        "Antigüedad",
      ],
      nextId: "huaca-interior-2",
    },

    // =============================
    // HUACA INTERIOR — 2
    // =============================
    {
      id: "huaca-interior-2",
      title: "Huaca Pucllana — Rampa",
      voiceText:
        "Mientras subes esta rampa no solo cambias de altura. Cambias de jerarquía. No cualquiera podía acceder a este nivel.",
      highlights: [
        "Rampa",
        "Jerarquía",
        "Acceso restringido",
        "Poder ritual",
      ],
      nextId: "huaca-interior-3",
    },

    // =============================
    // HUACA INTERIOR — 3
    // =============================
    {
      id: "huaca-interior-3",
      title: "Huaca Pucllana — Zona ceremonial",
      voiceText:
        "Aquí se realizaban los rituales más importantes. Se han encontrado ofrendas marinas y evidencia de sacrificios humanos.",
      highlights: [
        "Rituales",
        "Ofrendas",
        "Sacrificios",
        "Centro de poder",
      ],
      nextId: "huaca-cierre",
    },

    // =============================
    // CIERRE
    // =============================
    {
      id: "huaca-cierre",
      title: "Cierre",
      voiceText:
        "Este lugar ya era antiguo mil años antes de los incas. Caminaste por un centro de poder que existía mucho antes de la Lima actual.",
      highlights: [
        "Pre-preincaico",
        "Historia profunda",
        "Continuidad",
        "Memoria",
      ],
    },
  ],
};

const TOURS: Tour[] = [mirafloresOcio];

export function getTourById(id: string): Tour | undefined {
  return TOURS.find((t) => t.id === id);
}