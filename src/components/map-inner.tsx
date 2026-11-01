"use client";

import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";

export interface MapPoint {
  lat: number;
  lng: number;
  title: string;
  label?: string;
  href?: string;
  muted?: boolean;
}

function pin(label: string | undefined, muted: boolean | undefined) {
  return L.divIcon({
    className: "",
    html: `<div class="bh-pin${muted ? " muted" : ""}"><span>${label ?? ""}</span></div>`,
    iconSize: muted ? [22, 22] : [30, 30],
    iconAnchor: muted ? [2, 22] : [3, 30],
    popupAnchor: [12, -26],
  });
}

function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap();
  const key = points.map((p) => `${p.lat},${p.lng}`).join("|");
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) map.setView([points[0].lat, points[0].lng], 15);
    else map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), { padding: [40, 40], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

export default function MapInner({
  points,
  route = false,
  className = "",
}: {
  points: MapPoint[];
  route?: boolean;
  className?: string;
}) {
  const routePts = points.filter((p) => !p.muted).map((p) => [p.lat, p.lng] as [number, number]);
  return (
    <MapContainer
      center={[1.3, 103.83]}
      zoom={12}
      scrollWheelZoom={false}
      className={`isolate z-0 ${className}`}
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      {route && routePts.length > 1 && (
        <Polyline positions={routePts} pathOptions={{ color: "#c2255c", weight: 3, dashArray: "6 8" }} />
      )}
      {points.map((p, i) => (
        <Marker key={`${p.title}-${i}`} position={[p.lat, p.lng]} icon={pin(p.label, p.muted)}>
          <Popup>
            {p.href ? (
              <a href={p.href} style={{ fontWeight: 600 }}>
                {p.title}
              </a>
            ) : (
              <strong>{p.title}</strong>
            )}
          </Popup>
        </Marker>
      ))}
      <FitBounds points={points} />
    </MapContainer>
  );
}
