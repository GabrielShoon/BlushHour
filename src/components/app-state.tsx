"use client";

import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PLACE_BY_SLUG } from "@/data/places";
import { newItinerary, stopFor } from "@/lib/itinerary";
import { getSupabase } from "@/lib/supabase/client";
import type { Itinerary, ItineraryStop } from "@/lib/types";

const KEYS = { draft: "bh:draft", favs: "bh:favs", plans: "bh:plans" };

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the in-memory state still works for this visit.
  }
}

type PlanRow = {
  id: string;
  title: string;
  date: string | null;
  start_time: string;
  people: number;
  stops: ItineraryStop[];
  updated_at: string;
};
const fromRow = (r: PlanRow): Itinerary => ({
  id: r.id,
  title: r.title,
  date: r.date,
  startTime: r.start_time,
  people: r.people,
  stops: r.stops,
  updatedAt: r.updated_at,
});
const toRow = (it: Itinerary, userId: string) => ({
  id: it.id,
  user_id: userId,
  title: it.title,
  date: it.date,
  start_time: it.startTime,
  people: it.people,
  stops: it.stops,
  updated_at: it.updatedAt,
});

interface ToastAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface Toast {
  id: number;
  message: string;
  action?: ToastAction;
}

interface AppState {
  ready: boolean;
  user: User | null;
  draft: Itinerary;
  favorites: string[];
  plans: Itinerary[];
  toast: Toast | null;
  inDraft: (slug: string) => boolean;
  addToDraft: (slug: string) => void;
  removeStop: (id: string) => void;
  replaceStop: (id: string, slug: string) => void;
  moveStop: (from: number, to: number) => void;
  setDuration: (id: string, mins: number) => void;
  updateDraft: (patch: Partial<Omit<Itinerary, "stops" | "id">>) => void;
  loadDraft: (it: Itinerary, opts?: { keepId?: boolean }) => void;
  clearDraft: () => void;
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
  saveDraft: () => Promise<boolean>;
  deletePlan: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
  notify: (message: string, action?: ToastAction) => void;
  dismissToast: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside <AppStateProvider>");
  return ctx;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [draft, setDraft] = useState<Itinerary>(() => newItinerary());
  const [favorites, setFavorites] = useState<string[]>([]);
  const [plans, setPlans] = useState<Itinerary[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const notify = useCallback((message: string, action?: ToastAction) => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, action });
    toastTimer.current = setTimeout(() => setToast(null), action?.onClick ? 6000 : 4000);
  }, []);

  const dismissToast = useCallback(() => {
    clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  // Load local state once on mount.
  useEffect(() => {
    const d = read<Itinerary | null>(KEYS.draft, null);
    if (d) setDraft({ ...d, stops: d.stops.filter((s) => PLACE_BY_SLUG[s.slug]) });
    setFavorites(read<string[]>(KEYS.favs, []));
    setPlans(read<Itinerary[]>(KEYS.plans, []));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) write(KEYS.draft, draft);
  }, [draft, ready]);

  // Auth: follow the Supabase session; on sign-in, move browser-only saves into the account.
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !user || !ready) return;
    let cancelled = false;
    (async () => {
      const localFavs = read<string[]>(KEYS.favs, []);
      const localPlans = read<Itinerary[]>(KEYS.plans, []);
      if (localFavs.length) {
        await sb
          .from("favorites")
          .upsert(localFavs.map((s) => ({ user_id: user.id, place_slug: s })), { ignoreDuplicates: true });
      }
      if (localPlans.length) {
        await sb.from("date_plans").upsert(localPlans.map((p) => toRow(p, user.id)));
      }
      if (localFavs.length || localPlans.length) {
        write(KEYS.favs, []);
        write(KEYS.plans, []);
      }
      const [f, p] = await Promise.all([
        sb.from("favorites").select("place_slug").order("created_at", { ascending: false }),
        sb.from("date_plans").select("*").order("updated_at", { ascending: false }),
      ]);
      if (cancelled) return;
      if (f.data) setFavorites(f.data.map((r: { place_slug: string }) => r.place_slug));
      if (p.data) setPlans((p.data as PlanRow[]).map(fromRow));
    })();
    return () => {
      cancelled = true;
    };
  }, [user, ready]);

  const touch = (it: Itinerary): Itinerary => ({ ...it, updatedAt: new Date().toISOString() });

  const addToDraft = useCallback(
    (slug: string) => {
      const p = PLACE_BY_SLUG[slug];
      if (!p) return;
      setDraft((d) => touch({ ...d, stops: [...d.stops, stopFor(slug)] }));
      notify(`${p.name} added to your date`, { href: "/plan", label: "Open builder" });
    },
    [notify],
  );

  const removeStop = useCallback(
    (id: string) => setDraft((d) => touch({ ...d, stops: d.stops.filter((s) => s.id !== id) })),
    [],
  );

  const replaceStop = useCallback(
    (id: string, slug: string) =>
      setDraft((d) =>
        touch({ ...d, stops: d.stops.map((s) => (s.id === id ? stopFor(slug) : s)) }),
      ),
    [],
  );

  const moveStop = useCallback((from: number, to: number) => {
    setDraft((d) => {
      if (to < 0 || to >= d.stops.length) return d;
      const stops = [...d.stops];
      const [item] = stops.splice(from, 1);
      stops.splice(to, 0, item);
      return touch({ ...d, stops });
    });
  }, []);

  const setDuration = useCallback(
    (id: string, mins: number) =>
      setDraft((d) =>
        touch({
          ...d,
          stops: d.stops.map((s) => (s.id === id ? { ...s, durationMins: Math.max(10, mins) } : s)),
        }),
      ),
    [],
  );

  const updateDraft = useCallback(
    (patch: Partial<Omit<Itinerary, "stops" | "id">>) => setDraft((d) => touch({ ...d, ...patch })),
    [],
  );

  const loadDraft = useCallback((it: Itinerary, opts?: { keepId?: boolean }) => {
    setDraft(touch({ ...it, id: opts?.keepId ? it.id : newItinerary().id }));
  }, []);

  const clearDraft = useCallback(() => setDraft(newItinerary()), []);

  const toggleFavorite = useCallback(
    (slug: string) => {
      const sb = getSupabase();
      const on = favorites.includes(slug);
      const next = on ? favorites.filter((s) => s !== slug) : [slug, ...favorites];
      setFavorites(next);
      if (sb && user) {
        const q = on
          ? sb.from("favorites").delete().match({ user_id: user.id, place_slug: slug })
          : sb.from("favorites").insert({ user_id: user.id, place_slug: slug });
        q.then(({ error }: { error: unknown }) => {
          if (error) {
            setFavorites(favorites);
            notify("Couldn't sync that favourite. Try again in a moment.");
          }
        });
      } else {
        write(KEYS.favs, next);
      }
    },
    [favorites, user, notify],
  );

  const saveDraft = useCallback(async () => {
    const it = touch(draft);
    setDraft(it);
    const sb = getSupabase();
    if (sb && user) {
      const { error } = await sb.from("date_plans").upsert(toRow(it, user.id));
      if (error) {
        notify("Couldn't save your date. Check your connection and try again.");
        return false;
      }
    }
    const next = [it, ...plans.filter((p) => p.id !== it.id)];
    setPlans(next);
    if (!(sb && user)) write(KEYS.plans, next);
    notify(user ? "Date saved to your account" : "Date saved on this device", {
      href: "/saved",
      label: "View saved",
    });
    return true;
  }, [draft, plans, user, notify]);

  const deletePlan = useCallback(
    async (id: string) => {
      const sb = getSupabase();
      if (sb && user) {
        const { error } = await sb.from("date_plans").delete().match({ id, user_id: user.id });
        if (error) {
          notify("Couldn't delete that date. Try again.");
          return;
        }
      }
      const next = plans.filter((p) => p.id !== id);
      setPlans(next);
      if (!(sb && user)) write(KEYS.plans, next);
    },
    [plans, user, notify],
  );

  const signOut = useCallback(async () => {
    await getSupabase()?.auth.signOut();
    setUser(null);
    setFavorites(read<string[]>(KEYS.favs, []));
    setPlans(read<Itinerary[]>(KEYS.plans, []));
    notify("Signed out");
  }, [notify]);

  const value = useMemo<AppState>(
    () => ({
      ready,
      user,
      draft,
      favorites,
      plans,
      toast,
      inDraft: (slug) => draft.stops.some((s) => s.slug === slug),
      addToDraft,
      removeStop,
      replaceStop,
      moveStop,
      setDuration,
      updateDraft,
      loadDraft,
      clearDraft,
      isFavorite: (slug) => favorites.includes(slug),
      toggleFavorite,
      saveDraft,
      deletePlan,
      signOut,
      notify,
      dismissToast,
    }),
    [
      ready, user, draft, favorites, plans, toast, addToDraft, removeStop, replaceStop, moveStop,
      setDuration, updateDraft, loadDraft, clearDraft, toggleFavorite, saveDraft, deletePlan, signOut,
      notify, dismissToast,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
