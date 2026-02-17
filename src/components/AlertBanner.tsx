import { useState, useEffect } from "react";
import { AlertTriangle, Volume2, VolumeX } from "lucide-react";
import { useRealtimeAlerts } from "@/hooks/useDisasterData";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

const AlertBanner = () => {
  const realtimeAlerts = useRealtimeAlerts();
  const { t } = useTranslation();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Auto-cycle alerts
  useEffect(() => {
    if (realtimeAlerts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % realtimeAlerts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [realtimeAlerts.length]);

  // Play alert sound for critical alerts
  useEffect(() => {
    if (!soundEnabled || realtimeAlerts.length === 0) return;
    const alert = realtimeAlerts[currentIdx];
    if (alert?.severity === 'critical' || alert?.severity === 'emergency') {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch {}
    }
  }, [currentIdx, soundEnabled, realtimeAlerts]);

  if (realtimeAlerts.length === 0) return null;
  const latestAlert = realtimeAlerts[currentIdx] || realtimeAlerts[0];

  const severityStyles = {
    critical: "bg-destructive/10 border-destructive/40 glow-danger",
    emergency: "bg-destructive/15 border-destructive/50 glow-danger",
    warning: "bg-warning/10 border-warning/30",
    info: "bg-primary/10 border-primary/30",
  };
  const style = severityStyles[latestAlert.severity as keyof typeof severityStyles] || severityStyles.warning;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border ${style} relative overflow-hidden`}
    >
      {/* Animated background shimmer for critical */}
      {(latestAlert.severity === 'critical' || latestAlert.severity === 'emergency') && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-destructive/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
      )}

      <AlertTriangle className="w-4 h-4 text-destructive animate-pulse-glow flex-shrink-0 relative z-10" />

      <AnimatePresence mode="wait">
        <motion.p
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-foreground font-body flex-1 relative z-10"
        >
          <span className="font-bold text-destructive">
            {latestAlert.severity?.toUpperCase() || t('alert.critical')}:
          </span>{" "}
          {latestAlert.message} — {latestAlert.region || 'Odisha'}
        </motion.p>
      </AnimatePresence>

      <div className="flex items-center gap-2 relative z-10 flex-shrink-0">
        {realtimeAlerts.length > 1 && (
          <span className="text-[10px] text-muted-foreground font-display">
            {currentIdx + 1}/{realtimeAlerts.length}
          </span>
        )}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1 rounded hover:bg-accent transition-colors"
          title={soundEnabled ? "Mute alerts" : "Enable alert sound"}
        >
          {soundEnabled
            ? <Volume2 className="w-3.5 h-3.5 text-primary" />
            : <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
          }
        </button>
      </div>
    </motion.div>
  );
};

export default AlertBanner;