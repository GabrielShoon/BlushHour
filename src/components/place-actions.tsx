"use client";

import { Check, Heart, Plus } from "@phosphor-icons/react/dist/ssr";
import type { Place } from "@/lib/types";
import { useApp } from "./app-state";

export function FavoriteButton({ place, className = "" }: { place: Place; className?: string }) {
  const { isFavorite, toggleFavorite, ready } = useApp();
  const on = ready && isFavorite(place.slug);
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(place.slug)}
      aria-pressed={on}
      aria-label={on ? `Remove ${place.name} from saved` : `Save ${place.name}`}
      className={`grid size-11 place-items-center rounded-full bg-surface/90 text-rose backdrop-blur transition hover:bg-surface active:scale-95 ${className}`}
    >
      <Heart size={20} weight={on ? "fill" : "regular"} aria-hidden />
    </button>
  );
}

/**
 * `chip` sits on top of a photo in cards; `primary` is the large button on
 * detail pages.
 */
export function AddToDateButton({
  place,
  variant = "chip",
  className = "",
}: {
  place: Place;
  variant?: "chip" | "primary";
  className?: string;
}) {
  const { addToDraft, inDraft, ready } = useApp();
  const added = ready && inDraft(place.slug);
  const closed = place.status === "closed";

  if (variant === "chip") {
    if (closed) return null;
    return (
      <button
        type="button"
        onClick={() => addToDraft(place.slug)}
        aria-label={added ? `${place.name} is in your date. Add it again` : `Add ${place.name} to your date`}
        className={`inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold backdrop-blur transition active:scale-95 ${
          added ? "bg-ink/85 text-bg" : "bg-surface/90 text-ink hover:bg-surface"
        } ${className}`}
      >
        {added ? <Check size={16} weight="bold" aria-hidden /> : <Plus size={16} weight="bold" aria-hidden />}
        {added ? "Added" : "Add"}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={closed}
      onClick={() => addToDraft(place.slug)}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 ${
        added ? "border border-ink text-ink hover:bg-surface-2" : "bg-rose text-rose-ink hover:brightness-110"
      } ${className}`}
    >
      {added ? <Check size={18} weight="bold" aria-hidden /> : <Plus size={18} weight="bold" aria-hidden />}
      {closed ? "Currently closed" : added ? "In your date · add again" : "Add to my date"}
    </button>
  );
}
