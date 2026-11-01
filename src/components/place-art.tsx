import { CATEGORY_BY_ID } from "@/data/categories";
import type { Place } from "@/lib/types";
import { CategoryIcon, HUE_VAR } from "./icons";

function seed(s: string) {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Generated cover art for a place until real photos are uploaded: two soft
 * blobs in the category colour and the category icon. Deterministic per slug.
 */
export function PlaceArt({
  place,
  className = "",
  iconSize = 44,
}: {
  place: Place;
  className?: string;
  iconSize?: number;
}) {
  const cat = CATEGORY_BY_ID[place.category];
  const h = seed(place.slug);
  const x1 = 15 + (h % 50);
  const y1 = 10 + ((h >> 4) % 40);
  const x2 = 50 + ((h >> 8) % 45);
  const y2 = 45 + ((h >> 12) % 45);
  const rot = ((h >> 16) % 24) - 12;
  const color = HUE_VAR[cat.hue];
  return (
    <div
      className={`relative overflow-hidden bg-surface-2 ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle at ${x1}% ${y1}%, color-mix(in oklab, ${color} 70%, transparent) 0 22%, transparent 48%), radial-gradient(circle at ${x2}% ${y2}%, color-mix(in oklab, ${color} 45%, var(--apricot)) 0 18%, transparent 52%)`,
      }}
      aria-hidden
    >
      <div className="grain absolute inset-0 opacity-60" />
      <div
        className="absolute inset-0 grid place-items-center text-ink/80"
        style={{ transform: `rotate(${rot}deg)` }}
      >
        <CategoryIcon id={place.category} size={iconSize} />
      </div>
    </div>
  );
}
