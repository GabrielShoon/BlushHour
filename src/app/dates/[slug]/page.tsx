import { ArrowLeft, Clock, Path } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryIcon, HUE_BG } from "@/components/icons";
import { BUDGETS, OCCASIONS } from "@/data/categories";
import { SUGGESTED_BY_SLUG, SUGGESTED_DATES } from "@/data/suggested-dates";
import {
  formatDuration,
  formatSGD,
  formatTime,
  budgetBand,
  itineraryFromSuggestion,
  suggestionCost,
  schedule,
} from "@/lib/itinerary";
import { RemixButton, RouteMap } from "./remix";

export function generateStaticParams() {
  return SUGGESTED_DATES.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const d = SUGGESTED_BY_SLUG[(await params).slug];
  return d ? { title: d.title, description: d.description } : {};
}

export default async function DateIdeaPage({ params }: { params: Promise<{ slug: string }> }) {
  const idea = SUGGESTED_BY_SLUG[(await params).slug];
  if (!idea) notFound();
  const it = itineraryFromSuggestion(idea);
  const plan = schedule(it);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Link
        href="/dates"
        className="inline-flex h-11 items-center gap-2 rounded-full pr-3 text-sm font-semibold text-ink-soft hover:text-rose"
      >
        <ArrowLeft size={18} aria-hidden /> All date ideas
      </Link>

      <header className={`mt-2 rounded-card p-6 sm:p-10 ${HUE_BG[idea.hue]}`}>
        <p className="font-semibold text-ink-soft">{idea.tagline}</p>
        <h1 className="mt-2 text-4xl font-semibold sm:text-6xl">{idea.title}</h1>
        <p className="mt-4 max-w-2xl text-lg">{idea.description}</p>
        <ul className="mt-5 flex flex-wrap gap-2 text-sm font-semibold">
          {idea.occasions.map((o) => (
            <li key={o} className="rounded-full bg-surface/80 px-3 py-1">
              {OCCASIONS.find((x) => x.id === o)?.label}
            </li>
          ))}
          <li className="rounded-full bg-surface/80 px-3 py-1">{BUDGETS.find((b) => b.id === budgetBand(suggestionCost(idea)))?.label}</li>
        </ul>
        <div className="mt-6">
          <RemixButton slug={idea.slug} />
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <section aria-labelledby="timeline">
          <h2 id="timeline" className="text-3xl font-semibold">
            How it could go
          </h2>
          <ol className="mt-6 space-y-0">
            {plan.stops.map((s, i) => (
              <li key={s.stop.id}>
                {s.travelBefore > 0 && (
                  <p className="ml-6 flex items-center gap-2 border-l-2 border-dashed border-line py-3 pl-8 text-sm text-ink-soft">
                    <Path size={16} aria-hidden /> ~{s.travelBefore} min travel
                  </p>
                )}
                <Link
                  href={`/places/${s.place.slug}`}
                  className="flex gap-4 rounded-card border border-line bg-surface p-4 shadow-card transition hover:border-rose"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-rose-soft font-display text-xl font-semibold text-rose">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink-soft tabular">
                      {formatTime(s.start)} – {formatTime(s.end)}
                    </p>
                    <p className="font-display text-xl font-semibold">{s.place.name}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{s.place.blurb}</p>
                  </div>
                  <CategoryIcon id={s.place.category} size={24} className="shrink-0 text-ink-soft" />
                </Link>
              </li>
            ))}
          </ol>
          <dl className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-card border border-line bg-surface p-4">
              <dt className="flex items-center gap-1 text-sm font-semibold text-ink-soft">
                <Clock size={16} aria-hidden /> Total time
              </dt>
              <dd className="font-display text-2xl font-semibold tabular">
                {formatDuration(plan.end - plan.stops[0].start)}
              </dd>
            </div>
            <div className="rounded-card border border-line bg-surface p-4">
              <dt className="text-sm font-semibold text-ink-soft">Estimated for two</dt>
              <dd className="font-display text-2xl font-semibold tabular">{formatSGD(plan.totalCost)}</dd>
            </div>
          </dl>
        </section>
        <section aria-labelledby="route" className="overflow-hidden rounded-card border border-line shadow-card">
          <h2 id="route" className="sr-only">
            Route map
          </h2>
          <RouteMap slug={idea.slug} />
        </section>
      </div>
    </div>
  );
}
