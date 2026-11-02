import type { CategoryId, Place, SuggestedDate } from "@/lib/types";

/**
 * Free Unsplash photos (unsplash.com/license), served straight from Unsplash's
 * image CDN. Most are representative of the mood, not the exact venue.
 */
export interface Photo {
  id: string;
  alt: string;
}

const p = (id: string, alt: string): Photo => ({ id, alt });

export const PHOTOS = {
  heroSkyline: p("1544214036-5aaeb9e32d11", "Singapore skyline lit up across the water at night"),
  heroBay: p("1496939376851-89342e90adcd", "Marina Bay at dusk"),
  candlelit: p("1778694277039-5cbf0b9a1fcf", "Couples at a candlelit restaurant"),
  gardens: p("1508964942454-1a56651d54ac", "Walkway between the Supertrees at Gardens by the Bay"),
  flyer: p("1559633462-d82e21578552", "The Singapore Flyer beside the city skyline"),
  cablecar: p("1583241595865-b18efaf983f1", "A cable car gliding through a blue sky"),
  river: p("1620054940121-0ad088e4611c", "Bumboats on the Singapore River at night"),
  sentosa: p("1670518979083-cda159e0a8c4", "Palm trees on a beach at sunset"),
  jewel: p("1708084243733-e5f55c06a299", "The Rain Vortex waterfall at Jewel Changi"),
  henderson: p("1616201158980-a25c9fd273ec", "Henderson Waves bridge above the trees"),
  haji: p("1696582836621-07211aaea9ab", "Colourful shophouses in Kampong Glam"),
  ship: p("1625508133058-78bc39fbd228", "A tall ship sailing at sunset"),
  glamping: p("1478827536114-da961b7f86d2", "A glowing tent under the stars"),
  aquarium: p("1769234428281-c108a6053cd3", "Fish swimming around an underwater tunnel"),
  perfume: p("1615634260167-c8cdede054de", "Glass perfume bottles"),
  sushi: p("1681270496598-13c5365730c8", "Sushi served at the counter"),
  satay: p("1742808838159-1848c1a36209", "Satay skewers over a charcoal grill"),
  uss: p("1696851108364-5341c14c49cf", "The Universal Studios globe"),
  safari: p("1746272292394-13c6566cbf71", "A leopard in the dark"),
  botanic: p("1578208068020-4188dadc767c", "A white gazebo among the trees in the Botanic Gardens"),
  nightSkyline: p("1624003974266-7cdbf877ec00", "City skyline at night"),
  mbs: p("1627882278881-672b48f83298", "Marina Bay Sands lit up at night"),
} as const;

export const CATEGORY_PHOTOS: Record<CategoryId, Photo> = {
  romantic: p("1649289660303-b19cc4514c15", "A couple holding hands by the sea at sunset"),
  unique: p("1763002032476-511cab02e34c", "Two putters and golf balls on the green"),
  active: p("1505570554449-69ce7d4fa36b", "Two go-karts racing on a track"),
  games: p("1636070759654-5c93bbca2862", "An arcade glowing with neon"),
  creative: p("1589051088132-06f36a22012a", "Hands shaping a clay bowl on a wheel"),
  relaxing: p("1601479604588-68d9e6d386b5", "Lit candles on a wooden table"),
  museums: p("1512540452972-baac55d40ef1", "Two people looking at artwork in a gallery"),
  photobooths: p("1778641603107-850c6a5f66c0", "A vintage photo booth with a curtain"),
  outdoors: p("1669639938568-cd6cebb71c9d", "A leafy path through a garden"),
  dining: p("1772479020020-9bd8d2f577d0", "A romantic dinner table set with candles"),
  bars: p("1605270012917-bf157c5a9541", "A pink cocktail on the bar"),
  cafes: p("1534687941688-651ccaafbff8", "A latte with latte art"),
  desserts: p("1637944220604-c5f28faac604", "A slice of cake on a plate"),
  supper: p("1739857829959-78c5a13d11f7", "People eating at a hawker centre at night"),
};

/** Place-specific photos where we have a good match; everything else uses its category. */
const PLACE_PHOTOS: Record<string, Photo> = {
  "royal-albatross": PHOTOS.ship,
  "singapore-oceanarium": PHOTOS.aquarium,
  "cable-car": PHOTOS.cablecar,
  "singapore-flyer": PHOTOS.flyer,
  "gardens-by-the-bay": PHOTOS.gardens,
  "singapore-river-cruise": PHOTOS.river,
  "glamping-city-singapore": PHOTOS.glamping,
  uss: PHOTOS.uss,
  "night-safari": PHOTOS.safari,
  perfumeplay: PHOTOS.perfume,
  scentopia: PHOTOS.perfume,
  "henderson-waves": PHOTOS.henderson,
  "spectra-light-show": PHOTOS.mbs,
  "haji-lane-stroll": PHOTOS.haji,
  "botanic-gardens-picnic": PHOTOS.botanic,
  "jewel-rain-vortex": PHOTOS.jewel,
  "kozen-sushi": PHOTOS.sushi,
  "lau-pa-sat-satay-street": PHOTOS.satay,
  skai: PHOTOS.nightSkyline,
  lavo: PHOTOS.mbs,
  "smoke-and-mirrors": PHOTOS.heroSkyline,
  "wildseed-bar-and-grill": PHOTOS.sentosa,
};

export function placePhoto(place: Place): Photo {
  return PLACE_PHOTOS[place.slug] ?? CATEGORY_PHOTOS[place.category];
}

const IDEA_PHOTOS: Record<string, Photo> = {
  "sentosa-sunset-splurge": PHOTOS.ship,
  "rainy-day-hideout": CATEGORY_PHOTOS.games,
  "make-something-together": CATEGORY_PHOTOS.creative,
  "chinatown-after-dark": PHOTOS.candlelit,
  "clarke-quay-game-night": PHOTOS.river,
  "first-date-easy-mode": CATEGORY_PHOTOS.museums,
  "under-fifty-city-lights": PHOTOS.henderson,
  "wild-night-out": PHOTOS.safari,
  "airport-after-hours": PHOTOS.jewel,
};

export function ideaPhoto(idea: SuggestedDate): Photo {
  return IDEA_PHOTOS[idea.slug] ?? PHOTOS.heroBay;
}

export function photoUrl(photo: Photo, width: number) {
  return `https://images.unsplash.com/photo-${photo.id}?auto=format&fit=crop&w=${width}&q=70`;
}
