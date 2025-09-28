import data from "@/data/social.json";

export default function SocialAnalyticsPanel() {
  return (
    <aside className="glass rounded-2xl p-4 h-full">
      <h3 className="font-semibold mb-3 text-glow-blue">Social Media Analytics</h3>
      <div className="space-y-2">
        {data.keywords.map((k) => (
          <div key={k.term} className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-3 py-2">
            <span className="text-white/90">
              <span className="text-[hsl(var(--neon-aqua))]">#</span>
              {k.term}
            </span>
            <span className="text-xs text-white/60">{k.count}</span>
            <span
              className={
                "ml-2 px-2 py-1 rounded-full text-xs font-medium " +
                (k.sentiment === "positive"
                  ? "bg-emerald-500/15 text-emerald-200 glow-green"
                  : k.sentiment === "negative"
                  ? "bg-red-500/15 text-red-200 glow-red"
                  : "bg-blue-500/10 text-blue-200 glow-blue")
              }
            >
              {k.sentiment}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
