"use client";

import {
  FunnelSimple,
  GridFour,
  MagnifyingGlass,
  MapTrifold,
  X,
} from "@phosphor-icons/react/dist/ssr";
import { useEffect, useMemo, useState } from "react";
import { CategoryIcon } from "@/components/icons";
import { MapView } from "@/components/map";
import { PlaceCard } from "@/components/place-card";
import { CATEGORIES, PRICE_LABEL, VIBES } from "@/data/categories";
import { AREA_NAMES, PLACES } from "@/data/places";
import type { Place } from "@/lib/types";

export interface DiscoverFilters {
  q: string;
  kind: "all" | "activity" | "food";
  category: string;
  vibe: string;
  area: string;
  maxPrice: number;
  time: string;
  indoor: boolean;
  sort: "recommended" | "price-asc" | "price-desc" | "name";
}

const DEFAULTS: DiscoverFilters = {
  q: "",
  kind: "all",
  category: "",
  vibe: "",
  area: "",
  maxPrice: 4,
  time: "",
  indoor: false,
  sort: "recommended",
};

function matches(p: Place, f: DiscoverFilters) {
  if (f.kind !== "all" && p.kind !== f.kind) return false;
  if (f.category && p.category !== f.category) return false;
  if (f.vibe && !p.vibes.includes(f.vibe as Place["vibes"][number])) return false;
  if (f.area && p.area !== f.area) return false;
  if (p.priceLevel > f.maxPrice) return false;
  if (f.time && p.timeOfDay !== "any" && p.timeOfDay !== f.time) return false;
  if (f.indoor && !p.indoor) return false;
  if (f.q) {
    const hay = [p.name, p.area, p.blurb, p.note, p.cuisine, p.category, ...p.vibes, ...(p.branches ?? [])]
      .join(" ")
      .toLowerCase();
    if (!f.q.toLowerCase().split(/\s+/).every((w) => hay.includes(w))) return false;
  }
  return true;
}

const selectCls =
  "h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm font-medium text-ink focus:border-rose";

export function DiscoverClient({ initial }: { initial: DiscoverFilters }) {
  const [f, setF] = useState<DiscoverFilters>(initial);
  const [view, setView] = useState<"grid" | "map">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const set = <K extends keyof DiscoverFilters>(k: K, v: DiscoverFilters[K]) => setF((x) => ({ ...x, [k]: v }));

  // Keep the URL in sync so filtered views can be shared and survive back/forward.
  useEffect(() => {
    const params = new URLSearchParams();
    if (f.q) params.set("q", f.q);
    if (f.kind !== "all") params.set("kind", f.kind);
    if (f.category) params.set("category", f.category);
    if (f.vibe) params.set("vibe", f.vibe);
    if (f.area) params.set("area", f.area);
    if (f.maxPrice < 4) params.set("price", String(f.maxPrice));
    if (f.time) params.set("time", f.time);
    if (f.indoor) params.set("indoor", "1");
    if (f.sort !== "recommended") params.set("sort", f.sort);
    const qs = params.toString();
    const t = setTimeout(() => window.history.replaceState(null, "", qs ? `?${qs}` : location.pathname), 250);
    return () => clearTimeout(t);
  }, [f]);

  const results = useMemo(() => {
    const list = PLACES.filter((p) => matches(p, f));
    const open = (p: Place) => (p.status === "closed" ? 1 : 0);
    switch (f.sort) {
      case "price-asc":
        return list.sort((a, b) => open(a) - open(b) || a.costPerPerson - b.costPerPerson);
      case "price-desc":
        return list.sort((a, b) => open(a) - open(b) || b.costPerPerson - a.costPerPerson);
      case "name":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list.sort((a, b) => open(a) - open(b));
    }
  }, [f]);

  const visibleCats = CATEGORIES.filter((c) => f.kind === "all" || c.kind === f.kind);
  const activeCount =
    [f.vibe, f.area, f.time].filter(Boolean).length + (f.maxPrice < 4 ? 1 : 0) + (f.indoor ? 1 : 0);
  const mapPoints = results
    .filter((p) => p.lat != null && p.lng != null)
    .map((p) => ({ lat: p.lat!, lng: p.lng!, title: p.name, href: `/places/${p.slug}` }));

  return (
    <div className="mt-6">
      {/* Search + kind */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search places</span>
          <MagnifyingGlass
            size={20}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
            aria-hidden
          />
          <input
            type="search"
            value={f.q}
            onChange={(e) => set("q", e.target.value)}
            placeholder="Try “sentosa”, “workshop”, “japanese”, “cats”"
            className="h-12 w-full rounded-full border border-line bg-surface pl-12 pr-4 text-base shadow-card placeholder:text-ink-soft/70 focus:border-rose"
          />
        </label>
        <div role="radiogroup" aria-label="Type" className="flex rounded-full border border-line bg-surface p-1">
          {(["all", "activity", "food"] as const).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={f.kind === k}
              onClick={() => setF((x) => ({ ...x, kind: k, category: "" }))}
              className={`h-10 rounded-full px-4 text-sm font-semibold transition ${
                f.kind === k ? "bg-ink text-bg" : "text-ink-soft hover:text-ink"
              }`}
            >
              {k === "all" ? "Everything" : k === "activity" ? "Activities" : "Food & drinks"}
            </button>
          ))}
        </div>
      </div>

      {/* Category chips */}
      <div className="-mx-4 mt-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap" aria-label="Categories">
          <li>
            <button
              type="button"
              aria-pressed={!f.category}
              onClick={() => set("category", "")}
              className={`h-10 rounded-full border px-4 text-sm font-semibold transition ${
                !f.category ? "border-rose bg-rose-soft text-ink" : "border-line bg-surface text-ink-soft hover:border-rose"
              }`}
            >
              All
            </button>
          </li>
          {visibleCats.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                aria-pressed={f.category === c.id}
                onClick={() => set("category", f.category === c.id ? "" : c.id)}
                className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${
                  f.category === c.id
                    ? "border-rose bg-rose-soft text-ink"
                    : "border-line bg-surface text-ink-soft hover:border-rose"
                }`}
              >
                <CategoryIcon id={c.id} size={18} />
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Toolbar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            aria-expanded={showFilters}
            aria-controls="filters"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold hover:border-rose"
          >
            <FunnelSimple size={18} aria-hidden /> Filters
            {activeCount > 0 && (
              <span className="grid min-w-5 place-items-center rounded-full bg-rose px-1.5 text-xs text-rose-ink tabular">
                {activeCount}
              </span>
            )}
          </button>
          {(activeCount > 0 || f.q || f.category || f.kind !== "all") && (
            <button
              type="button"
              onClick={() => setF(DEFAULTS)}
              className="inline-flex h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-ink-soft hover:text-rose"
            >
              <X size={16} aria-hidden /> Clear all
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-ink-soft tabular" aria-live="polite">
            {results.length} {results.length === 1 ? "place" : "places"}
          </p>
          <div className="flex rounded-full border border-line bg-surface p-1" role="group" aria-label="View">
            <button
              type="button"
              aria-pressed={view === "grid"}
              aria-label="Grid view"
              onClick={() => setView("grid")}
              className={`grid size-9 place-items-center rounded-full ${view === "grid" ? "bg-ink text-bg" : "text-ink-soft"}`}
            >
              <GridFour size={18} aria-hidden />
            </button>
            <button
              type="button"
              aria-pressed={view === "map"}
              aria-label="Map view"
              onClick={() => setView("map")}
              className={`grid size-9 place-items-center rounded-full ${view === "map" ? "bg-ink text-bg" : "text-ink-soft"}`}
            >
              <MapTrifold size={18} aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div
          id="filters"
          className="rise mt-3 grid gap-4 rounded-card border border-line bg-surface p-4 shadow-card sm:grid-cols-2 lg:grid-cols-6"
        >
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Vibe
            <select className={selectCls} value={f.vibe} onChange={(e) => set("vibe", e.target.value)}>
              <option value="">Any vibe</option>
              {VIBES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Area
            <select className={selectCls} value={f.area} onChange={(e) => set("area", e.target.value)}>
              <option value="">Anywhere</option>
              {AREA_NAMES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Max budget
            <select
              className={selectCls}
              value={f.maxPrice}
              onChange={(e) => set("maxPrice", Number(e.target.value))}
            >
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n === 4 ? "Any price" : n === 0 ? "Free only" : `Up to ${PRICE_LABEL[n]}`}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Time of day
            <select className={selectCls} value={f.time} onChange={(e) => set("time", e.target.value)}>
              <option value="">Any time</option>
              <option value="day">Daytime</option>
              <option value="evening">Evening</option>
              <option value="night">Late night</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Sort by
            <select
              className={selectCls}
              value={f.sort}
              onChange={(e) => set("sort", e.target.value as DiscoverFilters["sort"])}
            >
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name A–Z</option>
            </select>
          </label>
          <label className="flex items-center gap-3 self-end rounded-xl border border-line px-3 py-2.5 text-sm font-semibold">
            <input
              type="checkbox"
              checked={f.indoor}
              onChange={(e) => set("indoor", e.target.checked)}
              className="size-5 accent-[var(--rose)]"
            />
            Rain-proof only
          </label>
        </div>
      )}

      {/* Results */}
      {results.length === 0 ? (
        <div className="mt-10 rounded-card border border-dashed border-line p-10 text-center">
          <p className="font-display text-2xl font-semibold">Nothing matches that combo.</p>
          <p className="mt-2 text-ink-soft">Try fewer filters, or search for an area like “Chinatown”.</p>
          <button
            type="button"
            onClick={() => setF(DEFAULTS)}
            className="mt-4 h-11 rounded-full bg-rose px-5 font-semibold text-rose-ink"
          >
            Reset filters
          </button>
        </div>
      ) : view === "map" ? (
        <div className="mt-6 overflow-hidden rounded-card border border-line shadow-card">
          <MapView points={mapPoints} className="h-[65vh] w-full" />
          {mapPoints.length < results.length && (
            <p className="border-t border-line bg-surface px-4 py-2 text-sm text-ink-soft">
              {results.length - mapPoints.length} places have several locations and aren&apos;t shown on the map.
            </p>
          )}
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((p, i) => (
            <li key={p.slug} className="rise" style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}>
              <PlaceCard place={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
