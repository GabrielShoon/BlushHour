import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { BUDGETS, VIBES } from "@/data/categories";
import { PLACE_BY_SLUG } from "@/data/places";
import { budgetBand, formatSGD, suggestionCost } from "@/lib/itinerary";
import type { SuggestedDate } from "@/lib/types";
import { CategoryIcon, HUE_BG } from "./icons";

export function DateIdeaCard({ date }: { date: SuggestedDate }) {
  const stops = date.stops.map((s) => PLACE_BY_SLUG[s.slug]).filter(Boolean);
  const budget = BUDGETS.find((b) => b.id === budgetBand(suggestionCost(date)))?.label;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className={`flex items-center gap-2 p-5 ${HUE_BG[date.hue]}`}>
        {stops.map((p, i) => (
          <span key={p.slug} className="flex items-center gap-2">
            <span className="grid size-11 place-items-center rounded-2xl bg-surface/80 shadow-card">
              <CategoryIcon id={p.category} size={22} />
            </span>
            {i < stops.length - 1 && <span className="h-0.5 w-4 rounded bg-ink/30" aria-hidden />}
          </span>
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-sm font-semibold text-rose">{date.tagline}</p>
          <h3 className="mt-1 text-2xl font-semibold">
            <Link href={`/dates/${date.slug}`} className="after:absolute after:inset-0 after:content-['']">
              {date.title}
            </Link>
          </h3>
          <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{date.description}</p>
        </div>
        <ul className="flex flex-wrap gap-1.5" aria-label="Moods">
          {date.moods.map((m) => (
            <li key={m} className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-ink-soft">
              {VIBES.find((v) => v.id === m)?.label}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-between border-t border-line pt-3 text-sm">
          <span className="text-ink-soft">
            {stops.length} stops · <span className="font-semibold text-ink tabular">~{formatSGD(suggestionCost(date))} pp</span>
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-rose">
            {budget} <ArrowRight size={14} weight="bold" aria-hidden />
          </span>
        </div>
      </div>
    </article>
  );
}
