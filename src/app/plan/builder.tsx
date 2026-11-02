"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowsClockwise,
  ArrowUp,
  CalendarBlank,
  Clock,
  DotsSixVertical,
  FloppyDisk,
  MinusCircle,
  Path,
  Plus,
  PlusCircle,
  Trash,
  Users,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/components/app-state";
import { CategoryIcon } from "@/components/icons";
import { Photo } from "@/components/photo";
import { MapView } from "@/components/map";
import { CATEGORY_BY_ID } from "@/data/categories";
import { placePhoto } from "@/data/photos";
import { PLACE_BY_SLUG } from "@/data/places";
import { SUGGESTED_DATES } from "@/data/suggested-dates";
import {
  costLabel,
  formatDuration,
  formatSGD,
  formatTime,
  schedule,
  type ScheduledStop,
} from "@/lib/itinerary";
import { PlacePicker } from "./place-picker";

const inputCls =
  "h-11 w-full rounded-xl border border-line bg-surface px-3 font-medium text-ink focus:border-rose";

function StopCard({
  s,
  index,
  total,
  onReplace,
  onRemove,
}: {
  s: ScheduledStop;
  index: number;
  total: number;
  onReplace: () => void;
  onRemove: () => void;
}) {
  const { moveStop, setDuration } = useApp();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: s.stop.id });
  const cat = CATEGORY_BY_ID[s.place.category];

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative rounded-card border bg-surface transition-shadow ${
        isDragging ? "z-10 border-ink shadow-lift" : "border-line"
      }`}
    >
      <div className="flex gap-3 p-4">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder ${s.place.name}. Use space and arrow keys with a keyboard.`}
          className="-ml-1 grid w-8 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-ink-soft hover:bg-surface-2 active:cursor-grabbing"
        >
          <DotsSixVertical size={22} weight="bold" aria-hidden />
        </button>

        <Link
          href={`/places/${s.place.slug}`}
          tabIndex={-1}
          aria-hidden
          className="relative hidden size-24 shrink-0 overflow-hidden rounded-card sm:block"
        >
          <Photo photo={placePhoto(s.place)} sizes="96px" decorative />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-rose tabular">
                {formatTime(s.start)} – {formatTime(s.end)}
              </p>
              <h3 className="truncate text-2xl">
                <Link href={`/places/${s.place.slug}`} className="hover:text-rose">
                  {s.place.name}
                </Link>
              </h3>
              <p className="flex flex-wrap items-center gap-x-3 text-sm text-ink-soft">
                <span className="inline-flex items-center gap-1">
                  <CategoryIcon id={s.place.category} size={16} /> {cat.label}
                </span>
                <span>{s.place.area}</span>
                <span className="tabular">
                  {costLabel(s.place)}
                </span>
              </p>
            </div>
            <span className="shrink-0 font-display text-3xl leading-none text-rose tabular" aria-hidden>
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 rounded-full border border-line p-0.5" role="group" aria-label="Duration">
              <button
                type="button"
                onClick={() => setDuration(s.stop.id, s.stop.durationMins - 15)}
                aria-label={`Shorten ${s.place.name} by 15 minutes`}
                className="grid size-9 place-items-center rounded-full text-ink-soft hover:bg-surface-2 hover:text-ink"
              >
                <MinusCircle size={20} aria-hidden />
              </button>
              <span className="min-w-16 text-center text-sm font-semibold tabular" aria-live="polite">
                {formatDuration(s.stop.durationMins)}
              </span>
              <button
                type="button"
                onClick={() => setDuration(s.stop.id, s.stop.durationMins + 15)}
                aria-label={`Extend ${s.place.name} by 15 minutes`}
                className="grid size-9 place-items-center rounded-full text-ink-soft hover:bg-surface-2 hover:text-ink"
              >
                <PlusCircle size={20} aria-hidden />
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveStop(index, index - 1)}
                disabled={index === 0}
                aria-label={`Move ${s.place.name} earlier`}
                className="grid size-10 place-items-center rounded-full text-ink-soft hover:bg-surface-2 hover:text-ink disabled:opacity-30"
              >
                <ArrowUp size={18} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => moveStop(index, index + 1)}
                disabled={index === total - 1}
                aria-label={`Move ${s.place.name} later`}
                className="grid size-10 place-items-center rounded-full text-ink-soft hover:bg-surface-2 hover:text-ink disabled:opacity-30"
              >
                <ArrowDown size={18} aria-hidden />
              </button>
              <button
                type="button"
                onClick={onReplace}
                className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-ink-soft hover:bg-surface-2 hover:text-ink"
              >
                <ArrowsClockwise size={18} aria-hidden /> Swap
              </button>
              <button
                type="button"
                onClick={onRemove}
                aria-label={`Remove ${s.place.name}`}
                className="grid size-10 place-items-center rounded-full text-ink-soft hover:bg-rose-soft hover:text-danger"
              >
                <Trash size={18} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyBuilder({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="border-y border-line py-12 text-center sm:py-16">
      <p className="eyebrow">Your date</p>
      <h2 className="mt-3 text-5xl">
        A blank page, <em className="text-rose">for now.</em>
      </h2>
      <p className="mx-auto mt-2 max-w-md text-ink-soft">
        Add your first stop, then build around it. You can also start from a date idea and change whatever you like.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-rose px-6 font-semibold text-rose-ink hover:brightness-110"
        >
          <Plus size={18} weight="bold" aria-hidden /> Add a stop
        </button>
        <Link
          href="/explore"
          className="inline-flex h-12 items-center rounded-full border border-ink px-6 font-semibold hover:bg-surface-2"
        >
          Browse places
        </Link>
      </div>
      <p className="eyebrow mt-10">Or start from an idea</p>
      <ul className="mt-3 flex flex-wrap justify-center gap-2">
        {SUGGESTED_DATES.slice(0, 4).map((d) => (
          <li key={d.slug}>
            <Link
              href={`/dates/${d.slug}`}
              className="inline-flex h-10 items-center rounded-full border border-line px-4 text-sm font-medium hover:border-ink"
            >
              {d.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Builder() {
  const app = useApp();
  const { draft, ready, updateDraft, removeStop, replaceStop, moveStop, loadDraft, clearDraft, notify, saveDraft, user } =
    app;
  const [picker, setPicker] = useState<{ mode: "add" } | { mode: "replace"; stopId: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const plan = useMemo(() => schedule(draft), [draft]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = draft.stops.findIndex((s) => s.id === active.id);
    const to = draft.stops.findIndex((s) => s.id === over.id);
    moveStop(from, to);
  };

  const remove = (stopId: string, name: string) => {
    const before = draft;
    removeStop(stopId);
    notify(`Removed ${name}`, { label: "Undo", onClick: () => loadDraft(before, { keepId: true }) });
  };

  const save = async () => {
    setSaving(true);
    await saveDraft();
    setSaving(false);
  };

  const mapPoints = plan.stops
    .filter((s) => s.place.lat != null)
    .map((s) => ({
      lat: s.place.lat!,
      lng: s.place.lng!,
      title: s.place.name,
      label: String(plan.stops.indexOf(s) + 1),
      href: `/places/${s.place.slug}`,
    }));

  const hasStops = plan.stops.length > 0;
  const replacing = picker?.mode === "replace" ? draft.stops.find((s) => s.id === picker.stopId) : undefined;

  if (!ready) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6" aria-busy>
        <div className="h-12 w-64 animate-pulse rounded-xl bg-surface-2" />
        <div className="mt-6 h-64 animate-pulse rounded-card bg-surface-2" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="sr-only">Date builder</h1>
      {/* Title + meta */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex-1">
          <label htmlFor="title" className="eyebrow">
            Name your date
          </label>
          <input
            id="title"
            value={draft.title}
            onChange={(e) => updateDraft({ title: e.target.value })}
            maxLength={80}
            className="block w-full rounded-xl border border-transparent bg-transparent font-display text-5xl hover:border-line focus:border-ink sm:text-6xl"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:w-[30rem]">
          <label className="col-span-2 flex flex-col gap-1 text-sm font-semibold text-ink-soft sm:col-span-1">
            <span className="inline-flex items-center gap-1">
              <CalendarBlank size={16} aria-hidden /> Date
            </span>
            <input
              type="date"
              value={draft.date ?? ""}
              onChange={(e) => updateDraft({ date: e.target.value || null })}
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-ink-soft">
            <span className="inline-flex items-center gap-1">
              <Clock size={16} aria-hidden /> Start
            </span>
            <input
              type="time"
              value={draft.startTime}
              onChange={(e) => e.target.value && updateDraft({ startTime: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-ink-soft">
            <span className="inline-flex items-center gap-1">
              <Users size={16} aria-hidden /> People
            </span>
            <input
              type="number"
              min={1}
              max={20}
              inputMode="numeric"
              value={draft.people}
              onChange={(e) => updateDraft({ people: Math.min(20, Math.max(1, Number(e.target.value) || 1)) })}
              className={inputCls}
            />
          </label>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_1fr]">
        {/* Stops */}
        <section aria-label="Stops">
          {!hasStops ? (
            <EmptyBuilder onAdd={() => setPicker({ mode: "add" })} />
          ) : (
            <>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={draft.stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <ol>
                    {plan.stops.map((s, i) => (
                      <li key={s.stop.id}>
                        {s.travelBefore > 0 && (
                          <p className="ml-7 flex items-center gap-2 border-l-2 border-dashed border-line py-3 pl-7 text-sm text-ink-soft tabular">
                            <Path size={16} aria-hidden /> ~{s.travelBefore} min to get there
                          </p>
                        )}
                        <StopCard
                          s={s}
                          index={i}
                          total={plan.stops.length}
                          onReplace={() => setPicker({ mode: "replace", stopId: s.stop.id })}
                          onRemove={() => remove(s.stop.id, s.place.name)}
                        />
                      </li>
                    ))}
                  </ol>
                </SortableContext>
              </DndContext>
              <button
                type="button"
                onClick={() => setPicker({ mode: "add" })}
                className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-card border-2 border-dashed border-line font-semibold text-ink-soft transition hover:border-rose hover:text-rose"
              >
                <Plus size={20} weight="bold" aria-hidden /> Add another stop
              </button>
            </>
          )}
        </section>

        {/* Summary */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start" aria-label="Summary">
          <div className="overflow-hidden rounded-card border border-line bg-surface">
            {mapPoints.length ? (
              <MapView points={mapPoints} route className="h-64 w-full lg:h-72" />
            ) : (
              <div className="grid h-40 place-items-center bg-surface-2 text-sm text-ink-soft">
                Your route will appear here
              </div>
            )}
          </div>

          <div className="rounded-card border border-line bg-surface p-6">
            <h2 className="text-3xl">Summary</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              <div className="border-t border-line pt-3">
                <dt className="eyebrow">Time</dt>
                <dd className="whitespace-nowrap font-display text-2xl tabular">
                  {hasStops ? `${formatTime(plan.stops[0].start)}–${formatTime(plan.end)}` : "–"}
                </dd>
              </div>
              <div className="border-t border-line pt-3">
                <dt className="eyebrow">Travel</dt>
                <dd className="font-display text-2xl tabular">
                  {hasStops ? formatDuration(plan.totalTravel || 0) : "–"}
                </dd>
              </div>
            </dl>

            <h3 className="eyebrow mt-6">
              Estimated cost · {draft.people} {draft.people === 1 ? "person" : "people"}
            </h3>
            <ul className="mt-2 divide-y divide-line text-sm">
              {plan.stops.map((s) => (
                <li key={s.stop.id} className="flex justify-between gap-3 py-2">
                  <span className="truncate">{s.place.name}</span>
                  <span className="shrink-0 font-semibold tabular">
                    {formatSGD(s.place.costPerPerson * draft.people)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-baseline justify-between border-t-2 border-ink pt-3">
              <span className="font-semibold">Total</span>
              <span className="font-display text-4xl tabular">{formatSGD(plan.totalCost)}</span>
            </div>
            {hasStops && draft.people > 1 && (
              <p className="text-right text-sm text-ink-soft tabular">
                {formatSGD(plan.totalCost / draft.people)} per person
              </p>
            )}
            <p className="mt-3 text-xs text-ink-soft">
              Rough estimates based on typical prices, excluding transport. Travel times assume MRT or Grab.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={save}
                disabled={!hasStops || saving}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-rose font-semibold text-rose-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <FloppyDisk size={20} aria-hidden /> {saving ? "Saving…" : "Save this date"}
              </button>
              {!user && hasStops && (
                <p className="text-center text-xs text-ink-soft">
                  Saved on this device.{" "}
                  <Link href="/login?next=/plan" className="font-semibold text-rose underline-offset-2 hover:underline">
                    Sign in
                  </Link>{" "}
                  to keep it across devices.
                </p>
              )}
              {hasStops &&
                (confirmClear ? (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span>Clear all stops?</span>
                    <button
                      type="button"
                      onClick={() => {
                        clearDraft();
                        setConfirmClear(false);
                      }}
                      className="h-10 rounded-full bg-danger px-4 font-semibold text-white"
                    >
                      Clear
                    </button>
                    <button type="button" onClick={() => setConfirmClear(false)} className="h-10 px-3 font-semibold">
                      Keep
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="h-11 text-sm font-semibold text-ink-soft hover:text-danger"
                  >
                    Start a new date
                  </button>
                ))}
            </div>
          </div>
        </aside>
      </div>

      {picker && (
        <PlacePicker
          title={replacing ? `Swap ${PLACE_BY_SLUG[replacing.slug]?.name}` : "Add a stop"}
          replacing={replacing ? PLACE_BY_SLUG[replacing.slug] : undefined}
          anchor={plan.stops.at(-1)?.place}
          exclude={draft.stops.map((s) => s.slug)}
          onPick={(slug) => {
            if (picker.mode === "replace") {
              replaceStop(picker.stopId, slug);
              notify(`Swapped in ${PLACE_BY_SLUG[slug].name}`);
            } else {
              app.addToDraft(slug);
              notify(`Added ${PLACE_BY_SLUG[slug].name}`);
            }
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}
