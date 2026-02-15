import { motion } from "framer-motion";
import { ArrowRight, Shield, Brain, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import heroGlobe from "@/assets/hero-globe.jpg";
import LanguageToggle from "@/components/LanguageToggle";

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-dark">
      <div className="absolute inset-0">
        <img src={heroGlobe} alt="Global disaster intelligence visualization" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-full h-px bg-primary/20 animate-scan-line" />
      </div>

      {/* Language toggle top-right */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageToggle />
      </div>

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
            <button onClick={() => navigate("/dashboard")} className="group inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-primary text-primary-foreground font-display font-bold text-lg glow-primary transition-transform hover:scale-105">
              {t('hero.openDashboard')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigate("/dashboard")} className="inline-flex items-center gap-2 px-8 py-4 rounded-lg border border-border text-foreground font-display hover:bg-accent transition-colors">
              {t('hero.viewMap')}
            </button>
          </div>
        </motion.div>

        <motion.div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
          {[
            { icon: Brain, label: t('hero.aiPrediction'), desc: t('hero.aiPredictionDesc') },
            { icon: Globe, label: t('hero.realTimeMapping'), desc: t('hero.realTimeMappingDesc') },
            { icon: Shield, label: t('hero.survivalGuidance'), desc: t('hero.survivalGuidanceDesc') },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm">
              <div className="p-2 rounded-md bg-primary/10">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-display text-sm font-bold text-foreground">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
