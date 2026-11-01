import { Clock, MapPin } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { CATEGORY_BY_ID, PRICE_LABEL } from "@/data/categories";
import { formatDuration } from "@/lib/itinerary";
import type { Place } from "@/lib/types";
import { AddToDateButton, FavoriteButton } from "./place-actions";
import { PlaceArt } from "./place-art";

export function PlaceCard({ place }: { place: Place }) {
  const cat = CATEGORY_BY_ID[place.category];
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative">
        <PlaceArt place={place} className="aspect-[4/3]" />
        <FavoriteButton place={place} className="absolute right-3 top-3 z-10" />
        <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold backdrop-blur">
          {cat.label}
        </span>
        {place.status === "closed" && (
          <span className="absolute bottom-3 left-3 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-bg">
            Temporarily closed
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-xl font-semibold">
            <Link
              href={`/places/${place.slug}`}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {place.name}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{place.blurb}</p>
        </div>
        <dl className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
          <div className="flex items-center gap-1">
            <dt className="sr-only">Area</dt>
            <MapPin size={16} aria-hidden />
            <dd>{place.area}</dd>
          </div>
          <div className="flex items-center gap-1">
            <dt className="sr-only">Typical time</dt>
            <Clock size={16} aria-hidden />
            <dd>{formatDuration(place.durationMins)}</dd>
          </div>
          <div>
            <dt className="sr-only">Price</dt>
            <dd className="font-semibold text-ink">{PRICE_LABEL[place.priceLevel]}</dd>
          </div>
        </dl>
        <AddToDateButton place={place} className="relative z-10 w-full" />
      </div>
    </article>
  );
}
