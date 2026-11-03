import { buildCatalogue, type Catalogue } from "@/lib/catalogue";
import { builtinIdeaPhoto, builtinPlacePhoto } from "./photos";
import { PLACES } from "./places";
import { SUGGESTED_DATES } from "./suggested-dates";

/**
 * The catalogue that shipped with the code. It seeds the database
 * (supabase/migrations/0004_seed.sql) and is the fallback when the database
 * can't be reached; after that, the admin pages are the source of truth.
 */
export function builtinCatalogue(): Catalogue {
  return buildCatalogue(
    PLACES.map((p) => ({ ...p, photo: builtinPlacePhoto(p.slug, p.name) })),
    SUGGESTED_DATES.map((d) => ({ ...d, photo: builtinIdeaPhoto(d.slug) })),
  );
}
