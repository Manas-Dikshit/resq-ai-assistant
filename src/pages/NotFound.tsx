import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Activity } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: attempted route", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center border-b border-border px-4">
        <Link to="/" className="flex items-center gap-2.5" aria-label="ResQAI home">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/30 bg-primary/10">
            <Activity className="h-4 w-4 text-primary" strokeWidth={2.25} />
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight text-foreground">
            Res<span className="text-primary">Q</span>AI
          </span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <p className="font-display text-5xl font-semibold tabular-nums tracking-tight text-muted-foreground/50">
            404
          </p>
          <h1 className="mt-3 font-display text-lg font-semibold text-foreground">Page not found</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The route <code className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-foreground">{location.pathname}</code> does not exist.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Return home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
