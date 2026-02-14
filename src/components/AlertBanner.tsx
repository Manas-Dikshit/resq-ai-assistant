import { AlertTriangle } from "lucide-react";
import { mockDisasters } from "@/data/mockDisasters";
import { motion } from "framer-motion";

const AlertBanner = () => {
  const topAlert = mockDisasters.reduce((a, b) => (a.severity > b.severity ? a : b));

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-2 bg-destructive/10 border border-destructive/30 rounded-lg"
    >
      <AlertTriangle className="w-4 h-4 text-destructive animate-pulse-glow flex-shrink-0" />
      <p className="text-sm text-foreground font-body">
        <span className="font-bold text-destructive">CRITICAL:</span>{" "}
        {topAlert.title} — Severity {(topAlert.severity * 100).toFixed(0)}% — {topAlert.affected.toLocaleString()} affected
      </p>
    </motion.div>
  );
};

export default AlertBanner;
