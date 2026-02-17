import { motion } from "framer-motion";
import { ArrowRight, Shield, Brain, Globe, Activity, Zap, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import heroGlobe from "@/assets/hero-globe.jpg";
import LanguageToggle from "@/components/LanguageToggle";

const StatCard = ({ value, label, delay }: { value: string; label: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    className="text-center"
  >
    <p className="text-2xl md:text-3xl font-display font-bold text-gradient-primary">{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{label}</p>
  </motion.div>
);

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-dark">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={heroGlobe} alt="Global disaster intelligence visualization" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />
      </div>

      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-full h-px bg-primary/20 animate-scan-line" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(hsl(168 80% 45%) 1px, transparent 1px), linear-gradient(90deg, hsl(168 80% 45%) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />

      {/* Language toggle top-right */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageToggle />
      </div>

      {/* Live status indicator */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-display text-muted-foreground"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safe opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-safe"></span>
        </span>
        Systems Active
      </motion.div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-sm font-display text-primary tracking-wide">{t('hero.badge')}</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-6">
            <span className="text-foreground">Res</span>
            <span className="text-gradient-primary">Q</span>
            <span className="text-foreground">AI</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4 font-body">{t('hero.subtitle')}</p>
          <p className="text-base text-muted-foreground/70 max-w-2xl mx-auto mb-12 font-body">{t('hero.description')}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              onClick={() => navigate("/dashboard")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-primary text-primary-foreground font-display font-bold text-lg animate-glow-pulse transition-all"
            >
              {t('hero.openDashboard')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              onClick={() => navigate("/dashboard")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg border border-border text-foreground font-display hover:bg-accent hover:border-primary/30 transition-all"
            >
              {t('hero.viewMap')}
            </motion.button>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 flex items-center justify-center gap-8 md:gap-16"
        >
          <StatCard value="15+" label="Monitoring Points" delay={0.7} />
          <div className="w-px h-10 bg-border" />
          <StatCard value="6" label="Risk Categories" delay={0.8} />
          <div className="w-px h-10 bg-border" />
          <StatCard value="48h" label="Forecast Window" delay={0.9} />
          <div className="hidden md:block w-px h-10 bg-border" />
          <div className="hidden md:block">
            <StatCard value="Real-time" label="Data Feeds" delay={1.0} />
          </div>
        </motion.div>

        {/* Feature cards */}
        <motion.div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
          {[
            { icon: Brain, label: t('hero.aiPrediction'), desc: t('hero.aiPredictionDesc'), accent: "from-primary/20 to-primary/5" },
            { icon: Globe, label: t('hero.realTimeMapping'), desc: t('hero.realTimeMappingDesc'), accent: "from-flood/20 to-flood/5" },
            { icon: Shield, label: t('hero.survivalGuidance'), desc: t('hero.survivalGuidanceDesc'), accent: "from-safe/20 to-safe/5" },
          ].map((f, i) => (
            <motion.div
              key={f.label}
              whileHover={{ y: -4, borderColor: 'hsl(168 80% 45% / 0.3)' }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`flex items-center gap-4 p-5 rounded-xl border border-border bg-gradient-to-br ${f.accent} backdrop-blur-sm`}
            >
              <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-display text-sm font-bold text-foreground">{f.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;