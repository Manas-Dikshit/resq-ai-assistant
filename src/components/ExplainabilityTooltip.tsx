import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface Factor {
  factor: string;
  impact: number;
  direction: string;
}

interface Explainability {
  factors: Factor[];
  summary: string;
  method: string;
}

interface Props {
  explainability?: Explainability;
  alertTier?: string;
}

const TIER_STYLES: Record<string, { label: string; className: string }> = {
  VERIFIED_CRITICAL: { label: "⚠ VERIFIED CRITICAL", className: "bg-destructive/10 text-destructive border-destructive/30" },
  AI_PREDICTED: { label: "🤖 AI PREDICTED", className: "bg-warning/10 text-warning border-warning/30" },
  MONITORING: { label: "👁 MONITORING", className: "bg-primary/10 text-primary border-primary/30" },
  LOW_WATCH: { label: "✅ LOW WATCH", className: "bg-safe/10 text-safe border-safe/30" },
};

const ExplainabilityTooltip = ({ explainability, alertTier }: Props) => {
  const [open, setOpen] = useState(false);

  if (!explainability || !explainability.factors?.length) return null;

  const tier = TIER_STYLES[alertTier || "LOW_WATCH"] || TIER_STYLES.LOW_WATCH;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-primary hover:text-foreground transition-colors"
        aria-label="Why this prediction?"
      >
        <Info className="w-3 h-3" />
        <span className="font-display">Why?</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            className="absolute z-50 bottom-full mb-2 left-0 w-72 p-3 rounded-lg border border-border bg-card shadow-lg"
          >
            {/* Alert Tier */}
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-display mb-2 ${tier.className}`}>
              {tier.label}
            </div>

            {/* Summary */}
            <p className="text-xs text-foreground mb-2 leading-relaxed">{explainability.summary}</p>

            {/* Factor Bars */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">Contributing Factors</p>
              {explainability.factors.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-warning flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-foreground truncate">{f.factor}</p>
                    <div className="h-1 rounded-full bg-secondary mt-0.5">
                      <div
                        className="h-full rounded-full bg-warning"
                        style={{ width: `${f.impact * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground w-8 text-right">+{(f.impact * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>

            {/* Method */}
            <p className="text-[9px] text-muted-foreground mt-2 pt-2 border-t border-border">
              Method: {explainability.method} • Factors ranked by impact
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExplainabilityTooltip;
