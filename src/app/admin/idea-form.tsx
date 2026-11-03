"use client";

import { ArrowDown, ArrowLeft, ArrowUp, MagnifyingGlass, Plus, Trash, X } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { useCatalogue } from "@/components/catalogue";
import { BUDGETS, CATEGORY_BY_ID, OCCASIONS, VIBES } from "@/data/categories";
import { ideaToRow, slugify } from "@/lib/catalogue";
import {
  budgetBand,
  costLabel,
  formatDuration,
  formatSGD,
  itineraryFromSuggestion,
  schedule,
  suggestionCost,
} from "@/lib/itinerary";
import { getSupabase } from "@/lib/supabase/client";
import type { Occasion, SuggestedDate, Vibe } from "@/lib/types";
import { refreshCatalogue } from "./actions";
import { Chips, Field, inputCls, PhotoField } from "./form-parts";

function blank(): SuggestedDate {
  return { slug: "", title: "", tagline: "", description: "", moods: [], occasions: [], startTime: "18:00", stops: [] };
}

export function IdeaForm({ existing }: { existing?: SuggestedDate }) {
  const cat = useCatalogue();
  const router = useRouter();
  const [d, setD] = useState<SuggestedDate>(existing ?? blank());
  const [q, setQ] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = (patch: Partial<SuggestedDate>) => setD((x) => ({ ...x, ...patch }));

  const slug = existing?.slug ?? slugify(d.title);
  const perPerson = suggestionCost(d, cat);
  const plan = useMemo(() => schedule(itineraryFromSuggestion(d, cat), cat), [d, cat]);
  const band = BUDGETS.find((b) => b.id === budgetBand(perPerson))?.label;

  const matches = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return cat.places
      .filter((p) => !d.stops.some((s) => s.slug === p.slug))
      .filter((p) => words.every((w) => `${p.name} ${p.area} ${CATEGORY_BY_ID[p.category].label}`.toLowerCase().includes(w)))
      .slice(0, 8);
  }, [q, cat, d.stops]);

  const move = (i: number, to: number) => {
    if (to < 0 || to >= d.stops.length) return;
    const stops = [...d.stops];
    const [s] = stops.splice(i, 1);
    stops.splice(to, 0, s);
    set({ stops });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!d.title.trim()) e.title = "Give the date idea a title.";
    else if (!existing && cat.ideaBySlug[slug]) e.title = "A date idea with this title already exists.";
    if (!d.tagline.trim()) e.tagline = "Add a short tagline.";
    if (!d.description.trim()) e.description = "Describe how the date goes.";
    if (d.stops.length < 1) e.stops = "Add at least one stop.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async (ev: FormEvent) => {
    ev.preventDefault();
    setFormError(null);
    if (!validate()) return;
    const sb = getSupabase();
    if (!sb) return setFormError("Supabase isn't configured.");
    setSaving(true);
    const idea: SuggestedDate = {
      ...d,
      slug,
      title: d.title.trim(),
      tagline: d.tagline.trim(),
      description: d.description.trim(),
      photo: d.photo ? { ...d.photo, alt: d.title.trim() } : undefined,
    };
    const { position, ...fields } = ideaToRow(idea, cat.ideas.length + 1);
    const { error } = existing
      ? await sb.from("date_ideas").update({ ...fields, updated_at: new Date().toISOString() }).eq("slug", existing.slug)
      : await sb.from("date_ideas").insert({ ...fields, position });
    if (error) {
      console.error("BlushHour: saving date idea failed", error);
      setSaving(false);
      return setFormError(
        error.code === "23505" ? "A date idea with this title already exists." : `Couldn't save: ${error.message}`,
      );
    }
    await refreshCatalogue();
    router.push(`/admin?tab=ideas&saved=${encodeURIComponent(idea.title)}`);
    router.refresh();
  };

  const remove = async () => {
    if (!existing) return;
    const sb = getSupabase();
    if (!sb) return;
    setSaving(true);
    const { error } = await sb.from("date_ideas").delete().eq("slug", existing.slug);
    if (error) {
      setSaving(false);
      return setFormError(`Couldn't delete: ${error.message}`);
    }
    await refreshCatalogue();
    router.push(`/admin?tab=ideas&deleted=${encodeURIComponent(existing.title)}`);
    router.refresh();
  };

  return (
    <form onSubmit={save} noValidate className="pb-16">
      <Link href="/admin?tab=ideas" className="inline-flex h-11 items-center gap-2 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft size={16} aria-hidden /> All date ideas
      </Link>
      <h1 className="mt-2 text-5xl">{existing ? `Edit ${existing.title}` : "Add a date idea"}</h1>
      <p className="mt-2 text-ink-soft">
        Pick the stops from your places. Timings, route, cost and budget filters are worked out for you.
      </p>

      {formError && (
        <p role="alert" className="mt-6 rounded-xl bg-rose-soft p-4 text-sm font-medium">
          {formError}
        </p>
      )}

      <div className="mt-8 grid gap-8">
        <section className="grid gap-5 border-t border-ink pt-6">
          <h2 className="text-3xl">The idea</h2>
          <Field label="Title" error={errors.title} hint={slug ? `Page address: /dates/${slug}` : undefined} htmlFor="title">
            <input id="title" value={d.title} onChange={(e) => set({ title: e.target.value })} className={inputCls} aria-invalid={!!errors.title} />
          </Field>
          <Field label="Tagline" error={errors.tagline} hint="A short hook, e.g. “Cable car in, tall ship out”." htmlFor="tagline">
            <input id="tagline" value={d.tagline} onChange={(e) => set({ tagline: e.target.value })} className={inputCls} aria-invalid={!!errors.tagline} />
          </Field>
          <Field label="Description" error={errors.description} htmlFor="description">
            <textarea
              id="description"
              value={d.description}
              onChange={(e) => set({ description: e.target.value })}
              rows={3}
              className={`${inputCls} h-auto py-3`}
              aria-invalid={!!errors.description}
            />
          </Field>
        </section>

        <section className="grid gap-5 border-t border-ink pt-6">
          <h2 className="text-3xl">Stops</h2>
          <Field label="Start time" htmlFor="start">
            <input id="start" type="time" value={d.startTime} onChange={(e) => e.target.value && set({ startTime: e.target.value })} className={`${inputCls} w-40`} />
          </Field>

          {d.stops.length > 0 && (
            <ol className="divide-y divide-line rounded-card border border-line">
              {plan.stops.map((s, i) => (
                <li key={s.place.slug} className="flex flex-wrap items-center gap-3 p-3">
                  <span className="w-8 font-display text-2xl text-rose">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-xl">{s.place.name}</span>
                    <span className="block text-xs text-ink-soft">
                      {s.place.area} · {costLabel(s.place)}
                    </span>
                  </span>
                  <label className="flex items-center gap-2 text-xs text-ink-soft">
                    Minutes
                    <input
                      type="number"
                      min={10}
                      step={5}
                      value={d.stops[i].durationMins ?? s.place.durationMins}
                      onChange={(e) =>
                        set({
                          stops: d.stops.map((x, j) => (j === i ? { ...x, durationMins: Math.max(10, Number(e.target.value) || 10) } : x)),
                        })
                      }
                      className="h-10 w-20 rounded-lg border border-line bg-surface px-2 text-sm text-ink"
                      aria-label={`Minutes at ${s.place.name}`}
                    />
                  </label>
                  <span className="flex">
                    <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move ${s.place.name} earlier`} className="grid size-10 place-items-center rounded-full hover:bg-surface-2 disabled:opacity-30">
                      <ArrowUp size={16} aria-hidden />
                    </button>
                    <button type="button" onClick={() => move(i, i + 1)} disabled={i === d.stops.length - 1} aria-label={`Move ${s.place.name} later`} className="grid size-10 place-items-center rounded-full hover:bg-surface-2 disabled:opacity-30">
                      <ArrowDown size={16} aria-hidden />
                    </button>
                    <button type="button" onClick={() => set({ stops: d.stops.filter((_, j) => j !== i) })} aria-label={`Remove ${s.place.name}`} className="grid size-10 place-items-center rounded-full hover:bg-rose-soft hover:text-danger">
                      <X size={16} aria-hidden />
                    </button>
                  </span>
                </li>
              ))}
            </ol>
          )}

          <div>
            <label className="relative block">
              <span className="sr-only">Find a place to add</span>
              <MagnifyingGlass size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" aria-hidden />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a place to add as a stop" className={`${inputCls} pl-11`} />
            </label>
            {matches.length > 0 && (
              <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
                {matches.map((p) => (
                  <li key={p.slug}>
                    <button
                      type="button"
                      onClick={() => {
                        set({ stops: [...d.stops, { slug: p.slug }] });
                        setQ("");
                      }}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-surface-2"
                    >
                      <span>
                        {p.name} <span className="text-ink-soft">· {p.area}</span>
                      </span>
                      <Plus size={16} className="text-rose" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {errors.stops && (
              <p role="alert" className="mt-2 text-sm text-danger">
                {errors.stops}
              </p>
            )}
          </div>

          {d.stops.length > 0 && (
            <dl className="grid grid-cols-3 border-t border-line pt-4 text-sm">
              <div>
                <dt className="eyebrow">Per person</dt>
                <dd className="mt-1 font-display text-2xl tabular">{formatSGD(perPerson)}</dd>
              </div>
              <div>
                <dt className="eyebrow">Budget band</dt>
                <dd className="mt-1 font-display text-2xl">{band}</dd>
              </div>
              <div>
                <dt className="eyebrow">Total time</dt>
                <dd className="mt-1 font-display text-2xl tabular">
                  {plan.stops.length ? formatDuration(plan.end - plan.stops[0].start) : "–"}
                </dd>
              </div>
            </dl>
          )}
        </section>

        <section className="grid gap-5 border-t border-ink pt-6">
          <h2 className="text-3xl">Who it&apos;s for</h2>
          <Chips label="Moods" options={VIBES} value={d.moods} onChange={(v) => set({ moods: v as Vibe[] })} />
          <Chips label="Occasions" options={OCCASIONS} value={d.occasions} onChange={(v) => set({ occasions: v as Occasion[] })} />
        </section>

        <section className="border-t border-ink pt-6">
          <PhotoField value={d.photo} onChange={(p) => set({ photo: p })} folder="dates" name={d.title} />
        </section>
      </div>

      <div className="sticky bottom-20 mt-10 flex flex-wrap items-center gap-3 border-t border-line bg-bg/95 py-4 backdrop-blur md:bottom-0">
        <button type="submit" disabled={saving} className="h-12 rounded-full bg-rose px-8 font-semibold text-rose-ink hover:brightness-110 disabled:opacity-50">
          {saving ? "Saving…" : existing ? "Save changes" : "Add date idea"}
        </button>
        <Link href="/admin?tab=ideas" className="h-12 px-3 text-sm font-medium leading-[3rem] text-ink-soft hover:text-ink">
          Cancel
        </Link>
        {existing &&
          (confirmDelete ? (
            <span className="ml-auto flex items-center gap-2 text-sm">
              Delete {existing.title}?
              <button type="button" onClick={remove} className="h-10 rounded-full bg-danger px-4 font-semibold text-white">
                Delete
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="h-10 px-2 font-medium">
                Keep
              </button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} className="ml-auto inline-flex h-11 items-center gap-1.5 text-sm text-ink-soft hover:text-danger">
              <Trash size={16} aria-hidden /> Delete date idea
            </button>
          ))}
      </div>
    </form>
  );
}
