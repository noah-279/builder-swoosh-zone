import type { Hazard } from "./map/MapViewer";

export default function VerifiedHazardsSidebar({ list }: { list: Hazard[] }) {
  return (
    <aside className="glass rounded-2xl p-4 h-full">
      <h3 className="font-semibold mb-3 text-glow-blue">
        Recent Verified Hazards
      </h3>
      <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
        {list
          .filter((x) => x.verified)
          .slice(0, 8)
          .map((h) => (
            <div
              key={h.id}
              className="flex items-start gap-3 border border-white/10 rounded-lg p-3 bg-black/20"
            >
              <img
                src={h.mediaUrl}
                alt="media"
                className="w-14 h-14 rounded-md object-cover opacity-90"
              />
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[hsl(var(--neon-blue))]"></span>
                  <span className="font-medium">{h.type}</span>
                </div>
                <p className="text-white/70 mt-1 line-clamp-2">
                  {h.description}
                </p>
                <p className="text-white/40 text-xs mt-1">
                  {new Date(h.date).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
      </div>
    </aside>
  );
}
