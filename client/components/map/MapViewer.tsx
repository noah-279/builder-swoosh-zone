import { useEffect, useMemo, useRef } from "react";
import L, { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
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

function createGlowingMarker(h: Hazard) {
  const color = iconColor(h.type);
  const html = `<div style="width:18px;height:18px;border-radius:50%;background:hsla(${color},0.9);box-shadow:0 0 14px hsla(${color},0.9),0 0 28px hsla(${color},0.5);border:2px solid rgba(255,255,255,.2)" class="pulse-glow"></div>`;
  return L.marker([h.lat, h.lng], {
    icon: L.divIcon({ className: "", html, iconSize: [18, 18], iconAnchor: [9, 9] }),
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
    const map = L.map("hazard-map", { zoomControl: false, scrollWheelZoom: true, attributionControl: false }).setView([20, 0], 2);
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

    // Markers with popups
    filtered.forEach((h) => {
      const m = createGlowingMarker(h).addTo(layer);
      const popup = `
        <div style="min-width:220px">
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:hsl(${iconColor(h.type)});"></span>
            <strong style="color:#fff">${h.type}</strong>
            ${h.verified ? '<span style="margin-left:auto;color:#7CFC9A">Verified</span>' : ""}
          </div>
          <img src="${h.mediaUrl}" alt="media" style="width:100%;height:110px;object-fit:cover;border-radius:8px;opacity:.9" />
          <p style="margin-top:6px;color:#cbd5e1">${h.description}</p>
        </div>`;
      m.bindPopup(popup);
    });

    // Heatmap
    const heatPoints = filtered.map((h) => [h.lat, h.lng, 0.4 + (h.verified ? 0.3 : 0)] as [number, number, number]);

    if (heatRef.current) {
      heatRef.current.setLatLngs(heatPoints);
    } else {
      heatRef.current = (L as any).heatLayer(heatPoints, { radius: 20, blur: 15, minOpacity: 0.3, maxZoom: 10 }).addTo(mapRef.current!);
    }
  }, [filtered]);

  return <div id="hazard-map" className="w-full h-full rounded-xl overflow-hidden ring-1 ring-white/10" />;
}
