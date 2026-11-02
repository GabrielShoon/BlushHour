import { ArrowLeft, ArrowUpRight, Info } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Photo } from "@/components/photo";
import { PlaceMap } from "@/components/place-map";
import { AddToDateButton, FavoriteButton } from "@/components/place-actions";
import { PlaceCard } from "@/components/place-card";
import { CATEGORY_BY_ID, VIBES } from "@/data/categories";
import { placePhoto } from "@/data/photos";
import { PLACE_BY_SLUG, PLACES } from "@/data/places";
import { SUGGESTED_DATES } from "@/data/suggested-dates";
import { costLabel, formatDuration, nearby } from "@/lib/itinerary";

export function generateStaticParams() {
  return PLACES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = PLACE_BY_SLUG[(await params).slug];
  if (!p) return {};
  return { title: `${p.name}, ${p.area}`, description: p.blurb };
}

export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const place = PLACE_BY_SLUG[(await params).slug];
  if (!place) notFound();
  const cat = CATEGORY_BY_ID[place.category];
  const photo = placePhoto(place);
  const pairWith = nearby(place, 4, (p) => p.kind !== place.kind);
  const alsoNearby = nearby(place, 4, (p) => p.kind === place.kind);
  const inIdeas = SUGGESTED_DATES.filter((d) => d.stops.some((s) => s.slug === place.slug));
  const mapsQuery = encodeURIComponent(
    `${place.name} ${place.area === "Various locations" ? "" : place.area} Singapore`,
  );

  const facts: [string, string][] = [
    [
      "Price",
      costLabel(place),
    ],
    ["Time to allow", formatDuration(place.durationMins)],
    ["Where", place.branches ? `${place.area} · also ${place.branches.filter((b) => b !== place.area).join(", ")}` : place.area],
    ["Setting", place.indoor ? "Indoors, so rain-proof" : "Outdoors, so check the weather"],
    ["Opening hours", place.hours ?? "Not checked yet. Confirm with the venue before you go."],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
        <Link href="/explore?tab=places" className="inline-flex h-11 items-center gap-2 hover:text-ink">
          <ArrowLeft size={16} aria-hidden /> Places
        </Link>
        <span aria-hidden> / </span>
        <Link href={`/explore?tab=places&category=${place.category}`} className="hover:text-ink">
          {cat.label}
        </Link>
      </nav>

      <div className="mt-4 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <figure>
          <div className="photo-grade aspect-[4/5] overflow-hidden rounded-card sm:aspect-[5/4] lg:aspect-[4/5]">
            <Photo photo={photo} priority sizes="(min-width: 1024px) 55vw, 100vw" />
          </div>
          {photo.kind === "unsplash" && (
            <figcaption className="mt-2 text-xs text-ink-soft">Photo: Unsplash. Sets the mood; may not be this exact venue.</figcaption>
          )}
        </figure>

        <div className="lg:pt-6">
          <p className="eyebrow">
            {cat.label}
            {place.cuisine && ` · ${place.cuisine}`} · {place.area}
          </p>
          <h1 className="mt-3 text-5xl sm:text-6xl">{place.name}</h1>
          {place.status === "closed" && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1 text-sm font-semibold text-bg">
              <Info size={16} aria-hidden /> Temporarily closed
            </p>
          )}
          <p className="mt-5 text-lg text-ink-soft">{place.blurb}</p>
          <p className="mt-4 text-sm">
            {place.vibes.map((v, i) => (
              <span key={v}>
                {i > 0 && <span className="text-ink-soft"> · </span>}
                <Link href={`/explore?tab=places&vibe=${v}`} className="underline decoration-line underline-offset-4 hover:decoration-ink">
                  {VIBES.find((x) => x.id === v)?.label}
                </Link>
              </span>
            ))}
          </p>

          <div className="mt-8 flex items-center gap-3">
            <AddToDateButton place={place} variant="primary" className="flex-1 sm:flex-none" />
            <FavoriteButton place={place} className="size-12 border border-line" />
          </div>

          <dl className="mt-10 border-t border-ink">
            {facts.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[8.5rem_1fr] gap-4 border-b border-line py-3.5 text-[15px]">
                <dt className="text-ink-soft">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex h-11 items-center gap-1.5 font-medium underline decoration-line underline-offset-4 hover:decoration-ink"
          >
            Directions and hours on Google Maps <ArrowUpRight size={16} aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          {(place.unverified || place.source === "blushhour") && (
            <p className="mt-3 flex gap-2 text-sm text-ink-soft">
              <Info size={18} className="shrink-0" aria-hidden />
              {place.unverified
                ? "Some details here are our best guess and still need checking."
                : "A BlushHour addition to round out the list."}
            </p>
          )}
        </div>
      </div>

      <section aria-labelledby="map" className="mt-20 border-t border-ink pt-6">
        <h2 id="map" className="text-4xl">
          On the map
        </h2>
        <div className="mt-6 overflow-hidden rounded-card border border-line">
          {place.lat != null ? (
            <PlaceMap place={place} nearby={[...pairWith, ...alsoNearby]} />
          ) : (
            <p className="p-10 text-center text-ink-soft">
              Several branches. Pick the one closest to the rest of your date.
            </p>
          )}
        </div>
        {place.lat != null && (
          <p className="mt-2 text-xs text-ink-soft">The pin marks the neighbourhood, not the exact address. Smaller pins are nearby spots.</p>
        )}
      </section>

      {pairWith.length > 0 && (
        <section className="mt-20 border-t border-ink pt-6" aria-labelledby="pair">
          <p className="eyebrow">Nearby</p>
          <h2 id="pair" className="mt-2 text-4xl">
            {place.kind === "activity" ? "Then, somewhere to eat" : "Before or after, something to do"}
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {pairWith.map((p) => (
              <li key={p.slug}>
                <PlaceCard place={p} sizes="(min-width: 1024px) 25vw, 50vw" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {inIdeas.length > 0 && (
        <section className="mt-20 border-t border-ink pt-6" aria-labelledby="ideas">
          <p className="eyebrow">Featured in</p>
          <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
            {inIdeas.map((d) => (
              <li key={d.slug}>
                <Link id="ideas" href={`/dates/${d.slug}`} className="font-display text-3xl hover:text-rose">
                  {d.title} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
