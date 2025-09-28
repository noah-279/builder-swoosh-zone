import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";

const passwordRules = [
  { label: "8+ chars", test: (s: string) => s.length >= 8 },
  { label: "Letter", test: (s: string) => /[A-Za-z]/.test(s) },
  { label: "Number", test: (s: string) => /\d/.test(s) },
  { label: "Symbol", test: (s: string) => /[^\w\s]/.test(s) },
];

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const allPass = useMemo(
    () => passwordRules.every((r) => r.test(password)),
    [password],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailOk = /.+@.+\..+/.test(email);
    if (!emailOk) return setError("Enter a valid email");

    if (!allPass) return setError("Password must meet all requirements");

    if (mode === "signup" && password !== confirm) {
      return setError("Passwords do not match");
    }

    setTimeout(() => {
      navigate("/");
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className={cn("w-full max-w-md p-6 rounded-2xl glass animate-slide-up")}>        
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-glow-blue">Integrated Ocean Hazard</h1>
          <p className="text-sm text-muted-foreground mt-1">{mode === "signup" ? "Create an account" : "Welcome back"}</p>
        </div>
        <div className="flex gap-2 mb-6">
          <button
            className={cn(
              "flex-1 h-10 rounded-md transition-all",
              mode === "signup" ? "bg-primary/20 glow-blue" : "bg-muted/40 hover:bg-muted/60",
            )}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
          <button
            className={cn(
              "flex-1 h-10 rounded-md transition-all",
              mode === "login" ? "bg-primary/20 glow-blue" : "bg-muted/40 hover:bg-muted/60",
            )}
            onClick={() => setMode("login")}
          >
            Log in
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full h-11 rounded-md bg-black/30 border border-white/10 px-3 outline-none focus:ring-2 focus:ring-[hsl(var(--neon-aqua))] transition glow-aqua"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full h-11 rounded-md bg-black/30 border border-white/10 px-3 outline-none focus:ring-2 focus:ring-[hsl(var(--neon-blue))] transition glow-blue"
              placeholder="••••••••"
              required
            />
            <ul className="mt-2 grid grid-cols-2 gap-2 text-xs">
              {passwordRules.map((r) => (
                <li
                  key={r.label}
                  className={cn(
                    "px-2 py-1 rounded-md border border-white/10 bg-black/20",
                    r.test(password) ? "text-emerald-300/90 glow-green" : "text-white/50",
                  )}
                >
                  {r.label}
                </li>
              ))}
            </ul>
          </div>
          {mode === "signup" && (
            <div>
              <label className="text-sm text-muted-foreground">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full h-11 rounded-md bg-black/30 border border-white/10 px-3 outline-none focus:ring-2 focus:ring-[hsl(var(--neon-blue))] transition glow-blue"
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {error && (
            <div className="rounded-md border border-white/10 bg-red-500/10 p-3 text-sm glow-red text-glow-red">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full h-11 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold tracking-wide glow-blue hover:scale-[1.01] active:scale-[.99] transition-transform"
          >
            {mode === "signup" ? "Create account" : "Log in"}
          </button>
        </form>

        <div className="text-xs text-center mt-4 text-white/60">
          <Link to="/" className="underline decoration-[hsl(var(--neon-aqua))] decoration-2 underline-offset-4 hover:text-white">Back to dashboard</Link>
        </div>
      </div>
    </div>
  );
}
