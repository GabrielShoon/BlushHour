import {
  ArrowLeft,
  ArrowSquareOut,
  Clock,
  CurrencyCircleDollar,
  Info,
  MapPin,
  NotePencil,
  Storefront,
  Umbrella,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryIcon } from "@/components/icons";
import { PlaceMap } from "@/components/place-map";
import { AddToDateButton, FavoriteButton } from "@/components/place-actions";
import { PlaceArt } from "@/components/place-art";
import { PlaceCard } from "@/components/place-card";
import { CATEGORY_BY_ID, PRICE_LABEL, VIBES } from "@/data/categories";
import { PLACE_BY_SLUG, PLACES } from "@/data/places";
import { SUGGESTED_DATES } from "@/data/suggested-dates";
import { distanceKm, formatDuration, formatSGD, nearby } from "@/lib/itinerary";

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
  const pairWith = nearby(place, 4, (p) => p.kind !== place.kind);
  const alsoNearby = nearby(place, 4, (p) => p.kind === place.kind);
  const inIdeas = SUGGESTED_DATES.filter((d) => d.stops.some((s) => s.slug === place.slug));
  const mapsQuery = encodeURIComponent(`${place.name} ${place.area === "Various locations" ? "" : place.area} Singapore`);

  const facts = [
    {
      icon: CurrencyCircleDollar,
      label: "Price",
      value:
        place.priceLevel === 0
          ? "Free"
          : `${PRICE_LABEL[place.priceLevel]} · about ${formatSGD(place.costPerPerson)} per person`,
    },
    { icon: Clock, label: "Typical time", value: formatDuration(place.durationMins) },
    { icon: MapPin, label: "Area", value: place.area },
    {
      icon: Umbrella,
      label: "Setting",
      value: place.indoor ? "Indoors, rain-proof" : "Outdoors, so check the weather",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Link
        href="/discover"
        className="inline-flex h-11 items-center gap-2 rounded-full pr-3 text-sm font-semibold text-ink-soft hover:text-rose"
      >
        <ArrowLeft size={18} aria-hidden /> Back to discover
      </Link>

      <div className="mt-2 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Visual */}
        <div className="relative">
          <PlaceArt place={place} className="aspect-[4/3] rounded-card shadow-card lg:aspect-[5/4]" iconSize={96} />
          <p className="absolute bottom-3 left-3 rounded-full bg-surface/90 px-3 py-1 text-xs font-medium text-ink-soft backdrop-blur">
            Photos coming soon
          </p>
        </div>

        {/* Summary */}
        <div className="flex flex-col">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-rose">
            <CategoryIcon id={place.category} size={18} weight="bold" />
            {cat.label}
            {place.cuisine && <span className="text-ink-soft">· {place.cuisine}</span>}
          </p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{place.name}</h1>
          {place.status === "closed" && (
            <p className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-ink px-3 py-1 text-sm font-semibold text-bg">
              <Info size={16} aria-hidden /> Temporarily closed
            </p>
          )}
          <p className="mt-4 text-lg text-ink-soft">{place.blurb}</p>
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Vibes">
            {place.vibes.map((v) => (
              <li key={v}>
                <Link
                  href={`/discover?vibe=${v}`}
                  className="inline-block rounded-full bg-surface-2 px-3 py-1 text-sm font-semibold text-ink-soft hover:text-rose"
                >
                  {VIBES.find((x) => x.id === v)?.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center gap-3">
            <AddToDateButton place={place} size="lg" className="flex-1 sm:flex-none" />
            <FavoriteButton place={place} className="size-12 border border-line" />
          </div>

          {place.note && (
            <figure className="mt-6 rounded-card border border-line bg-surface p-4">
              <figcaption className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
                <NotePencil size={18} aria-hidden /> Curator&apos;s note
              </figcaption>
              <blockquote className="mt-1 font-display text-lg italic">“{place.note}”</blockquote>
            </figure>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <section aria-labelledby="details" className="rounded-card border border-line bg-surface p-6 shadow-card">
          <h2 id="details" className="text-2xl font-semibold">
            Good to know
          </h2>
          <dl className="mt-4 divide-y divide-line">
            {facts.map(({ icon: I, label, value }) => (
              <div key={label} className="flex gap-3 py-3">
                <I size={22} className="mt-0.5 shrink-0 text-rose" aria-hidden />
                <div>
                  <dt className="text-sm font-semibold text-ink-soft">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              </div>
            ))}
            <div className="flex gap-3 py-3">
              <Clock size={22} className="mt-0.5 shrink-0 text-rose" aria-hidden />
              <div>
                <dt className="text-sm font-semibold text-ink-soft">Opening hours</dt>
                <dd className="font-medium">
                  {place.hours ?? "Not verified yet. Check the venue before you go."}
                </dd>
              </div>
            </div>
            {place.branches && (
              <div className="flex gap-3 py-3">
                <Storefront size={22} className="mt-0.5 shrink-0 text-rose" aria-hidden />
                <div>
                  <dt className="text-sm font-semibold text-ink-soft">Also at</dt>
                  <dd className="font-medium">{place.branches.join(" · ")}</dd>
                </div>
              </div>
            )}
          </dl>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold hover:border-rose"
          >
            Directions & hours on Google Maps <ArrowSquareOut size={16} aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          {(place.unverified || place.source === "blushhour") && (
            <p className="mt-4 flex gap-2 text-sm text-ink-soft">
              <Info size={18} className="shrink-0" aria-hidden />
              {place.unverified
                ? "Some details here are BlushHour's best guess and still need checking."
                : "Added by BlushHour to round out the list."}
            </p>
          )}
        </section>

        <section aria-labelledby="map" className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
          <h2 id="map" className="sr-only">
            Map
          </h2>
          {place.lat != null ? (
            <>
              <PlaceMap place={place} nearby={[...pairWith, ...alsoNearby]} />
              <p className="border-t border-line px-4 py-2 text-sm text-ink-soft">
                The pin shows the area, not the exact address. Smaller pins are nearby spots.
              </p>
            </>
          ) : (
            <div className="grid h-full min-h-60 place-items-center p-6 text-center text-ink-soft">
              <div>
                <MapPin size={32} className="mx-auto" aria-hidden />
                <p className="mt-2 font-semibold text-ink">Several locations</p>
                <p>Pick the branch closest to the rest of your date.</p>
              </div>
            </div>
          )}
        </section>
      </div>

      {pairWith.length > 0 && (
        <section className="mt-14" aria-labelledby="pair">
          <h2 id="pair" className="text-3xl font-semibold">
            {place.kind === "activity" ? "Eat nearby" : "Things to do nearby"}
          </h2>
          <p className="mt-1 text-ink-soft">Good to combine into one date, sorted by distance.</p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pairWith.map((p) => (
              <li key={p.slug}>
                <PlaceCard place={p} />
                <p className="mt-1 px-1 text-xs text-ink-soft tabular">
                  ~{(distanceKm(place, p) ?? 0).toFixed(1)} km away
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {inIdeas.length > 0 && (
        <section className="mt-14" aria-labelledby="ideas">
          <h2 id="ideas" className="text-3xl font-semibold">
            Featured in
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {inIdeas.map((d) => (
              <li key={d.slug}>
                <Link
                  href={`/dates/${d.slug}`}
                  className="inline-flex h-11 items-center rounded-full border border-line bg-surface px-4 font-semibold hover:border-rose"
                >
                  {d.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
