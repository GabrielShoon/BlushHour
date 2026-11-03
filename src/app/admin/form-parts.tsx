"use client";

import { MagnifyingGlass, UploadSimple, X } from "@phosphor-icons/react/dist/ssr";
import { useState, type ReactNode } from "react";
import { MapView } from "@/components/map";
import { Photo } from "@/components/photo";
import { getSupabase } from "@/lib/supabase/client";
import type { Photo as PhotoData } from "@/lib/types";

export const inputCls =
  "h-12 w-full rounded-xl border border-line bg-surface px-4 text-base text-ink focus:border-ink aria-[invalid=true]:border-danger";

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-ink-soft">{hint}</p>
      )}
    </div>
  );
}

export function Chips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { id: T; label: string }[];
  value: T[];
  onChange: (v: T[]) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((v) => v !== o.id) : [...value, o.id])}
              className={`h-10 rounded-full border px-4 text-sm font-medium transition ${
                on ? "border-ink bg-ink text-bg" : "border-line text-ink-soft hover:border-ink"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Uploads a photo to the public "catalogue" bucket and reports its size for layout. */
export function PhotoField({
  value,
  onChange,
  folder,
  name,
}: {
  value: PhotoData | undefined;
  onChange: (p: PhotoData | undefined) => void;
  folder: "places" | "dates";
  name: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) return setError("Choose an image file (JPG, PNG or WebP).");
    if (file.size > 10 * 1024 * 1024) return setError("That photo is over 10 MB. Try a smaller one.");
    const sb = getSupabase();
    if (!sb) return setError("Supabase isn't configured.");
    setBusy(true);
    try {
      const bitmap = await createImageBitmap(file);
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const { error: upErr } = await sb.storage
        .from("catalogue")
        .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
      if (upErr) throw upErr;
      const { publicUrl } = sb.storage.from("catalogue").getPublicUrl(path).data;
      onChange({ kind: "local", src: publicUrl, width: bitmap.width, height: bitmap.height, alt: name });
    } catch (e) {
      console.error("BlushHour: photo upload failed", e);
      setError("Upload failed. Check you ran 0003_catalogue.sql, then try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold">Photo</span>
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative aspect-[4/5] w-40 overflow-hidden rounded-card border border-line bg-surface-2">
          {value ? (
            <Photo photo={value} sizes="160px" decorative />
          ) : (
            <p className="absolute inset-0 grid place-items-center p-3 text-center text-xs text-ink-soft">
              No photo yet. A stock photo is used.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-ink px-5 text-sm font-semibold hover:bg-surface-2">
            <UploadSimple size={18} aria-hidden />
            {busy ? "Uploading…" : value ? "Replace photo" : "Upload photo"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={busy}
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
            />
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="inline-flex h-10 items-center gap-1.5 self-start px-1 text-sm text-ink-soft hover:text-danger"
            >
              <X size={16} aria-hidden /> Remove photo
            </button>
          )}
          <p className="max-w-xs text-xs text-ink-soft">Portrait or square works best on cards. Up to 10 MB.</p>
          {error && (
            <p role="alert" className="max-w-xs text-sm text-danger">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface Hit {
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
}

function areaFrom(a: Record<string, string> = {}) {
  return a.suburb || a.neighbourhood || a.quarter || a.city_district || a.town || a.road || "Singapore";
}

/**
 * Finds an address with OpenStreetMap's free search and sets the map pin and
 * area. "Several locations" clears the pin for chains with many branches.
 */
export function LocationField({
  lat,
  lng,
  area,
  name,
  onChange,
}: {
  lat: number | null;
  lng: number | null;
  area: string;
  name: string;
  onChange: (v: { lat: number | null; lng: number | null; area: string }) => void;
}) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const several = lat == null && area === "Various locations";

  const search = async () => {
    if (!q.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=sg&limit=5&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as Hit[];
      setHits(data);
      if (!data.length) setError("No matches. Try the street name, building or postal code.");
    } catch {
      setError("The address search didn't respond. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold">Location</span>
      <div className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Search address or postal code</span>
          <MagnifyingGlass size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                search();
              }
            }}
            placeholder="Address, building or postal code"
            className={`${inputCls} pl-11`}
          />
        </label>
        <button
          type="button"
          onClick={search}
          disabled={busy}
          className="h-12 shrink-0 rounded-xl border border-ink px-5 text-sm font-semibold hover:bg-surface-2 disabled:opacity-50"
        >
          {busy ? "Finding…" : "Find"}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      {hits && hits.length > 0 && (
        <ul className="divide-y divide-line rounded-xl border border-line">
          {hits.map((h) => (
            <li key={h.lat + h.lon}>
              <button
                type="button"
                onClick={() => {
                  onChange({ lat: Number(h.lat), lng: Number(h.lon), area: areaFrom(h.address) });
                  setHits(null);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-surface-2"
              >
                {h.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <Field label="Area shown on the card" hint="Filled in from the address. You can change it, e.g. “Bugis”.">
          <input
            value={area}
            onChange={(e) => onChange({ lat, lng, area: e.target.value })}
            className={inputCls}
            required
          />
        </Field>
        <label className="flex h-12 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={several}
            onChange={(e) =>
              onChange(e.target.checked ? { lat: null, lng: null, area: "Various locations" } : { lat, lng, area: "" })
            }
            className="size-5 accent-[var(--rose)]"
          />
          Several locations
        </label>
      </div>
      {lat != null && lng != null && (
        <div className="overflow-hidden rounded-card border border-line">
          <MapView points={[{ lat, lng, title: name || "New place", label: "♥" }]} className="h-56 w-full" />
        </div>
      )}
    </div>
  );
}
