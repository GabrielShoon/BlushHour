"use client";

import {
  GridFour,
  MagnifyingGlass,
  MapTrifold,
  SlidersHorizontal,
  X,
} from "@phosphor-icons/react/dist/ssr";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { DateIdeaCard } from "@/components/date-idea-card";
import { MapView } from "@/components/map";
import { PlaceCard } from "@/components/place-card";
import { CATEGORIES, CATEGORY_BY_ID, OCCASIONS, VIBES } from "@/data/categories";
import { COLLECTION_BY_SLUG } from "@/data/collections";
import { useCatalogue } from "@/components/catalogue";
import { suggestionCost } from "@/lib/itinerary";
import type { Place } from "@/lib/types";

export interface ExploreState {
  tab: "ideas" | "places";
  q: string;
  kind: "all" | "activity" | "food";
  category: string;
  collection: string;
  vibe: string;
  area: string;
  /** Max S$ per person for places; null = any. */
  maxCost: number | null;
  time: string;
  indoor: boolean;
  sort: "recommended" | "price-asc" | "price-desc" | "name";
  mood: string;
  occasion: string;
  /** Max S$ per person for a whole date idea; null = any. */
  ideaMax: number | null;
}

const KINDS = [
  ["all", "Everything"],
  ["activity", "Things to do"],
  ["food", "Food & drinks"],
] as const;

const PLACE_RESET: Partial<ExploreState> = {
  q: "",
  kind: "all",
  category: "",
  collection: "",
  vibe: "",
  area: "",
  maxCost: null,
  time: "",
  indoor: false,
  sort: "recommended",
};

function matches(p: Place, f: ExploreState) {
  if (f.collection && !COLLECTION_BY_SLUG[f.collection]?.match(p)) return false;
  if (f.kind !== "all" && p.kind !== f.kind) return false;
  if (f.category && p.category !== f.category) return false;
  if (f.vibe && !p.vibes.includes(f.vibe as Place["vibes"][number])) return false;
  if (f.area && p.area !== f.area) return false;
  if (f.maxCost != null && p.costPerPerson > f.maxCost) return false;
  if (f.time && p.timeOfDay !== "any" && p.timeOfDay !== f.time) return false;
  if (f.indoor && !p.indoor) return false;
  if (f.q) {
    const hay = [p.name, p.area, p.blurb, p.cuisine, CATEGORY_BY_ID[p.category].label, ...p.vibes, ...(p.branches ?? [])]
      .join(" ")
      .toLowerCase();
    if (!f.q.toLowerCase().split(/\s+/).every((w) => hay.includes(w))) return false;
  }
  return true;
}

/* ------------------------------------------------------------------ */

function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition ${
        on ? "border-ink bg-ink text-bg" : "border-line text-ink-soft hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-line py-5">
      <legend className="eyebrow mb-3 float-left w-full">{label}</legend>
      <div className="clear-both flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

/** Slider positions in S$ per person; null is "any budget". */
const PLACE_STOPS: (number | null)[] = [0, 10, 20, 30, 40, 50, 75, 100, 150, 200, null];
const IDEA_STOPS: (number | null)[] = [20, 30, 50, 75, 100, 150, 200, 300, null];

function budgetLabel(v: number | null) {
  if (v == null) return "Any budget";
  return v === 0 ? "Free only" : `Up to S$${v}`;
}

function BudgetSlider({
  label,
  stops,
  value,
  onChange,
}: {
  label: string;
  stops: (number | null)[];
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  // Snap any value from the URL to the nearest stop at or above it.
  const idx = value == null ? stops.length - 1 : Math.max(0, stops.findIndex((s) => s == null || s >= value));
  const pct = (idx / (stops.length - 1)) * 100;
  const text = budgetLabel(stops[idx]);
  return (
    <div className="border-t border-line py-5">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor="budget-slider" className="eyebrow">
          {label}
        </label>
        <output htmlFor="budget-slider" className="font-display text-2xl tabular">
          {text}
        </output>
      </div>
      <input
        id="budget-slider"
        type="range"
        min={0}
        max={stops.length - 1}
        step={1}
        value={idx}
        onChange={(e) => onChange(stops[Number(e.target.value)])}
        aria-valuetext={text}
        className="bh-range mt-4 w-full"
        style={{ ["--pct" as string]: `${pct}%` }}
      />
      <div className="mt-1 flex justify-between text-xs text-ink-soft tabular">
        <span>{stops[0] === 0 ? "Free" : `S$${stops[0]}`}</span>
        <span>Any</span>
      </div>
    </div>
  );
}

function RefineSheet({
  f,
  set,
  count,
  onClose,
}: {
  f: ExploreState;
  set: (patch: Partial<ExploreState>) => void;
  count: number;
  onClose: () => void;
}) {
  const { areas } = useCatalogue();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => ref.current?.showModal(), []);
  const close = () => ref.current?.close();
  const selectCls = "h-11 w-full rounded-full border border-line bg-surface px-4 text-sm text-ink focus:border-ink";

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && close()}
      aria-labelledby="refine-title"
      className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-md bg-bg p-0 text-ink backdrop:bg-ink/40 backdrop:backdrop-blur-[2px] [animation:sheet-in_320ms_cubic-bezier(0.2,0.8,0.2,1)]"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 id="refine-title" className="text-3xl">
            Refine
          </h2>
          <button type="button" onClick={close} aria-label="Close" className="grid size-11 place-items-center rounded-full hover:bg-surface-2">
            <X size={20} aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-6">
          {f.tab === "ideas" ? (
            <>
              <Field label="Occasion">
                {OCCASIONS.map((o) => (
                  <Pill key={o.id} on={f.occasion === o.id} onClick={() => set({ occasion: f.occasion === o.id ? "" : o.id })}>
                    {o.label}
                  </Pill>
                ))}
              </Field>
              <BudgetSlider
                label="Budget per person, whole date"
                stops={IDEA_STOPS}
                value={f.ideaMax}
                onChange={(v) => set({ ideaMax: v })}
              />
            </>
          ) : (
            <>
              <Field label="Category">
                {CATEGORIES.filter((c) => f.kind === "all" || c.kind === f.kind).map((c) => (
                  <Pill key={c.id} on={f.category === c.id} onClick={() => set({ category: f.category === c.id ? "" : c.id })}>
                    {c.label}
                  </Pill>
                ))}
              </Field>
              <Field label="Vibe">
                {VIBES.map((v) => (
                  <Pill key={v.id} on={f.vibe === v.id} onClick={() => set({ vibe: f.vibe === v.id ? "" : v.id })}>
                    {v.label}
                  </Pill>
                ))}
              </Field>
              <Field label="When">
                {[
                  ["day", "Daytime"],
                  ["evening", "Evening"],
                  ["night", "Late night"],
                ].map(([id, label]) => (
                  <Pill key={id} on={f.time === id} onClick={() => set({ time: f.time === id ? "" : id })}>
                    {label}
                  </Pill>
                ))}
                <Pill on={f.indoor} onClick={() => set({ indoor: !f.indoor })}>
                  Rain-proof
                </Pill>
              </Field>
              <BudgetSlider
                label="Budget per person"
                stops={PLACE_STOPS}
                value={f.maxCost}
                onChange={(v) => set({ maxCost: v })}
              />
              <div className="grid grid-cols-2 gap-4 border-t border-line py-5">
                <label className="flex flex-col gap-2">
                  <span className="eyebrow">Area</span>
                  <select className={selectCls} value={f.area} onChange={(e) => set({ area: e.target.value })}>
                    <option value="">Anywhere</option>
                    {areas.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="eyebrow">Sort</span>
                  <select
                    className={selectCls}
                    value={f.sort}
                    onChange={(e) => set({ sort: e.target.value as ExploreState["sort"] })}
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-asc">Price: low to high</option>
                    <option value="price-desc">Price: high to low</option>
                    <option value="name">A–Z</option>
                  </select>
                </label>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={() =>
              set(f.tab === "ideas" ? { occasion: "", ideaMax: null } : { ...PLACE_RESET, q: f.q, collection: f.collection, kind: f.kind })
            }
            className="h-12 px-2 font-medium underline decoration-line underline-offset-4 hover:decoration-ink"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={close}
            className="h-12 flex-1 rounded-full bg-ink font-semibold text-bg transition hover:bg-rose hover:text-rose-ink"
          >
            Show {count} {f.tab === "ideas" ? (count === 1 ? "idea" : "ideas") : count === 1 ? "place" : "places"}
          </button>
        </div>
      </div>
    </dialog>
  );
}

/* ------------------------------------------------------------------ */

export function ExploreClient({ initial }: { initial: ExploreState }) {
  const cat = useCatalogue();
  const [f, setF] = useState<ExploreState>(initial);
  const [refine, setRefine] = useState(false);
  const [view, setView] = useState<"grid" | "map">("grid");
  const set = (patch: Partial<ExploreState>) => setF((x) => ({ ...x, ...patch }));

  // Mirror state into the URL so views are shareable and survive back/forward.
  useEffect(() => {
    const p = new URLSearchParams();
    if (f.tab === "places") p.set("tab", "places");
    if (f.tab === "places") {
      if (f.q) p.set("q", f.q);
      if (f.collection) p.set("collection", f.collection);
      if (f.kind !== "all") p.set("kind", f.kind);
      if (f.category) p.set("category", f.category);
      if (f.vibe) p.set("vibe", f.vibe);
      if (f.area) p.set("area", f.area);
      if (f.maxCost != null) p.set("max", String(f.maxCost));
      if (f.time) p.set("time", f.time);
      if (f.indoor) p.set("indoor", "1");
      if (f.sort !== "recommended") p.set("sort", f.sort);
    } else {
      if (f.mood) p.set("mood", f.mood);
      if (f.occasion) p.set("occasion", f.occasion);
      if (f.ideaMax != null) p.set("max", String(f.ideaMax));
    }
    const qs = p.toString();
    const t = setTimeout(() => window.history.replaceState(null, "", qs ? `?${qs}` : location.pathname), 250);
    return () => clearTimeout(t);
  }, [f]);

  /* Ideas */
  const ideas = cat.ideas.filter(
    (d) =>
      (!f.mood || d.moods.includes(f.mood as never)) &&
      (!f.occasion || d.occasions.includes(f.occasion as never)) &&
      (f.ideaMax == null || suggestionCost(d, cat) <= f.ideaMax),
  );
  const ideaRefineCount = (f.occasion ? 1 : 0) + (f.ideaMax != null ? 1 : 0);

  /* Places */
  // True when nothing beyond the type switch is narrowing the list.
  const browsing =
    !f.q && !f.collection && !f.category && !f.vibe && !f.area && !f.time && !f.indoor && f.maxCost == null;
  const results = useMemo(() => {
    const list = cat.places.filter((p) => matches(p, f));
    const closed = (p: Place) => (p.status === "closed" ? 1 : 0);
    if (f.sort === "price-asc") return list.sort((a, b) => closed(a) - closed(b) || a.costPerPerson - b.costPerPerson);
    if (f.sort === "price-desc") return list.sort((a, b) => closed(a) - closed(b) || b.costPerPerson - a.costPerPerson);
    if (f.sort === "name") return list.sort((a, b) => a.name.localeCompare(b.name));
    return list.sort((a, b) => closed(a) - closed(b));
  }, [f, cat]);

  const chips: { label: string; clear: Partial<ExploreState> }[] = [];
  if (f.collection) chips.push({ label: COLLECTION_BY_SLUG[f.collection]?.title ?? f.collection, clear: { collection: "" } });
  if (f.category) chips.push({ label: CATEGORY_BY_ID[f.category as Place["category"]]?.label ?? f.category, clear: { category: "" } });
  if (f.vibe) chips.push({ label: VIBES.find((v) => v.id === f.vibe)?.label ?? f.vibe, clear: { vibe: "" } });
  if (f.area) chips.push({ label: f.area, clear: { area: "" } });
  if (f.time) chips.push({ label: { day: "Daytime", evening: "Evening", night: "Late night" }[f.time] ?? f.time, clear: { time: "" } });
  if (f.indoor) chips.push({ label: "Rain-proof", clear: { indoor: false } });
  if (f.maxCost != null) chips.push({ label: budgetLabel(f.maxCost), clear: { maxCost: null } });
  const placeRefineCount = chips.filter((c) => !("collection" in c.clear)).length;

  const mapPoints = results
    .filter((p) => p.lat != null)
    .map((p) => ({ lat: p.lat!, lng: p.lng!, title: p.name, href: `/places/${p.slug}` }));
  const heading = f.collection ? COLLECTION_BY_SLUG[f.collection]?.title : undefined;

  return (
    <>
      {/* Title + tabs */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Explore</p>
          <h1 className="mt-2 text-5xl sm:text-6xl">
            {f.tab === "ideas" ? (
              <>
                Pick a starting point, <em className="text-rose">then remix it.</em>
              </>
            ) : (
              <>
                Places worth <em className="text-rose">the trip.</em>
              </>
            )}
          </h1>
        </div>
        <div role="tablist" aria-label="Explore" className="flex gap-8 border-b border-line">
          {(
            [
              ["ideas", "Date ideas", cat.ideas.length],
              ["places", "Places", cat.places.length],
            ] as const
          ).map(([id, label, n]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={f.tab === id}
              onClick={() => set({ tab: id })}
              className={`-mb-px h-12 border-b-2 text-[15px] font-medium transition ${
                f.tab === id ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {label} <span className="text-ink-soft tabular">({n})</span>
            </button>
          ))}
        </div>
      </div>

      {f.tab === "ideas" ? (
        /* ---------------- Date ideas ---------------- */
        <div role="tabpanel" aria-label="Date ideas">
          <div className="mt-8 flex items-center gap-3">
            <div className="shelf -mx-4 flex flex-1 gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Mood">
              <Pill on={!f.mood} onClick={() => set({ mood: "" })}>
                All moods
              </Pill>
              {VIBES.filter((v) => cat.ideas.some((d) => d.moods.includes(v.id))).map((v) => (
                <Pill key={v.id} on={f.mood === v.id} onClick={() => set({ mood: f.mood === v.id ? "" : v.id })}>
                  {v.label}
                </Pill>
              ))}
            </div>
            <RefineButton count={ideaRefineCount} onClick={() => setRefine(true)} />
          </div>
          {ideas.length ? (
            <ul className="mt-10 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {ideas.map((d) => (
                <li key={d.slug} className="rise">
                  <DateIdeaCard date={d} index={cat.ideas.indexOf(d)} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" />
                </li>
              ))}
            </ul>
          ) : (
            <Empty
              title="No ready-made idea for that yet."
              body="That's what the builder is for. Pick the pieces yourself from Places."
              action={["Browse places", () => set({ tab: "places", mood: "", occasion: "", ideaMax: null })]}
            />
          )}
        </div>
      ) : (
        /* ---------------- Places ---------------- */
        <div role="tabpanel" aria-label="Places">
          <div className="mt-8 flex items-center gap-3">
            <label className="relative flex-1">
              <span className="sr-only">Search places</span>
              <MagnifyingGlass size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" aria-hidden />
              <input
                type="search"
                value={f.q}
                onChange={(e) => set({ q: e.target.value })}
                placeholder="Search places or areas"
                className="h-12 w-full rounded-full border border-line bg-surface pl-11 pr-4 text-base placeholder:text-ink-soft/80 focus:border-ink"
              />
            </label>
            <RefineButton count={placeRefineCount} onClick={() => setRefine(true)} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Show">
            {KINDS.map(([k, label]) => (
              <Pill
                key={k}
                on={f.kind === k}
                onClick={() => {
                  // Keep a chosen category only if it still belongs to the new type.
                  const keep = !f.category || k === "all" || CATEGORY_BY_ID[f.category as Place["category"]]?.kind === k;
                  set({ kind: k, category: keep ? f.category : "" });
                }}
              >
                {label}
              </Pill>
            ))}
          </div>

          <>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="mr-2 text-sm text-ink-soft tabular" aria-live="polite">
                    {results.length} {results.length === 1 ? "place" : "places"}
                    {heading ? ` in ${heading}` : ""}
                  </p>
                  {chips.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => set(c.clear)}
                      aria-label={`Remove filter: ${c.label}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-surface-2 pl-3.5 pr-2.5 text-sm font-medium hover:bg-rose-soft"
                    >
                      {c.label} <X size={14} aria-hidden />
                    </button>
                  ))}
                  {!browsing && (
                    <button
                      type="button"
                      onClick={() => set({ ...PLACE_RESET, kind: f.kind })}
                      className="h-9 px-2 text-sm font-medium underline decoration-line underline-offset-4 hover:decoration-ink"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
                <div className="flex rounded-full border border-line p-1" role="group" aria-label="View">
                  {(
                    [
                      ["grid", GridFour, "Grid view"],
                      ["map", MapTrifold, "Map view"],
                    ] as const
                  ).map(([id, I, label]) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={view === id}
                      aria-label={label}
                      onClick={() => setView(id)}
                      className={`grid size-9 place-items-center rounded-full ${view === id ? "bg-ink text-bg" : "text-ink-soft"}`}
                    >
                      <I size={18} aria-hidden />
                    </button>
                  ))}
                </div>
              </div>

              {results.length === 0 ? (
                <Empty
                  title="Nothing matches that combination."
                  body="Try fewer filters, or search for an area like “Chinatown”."
                  action={["Back to all places", () => set(PLACE_RESET)]}
                />
              ) : view === "map" ? (
                <div className="mt-6 overflow-hidden rounded-card border border-line">
                  <MapView points={mapPoints} className="h-[65vh] w-full" />
                  {mapPoints.length < results.length && (
                    <p className="border-t border-line px-4 py-2 text-sm text-ink-soft">
                      {results.length - mapPoints.length} places with several branches aren&apos;t on the map.
                    </p>
                  )}
                </div>
              ) : (
                <ul className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {results.map((p, i) => (
                    <li key={p.slug} className="rise" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                      <PlaceCard place={p} sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                    </li>
                  ))}
                </ul>
              )}
          </>
        </div>
      )}

      {refine && (
        <RefineSheet
          f={f}
          set={set}
          count={f.tab === "ideas" ? ideas.length : results.length}
          onClose={() => setRefine(false)}
        />
      )}
    </>
  );
}

function RefineButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full border border-ink px-5 text-sm font-semibold transition hover:bg-ink hover:text-bg"
    >
      <SlidersHorizontal size={18} aria-hidden />
      Refine
      {count > 0 && (
        <span className="grid min-w-5 place-items-center rounded-full bg-rose px-1.5 text-xs leading-5 text-rose-ink tabular">
          {count}
        </span>
      )}
    </button>
  );
}

function Empty({ title, body, action }: { title: string; body: string; action: [string, () => void] }) {
  return (
    <div className="mt-12 border-y border-line py-14 text-center">
      <p className="font-display text-3xl">{title}</p>
      <p className="mt-2 text-ink-soft">{body}</p>
      <button
        type="button"
        onClick={action[1]}
        className="mt-6 h-12 rounded-full bg-ink px-6 font-semibold text-bg hover:bg-rose hover:text-rose-ink"
      >
        {action[0]}
      </button>
    </div>
  );
}
