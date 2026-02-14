import { AlertTriangle } from "lucide-react";
import { odishaDisasters } from "@/data/odishaData";
import { useRealtimeAlerts } from "@/hooks/useDisasterData";
import { motion } from "framer-motion";

const AlertBanner = () => {
  const realtimeAlerts = useRealtimeAlerts();
  const topDisaster = odishaDisasters.reduce((a, b) => (a.severity > b.severity ? a : b));

  // Show latest realtime alert if available, otherwise show top disaster
  const latestAlert = realtimeAlerts[0];

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-2 bg-destructive/10 border border-destructive/30 rounded-lg">
      <AlertTriangle className="w-4 h-4 text-destructive animate-pulse-glow flex-shrink-0" />
      <p className="text-sm text-foreground font-body">
        <span className="font-bold text-destructive">
          {latestAlert ? latestAlert.severity?.toUpperCase() + ':' : 'CRITICAL:'}
        </span>{" "}
        {latestAlert
          ? `${latestAlert.message} — ${latestAlert.region || 'Odisha'}`
          : `${topDisaster.title} — Severity ${(topDisaster.severity * 100).toFixed(0)}% — ${topDisaster.affected.toLocaleString()} affected`
        }
      </p>
    </motion.div>
  );
};

export default AlertBanner;
