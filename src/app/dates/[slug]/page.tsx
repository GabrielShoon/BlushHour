import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Photo } from "@/components/photo";
import { BUDGETS, OCCASIONS } from "@/data/categories";
import { ideaPhoto, placePhoto } from "@/data/photos";
import { getCatalogue } from "@/lib/catalogue-server";
import {
  budgetBand,
  formatDuration,
  formatSGD,
  formatTime,
  itineraryFromSuggestion,
  schedule,
  suggestionCost,
} from "@/lib/itinerary";
import { RemixButton, RouteMap } from "./remix";

export async function generateStaticParams() {
  return (await getCatalogue()).ideas.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const d = (await getCatalogue()).ideaBySlug[(await params).slug];
  return d ? { title: d.title, description: d.description } : {};
}

export default async function DateIdeaPage({ params }: { params: Promise<{ slug: string }> }) {
  const cat = await getCatalogue();
  const idea = cat.ideaBySlug[(await params).slug];
  if (!idea) notFound();
  const plan = schedule(itineraryFromSuggestion(idea, cat), cat);
  const tags = [
    ...idea.occasions.map((o) => OCCASIONS.find((x) => x.id === o)?.label),
    BUDGETS.find((b) => b.id === budgetBand(suggestionCost(idea, cat)))?.label,
  ].filter(Boolean);

  return (
    <>
      <header className="relative">
        <div className="photo-grade relative h-[62vh] min-h-[26rem] w-full overflow-hidden">
          <Photo photo={ideaPhoto(idea)} priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
        </div>
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-7xl px-4 pb-10 text-white sm:px-6">
            <Link href="/explore" className="inline-flex h-11 items-center gap-2 text-sm text-white/85 hover:text-white">
              <ArrowLeft size={16} aria-hidden /> Date ideas
            </Link>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
              No. {String(cat.ideas.indexOf(idea) + 1).padStart(2, "0")} · {idea.tagline}
            </p>
            <h1 className="mt-3 max-w-3xl text-5xl sm:text-7xl">{idea.title}</h1>
            <p className="mt-4 max-w-xl text-lg text-white/90">{idea.description}</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 border-b border-line py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-soft">{tags.join(" · ")}</p>
          <RemixButton slug={idea.slug} />
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_1fr]">
          <section aria-labelledby="timeline">
            <p className="eyebrow">The plan</p>
            <h2 id="timeline" className="mt-2 text-4xl">
              How it could go
            </h2>
            <ol className="mt-8">
              {plan.stops.map((s, i) => (
                <li key={s.stop.id}>
                  {s.travelBefore > 0 && (
                    <p className="ml-[3.25rem] border-l border-dashed border-line py-3 pl-6 text-sm text-ink-soft tabular">
                      About {s.travelBefore} min to get there
                    </p>
                  )}
                  <Link
                    href={`/places/${s.place.slug}`}
                    className="group grid grid-cols-[2.5rem_5.5rem_1fr] items-center gap-3 border-t border-line py-4 sm:gap-5"
                  >
                    <span className="font-display text-4xl text-rose">{String(i + 1).padStart(2, "0")}</span>
                    <span className="aspect-square overflow-hidden rounded-card">
                      <Photo photo={placePhoto(s.place)} sizes="96px" decorative />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm text-ink-soft tabular">
                        {formatTime(s.start)} – {formatTime(s.end)}
                      </span>
                      <span className="block font-display text-2xl leading-tight group-hover:underline">{s.place.name}</span>
                      <span className="mt-0.5 line-clamp-1 block text-sm text-ink-soft">{s.place.blurb}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            <dl className="mt-6 grid grid-cols-2 border-t border-ink">
              <div className="border-r border-line py-4 pr-4">
                <dt className="eyebrow">Total time</dt>
                <dd className="mt-1 font-display text-3xl tabular">{formatDuration(plan.end - plan.stops[0].start)}</dd>
              </div>
              <div className="py-4 pl-4">
                <dt className="eyebrow">Estimate for two</dt>
                <dd className="mt-1 font-display text-3xl tabular">{formatSGD(plan.totalCost)}</dd>
              </div>
            </dl>
          </section>
          <section aria-labelledby="route" className="lg:sticky lg:top-24 lg:self-start">
            <h2 id="route" className="sr-only">
              Route map
            </h2>
            <div className="overflow-hidden rounded-card border border-line">
              <RouteMap slug={idea.slug} />
            </div>
            <p className="mt-2 text-xs text-ink-soft">
              Like the idea but not every stop? Remix it and swap anything in the builder.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
