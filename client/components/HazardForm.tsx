import { useEffect, useState } from "react";
import type { Hazard } from "./map/MapViewer";

const hazardTypes: Hazard["type"][] = [
  "Flooding",
  "Tsunami",
  "High Waves",
  "Erosion",
  "Other",
];

type Props = {
  onSubmit: (h: Omit<Hazard, "id">) => void;
};

export default function HazardForm({ onSubmit }: Props) {
  const [type, setType] = useState<Hazard["type"]>("Flooding");
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("/placeholder.svg");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  useEffect(() => {
    const clampToIndia = (la: number, ln: number) => {
      const lat = Math.min(37.5, Math.max(6.5, la));
      const lng = Math.min(97.5, Math.max(68.0, ln));
      return { lat, lng };
    };
    if (!navigator.geolocation) {
      const c = clampToIndia(22.9734, 78.6569);
      setLat(c.lat);
      setLng(c.lng);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = clampToIndia(pos.coords.latitude, pos.coords.longitude);
        setLat(c.lat);
        setLng(c.lng);
      },
      () => {
        const c = clampToIndia(22.9734, 78.6569);
        setLat(c.lat);
        setLng(c.lng);
      },
    );
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setMediaUrl(reader.result as string);
    };
    reader.readAsDataURL(f);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lat == null || lng == null) return;
    onSubmit({
      lat,
      lng,
      type,
      description,
      mediaUrl,
      date: new Date().toISOString(),
      source: "Citizen",
      verified: false,
    });

    setDescription("");
  };

  return (
    <form onSubmit={submit} className="glass rounded-2xl p-4 space-y-3">
      <h3 className="font-semibold text-glow-blue">Report a Hazard</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-white/70">Type</label>
          <select
            className="mt-1 w-full h-10 rounded-md bg-black/30 border border-white/10 px-3 outline-none focus:ring-2 focus:ring-[hsl(var(--neon-aqua))] glow-aqua"
            value={type}
            onChange={(e) => setType(e.target.value as Hazard["type"])}
          >
            {hazardTypes.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-white/70">Upload photo or video</label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFile}
            className="mt-1 block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-[hsl(var(--primary))] file:text-[hsl(var(--primary-foreground))] file:cursor-pointer hover:file:opacity-90"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-white/70">Description</label>
        <textarea
          className="mt-1 w-full min-h-[90px] rounded-md bg-black/30 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[hsl(var(--neon-blue))] glow-blue"
          placeholder="Describe what you are seeing..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center gap-3 text-xs text-white/70">
        <span>Location:</span>
        <span className="px-2 py-1 rounded bg-black/30 border border-white/10">
          {lat?.toFixed(4)}, {lng?.toFixed(4)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span className="h-2 w-2 rounded-full bg-[hsl(var(--neon-green))] animate-pulse" />{" "}
          Auto-captured via GPS
        </div>
        <button
          type="submit"
          className="h-10 px-4 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold glow-blue hover:scale-[1.02] active:scale-[.98] transition"
        >
          Submit Report
        </button>
      </div>
      <div className="rounded-lg overflow-hidden border border-white/10 bg-black/20">
        <img
          src={mediaUrl}
          alt="preview"
          className="w-full h-40 object-cover opacity-90"
        />
      </div>
    </form>
  );
}
