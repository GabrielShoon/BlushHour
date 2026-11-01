"use client";

import { MagnifyingGlass, Plus, X } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/components/app-state";
import { CategoryIcon } from "@/components/icons";
import { CATEGORY_BY_ID, PRICE_LABEL } from "@/data/categories";
import { PLACES } from "@/data/places";
import { alternatives, distanceKm, formatSGD, nearby } from "@/lib/itinerary";
import type { Place } from "@/lib/types";

/**
 * Modal for adding or swapping a stop. Shows context-aware picks first
 * (similar spots for a swap, nearby ones after the last stop, then favourites)
 * with search over the whole catalogue.
 */
export function PlacePicker({
  title,
  replacing,
  anchor,
  exclude,
  onPick,
  onClose,
}: {
  title: string;
  replacing?: Place;
  anchor?: Place;
  exclude: string[];
  onPick: (slug: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { favorites } = useApp();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "activity" | "food">("all");

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const picks = useMemo(() => {
    if (replacing) return { label: "Similar spots nearby", items: alternatives(replacing, [...exclude, replacing.slug]) };
    if (anchor) {
      const want = anchor.kind === "activity" ? "food" : "activity";
      return { label: `Close to ${anchor.name}`, items: nearby(anchor, 6, (p) => p.kind === want && !exclude.includes(p.slug)) };
    }
    const favs = PLACES.filter((p) => favorites.includes(p.slug));
    return { label: "Your favourites", items: favs.slice(0, 6) };
  }, [replacing, anchor, exclude, favorites]);

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return PLACES.filter((p) => p.status !== "closed")
      .filter((p) => kind === "all" || p.kind === kind)
      .filter((p) => {
        if (!words.length) return true;
        const hay = `${p.name} ${p.area} ${p.cuisine ?? ""} ${p.category} ${p.vibes.join(" ")}`.toLowerCase();
        return words.every((w) => hay.includes(w));
      });
  }, [q, kind]);

  const Row = ({ p }: { p: Place }) => {
    const from = replacing ?? anchor;
    const d = from ? distanceKm(from, p) : null;
    return (
      <li>
        <button
          type="button"
          onClick={() => onPick(p.slug)}
          className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-surface-2"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-rose-soft text-ink">
            <CategoryIcon id={p.category} size={22} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold">{p.name}</span>
            <span className="block truncate text-sm text-ink-soft">
              {CATEGORY_BY_ID[p.category].label} · {p.area} · {PRICE_LABEL[p.priceLevel]} ~{formatSGD(p.costPerPerson)}
              {d != null && ` · ${d.toFixed(1)} km`}
            </span>
          </span>
          <Plus size={20} weight="bold" className="shrink-0 text-rose" aria-hidden />
          <span className="sr-only">{replacing ? "Swap in" : "Add"}</span>
        </button>
      </li>
    );
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      aria-labelledby="picker-title"
      className="m-auto max-h-[85dvh] w-[min(42rem,calc(100vw-2rem))] overflow-hidden rounded-card border border-line bg-surface p-0 text-ink shadow-lift backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[85dvh] flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-line p-4">
          <h2 id="picker-title" className="truncate text-2xl font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Close"
            className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-surface-2"
          >
            <X size={20} aria-hidden />
          </button>
        </div>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search</span>
            <MagnifyingGlass
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
              aria-hidden
            />
            <input
              autoFocus
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, area, cuisine…"
              className="h-11 w-full rounded-full border border-line bg-bg pl-10 pr-4 focus:border-rose"
            />
          </label>
          <div className="flex rounded-full border border-line p-1" role="radiogroup" aria-label="Type">
            {(["all", "activity", "food"] as const).map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                onClick={() => setKind(k)}
                className={`h-9 rounded-full px-3 text-sm font-semibold ${kind === k ? "bg-ink text-bg" : "text-ink-soft"}`}
              >
                {k === "all" ? "All" : k === "activity" ? "Do" : "Eat"}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto overscroll-contain p-2">
          {!q && picks.items.length > 0 && (
            <>
              <h3 className="px-2 pt-2 text-xs font-semibold uppercase tracking-wider text-rose">{picks.label}</h3>
              <ul className="mt-1">
                {picks.items.map((p) => (
                  <Row key={p.slug} p={p} />
                ))}
              </ul>
              <h3 className="px-2 pt-4 text-xs font-semibold uppercase tracking-wider text-ink-soft">Everything</h3>
            </>
          )}
          <ul className="mt-1">
            {results.map((p) => (
              <Row key={p.slug} p={p} />
            ))}
          </ul>
          {results.length === 0 && (
            <p className="p-6 text-center text-ink-soft">No matches. Try an area or a cuisine.</p>
          )}
        </div>
      </div>
    </dialog>
  );
}
