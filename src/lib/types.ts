export type Kind = "activity" | "food";

export type CategoryId =
  | "romantic"
  | "unique"
  | "active"
  | "games"
  | "creative"
  | "relaxing"
  | "museums"
  | "photobooths"
  | "outdoors"
  | "dining"
  | "casual"
  | "bars"
  | "cafes"
  | "desserts"
  | "supper";

export type Vibe =
  | "romantic"
  | "playful"
  | "chill"
  | "adventurous"
  | "creative"
  | "fancy"
  | "foodie"
  | "lowkey";

export type TimeOfDay = "day" | "evening" | "night" | "any";

/** 0 = free, 1 = $, 2 = $$, 3 = $$$, 4 = $$$$ */
export type PriceLevel = 0 | 1 | 2 | 3 | 4;

export type Source = "curator" | "blushhour";

export interface Place {
  slug: string;
  name: string;
  kind: Kind;
  category: CategoryId;
  area: string;
  /** Area-level coordinates; null when the place has several locations. */
  lat: number | null;
  lng: number | null;
  priceLevel: PriceLevel;
  /** Rough SGD spend per person, used for itinerary cost estimates. */
  costPerPerson: number;
  durationMins: number;
  blurb: string;
  cuisine?: string;
  vibes: Vibe[];
  timeOfDay: TimeOfDay;
  indoor: boolean;
  /** Opening hours, if known. Not shown yet; place pages link to Google Maps for hours. */
  hours?: string;
  branches?: string[];
  status?: "open" | "closed";
  /** Where this entry came from: the curator's docs or a BlushHour addition. */
  source: Source;
  /** True when price/details were filled in by BlushHour and still need checking. */
  unverified?: boolean;
  /** Own photo; without one the category's stock photo is used. */
  photo?: Photo;
}

/**
 * A curator photo (local file or uploaded to storage, served through
 * next/image) or a free Unsplash photo served from Unsplash's CDN.
 */
export type Photo =
  | { kind: "unsplash"; id: string; alt: string }
  | { kind: "local"; src: string; width: number; height: number; alt: string };

export interface Category {
  id: CategoryId;
  label: string;
  kind: Kind;
  icon: string;
  hue: "rose" | "apricot" | "plum" | "sage" | "sky" | "gold";
}

export interface ItineraryStop {
  id: string;
  slug: string;
  durationMins: number;
}

export interface Itinerary {
  id: string;
  title: string;
  date: string | null;
  startTime: string;
  people: number;
  stops: ItineraryStop[];
  updatedAt: string;
}

export interface SuggestedDate {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  moods: Vibe[];
  occasions: Occasion[];
  startTime: string;
  stops: { slug: string; durationMins?: number }[];
  hue?: Category["hue"];
  /** Cover photo; without one a default skyline photo is used. */
  photo?: Photo;
}

export type Occasion =
  | "first-date"
  | "anniversary"
  | "birthday"
  | "rainy-day"
  | "weekend"
  | "spontaneous";
