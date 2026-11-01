"use client";

import type { Place } from "@/lib/types";
import { MapView } from "./map";

export function PlaceMap({ place, nearby }: { place: Place; nearby: Place[] }) {
  const points = [
    { lat: place.lat!, lng: place.lng!, title: place.name, label: "♥" },
    ...nearby
      .filter((p) => p.lat != null)
      .map((p) => ({ lat: p.lat!, lng: p.lng!, title: p.name, href: `/places/${p.slug}`, muted: true })),
  ];
  return <MapView points={points} className="h-80 w-full lg:h-full lg:min-h-96" />;
}
