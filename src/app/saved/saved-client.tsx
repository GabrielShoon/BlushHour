"use client";

import { CalendarBlank, Heart, MapTrifold, PencilSimple, SignOut, Trash } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/app-state";
import { PlaceCard } from "@/components/place-card";
import { PLACE_BY_SLUG } from "@/data/places";
import { formatSGD, formatTime, schedule } from "@/lib/itinerary";
import { supabaseConfigured } from "@/lib/supabase/client";
import type { Itinerary } from "@/lib/types";

function PlanCard({ plan }: { plan: Itinerary }) {
  const { loadDraft, deletePlan } = useApp();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const s = schedule(plan);
  const names = s.stops.map((x) => x.place.name);

  return (
    <article className="flex flex-col rounded-card border border-line bg-surface p-5 shadow-card">
      <h3 className="text-2xl font-semibold">{plan.title || "Untitled date"}</h3>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft tabular">
        <CalendarBlank size={16} aria-hidden />
        {plan.date
          ? new Date(plan.date + "T00:00").toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short" })
          : "No date set"}
        {s.stops.length > 0 && ` · ${formatTime(s.stops[0].start)}–${formatTime(s.end)}`}
      </p>
      <p className="mt-3 line-clamp-2 text-sm">{names.join(" → ") || "No stops"}</p>
      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="font-display text-xl font-semibold tabular">{formatSGD(s.totalCost)}</span>
        {confirming ? (
          <div className="flex items-center gap-1 text-sm">
            <button
              type="button"
              onClick={() => deletePlan(plan.id)}
              className="h-10 rounded-full bg-danger px-3 font-semibold text-white"
            >
              Delete
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="h-10 px-3 font-semibold">
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label={`Delete ${plan.title}`}
              className="grid size-10 place-items-center rounded-full text-ink-soft hover:bg-rose-soft hover:text-danger"
            >
              <Trash size={18} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => {
                loadDraft(plan, { keepId: true });
                router.push("/plan");
              }}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-rose px-4 text-sm font-semibold text-rose-ink"
            >
              <PencilSimple size={16} aria-hidden /> Edit
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export function SavedClient() {
  const { ready, user, favorites, plans, signOut } = useApp();
  const favPlaces = favorites.map((s) => PLACE_BY_SLUG[s]).filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold sm:text-5xl">Saved</h1>
          <p className="mt-2 text-ink-soft">
            {user ? `Signed in as ${user.email}` : "Saved on this device only."}
          </p>
        </div>
        {user ? (
          <button
            type="button"
            onClick={signOut}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold hover:border-danger hover:text-danger"
          >
            <SignOut size={18} aria-hidden /> Sign out
          </button>
        ) : (
          supabaseConfigured && (
            <Link
              href="/login?next=/saved"
              className="inline-flex h-11 items-center rounded-full bg-rose px-5 text-sm font-semibold text-rose-ink"
            >
              Sign in to sync across devices
            </Link>
          )
        )}
      </div>

      <section className="mt-10" aria-labelledby="plans">
        <h2 id="plans" className="flex items-center gap-2 text-3xl font-semibold">
          <MapTrifold size={28} className="text-rose" aria-hidden /> Date plans
        </h2>
        {!ready ? (
          <div className="mt-4 h-40 animate-pulse rounded-card bg-surface-2" />
        ) : plans.length ? (
          <ul className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((p) => (
              <li key={p.id} className="flex">
                <PlanCard plan={p} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-card border border-dashed border-line p-6 text-ink-soft">
            No saved dates yet.{" "}
            <Link href="/plan" className="font-semibold text-rose hover:underline">
              Open the builder
            </Link>{" "}
            and hit save when you&apos;re happy with it.
          </p>
        )}
      </section>

      <section className="mt-14" aria-labelledby="favs">
        <h2 id="favs" className="flex items-center gap-2 text-3xl font-semibold">
          <Heart size={28} weight="fill" className="text-rose" aria-hidden /> Favourites
        </h2>
        {!ready ? (
          <div className="mt-4 h-40 animate-pulse rounded-card bg-surface-2" />
        ) : favPlaces.length ? (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favPlaces.map((p) => (
              <li key={p.slug}>
                <PlaceCard place={p} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-card border border-dashed border-line p-6 text-ink-soft">
            Tap the heart on anything in{" "}
            <Link href="/discover" className="font-semibold text-rose hover:underline">
              Discover
            </Link>{" "}
            to keep it here.
          </p>
        )}
      </section>
    </div>
  );
}
