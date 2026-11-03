import { CATEGORY_BY_ID } from "@/data/categories";
import type {
  CategoryId,
  Occasion,
  Photo,
  Place,
  PriceLevel,
  SuggestedDate,
  TimeOfDay,
  Vibe,
} from "@/lib/types";

/** Everything the site shows: places and date ideas, plus lookups. */
export interface Catalogue {
  places: Place[];
  ideas: SuggestedDate[];
  placeBySlug: Record<string, Place>;
  ideaBySlug: Record<string, SuggestedDate>;
  areas: string[];
}

export function buildCatalogue(places: Place[], ideas: SuggestedDate[]): Catalogue {
  return {
    places,
    ideas,
    placeBySlug: Object.fromEntries(places.map((p) => [p.slug, p])),
    ideaBySlug: Object.fromEntries(ideas.map((d) => [d.slug, d])),
    areas: Array.from(new Set(places.map((p) => p.area))).sort(),
  };
}

/** Budget level used by filters, derived from the per-person estimate. */
export function priceLevelFor(cost: number): PriceLevel {
  if (cost === 0) return 0;
  if (cost < 25) return 1;
  if (cost <= 60) return 2;
  if (cost <= 120) return 3;
  return 4;
}

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* ------------------------------------------------------------------ */
/* Database rows                                                       */

export interface PhotoColumns {
  photo_url: string | null;
  photo_width: number | null;
  photo_height: number | null;
}

export interface PlaceRow extends PhotoColumns {
  slug: string;
  name: string;
  category: string;
  area: string;
  lat: number | null;
  lng: number | null;
  cost_per_person: number;
  duration_mins: number;
  blurb: string;
  cuisine: string | null;
  vibes: string[];
  time_of_day: string;
  indoor: boolean;
  branches: string[] | null;
  status: string;
  source: string;
  unverified: boolean;
  position: number;
}

export interface IdeaRow extends PhotoColumns {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  moods: string[];
  occasions: string[];
  start_time: string;
  stops: { slug: string; durationMins?: number }[];
  position: number;
}

const UNSPLASH = /^https:\/\/images\.unsplash\.com\/photo-([\w-]+)/;

function photoFromRow(r: PhotoColumns, alt: string): Photo | undefined {
  if (!r.photo_url) return undefined;
  const m = r.photo_url.match(UNSPLASH);
  if (m) return { kind: "unsplash", id: m[1], alt };
  return { kind: "local", src: r.photo_url, width: r.photo_width ?? 1200, height: r.photo_height ?? 900, alt };
}

export function photoToRow(photo: Photo | undefined): PhotoColumns {
  if (!photo) return { photo_url: null, photo_width: null, photo_height: null };
  if (photo.kind === "unsplash") {
    return { photo_url: `https://images.unsplash.com/photo-${photo.id}`, photo_width: null, photo_height: null };
  }
  return { photo_url: photo.src, photo_width: photo.width, photo_height: photo.height };
}

export function rowToPlace(r: PlaceRow): Place {
  const category = (CATEGORY_BY_ID[r.category as CategoryId] ? r.category : "unique") as CategoryId;
  return {
    slug: r.slug,
    name: r.name,
    kind: CATEGORY_BY_ID[category].kind,
    category,
    area: r.area,
    lat: r.lat,
    lng: r.lng,
    priceLevel: priceLevelFor(r.cost_per_person),
    costPerPerson: r.cost_per_person,
    durationMins: r.duration_mins,
    blurb: r.blurb,
    cuisine: r.cuisine ?? undefined,
    vibes: r.vibes as Vibe[],
    timeOfDay: r.time_of_day as TimeOfDay,
    indoor: r.indoor,
    branches: r.branches?.length ? r.branches : undefined,
    status: r.status === "closed" ? "closed" : "open",
    source: r.source === "blushhour" ? "blushhour" : "curator",
    unverified: r.unverified || undefined,
    photo: photoFromRow(r, r.name),
  };
}

export function placeToRow(p: Place, position: number): PlaceRow {
  return {
    slug: p.slug,
    name: p.name,
    category: p.category,
    area: p.area,
    lat: p.lat,
    lng: p.lng,
    cost_per_person: p.costPerPerson,
    duration_mins: p.durationMins,
    blurb: p.blurb,
    cuisine: p.cuisine ?? null,
    vibes: p.vibes,
    time_of_day: p.timeOfDay,
    indoor: p.indoor,
    branches: p.branches ?? null,
    status: p.status ?? "open",
    source: p.source,
    unverified: !!p.unverified,
    position,
    ...photoToRow(p.photo),
  };
}

export function rowToIdea(r: IdeaRow): SuggestedDate {
  return {
    slug: r.slug,
    title: r.title,
    tagline: r.tagline,
    description: r.description,
    moods: r.moods as Vibe[],
    occasions: r.occasions as Occasion[],
    startTime: r.start_time,
    stops: r.stops ?? [],
    photo: photoFromRow(r, r.title),
  };
}

export function ideaToRow(d: SuggestedDate, position: number): IdeaRow {
  return {
    slug: d.slug,
    title: d.title,
    tagline: d.tagline,
    description: d.description,
    moods: d.moods,
    occasions: d.occasions,
    start_time: d.startTime,
    stops: d.stops,
    position,
    ...photoToRow(d.photo),
  };
}
