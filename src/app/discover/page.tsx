import type { Metadata } from "next";
import { DiscoverClient, type DiscoverFilters } from "./discover-client";

export const metadata: Metadata = {
  title: "Discover date ideas",
  description: "Search Singapore activities, restaurants and hidden gems by vibe, area, budget and time of day.",
};

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const initial: DiscoverFilters = {
    q: one("q"),
    kind: (one("kind") as DiscoverFilters["kind"]) || "all",
    category: one("category"),
    vibe: one("vibe"),
    area: one("area"),
    maxPrice: one("price") ? Number(one("price")) : 4,
    time: one("time"),
    indoor: one("indoor") === "1",
    sort: (one("sort") as DiscoverFilters["sort"]) || "recommended",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-4xl font-semibold sm:text-5xl">Discover</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Search, filter, heart and add. Everything you add goes into your date builder.
      </p>
      <DiscoverClient initial={initial} />
    </div>
  );
}
