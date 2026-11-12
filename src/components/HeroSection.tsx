import { motion } from "framer-motion";
import {
  ArrowRight, Shield, Globe, Activity, GraduationCap, Package,
  Waves, Database, WifiOff, Bot, CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageToggle from "@/components/LanguageToggle";

const systems = [
  { icon: Globe, label: "Disaster feeds", value: "NASA EONET · USGS", tone: "text-safe" },
  { icon: Database, label: "Shelter registry", value: "Supabase · live", tone: "text-safe" },
  { icon: Bot, label: "Response assistant", value: "Available", tone: "text-safe" },
  { icon: WifiOff, label: "Offline cache", value: "Last 24 h", tone: "text-warning" },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-border" />

      <div className="absolute right-6 top-5 z-20">
        <LanguageToggle />
      </div>

      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:py-0">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-safe opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-safe" />
            </span>
            <span className="font-display text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t('hero.badge', { defaultValue: 'Disaster response platform' })}
            </span>
          </div>

          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Res<span className="text-primary">Q</span>AI
          </h1>

          <p className="mt-5 max-w-xl text-lg text-foreground">
            {t('hero.subtitle', { defaultValue: 'Disaster intelligence for Odisha.' })}
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {t('hero.description', {
              defaultValue:
                'Live hazard feeds, shelter capacity, and incident command in one operational view — built for responders working under pressure.',
            })}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/dashboard")}
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t('hero.openDashboard', { defaultValue: 'Open dashboard' })}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => navigate("/forecast")}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 font-display text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Waves className="h-4 w-4 text-muted-foreground" />
              View forecasts
            </button>
          </div>

          <div className="mt-10 grid grid-cols-3 divide-x divide-border border-y border-border">
            {[
              { value: "15", label: "Monitoring points" },
              { value: "6", label: "Risk categories" },
              { value: "48h", label: "Forecast window" },
            ].map((s) => (
              <div key={s.label} className="px-4 py-4 first:pl-0">
                <p className="font-display text-xl font-semibold tabular-nums text-foreground">{s.value}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Activity, label: t('hero.aiPrediction', { defaultValue: 'Risk forecasting' }), desc: t('hero.aiPredictionDesc', { defaultValue: 'Grid-level hazard outlook' }) },
              { icon: Globe, label: t('hero.realTimeMapping', { defaultValue: 'Live mapping' }), desc: t('hero.realTimeMappingDesc', { defaultValue: 'Feeds and shelter status' }) },
              { icon: Shield, label: t('hero.survivalGuidance', { defaultValue: 'Response guidance' }), desc: t('hero.survivalGuidanceDesc', { defaultValue: 'Steps for the field' }) },
            ].map((f) => (
              <div key={f.label} className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-card">
                  <f.icon className="h-4 w-4 text-muted-foreground" />
                </span>
                <div>
                  <p className="font-display text-xs font-semibold text-foreground">{f.label}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="rounded-xl border border-border bg-card"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <p className="font-display text-sm font-semibold text-foreground">System status</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Operational snapshot</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-safe/25 bg-safe/10 px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-wide text-safe">
              <span className="h-1.5 w-1.5 rounded-full bg-safe" />
              Online
            </span>
          </div>

          <div className="divide-y divide-border">
            {systems.map((s) => (
              <div key={s.label} className="flex items-center gap-3 px-5 py-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground">{s.label}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{s.value}</p>
                </div>
                <span className={`h-1.5 w-1.5 rounded-full ${s.tone === "text-safe" ? "bg-safe" : "bg-warning"}`} />
              </div>
            ))}
          </div>

          <div className="border-t border-border px-5 py-4">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Hazard feeds and shelter records are read live. Cached and sample data are labelled in every view.
            </p>
            <div className="mt-3 flex items-center gap-4">
              <button onClick={() => navigate("/control-room")} className="inline-flex items-center gap-1.5 font-display text-xs font-medium text-primary hover:underline">
                <Shield className="h-3.5 w-3.5" /> Control room
              </button>
              <button onClick={() => navigate("/training")} className="inline-flex items-center gap-1.5 font-display text-xs font-medium text-muted-foreground hover:text-foreground">
                <GraduationCap className="h-3.5 w-3.5" /> Training
              </button>
              <button onClick={() => navigate("/resources")} className="inline-flex items-center gap-1.5 font-display text-xs font-medium text-muted-foreground hover:text-foreground">
                <Package className="h-3.5 w-3.5" /> Resources
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-b-xl border-t border-border bg-background/60 px-5 py-3">
            <CheckCircle2 className="h-3.5 w-3.5 text-safe" />
            <p className="text-[10px] text-muted-foreground">Last checked just now · Odisha region</p>
          </div>
        </motion.aside>
      </div>
    </section>
  );
};

export default HeroSection;
