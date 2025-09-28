import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function Logo({ size = 40, className = "" }: { size?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [rot, setRot] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    setRot({ x: dy * -10, y: dx * 10 });
  };

  const onLeave = () => setRot({ x: 0, y: 0 });

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("relative grid place-items-center rounded-xl glow-blue", className)}
      style={{ width: size, height: size, perspective: 600 }}
    >
      <div
        className="relative rounded-xl overflow-hidden border border-white/15 bg-gradient-to-br from-[hsl(var(--ocean-mid))] to-[hsl(var(--ocean-bottom))]"
        style={{ width: size, height: size, transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}
      >
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(var(--neon-blue))" />
              <stop offset="100%" stopColor="hsl(var(--neon-aqua))" />
            </linearGradient>
            <linearGradient id="g2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--neon-aqua))" />
              <stop offset="100%" stopColor="hsl(var(--neon-green))" />
            </linearGradient>
          </defs>
          {/* Shield */}
          <path d="M32 4l18 6v14c0 13.5-9.3 24.3-18 28-8.7-3.7-18-14.5-18-28V10l18-6z" fill="url(#g1)" opacity="0.3" />
          <path d="M32 6l16 5v13c0 12.8-8.6 22.8-16 26.2C24.6 46.8 16 36.8 16 24V11l16-5z" stroke="url(#g1)" strokeWidth="2" fill="none" />
          {/* Wave */}
          <path d="M12 34c6-4 12-4 18 0s12 4 18 0" stroke="url(#g2)" strokeWidth="3" fill="none">
            <animate attributeName="d" dur="4s" repeatCount="indefinite"
              values="M12 34c6-4 12-4 18 0s12 4 18 0; M12 34c6-2 12-6 18-2s12 6 18 2; M12 34c6-4 12-4 18 0s12 4 18 0" />
          </path>
          {/* Pulse dot */}
          <circle cx="48" cy="16" r="3" fill="hsl(var(--neon-green))">
            <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(60%_60%_at_30%_10%,hsla(var(--neon-blue),.35),transparent_60%)]" />
    </div>
  );
}
