"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { buildCatalogue, type Catalogue } from "@/lib/catalogue";
import type { Place, SuggestedDate } from "@/lib/types";

const Ctx = createContext<Catalogue | null>(null);

/** Hands the server-loaded catalogue to client components. */
export function CatalogueProvider({
  places,
  ideas,
  children,
}: {
  places: Place[];
  ideas: SuggestedDate[];
  children: ReactNode;
}) {
  const value = useMemo(() => buildCatalogue(places, ideas), [places, ideas]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCatalogue() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCatalogue must be used inside <CatalogueProvider>");
  return ctx;
}
