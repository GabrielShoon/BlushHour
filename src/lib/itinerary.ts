import type { Catalogue } from "@/lib/catalogue";
import type { Itinerary, ItineraryStop, Place, SuggestedDate } from "@/lib/types";

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/** Straight-line distance in km. */
export function distanceKm(a: Place, b: Place): number | null {
  if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) return null;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Rough door-to-door travel time between two stops in Singapore: walking when
 * close, otherwise MRT/Grab with a fixed buffer. Rounded to 5 minutes.
 */
export function travelMins(a: Place, b: Place): number {
  const d = distanceKm(a, b);
  if (d == null) return 25;
  if (d < 0.8) return Math.max(5, Math.round((d * 15) / 5) * 5);
  return Math.round((12 + d * 2.5) / 5) * 5;
}

export function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function formatTime(mins: number) {
  const m = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm.toString().padStart(2, "0")}${suffix}`;
}

export function formatDuration(mins: number) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function formatSGD(n: number) {
  return n === 0 ? "Free" : `S$${Math.round(n).toLocaleString("en-SG")}`;
}

export interface ScheduledStop {
  stop: ItineraryStop;
  place: Place;
  start: number;
  end: number;
  travelBefore: number;
}

export function schedule(it: Itinerary, cat: Catalogue): {
  stops: ScheduledStop[];
  end: number;
  totalCost: number;
  totalTravel: number;
} {
  let t = toMinutes(it.startTime);
  let totalCost = 0;
  let totalTravel = 0;
  const out: ScheduledStop[] = [];
  let prev: Place | null = null;
  for (const stop of it.stops) {
    const place = cat.placeBySlug[stop.slug];
    if (!place) continue;
    const travelBefore = prev ? travelMins(prev, place) : 0;
    t += travelBefore;
    totalTravel += travelBefore;
    out.push({ stop, place, start: t, end: t + stop.durationMins, travelBefore });
    t += stop.durationMins;
    totalCost += place.costPerPerson * it.people;
    prev = place;
  }
  return { stops: out, end: t, totalCost, totalTravel };
}

export function nearby(place: Place, cat: Catalogue, limit = 6, filter?: (p: Place) => boolean): Place[] {
  return cat.places.filter((p) => p.slug !== place.slug && p.status !== "closed" && (!filter || filter(p)))
    .map((p) => ({ p, d: distanceKm(place, p) }))
    .filter((x): x is { p: Place; d: number } => x.d != null)
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map((x) => x.p);
}

/** Alternatives for the "replace" action: same category first, then same kind, closest first. */
export function alternatives(place: Place, cat: Catalogue, exclude: string[], limit = 6): Place[] {
  const pool = cat.places.filter(
    (p) => !exclude.includes(p.slug) && p.status !== "closed" && p.kind === place.kind,
  );
  const score = (p: Place) =>
    (p.category === place.category ? 0 : 100) + (distanceKm(place, p) ?? 50);
  return pool.sort((a, b) => score(a) - score(b)).slice(0, limit);
}

export function newItinerary(partial?: Partial<Itinerary>): Itinerary {
  return {
    id: uid(),
    title: "Our date",
    date: null,
    startTime: "18:00",
    people: 2,
    stops: [],
    updatedAt: new Date().toISOString(),
    ...partial,
  };
}

export function stopFor(cat: Catalogue, slug: string, durationMins?: number): ItineraryStop {
  return { id: uid(), slug, durationMins: durationMins ?? cat.placeBySlug[slug]?.durationMins ?? 60 };
}

export function itineraryFromSuggestion(d: SuggestedDate, cat: Catalogue): Itinerary {
  return newItinerary({
    title: d.title,
    startTime: d.startTime,
    stops: d.stops.map((s) => stopFor(cat, s.slug, s.durationMins)),
  });
}

export function suggestionCost(d: SuggestedDate, cat: Catalogue) {
  return d.stops.reduce((sum, s) => sum + (cat.placeBySlug[s.slug]?.costPerPerson ?? 0), 0);
}

/** Budget band for a per-person cost, matching the BUDGETS filter ids. */
export function budgetBand(perPerson: number) {
  if (perPerson < 50) return "under-50";
  if (perPerson <= 150) return "50-150";
  if (perPerson <= 300) return "150-300";
  return "splurge";
}

/** The per-person estimate shown on cards and detail pages. */
export function costLabel(place: Place) {
  return place.costPerPerson === 0 ? "Free" : `About ${formatSGD(place.costPerPerson)} per person`;
}
