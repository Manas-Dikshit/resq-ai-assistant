import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        navigate("/dashboard");
      }
    } else {
      const { error } = await signUp(email, password, name);
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Check your email to verify your account before signing in.");
      }
    }
    setLoading(false);
  };

  const inputClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/60 focus:ring-1 focus:ring-primary/40";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <Link to="/" className="flex items-center gap-2.5" aria-label="ResQAI home">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/30 bg-primary/10">
            <Activity className="h-4 w-4 text-primary" strokeWidth={2.25} />
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight text-foreground">
            Res<span className="text-primary">Q</span>AI
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Link
            to="/"
            className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="rounded-lg border border-border bg-card p-6">
            <h1 className="font-display text-lg font-semibold text-foreground">
              {isLogin ? "Sign in" : "Create account"}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {isLogin
                ? "Access the response dashboard and incident tools."
                : "Register for access to the response network."}
            </p>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-safe/30 bg-safe/10 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-safe" />
                <p className="text-xs text-safe">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="mb-1.5 block font-display text-[11px] font-medium text-muted-foreground">
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    autoComplete="name"
                    className={inputClass}
                    placeholder="Your name"
                  />
                </div>
              )}
              <div>
                <label htmlFor="email" className="mb-1.5 block font-display text-[11px] font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={inputClass}
                  placeholder="you@organisation.org"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block font-display text-[11px] font-medium text-muted-foreground">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className={inputClass}
                  placeholder="At least 6 characters"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary py-2.5 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
              </button>
            </form>

            <div className="mt-5 border-t border-border pt-4">
              <p className="text-center text-xs text-muted-foreground">
                {isLogin ? "No account yet?" : "Already registered?"}{" "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                    setSuccess("");
                  }}
                  className="font-display font-medium text-primary hover:underline"
                >
                  {isLogin ? "Create one" : "Sign in"}
                </button>
              </p>
            </div>
          </div>

          <p className="mt-4 text-center text-[10px] leading-relaxed text-muted-foreground">
            Access is logged. Report incidents only with verified field information.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Auth;
