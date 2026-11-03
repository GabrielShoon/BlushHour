"use client";

import { ArrowLeft, Trash } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useCatalogue } from "@/components/catalogue";
import { CATEGORIES, CATEGORY_BY_ID, VIBES } from "@/data/categories";
import { placeToRow, priceLevelFor, slugify } from "@/lib/catalogue";
import { costLabel } from "@/lib/itinerary";
import { getSupabase } from "@/lib/supabase/client";
import type { CategoryId, Place, TimeOfDay, Vibe } from "@/lib/types";
import { refreshCatalogue } from "./actions";
import { Chips, Field, inputCls, LocationField, PhotoField } from "./form-parts";

/** Typical time to allow per category, used when adding a place. */
const DEFAULT_MINS: Record<CategoryId, number> = {
  romantic: 90, unique: 120, active: 120, games: 120, creative: 120, relaxing: 90, museums: 120,
  photobooths: 20, outdoors: 60, dining: 105, casual: 60, bars: 90, cafes: 60, desserts: 45, supper: 60,
};

type Draft = Omit<Place, "kind" | "priceLevel">;

function blank(): Draft {
  return {
    slug: "",
    name: "",
    category: "dining",
    area: "",
    lat: null,
    lng: null,
    costPerPerson: 0,
    durationMins: DEFAULT_MINS.dining,
    blurb: "",
    vibes: [],
    timeOfDay: "any",
    indoor: true,
    status: "open",
    source: "curator",
  };
}

export function PlaceForm({ existing }: { existing?: Place }) {
  const cat = useCatalogue();
  const router = useRouter();
  const [d, setD] = useState<Draft>(existing ?? blank());
  const [branches, setBranches] = useState((existing?.branches ?? []).join(", "));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }));

  const slug = existing?.slug ?? slugify(d.name);
  const kind = CATEGORY_BY_ID[d.category].kind;
  const usedIn = existing ? cat.ideas.filter((i) => i.stops.some((s) => s.slug === existing.slug)) : [];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!d.name.trim()) e.name = "Give the place a name.";
    else if (!existing && cat.placeBySlug[slug]) e.name = "A place with this name already exists.";
    if (!d.blurb.trim()) e.blurb = "Add a short description.";
    if (!d.area.trim()) e.area = "Find the address or type the area.";
    if (!Number.isFinite(d.costPerPerson) || d.costPerPerson < 0) e.cost = "Enter 0 or more.";
    if (!Number.isFinite(d.durationMins) || d.durationMins < 10) e.mins = "At least 10 minutes.";
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
    const place: Place = {
      ...d,
      slug,
      name: d.name.trim(),
      blurb: d.blurb.trim(),
      area: d.area.trim(),
      kind,
      priceLevel: priceLevelFor(d.costPerPerson),
      cuisine: kind === "food" && d.cuisine?.trim() ? d.cuisine.trim() : undefined,
      branches: branches.split(",").map((b) => b.trim()).filter(Boolean),
      photo: d.photo ? { ...d.photo, alt: d.name.trim() } : undefined,
    };
    // New places go to the end of the list; edits keep their place in it.
    const { position, ...fields } = placeToRow(place, cat.places.length + 1);
    const { error } = existing
      ? await sb.from("places").update({ ...fields, updated_at: new Date().toISOString() }).eq("slug", existing.slug)
      : await sb.from("places").insert({ ...fields, position });
    if (error) {
      console.error("BlushHour: saving place failed", error);
      setSaving(false);
      return setFormError(
        error.code === "23505" ? "A place with this name already exists." : `Couldn't save: ${error.message}`,
      );
    }
    await refreshCatalogue();
    router.push(`/admin?saved=${encodeURIComponent(place.name)}`);
    router.refresh();
  };

  const remove = async () => {
    if (!existing) return;
    const sb = getSupabase();
    if (!sb) return;
    setSaving(true);
    const { error } = await sb.from("places").delete().eq("slug", existing.slug);
    if (error) {
      setSaving(false);
      return setFormError(`Couldn't delete: ${error.message}`);
    }
    await refreshCatalogue();
    router.push(`/admin?deleted=${encodeURIComponent(existing.name)}`);
    router.refresh();
  };

  return (
    <form onSubmit={save} noValidate className="pb-16">
      <Link href="/admin" className="inline-flex h-11 items-center gap-2 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft size={16} aria-hidden /> All places
      </Link>
      <h1 className="mt-2 text-5xl">{existing ? `Edit ${existing.name}` : "Add a place"}</h1>
      <p className="mt-2 text-ink-soft">
        Fill in what you know. The web address, food vs activity, budget level and filters are worked out for you.
      </p>

      {formError && (
        <p role="alert" className="mt-6 rounded-xl bg-rose-soft p-4 text-sm font-medium">
          {formError}
        </p>
      )}

      <div className="mt-8 grid gap-8">
        <section className="grid gap-5 border-t border-ink pt-6">
          <h2 className="text-3xl">The basics</h2>
          <Field label="Name" error={errors.name} hint={slug ? `Page address: /places/${slug}` : undefined} htmlFor="name">
            <input id="name" value={d.name} onChange={(e) => set({ name: e.target.value })} className={inputCls} aria-invalid={!!errors.name} />
          </Field>
          <Field label="Category" htmlFor="category" hint={kind === "food" ? "Shows under Food & drinks." : "Shows under Things to do."}>
            <select
              id="category"
              value={d.category}
              onChange={(e) => {
                const c = e.target.value as CategoryId;
                set({ category: c, durationMins: existing ? d.durationMins : DEFAULT_MINS[c] });
              }}
              className={inputCls}
            >
              <optgroup label="Things to do">
                {CATEGORIES.filter((c) => c.kind === "activity").map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </optgroup>
              <optgroup label="Food & drinks">
                {CATEGORIES.filter((c) => c.kind === "food").map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </optgroup>
            </select>
          </Field>
          <Field label="Short description" error={errors.blurb} hint="One or two sentences shown on the card and page." htmlFor="blurb">
            <textarea
              id="blurb"
              value={d.blurb}
              onChange={(e) => set({ blurb: e.target.value })}
              rows={3}
              className={`${inputCls} h-auto py-3`}
              aria-invalid={!!errors.blurb}
            />
          </Field>
          {kind === "food" && (
            <Field label="Cuisine (optional)" htmlFor="cuisine" hint="e.g. Japanese, Thai, Italian">
              <input id="cuisine" value={d.cuisine ?? ""} onChange={(e) => set({ cuisine: e.target.value })} className={inputCls} />
            </Field>
          )}
        </section>

        <section className="grid gap-5 border-t border-ink pt-6">
          <h2 className="text-3xl">Cost and time</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Estimate per person (S$)"
              error={errors.cost}
              hint={`Shows as “${costLabel({ costPerPerson: d.costPerPerson || 0 } as Place)}”. Use 0 for free.`}
              htmlFor="cost"
            >
              <input
                id="cost"
                type="number"
                inputMode="numeric"
                min={0}
                value={Number.isFinite(d.costPerPerson) ? d.costPerPerson : ""}
                onChange={(e) => set({ costPerPerson: Math.round(Number(e.target.value)) })}
                className={inputCls}
                aria-invalid={!!errors.cost}
              />
            </Field>
            <Field label="Time to allow (minutes)" error={errors.mins} hint="Used for timings in the date builder." htmlFor="mins">
              <input
                id="mins"
                type="number"
                inputMode="numeric"
                min={10}
                step={5}
                value={Number.isFinite(d.durationMins) ? d.durationMins : ""}
                onChange={(e) => set({ durationMins: Math.round(Number(e.target.value)) })}
                className={inputCls}
                aria-invalid={!!errors.mins}
              />
            </Field>
          </div>
        </section>

        <section className="grid gap-5 border-t border-ink pt-6">
          <h2 className="text-3xl">Where</h2>
          <LocationField
            lat={d.lat}
            lng={d.lng}
            area={d.area}
            name={d.name}
            onChange={(v) => set(v)}
          />
          {errors.area && (
            <p role="alert" className="-mt-2 text-sm text-danger">
              {errors.area}
            </p>
          )}
          <Field label="Other branches (optional)" htmlFor="branches" hint="Separate with commas, e.g. Orchard, Clarke Quay">
            <input id="branches" value={branches} onChange={(e) => setBranches(e.target.value)} className={inputCls} />
          </Field>
        </section>

        <section className="grid gap-5 border-t border-ink pt-6">
          <h2 className="text-3xl">Mood and filters</h2>
          <Chips label="Vibes" options={VIBES} value={d.vibes} onChange={(v) => set({ vibes: v as Vibe[] })} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Best time" htmlFor="time">
              <select id="time" value={d.timeOfDay} onChange={(e) => set({ timeOfDay: e.target.value as TimeOfDay })} className={inputCls}>
                <option value="any">Any time</option>
                <option value="day">Daytime</option>
                <option value="evening">Evening</option>
                <option value="night">Late night</option>
              </select>
            </Field>
            <Field label="Status" htmlFor="status">
              <select id="status" value={d.status} onChange={(e) => set({ status: e.target.value as "open" | "closed" })} className={inputCls}>
                <option value="open">Open</option>
                <option value="closed">Temporarily closed</option>
              </select>
            </Field>
          </div>
          <label className="flex items-center gap-3 text-sm font-medium">
            <input type="checkbox" checked={d.indoor} onChange={(e) => set({ indoor: e.target.checked })} className="size-5 accent-[var(--rose)]" />
            Indoors (shows in rain-proof results)
          </label>
        </section>

        <section className="border-t border-ink pt-6">
          <PhotoField value={d.photo} onChange={(p) => set({ photo: p })} folder="places" name={d.name} />
        </section>
      </div>

      <div className="sticky bottom-20 mt-10 flex flex-wrap items-center gap-3 border-t border-line bg-bg/95 py-4 backdrop-blur md:bottom-0">
        <button
          type="submit"
          disabled={saving}
          className="h-12 rounded-full bg-rose px-8 font-semibold text-rose-ink hover:brightness-110 disabled:opacity-50"
        >
          {saving ? "Saving…" : existing ? "Save changes" : "Add place"}
        </button>
        <Link href="/admin" className="h-12 px-3 leading-[3rem] text-sm font-medium text-ink-soft hover:text-ink">
          Cancel
        </Link>
        {existing &&
          (usedIn.length ? (
            <p className="ml-auto text-sm text-ink-soft">
              Used in {usedIn.map((i) => i.title).join(", ")}. Remove it there before deleting.
            </p>
          ) : confirmDelete ? (
            <span className="ml-auto flex items-center gap-2 text-sm">
              Delete {existing.name}?
              <button type="button" onClick={remove} className="h-10 rounded-full bg-danger px-4 font-semibold text-white">
                Delete
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="h-10 px-2 font-medium">
                Keep
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="ml-auto inline-flex h-11 items-center gap-1.5 text-sm text-ink-soft hover:text-danger"
            >
              <Trash size={16} aria-hidden /> Delete place
            </button>
          ))}
      </div>
    </form>
  );
}
