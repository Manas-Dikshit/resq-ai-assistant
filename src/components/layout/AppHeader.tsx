import type { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Activity, BarChart3, GraduationCap, LayoutDashboard, LogIn, LogOut,
  Package, Radio, Shield, ArrowLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageToggle from "@/components/LanguageToggle";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: LucideIcon;
  backTo?: string;
  actions?: ReactNode;
  showNav?: boolean;
  live?: boolean;
}

const navItems = [
  { to: "/dashboard", labelKey: "nav.dashboard", fallback: "Dashboard", icon: LayoutDashboard },
  { to: "/forecast", labelKey: "nav.forecasts", fallback: "Forecast", icon: BarChart3 },
  { to: "/control-room", labelKey: "nav.controlRoom", fallback: "Control Room", icon: Radio },
  { to: "/resources", labelKey: "nav.resources", fallback: "Resources", icon: Package },
  { to: "/training", labelKey: "nav.training", fallback: "Training", icon: GraduationCap },
];

const Wordmark = () => (
  <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="ResQAI home">
    <span className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/30 bg-primary/10">
      <Activity className="h-4 w-4 text-primary" strokeWidth={2.25} />
    </span>
    <span className="font-display text-[15px] font-bold tracking-tight text-foreground">
      Res<span className="text-primary">Q</span>AI
    </span>
  </Link>
);

const AppHeader = ({
  title,
  subtitle,
  badge,
  icon: PageIcon,
  backTo,
  actions,
  showNav = true,
  live = true,
}: AppHeaderProps) => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <header className="z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-3 backdrop-blur-md sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        {backTo ? (
          <Link
            to={backTo}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        ) : (
          <Wordmark />
        )}

        <span className="hidden h-5 w-px bg-border sm:block" />

        <div className="flex min-w-0 items-center gap-2">
          {PageIcon && <PageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />}
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-foreground">{title}</p>
            {subtitle && (
              <p className="hidden truncate text-[11px] text-muted-foreground sm:block">{subtitle}</p>
            )}
          </div>
          {badge && (
            <span className="hidden rounded border border-border bg-secondary px-2 py-0.5 font-display text-[10px] font-medium uppercase tracking-wide text-muted-foreground lg:inline">
              {badge}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {showNav && (
          <nav className="mr-1 hidden items-center gap-0.5 lg:flex" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )
                }
              >
                <item.icon className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">
                  {t(item.labelKey, { defaultValue: item.fallback })}
                </span>
              </NavLink>
            ))}
          </nav>
        )}

        {actions}

        <LanguageToggle />

        {live && (
          <span
            className="hidden items-center gap-1.5 rounded-full border border-safe/25 bg-safe/10 px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-wide text-safe sm:flex"
            title="Connected to live data sources"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-safe opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-safe" />
            </span>
            {t("app.live", { defaultValue: "Live" })}
          </span>
        )}

        {user ? (
          <>
            <Link
              to="/admin"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title={t("app.admin", { defaultValue: "Admin" })}
              aria-label={t("app.admin", { defaultValue: "Admin" })}
            >
              <Shield className="h-4 w-4" />
            </Link>
            <button
              onClick={() => signOut()}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title={t("app.signOut", { defaultValue: "Sign out" })}
              aria-label={t("app.signOut", { defaultValue: "Sign out" })}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/auth")}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 font-display text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <LogIn className="h-3.5 w-3.5" />
            {t("app.signIn", { defaultValue: "Sign in" })}
          </button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
