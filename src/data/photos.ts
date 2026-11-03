import type { CategoryId, Photo, Place, SuggestedDate } from "@/lib/types";

/**
 * Two kinds of photo: the curator's own shots of a venue (in /public/photos or
 * uploaded through the admin) and free Unsplash photos (unsplash.com/license)
 * that set the mood where a place has none yet.
 */
export type { Photo };

const p = (id: string, alt: string): Photo => ({ kind: "unsplash", id, alt });
const local = (src: string, width: number, height: number) => ({ src, width, height });

export const PHOTOS = {
  heroBay: p("1496939376851-89342e90adcd", "Marina Bay at dusk"),
  candlelit: p("1778694277039-5cbf0b9a1fcf", "Couples at a candlelit restaurant"),
  gardens: p("1508964942454-1a56651d54ac", "Walkway between the Supertrees at Gardens by the Bay"),
  flyer: p("1559633462-d82e21578552", "The Singapore Flyer beside the city skyline"),
  cablecar: p("1583241595865-b18efaf983f1", "A cable car gliding through a blue sky"),
  river: p("1620054940121-0ad088e4611c", "Bumboats on the Singapore River at night"),
  sentosa: p("1670518979083-cda159e0a8c4", "Palm trees on a beach at sunset"),
  jewel: p("1708084243733-e5f55c06a299", "The Rain Vortex waterfall at Jewel Changi"),
  henderson: p("1616201158980-a25c9fd273ec", "Henderson Waves bridge above the trees"),
  haji: p("1696582836621-07211aaea9ab", "Colourful shophouses along Haji Lane"),
  ship: p("1625508133058-78bc39fbd228", "A tall ship sailing at sunset"),
  glamping: p("1478827536114-da961b7f86d2", "A glowing tent under the stars"),
  aquarium: p("1769234428281-c108a6053cd3", "Fish swimming around an underwater tunnel"),
  satay: p("1742808838159-1848c1a36209", "Satay skewers over a charcoal grill"),
  uss: p("1696851108364-5341c14c49cf", "The Universal Studios globe"),
  safari: p("1746272292394-13c6566cbf71", "A leopard in the dark"),
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
  casual: p("1526318896980-cf78c088247c", "A bowl of ramen being picked up with chopsticks"),
  bars: p("1605270012917-bf157c5a9541", "A pink cocktail on the bar"),
  cafes: p("1534687941688-651ccaafbff8", "A latte with latte art"),
  desserts: p("1637944220604-c5f28faac604", "A slice of cake on a plate"),
  supper: p("1739857829959-78c5a13d11f7", "People eating at a hawker centre at night"),
};

/** Place-specific photos where we have a good match; everything else uses its category. */
const PLACE_PHOTOS: Record<string, Photo> = {
  "singapore-oceanarium": PHOTOS.aquarium,
  "cable-car": PHOTOS.cablecar,
  "singapore-flyer": PHOTOS.flyer,
  "gardens-by-the-bay": PHOTOS.gardens,
  "singapore-river-cruise": PHOTOS.river,
  "glamping-city-singapore": PHOTOS.glamping,
  uss: PHOTOS.uss,
  "night-safari": PHOTOS.safari,
  "henderson-waves": PHOTOS.henderson,
  "haji-lane": PHOTOS.haji,
  "jewel-rain-vortex": PHOTOS.jewel,
  "lau-pa-sat-satay-street": PHOTOS.satay,
};

/** The curator's own venue photos, keyed by place slug. */
const OWN_PHOTOS: Record<string, { src: string; width: number; height: number }> = {
  "a-painted-sip": local("/photos/a-painted-sip.jpg", 480, 640),
  "absurdities-singapore": local("/photos/restaurant-absurdities.jpg", 1400, 1050),
  "aramsa-garden-spa": local("/photos/aramsa.jpg", 686, 447),
  "artscience-museum": local("/photos/artscience-museum.jpg", 335, 597),
  "axe-factor": local("/photos/axe-factor2.webp", 763, 509),
  "beyond-crust": local("/photos/beyond-crust.jpg", 554, 554),
  "bkk-bistro-and-bar": local("/photos/bkk-bistro.jpg", 1080, 1080),
  "block-bouquets": local("/photos/block-bouquets.jpg", 480, 639),
  "dollop-pitstop": local("/photos/dollop.webp", 680, 453),
  "dopamine-land": local("/photos/dopamine-land.jpg", 447, 447),
  "elixir-esports": local("/photos/elixir-esports.jpg", 2048, 1366),
  "furama-in-room-hotpot": local("/photos/furama-hotpot.jpg", 516, 387),
  "fyp-cafe": local("/photos/fyp-cafe.webp", 2400, 1600),
  "game-over-gaming-cafe": local("/photos/game-over-gaming-cafe.jpg", 1920, 1080),
  "gochu-korean-bbq": local("/photos/gochu-dining2.webp", 1669, 942),
  "griddy-grid": local("/photos/griddy-grid.png", 1920, 1080),
  "gui-cafe": local("/photos/gui-cafe.jpg", 1828, 2560),
  "helen-s-bar": local("/photos/helens.jpg", 1200, 1200),
  "hvala": local("/photos/hvala.webp", 1335, 1668),
  "hyperdrive": local("/photos/hyper-drive.jpg", 365, 547),
  "il-clay": local("/photos/il-clay.avif", 980, 1741),
  "joji-s-diner": local("/photos/joji-diner.webp", 2560, 1707),
  "k-bowling-club": local("/photos/k-bowling-club.jpg", 1130, 750),
  "katsu-an": local("/photos/katsuan.webp", 1702, 1133),
  "kiap-kiap-chicken-club-and-bar": local("/photos/kiap-kiap-chicken.webp", 1400, 1000),
  "kommune-by-82soho": local("/photos/kommune-by-82soho.jpg", 801, 801),
  "kozen-sushi": local("/photos/kozen.jpg", 1024, 768),
  "kulnari-mystery-golf": local("/photos/kulnari-mystery-golf.webp", 960, 960),
  "kyok-studios": local("/photos/kyok-studios.webp", 287, 510),
  "lavo": local("/photos/lavo.jpg", 700, 466),
  "level-up-bar-arcade": local("/photos/level-up.jpg", 516, 387),
  "liu-lang-mian-noodle-bar": local("/photos/liu-lang-mian2.webp", 1200, 800),
  "mandai-rainforest": local("/photos/mandai_rainforest.avif", 1600, 1000),
  "manner-hotel": local("/photos/manner-hotel-photobooth.webp", 340, 510),
  "me-cafe-games-chinatown": local("/photos/me-cafe-and-games-chinatown.jpg", 452, 678),
  "me-cafe-games-orchard": local("/photos/me-cafe-games-orchard.png", 1360, 1020),
  "me-cafe-games-tanjong-pagar": local("/photos/me-cafe-and-games-tanjong-pagar.jpeg", 1360, 1008),
  "museum-of-ice-cream": local("/photos/museum-of-ice-cream.webp", 1620, 1080),
  "national-museum-of-singapore": local("/photos/national-museum-of-singapore.jpg", 399, 501),
  "natureland-massage": local("/photos/natureland-massage.jpg", 750, 469),
  "new-taste": local("/photos/new-taste.webp", 393, 393),
  "nox-dine-in-the-dark": local("/photos/nox-dine-in-the-dark.webp", 2500, 1667),
  "obba-bbq-jjajang": local("/photos/obba-bbq.png", 748, 768),
  "painting-manic": local("/photos/painting-manic.jpg", 1024, 684),
  "perfumeplay": local("/photos/perfume-play.jpg", 885, 885),
  "puppy-yoga-singapore": local("/photos/puppy-yoga.jpg", 495, 619),
  "ri-ri-cha": local("/photos/ri-ri-cha.jpg", 1200, 800),
  "royal-albatross": local("/photos/royal-albatross.webp", 768, 765),
  "scentopia": local("/photos/scentopia.jpg", 640, 791),
  "shinjuku-restaurant": local("/photos/shinjuku.jpg", 4000, 2925),
  "shu-du-fan-dian": local("/photos/shu-du-fan-dian.jpg", 700, 496),
  "skai": local("/photos/skai.jpg", 678, 452),
  "solace-express-cathay": local("/photos/solace-express-cathay.webp", 382, 510),
  "solace-high-school": local("/photos/solace-high-school.jpg", 416, 738),
  "spectra-light-show": local("/photos/spectra-show.png", 670, 415),
  "srisun-express": local("/photos/srisun-express.jpg", 592, 418),
  "standardphotostudio": local("/photos/standard-photo.webp", 382, 510),
  "sweedy": local("/photos/sweedy.jpeg", 2048, 1536),
  "tamoya-udon": local("/photos/tamoya-udon.webp", 600, 400),
  "thachang": local("/photos/thachang2.jpg", 2048, 2048),
  "the-coffee-code": local("/photos/the-coffee-code.jpg", 1024, 768),
  "tian-wang": local("/photos/tian-wang.jpg", 732, 1024),
  "toptable": local("/photos/top-table.webp", 2500, 1667),
  "ushio-sumiyaki-and-sake-bar": local("/photos/ushio3.png", 626, 400),
  "wanyoo-esports": local("/photos/wanyoo-esports.jpg", 1200, 600),
  "wild-wild-wet": local("/photos/wild-wild-wet.jpg", 547, 365),
  "wildseed-bar-and-grill": local("/photos/wildseed-bar-and-grill.jpg", 1840, 1035),
  "wonderland-upside-down": local("/photos/wonderland-upside-down2.jpg", 1295, 728),
  "yanhuo-restaurant": local("/photos/yanhuo.jpg", 1400, 1000),
};

/** Photo for a built-in place, if it has its own (used to seed the database). */
export function builtinPlacePhoto(slug: string, name: string): Photo | undefined {
  const own = OWN_PHOTOS[slug];
  if (own) return { kind: "local", ...own, alt: name };
  return PLACE_PHOTOS[slug];
}

export function placePhoto(place: Place): Photo {
  return place.photo ?? CATEGORY_PHOTOS[place.category];
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

/** Cover photo for a built-in date idea (used to seed the database). */
export function builtinIdeaPhoto(slug: string): Photo | undefined {
  return IDEA_PHOTOS[slug];
}

export function ideaPhoto(idea: SuggestedDate): Photo {
  return idea.photo ?? PHOTOS.heroBay;
}

export function unsplashUrl(id: string, width: number) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=70`;
}
