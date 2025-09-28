export default function AlertBanner({ message }: { message: string }) {
  return (
    <div className="w-full py-2 px-4 bg-red-500/10 border-b border-white/10 text-sm text-white flex items-center gap-3 animate-pulse glow-red">
      <span className="inline-flex h-2 w-2 rounded-full bg-[hsl(var(--destructive))] shadow-[0_0_12px_hsl(var(--destructive))]"></span>
      <span className="font-semibold tracking-wide">ALERT:</span>
      <span className="opacity-90">{message}</span>
    </div>
  );
}
