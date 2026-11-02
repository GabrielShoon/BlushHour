import type { SuggestedDate } from "@/lib/types";

/**
 * Starting points, not fixed plans. Every suggested date opens in the builder
 * so couples can swap, add and reorder stops.
 */
export const SUGGESTED_DATES: SuggestedDate[] = [
  {
    slug: "sentosa-sunset-splurge",
    title: "Sentosa sunset splurge",
    tagline: "Cable car in, tall ship out",
    description:
      "Float over the harbour by cable car, blend a perfume for each other at Scentopia, then board the Royal Albatross for dinner at sea.",
    moods: ["romantic", "fancy"],
    occasions: ["anniversary", "birthday"],
    startTime: "15:00",
    stops: [{ slug: "cable-car" }, { slug: "scentopia" }, { slug: "royal-albatross" }],
    hue: "rose",
  },
  {
    slug: "rainy-day-hideout",
    title: "Rainy-day hideout",
    tagline: "Tents, cats and matcha",
    description:
      "Rain plans that feel cosy. Indoor camping with cats in Orchard, a photobooth strip, then matcha desserts.",
    moods: ["chill", "playful", "lowkey"],
    occasions: ["rainy-day", "spontaneous"],
    startTime: "13:00",
    stops: [
      { slug: "me-cafe-games-orchard" },
      { slug: "dollop-pitstop" },
      { slug: "hvala" },
    ],
    hue: "sky",
  },
  {
    slug: "make-something-together",
    title: "Make something together",
    tagline: "Leave with a souvenir you made",
    description:
      "Start with a slow café brunch, sculpt each other something at Clayful, and finish with LEGO flowers that never wilt.",
    moods: ["creative", "chill"],
    occasions: ["first-date", "weekend"],
    startTime: "11:00",
    stops: [{ slug: "fyp-cafe" }, { slug: "clayful-cafe" }, { slug: "block-bouquets" }],
    hue: "gold",
  },
  {
    slug: "chinatown-after-dark",
    title: "Chinatown after dark",
    tagline: "Dinner in the dark, then dessert",
    description:
      "A mystery menu at NOX, a wander through the lanes, then desserts at Ri Ri Cha. Lots to talk about.",
    moods: ["adventurous", "romantic", "foodie"],
    occasions: ["anniversary", "spontaneous"],
    startTime: "18:30",
    stops: [{ slug: "nox-dine-in-the-dark" }, { slug: "ri-ri-cha" }],
    hue: "plum",
  },
  {
    slug: "clarke-quay-game-night",
    title: "Clarke Quay game night",
    tagline: "Mini golf, sumiyaki, arcade bar",
    description:
      "Solve puzzles at Kulnari Mystery Golf, eat charcoal-grilled skewers at USHIO, and settle the score at Level Up.",
    moods: ["playful", "foodie"],
    occasions: ["birthday", "weekend"],
    startTime: "17:00",
    stops: [
      { slug: "kulnari-mystery-golf" },
      { slug: "ushio-sumiyaki-and-sake-bar" },
      { slug: "level-up-bar-arcade" },
    ],
    hue: "apricot",
  },
  {
    slug: "first-date-easy-mode",
    title: "First date, easy mode",
    tagline: "Low pressure, lots to talk about",
    description:
      "A gallery to give you something to talk about, a wander down Haji Lane, then fried chicken and drinks round the corner at Kiap Kiap. Easy to cut short or stretch out.",
    moods: ["chill", "lowkey"],
    occasions: ["first-date"],
    startTime: "16:00",
    stops: [
      { slug: "national-museum-of-singapore" },
      { slug: "haji-lane" },
      { slug: "kiap-kiap-chicken-club-and-bar" },
    ],
    hue: "sage",
  },
  {
    slug: "under-fifty-city-lights",
    title: "City lights under $50",
    tagline: "Skyline views without the bill",
    description:
      "Sunset at Henderson Waves, satay on the street at Lau Pa Sat, then the free Spectra show by the bay.",
    moods: ["romantic", "lowkey"],
    occasions: ["spontaneous", "weekend"],
    startTime: "17:30",
    stops: [
      { slug: "henderson-waves" },
      { slug: "lau-pa-sat-satay-street" },
      { slug: "spectra-light-show" },
    ],
    hue: "sky",
  },
  {
    slug: "wild-night-out",
    title: "Into the wild",
    tagline: "Rainforest by day, safari by night",
    description:
      "Walk the Mandai Rainforest trails in the late afternoon, then stay on for the Night Safari after dark.",
    moods: ["adventurous", "romantic"],
    occasions: ["weekend", "birthday"],
    startTime: "15:00",
    stops: [{ slug: "mandai-rainforest" }, { slug: "night-safari" }],
    hue: "sage",
  },
  {
    slug: "airport-after-hours",
    title: "Airport after hours",
    tagline: "Lava floors and a waterfall",
    description:
      "Changi is a date destination. Play the floor-is-lava game at Griddy Grid, then watch the Rain Vortex light up.",
    moods: ["playful", "chill"],
    occasions: ["rainy-day", "spontaneous"],
    startTime: "19:00",
    stops: [{ slug: "griddy-grid" }, { slug: "jewel-rain-vortex" }],
    hue: "apricot",
  },
];

export const SUGGESTED_BY_SLUG: Record<string, SuggestedDate> = Object.fromEntries(
  SUGGESTED_DATES.map((d) => [d.slug, d]),
);
