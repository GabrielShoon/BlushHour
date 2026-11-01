"use client";

import { useState } from "react";
import { DateIdeaCard } from "@/components/date-idea-card";
import { BUDGETS, OCCASIONS, VIBES } from "@/data/categories";
import { SUGGESTED_DATES } from "@/data/suggested-dates";
import { budgetBand, suggestionCost } from "@/lib/itinerary";

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { id: T; label: string }[];
  value: T | "";
  onChange: (v: T | "") => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink-soft">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            onClick={() => onChange(value === o.id ? "" : o.id)}
            className={`h-10 rounded-full border px-4 text-sm font-semibold transition ${
              value === o.id ? "border-rose bg-rose-soft text-ink" : "border-line bg-surface text-ink-soft hover:border-rose"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function DatesClient() {
  const [mood, setMood] = useState<string>("");
  const [occasion, setOccasion] = useState<string>("");
  const [budget, setBudget] = useState<string>("");

  const results = SUGGESTED_DATES.filter(
    (d) =>
      (!mood || d.moods.includes(mood as never)) &&
      (!occasion || d.occasions.includes(occasion as never)) &&
      (!budget || budgetBand(suggestionCost(d)) === budget),
  );

  return (
    <>
      <div className="mt-6 grid gap-5 rounded-card border border-line bg-surface p-5 shadow-card lg:grid-cols-3">
        <ChipGroup label="Mood" options={VIBES} value={mood} onChange={setMood} />
        <ChipGroup label="Occasion" options={OCCASIONS} value={occasion} onChange={setOccasion} />
        <ChipGroup label="Budget per person" options={BUDGETS} value={budget} onChange={setBudget} />
      </div>
      <p className="mt-6 text-sm text-ink-soft tabular" aria-live="polite">
        {results.length} date {results.length === 1 ? "idea" : "ideas"}
      </p>
      {results.length ? (
        <ul className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((d) => (
            <li key={d.slug}>
              <DateIdeaCard date={d} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3 rounded-card border border-dashed border-line p-10 text-center">
          <p className="font-display text-2xl font-semibold">No ready-made idea for that combo yet.</p>
          <p className="mt-2 text-ink-soft">
            That&apos;s what the builder is for. Pick the pieces yourself in Discover.
          </p>
          <a href="/discover" className="mt-4 inline-flex h-11 items-center rounded-full bg-rose px-5 font-semibold text-rose-ink">
            Build it from scratch
          </a>
        </div>
      )}
    </>
  );
}
