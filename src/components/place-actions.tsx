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
      aria-label={on ? `Remove ${place.name} from favourites` : `Save ${place.name} to favourites`}
      className={`grid size-11 place-items-center rounded-full bg-surface/90 text-rose shadow-card backdrop-blur transition hover:scale-105 active:scale-95 ${className}`}
    >
      <Heart size={20} weight={on ? "fill" : "bold"} aria-hidden />
    </button>
  );
}

export function AddToDateButton({
  place,
  size = "md",
  className = "",
}: {
  place: Place;
  size?: "md" | "lg";
  className?: string;
}) {
  const { addToDraft, inDraft, ready } = useApp();
  const added = ready && inDraft(place.slug);
  const closed = place.status === "closed";
  const pad = size === "lg" ? "h-12 px-6 text-base" : "h-11 px-4 text-sm";
  return (
    <button
      type="button"
      disabled={closed}
      onClick={() => addToDraft(place.slug)}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 ${pad} ${
        added
          ? "bg-rose-soft text-ink hover:bg-[color-mix(in_oklab,var(--rose)_20%,var(--surface))]"
          : "bg-rose text-rose-ink hover:brightness-110"
      } ${className}`}
    >
      {added ? <Check size={18} weight="bold" aria-hidden /> : <Plus size={18} weight="bold" aria-hidden />}
      {closed ? "Currently closed" : added ? "Add again" : "Add to date"}
    </button>
  );
}
