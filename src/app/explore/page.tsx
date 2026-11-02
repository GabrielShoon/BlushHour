import type { Metadata } from "next";
import { ExploreClient, type ExploreState } from "./explore-client";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Singapore date ideas and places by mood, area and budget. Pick a starting point, then make the date your own.",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const tab = one("tab") === "places" || one("q") || one("category") || one("collection") ? "places" : "ideas";
  const initial: ExploreState = {
    tab,
    q: one("q"),
    kind: (one("kind") as ExploreState["kind"]) || "all",
    category: one("category"),
    collection: one("collection"),
    vibe: one("vibe"),
    area: one("area"),
    maxPrice: one("price") ? Number(one("price")) : 4,
    time: one("time"),
    indoor: one("indoor") === "1",
    sort: (one("sort") as ExploreState["sort"]) || "recommended",
    mood: one("mood"),
    occasion: one("occasion"),
    budget: one("budget"),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <ExploreClient initial={initial} />
    </div>
  );
}
