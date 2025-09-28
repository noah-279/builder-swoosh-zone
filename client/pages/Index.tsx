import { useMemo, useState } from "react";
import AlertBanner from "@/components/AlertBanner";
import MapViewer, { type Hazard, type Filters } from "@/components/map/MapViewer";
import RoleSwitch from "@/components/RoleSwitch";
import HazardForm from "@/components/HazardForm";
import SocialAnalyticsPanel from "@/components/SocialAnalyticsPanel";
import VerifiedHazardsSidebar from "@/components/VerifiedHazardsSidebar";
import Logo from "@/components/Logo";
import data from "@/data/reports.json";
import { Link } from "react-router-dom";

export default function Index() {
  const [role, setRole] = useState<"Citizen" | "Analyst" | "Official">("Citizen");
  const [reports, setReports] = useState<Hazard[]>(data as unknown as Hazard[]);
  const [filters, setFilters] = useState<Filters>({ type: "All", source: "All", verified: "All" });

  const verifiedList = useMemo(() => reports.filter((r) => r.verified), [reports]);

  const applyReport = (r: Omit<Hazard, "id">) => {
    setReports((prev) => [{ ...(r as any), id: `new-${prev.length + 1}` }, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AlertBanner message="India coastal high wave advisory in effect. Avoid low-lying shorelines." />

      <header className="px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size={40} />
          <div>
            <h1 className="font-bold tracking-wide text-lg text-glow-blue">Samraksh — India</h1>
            <p className="text-xs text-white/60 -mt-1">Integrated ocean hazard reporting & analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RoleSwitch value={role} onChange={setRole} />
          <Link to="/auth" className="text-sm underline decoration-[hsl(var(--neon-aqua))] underline-offset-4 hover:opacity-90">Login/Signup</Link>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 pb-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* Left side: filters + map */}
          <section className="xl:col-span-8 space-y-4">
            {/* Filters */}
            <div className="glass rounded-2xl p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="text-xs text-white/70">Hazard</label>
                  <select
                    className="mt-1 w-full h-10 rounded-md bg-black/30 border border-white/10 px-3 outline-none focus:ring-2 focus:ring-[hsl(var(--neon-blue))] glow-blue"
                    value={filters.type}
                    onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
                  >
                    {( ["All", "Flooding", "Tsunami", "High Waves", "Erosion", "Other"] as const).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/70">Source</label>
                  <select
                    className="mt-1 w-full h-10 rounded-md bg-black/30 border border-white/10 px-3 outline-none focus:ring-2 focus:ring-[hsl(var(--neon-aqua))] glow-aqua"
                    value={filters.source}
                    onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value }))}
                  >
                    {( ["All", "Citizen", "Official"] as const).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/70">From</label>
                  <input
                    type="date"
                    className="mt-1 w-full h-10 rounded-md bg-black/30 border border-white/10 px-3 outline-none focus:ring-2 focus:ring-[hsl(var(--neon-blue))] glow-blue"
                    onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/70">To</label>
                  <input
                    type="date"
                    className="mt-1 w-full h-10 rounded-md bg-black/30 border border-white/10 px-3 outline-none focus:ring-2 focus:ring-[hsl(var(--neon-blue))] glow-blue"
                    onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/70">Verified</label>
                  <select
                    className="mt-1 w-full h-10 rounded-md bg-black/30 border border-white/10 px-3 outline-none focus:ring-2 focus:ring-[hsl(var(--neon-green))] glow-green"
                    value={String(filters.verified ?? "All")}
                    onChange={(e) => {
                      const v = e.target.value as "true" | "false" | "All";
                      setFilters((f) => ({ ...f, verified: v === "All" ? "All" : v === "true" }));
                    }}
                  >
                    <option value="All">All</option>
                    <option value="true">Verified</option>
                    <option value="false">Unverified</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden glass min-h-[420px]">
              <div className="h-[540px]">
                <MapViewer data={reports} filters={filters} />
              </div>
            </div>

            {role === "Citizen" && <HazardForm onSubmit={applyReport} />}

            {role === "Official" && (
              <div className="glass rounded-2xl p-4">
                <h3 className="font-semibold mb-2">Verify Reports</h3>
                <div className="space-y-2">
                  {reports.slice(0, 6).map((r) => (
                    <div key={r.id} className="flex items-center justify-between border border-white/10 rounded-lg p-3 bg-black/20">
                      <div className="flex items-center gap-3">
                        <img src={r.mediaUrl} alt="m" className="w-10 h-10 rounded object-cover" />
                        <div>
                          <div className="text-sm font-medium">{r.type}</div>
                          <div className="text-xs text-white/60 line-clamp-1 max-w-[220px]">{r.description}</div>
                        </div>
                      </div>
                      <label className="inline-flex items-center gap-2 text-xs">
                        <span className="text-white/70">Verified</span>
                        <input
                          type="checkbox"
                          className="peer hidden"
                          checked={r.verified}
                          onChange={(e) => setReports((prev) => prev.map((x) => (x.id === r.id ? { ...x, verified: e.target.checked } : x)))}
                        />
                        <span className="w-10 h-6 rounded-full bg-black/40 border border-white/10 relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-[hsl(var(--neon-red))] peer-checked:after:bg-[hsl(var(--neon-green))] peer-checked:bg-[hsl(var(--neon-green))]/20 glow-blue transition-all"></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Right side panels */}
          <section className="xl:col-span-4 space-y-4">
            <SocialAnalyticsPanel />
            <VerifiedHazardsSidebar list={verifiedList} />
          </section>
        </div>
      </main>

      <footer className="px-6 py-6 text-xs text-white/50">
        <p>© 2025 Ocean Safety Initiative</p>
      </footer>
    </div>
  );
}
