"use client";

import { Shuffle } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/app-state";
import { MapView } from "@/components/map";
import { PLACE_BY_SLUG } from "@/data/places";
import { SUGGESTED_BY_SLUG } from "@/data/suggested-dates";
import { itineraryFromSuggestion, stopFor } from "@/lib/itinerary";

export function RemixButton({ slug }: { slug: string }) {
  const { draft, loadDraft, ready } = useApp();
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const idea = SUGGESTED_BY_SLUG[slug];

  const replace = () => {
    loadDraft(itineraryFromSuggestion(idea));
    router.push("/plan");
  };
  const append = () => {
    loadDraft(
      { ...draft, stops: [...draft.stops, ...idea.stops.map((s) => stopFor(s.slug, s.durationMins))] },
      { keepId: true },
    );
    router.push("/plan");
  };

  if (asking) {
    return (
      <div className="rise flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="text-sm font-medium">
          Your builder already has {draft.stops.length} {draft.stops.length === 1 ? "stop" : "stops"}.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={append} className="h-11 rounded-full bg-rose px-5 font-semibold text-rose-ink hover:brightness-110">
            Add these stops to it
          </button>
          <button type="button" onClick={replace} className="h-11 rounded-full border border-ink px-5 font-semibold hover:bg-surface-2">
            Start over with this idea
          </button>
          <button type="button" onClick={() => setAsking(false)} className="h-11 px-3 font-medium text-ink-soft hover:text-ink">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => (ready && draft.stops.length ? setAsking(true) : replace())}
      className="inline-flex h-12 items-center gap-2 rounded-full bg-rose px-7 font-semibold text-rose-ink transition hover:brightness-110"
    >
      <Shuffle size={18} aria-hidden /> Remix this date
    </button>
  );
}

export function RouteMap({ slug }: { slug: string }) {
  const points = SUGGESTED_BY_SLUG[slug].stops
    .map((s) => PLACE_BY_SLUG[s.slug])
    .filter((p) => p?.lat != null)
    .map((p, i) => ({ lat: p.lat!, lng: p.lng!, title: p.name, label: String(i + 1), href: `/places/${p.slug}` }));
  return <MapView points={points} route className="h-96 w-full lg:h-[32rem]" />;
}
