import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { builtinCatalogue } from "@/data/builtin";
import { buildCatalogue, rowToIdea, rowToPlace, type Catalogue, type IdeaRow, type PlaceRow } from "./catalogue";

export const CATALOGUE_TAG = "catalogue";

/**
 * Reads places and date ideas from Supabase, cached until an admin change
 * revalidates the "catalogue" tag. Throws on failure so a failure isn't cached.
 */
const loadRows = unstable_cache(
  async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("Supabase is not configured");
    const sb = createClient(url, key, { auth: { persistSession: false } });
    const [places, ideas] = await Promise.all([
      sb.from("places").select("*").order("position").order("name"),
      sb.from("date_ideas").select("*").order("position").order("title"),
    ]);
    if (places.error) throw places.error;
    if (ideas.error) throw ideas.error;
    if (!places.data.length) throw new Error("No places in the database yet");
    return { places: places.data as PlaceRow[], ideas: ideas.data as IdeaRow[] };
  },
  ["catalogue-v1"],
  { tags: [CATALOGUE_TAG], revalidate: 3600 },
);

export async function getCatalogue(): Promise<Catalogue> {
  try {
    const rows = await loadRows();
    return buildCatalogue(rows.places.map(rowToPlace), rows.ideas.map(rowToIdea));
  } catch (error) {
    console.warn("BlushHour: using the built-in catalogue:", (error as Error).message ?? error);
    return builtinCatalogue();
  }
}
