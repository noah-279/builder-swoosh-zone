import { useEffect, useMemo, useRef } from "react";
import L, { Map as LeafletMap } from "leaflet";
import "leaflet.heat";

export type Hazard = {
  id: string;
  lat: number;
  lng: number;
  type: "Flooding" | "Tsunami" | "High Waves" | "Erosion" | "Other";
  description: string;
  mediaUrl: string;
  date: string; // ISO
  source: "Citizen" | "Official";
  verified: boolean;
};

export type Filters = {
  type: string | "All";
  source: string | "All";
  from?: string;
  to?: string;
  verified?: boolean | "All";
};

function iconColor(t: Hazard["type"]) {
  switch (t) {
    case "Flooding":
      return "var(--neon-aqua)";
    case "Tsunami":
      return "var(--neon-blue)";
    case "High Waves":
      return "var(--neon-blue)";
    case "Erosion":
      return "var(--neon-green)";
    default:
      return "var(--neon-blue)";
  }
}

type Cluster = { lat: number; lng: number; count: number; items: Hazard[] };

function severity(count: number) {
  if (count >= 6) return "high" as const;
  if (count >= 3) return "med" as const;
  return "low" as const;
}

function severityColor(count: number) {
  const s = severity(count);
  if (s === "high") return "var(--neon-red)";
  if (s === "med") return "var(--neon-orange)";
  return "var(--neon-green)";
}

function createSeverityMarker(c: Cluster) {
  const color = severityColor(c.count);
  const size = Math.min(22 + c.count * 2, 36);
  const pulse = c.count >= 6 ? "pulse-glow" : "";
  const html = `<div class="${pulse}" style="width:${size}px;height:${size}px;border-radius:50%;display:grid;place-items:center;background:hsla(${color},0.18);color:#fff;font-weight:700;border:1px solid hsla(${color},0.6);box-shadow:0 0 14px hsla(${color},0.7),0 0 28px hsla(${color},0.35);">${c.count}</div>`;
  return L.marker([c.lat, c.lng], {
    icon: L.divIcon({ className: "", html, iconSize: [size, size], iconAnchor: [size/2, size/2] }),
  });
}

export default function MapViewer({ data, filters }: { data: Hazard[]; filters: Filters }) {
  const mapRef = useRef<LeafletMap | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const heatRef = useRef<any>(null);

  const filtered = useMemo(() => {
    return data.filter((d) => {
      const typeOk = filters.type === "All" || d.type === filters.type;
      const sourceOk = filters.source === "All" || d.source === filters.source;
      const verOk = filters.verified === "All" || filters.verified === undefined ? true : d.verified === filters.verified;
      const t = new Date(d.date).getTime();
      const fromOk = filters.from ? t >= new Date(filters.from).getTime() : true;
      const toOk = filters.to ? t <= new Date(filters.to).getTime() : true;
      return typeOk && sourceOk && verOk && fromOk && toOk;
    });
  }, [data, filters]);

  useEffect(() => {
    if (mapRef.current) return; // init once
    const INDIA_BOUNDS = L.latLngBounds([6.5, 68.0], [37.5, 97.5]);
    const map = L.map("hazard-map", {
      zoomControl: false,
      scrollWheelZoom: true,
      attributionControl: false,
      maxBounds: INDIA_BOUNDS,
      maxBoundsViscosity: 1.0,
      minZoom: 4,
      maxZoom: 10,
    }).setView([22.9734, 78.6569], 5);
    mapRef.current = map;

    // Dark tiles
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        subdomains: "abcd",
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      },
    ).addTo(map);

    // Controls
    L.control.zoom({ position: "bottomright" }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
  }, []);

  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current) return;
    const layer = layerGroupRef.current;
    layer.clearLayers();

    // Aggregate reports into grid clusters for severity
    const grid = 0.7; // degrees (~75km)
    const mapClusters = new Map<string, Cluster>();

    for (const h of filtered) {
      const gx = Math.round(h.lat / grid);
      const gy = Math.round(h.lng / grid);
      const key = `${gx}_${gy}`;
      const prev = mapClusters.get(key);
      if (prev) {
        prev.count += 1;
        prev.items.push(h);
        prev.lat = (prev.lat * (prev.count - 1) + h.lat) / prev.count;
        prev.lng = (prev.lng * (prev.count - 1) + h.lng) / prev.count;
      } else {
        mapClusters.set(key, { lat: h.lat, lng: h.lng, count: 1, items: [h] });
      }
    }

    const clusters = Array.from(mapClusters.values());

    // Markers with popups per cluster
    clusters.forEach((c) => {
      const m = createSeverityMarker(c).addTo(layer);
      const list = c.items
        .slice(0, 4)
        .map(
          (it) => `
          <div style="display:flex;gap:6px;margin-top:6px">
            <img src="${it.mediaUrl}" alt="m" style="width:44px;height:44px;border-radius:6px;object-fit:cover;opacity:.9" />
            <div style="font-size:12px;color:#cbd5e1"><strong style="color:#fff">${it.type}</strong><br/>${it.description}</div>
          </div>`,
        )
        .join("");
      const popup = `
        <div style="min-width:240px">
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:hsl(${severityColor(c.count)});"></span>
            <strong style="color:#fff">Reports: ${c.count}</strong>
          </div>
          ${list}
        </div>`;
      m.bindPopup(popup);
    });

    // Heatmap weighted by cluster count
    const heatPoints = clusters.map((c) => [c.lat, c.lng, Math.min(0.3 + c.count * 0.12, 0.9)] as [number, number, number]);

    if (heatRef.current) {
      heatRef.current.setLatLngs(heatPoints);
    } else {
      heatRef.current = (L as any).heatLayer(heatPoints, { radius: 22, blur: 16, minOpacity: 0.3, maxZoom: 10 }).addTo(mapRef.current!);
    }
  }, [filtered]);

  return <div id="hazard-map" className="w-full h-full rounded-xl overflow-hidden ring-1 ring-white/10" />;
}
