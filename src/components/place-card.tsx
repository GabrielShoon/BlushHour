import Link from "next/link";
import { CATEGORY_BY_ID, PRICE_LABEL } from "@/data/categories";
import { placePhoto } from "@/data/photos";
import { formatDuration } from "@/lib/itinerary";
import type { Place } from "@/lib/types";
import { Photo } from "./photo";
import { AddToDateButton, FavoriteButton } from "./place-actions";

export function PlaceCard({
  place,
  sizes,
  priority,
}: {
  place: Place;
  sizes?: string;
  priority?: boolean;
}) {
  const cat = CATEGORY_BY_ID[place.category];
  return (
    <article className="group relative">
      <div className="photo-grade relative aspect-[4/5] overflow-hidden rounded-card">
        <Photo
          photo={placePhoto(place)}
          sizes={sizes}
          priority={priority}
          decorative
          className="transition duration-700 ease-out group-hover:scale-[1.04]"
        />
        <FavoriteButton place={place} className="absolute right-3 top-3 z-10" />
        <AddToDateButton place={place} className="absolute bottom-3 left-3 z-10" />
        {place.status === "closed" && (
          <span className="absolute bottom-3 left-3 rounded-full bg-ink/85 px-3 py-1.5 text-xs font-semibold text-bg">
            Temporarily closed
          </span>
        )}
      </div>
      <p className="eyebrow mt-4">
        {cat.label} · {place.area}
      </p>
      <h3 className="mt-1.5 text-[1.65rem]">
        <Link
          href={`/places/${place.slug}`}
          className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-focus-within:underline"
        >
          {place.name}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-ink-soft tabular">
        {PRICE_LABEL[place.priceLevel]} · {formatDuration(place.durationMins)}
      </p>
    </article>
  );
}
