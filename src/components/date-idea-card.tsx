"use client";

import Link from "next/link";
import { ideaPhoto } from "@/data/photos";
import { formatSGD, suggestionCost } from "@/lib/itinerary";
import type { SuggestedDate } from "@/lib/types";
import { useCatalogue } from "./catalogue";
import { Photo } from "./photo";

export function DateIdeaCard({
  date,
  index,
  size = "md",
  sizes,
}: {
  date: SuggestedDate;
  index?: number;
  size?: "md" | "lg";
  sizes?: string;
}) {
  const cat = useCatalogue();
  const stops = date.stops.map((s) => cat.placeBySlug[s.slug]).filter(Boolean);
  return (
    <article className="group relative">
      <div
        className={`photo-grade relative overflow-hidden rounded-card ${size === "lg" ? "aspect-[4/5]" : "aspect-[4/3]"}`}
      >
        <Photo
          photo={ideaPhoto(date)}
          sizes={sizes}
          decorative
          className="transition duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <p className="eyebrow mt-4">
        {index != null && <span className="text-rose">No. {String(index + 1).padStart(2, "0")} · </span>}
        {date.tagline}
      </p>
      <h3 className={`mt-1.5 ${size === "lg" ? "text-4xl" : "text-[1.85rem]"}`}>
        <Link
          href={`/dates/${date.slug}`}
          className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-focus-within:underline"
        >
          {date.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm text-ink-soft">
        {stops.map((p) => p.name).join(" → ")}
      </p>
      <p className="mt-1 text-sm font-medium tabular">
        {stops.length} stops · about {formatSGD(suggestionCost(date, cat))} per person
      </p>
    </article>
  );
}
