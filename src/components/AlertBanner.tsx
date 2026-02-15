import { AlertTriangle } from "lucide-react";
import { useRealtimeAlerts } from "@/hooks/useDisasterData";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const AlertBanner = () => {
  const realtimeAlerts = useRealtimeAlerts();
  const { t } = useTranslation();
  const latestAlert = realtimeAlerts[0];

  if (!latestAlert) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-2 bg-destructive/10 border border-destructive/30 rounded-lg">
      <AlertTriangle className="w-4 h-4 text-destructive animate-pulse-glow flex-shrink-0" />
      <p className="text-sm text-foreground font-body">
        <span className="font-bold text-destructive">
          {latestAlert.severity?.toUpperCase() || t('alert.critical')}:
        </span>{" "}
        {latestAlert.message} — {latestAlert.region || 'Odisha'}
      </p>
    </motion.div>
  );
};

export default AlertBanner;
