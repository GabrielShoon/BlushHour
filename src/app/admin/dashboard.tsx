"use client";

import { CheckCircle, MagnifyingGlass, PencilSimple, Plus } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useState } from "react";
import { useCatalogue } from "@/components/catalogue";
import { Photo } from "@/components/photo";
import { CATEGORY_BY_ID } from "@/data/categories";
import { ideaPhoto, placePhoto } from "@/data/photos";
import { costLabel, formatSGD, suggestionCost } from "@/lib/itinerary";

export function AdminDashboard({
  tab: initialTab,
  notice,
}: {
  tab: "places" | "ideas";
  notice?: string;
}) {
  const cat = useCatalogue();
  const [tab, setTab] = useState(initialTab);
  const [q, setQ] = useState("");
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hit = (text: string) => words.every((w) => text.toLowerCase().includes(w));

  const places = cat.places.filter((p) => hit(`${p.name} ${p.area} ${CATEGORY_BY_ID[p.category].label}`));
  const ideas = cat.ideas.filter((d) => hit(`${d.title} ${d.tagline}`));

  return (
    <div className="pb-16">
      <p className="eyebrow">Admin</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-5xl sm:text-6xl">
          Your <em className="text-rose">catalogue</em>
        </h1>
        <Link
          href={tab === "places" ? "/admin/places/new" : "/admin/dates/new"}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-rose px-6 font-semibold text-rose-ink hover:brightness-110"
        >
          <Plus size={18} aria-hidden /> {tab === "places" ? "Add a place" : "Add a date idea"}
        </Link>
      </div>

      {notice && (
        <p role="status" className="mt-6 flex items-center gap-2 rounded-xl bg-surface-2 p-4 text-sm font-medium">
          <CheckCircle size={20} className="text-rose" aria-hidden /> {notice} It&apos;s live on the site now.
        </p>
      )}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Catalogue" className="flex gap-8 border-b border-line">
          {(
            [
              ["places", "Places", cat.places.length],
              ["ideas", "Date ideas", cat.ideas.length],
            ] as const
          ).map(([id, label, n]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`-mb-px h-12 border-b-2 text-[15px] font-medium ${
                tab === id ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {label} <span className="text-ink-soft tabular">({n})</span>
            </button>
          ))}
        </div>
        <label className="relative sm:w-72">
          <span className="sr-only">Search</span>
          <MagnifyingGlass size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="h-11 w-full rounded-full border border-line bg-surface pl-11 pr-4 focus:border-ink"
          />
        </label>
      </div>

      <ul className="mt-4 divide-y divide-line border-y border-line">
        {tab === "places"
          ? places.map((p) => (
              <li key={p.slug}>
                <Link href={`/admin/places/${p.slug}`} className="group flex items-center gap-4 py-3 hover:bg-surface-2/60">
                  <span className="size-14 shrink-0 overflow-hidden rounded-card">
                    <Photo photo={placePhoto(p)} sizes="56px" decorative />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-xl">{p.name}</span>
                    <span className="block truncate text-sm text-ink-soft">
                      {CATEGORY_BY_ID[p.category].label} · {p.area} · {costLabel(p)}
                      {p.status === "closed" && " · Closed"}
                    </span>
                  </span>
                  <PencilSimple size={18} className="mr-2 shrink-0 text-ink-soft group-hover:text-ink" aria-label="Edit" />
                </Link>
              </li>
            ))
          : ideas.map((d) => (
              <li key={d.slug}>
                <Link href={`/admin/dates/${d.slug}`} className="group flex items-center gap-4 py-3 hover:bg-surface-2/60">
                  <span className="size-14 shrink-0 overflow-hidden rounded-card">
                    <Photo photo={ideaPhoto(d)} sizes="56px" decorative />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-xl">{d.title}</span>
                    <span className="block truncate text-sm text-ink-soft">
                      {d.stops.length} stops · about {formatSGD(suggestionCost(d, cat))} per person
                    </span>
                  </span>
                  <PencilSimple size={18} className="mr-2 shrink-0 text-ink-soft group-hover:text-ink" aria-label="Edit" />
                </Link>
              </li>
            ))}
      </ul>
      {(tab === "places" ? places : ideas).length === 0 && <p className="py-10 text-center text-ink-soft">Nothing matches that search.</p>}
    </div>
  );
}
