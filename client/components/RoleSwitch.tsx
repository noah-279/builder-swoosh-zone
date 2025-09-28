type Role = "Citizen" | "Analyst" | "Official";
export default function RoleSwitch({
  value,
  onChange,
}: {
  value: Role;
  onChange: (r: Role) => void;
}) {
  const roles: Role[] = ["Citizen", "Analyst", "Official"];
  return (
    <div className="inline-flex bg-black/30 border border-white/10 rounded-full p-1">
      {roles.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={
            "px-4 h-9 rounded-full text-sm transition-all " +
            (value === r ? "bg-primary/30 glow-blue" : "hover:bg-white/5")
          }
        >
          {r}
        </button>
      ))}
    </div>
  );
}
