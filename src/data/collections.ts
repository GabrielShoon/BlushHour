import type { Place } from "@/lib/types";
import { PHOTOS, CATEGORY_PHOTOS, type Photo } from "./photos";

/** Hand-picked themes shown as shelves on Explore and as mood tiles on the home page. */
export interface Collection {
  slug: string;
  title: string;
  blurb: string;
  photo: Photo;
  match: (p: Place) => boolean;
}

export const COLLECTIONS: Collection[] = [
  {
    slug: "golden-hour",
    title: "Golden hour",
    blurb: "Views, water and soft light, for when the sun starts to dip.",
    photo: PHOTOS.heroBay,
    match: (p) =>
      p.kind === "activity" && p.vibes.includes("romantic") && (p.timeOfDay === "evening" || p.timeOfDay === "night"),
  },
  {
    slug: "rainy-day",
    title: "Rainy-day plans",
    blurb: "Cosy, indoor and fun even when it's pouring.",
    photo: CATEGORY_PHOTOS.games,
    match: (p) =>
      p.kind === "activity" &&
      p.indoor &&
      p.durationMins >= 60 &&
      (p.vibes.includes("playful") || p.vibes.includes("chill") || p.vibes.includes("creative")),
  },
  {
    slug: "make-something",
    title: "Make something together",
    blurb: "Workshops where you go home with something you made.",
    photo: CATEGORY_PHOTOS.creative,
    match: (p) => p.category === "creative",
  },
  {
    slug: "dinner",
    title: "Dinner worth dressing up for",
    blurb: "Tables to book when the night needs to feel special.",
    photo: CATEGORY_PHOTOS.dining,
    match: (p) => p.category === "dining" && p.priceLevel >= 3,
  },
  {
    slug: "under-20",
    title: "Free & almost free",
    blurb: "Lovely evenings that cost less than S$20 each.",
    photo: PHOTOS.henderson,
    match: (p) => p.costPerPerson <= 20,
  },
  {
    slug: "play",
    title: "Game on",
    blurb: "Arcades, karts and a little friendly competition.",
    photo: CATEGORY_PHOTOS.active,
    match: (p) => p.category === "games" || p.category === "active",
  },
  {
    slug: "sentosa",
    title: "A day on Sentosa",
    blurb: "Everything you need for an island day out.",
    photo: PHOTOS.sentosa,
    match: (p) => p.area === "Sentosa",
  },
  {
    slug: "late-night",
    title: "After midnight",
    blurb: "For when the date isn't over yet.",
    photo: CATEGORY_PHOTOS.supper,
    match: (p) => p.timeOfDay === "night",
  },
];

export const COLLECTION_BY_SLUG = Object.fromEntries(COLLECTIONS.map((c) => [c.slug, c]));

export function collectionPlaces(c: Collection, places: Place[]) {
  return places.filter((p) => p.status !== "closed" && c.match(p));
}
