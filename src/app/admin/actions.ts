"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CATALOGUE_TAG } from "@/lib/catalogue-server";
import { getServerSupabase } from "@/lib/supabase/server";

/**
 * Called after the admin saves or deletes something: refreshes the cached
 * catalogue so every page (filters, shelves, maps, costs) picks it up.
 */
export async function refreshCatalogue() {
  const sb = await getServerSupabase();
  const { data: isAdmin } = (await sb?.rpc("is_admin")) ?? { data: false };
  if (isAdmin !== true) throw new Error("Only admins can refresh the catalogue");
  revalidateTag(CATALOGUE_TAG);
  revalidatePath("/", "layout");
}
