import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronDown, ChevronUp, AlertTriangle, Shield, Clock, Cpu, Info } from "lucide-react";
import {
  useGridPredictions,
  GridPredictionPoint,
  RiskType,
  RISK_COLORS,
  RISK_LABELS,
  RISK_ICONS,
} from "@/hooks/useGridPredictions";
import { Skeleton } from "@/components/ui/skeleton";
import ExplainabilityTooltip from "@/components/ExplainabilityTooltip";
import OfflinePredictionEngine from "@/components/OfflinePredictionEngine";
import MeshAlertBanner from "@/components/MeshAlertBanner";

const RISK_KEYS: RiskType[] = ["flood_risk", "cyclone_risk", "fire_risk", "earthquake_risk", "landslide_risk", "heat_wave_risk"];

const levelColor = (level: string) => {
  switch (level) {
    case "CRITICAL": return "text-destructive bg-destructive/10 border-destructive/30";
    case "HIGH": return "text-warning bg-warning/10 border-warning/30";
    case "MEDIUM": return "text-primary bg-primary/10 border-primary/30";
    default: return "text-safe bg-safe/10 border-safe/30";
  }
};

const PredictionPanel = () => {
  const { data, isLoading, error } = useGridPredictions();
  const [expandedPoint, setExpandedPoint] = useState<number | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<RiskType | "all">("all");
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-primary animate-pulse" />
          <h3 className="font-display text-xs font-bold text-muted-foreground tracking-widest uppercase">Loading Predictions...</h3>
        </div>
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
        <p className="text-xs text-destructive font-display">Failed to load predictions. Retrying...</p>
      </div>
    );
  }

  const sorted = [...data.predictions].sort((a, b) => {
    const aMax = Math.max(...RISK_KEYS.map((k) => a.predictions[k]));
    const bMax = Math.max(...RISK_KEYS.map((k) => b.predictions[k]));
    return bMax - aMax;
  });

  const filtered = selectedRisk === "all" ? sorted : sorted.filter(p => p.predictions[selectedRisk] > 0.2);

  // Global summary
  const globalMax = Math.max(...sorted.flatMap(p => RISK_KEYS.map(k => p.predictions[k])));
  const globalLevel = globalMax > 0.8 ? "CRITICAL" : globalMax > 0.6 ? "HIGH" : globalMax > 0.3 ? "MEDIUM" : "LOW";
  const criticalCount = sorted.filter(p => p.risk_level === "CRITICAL" || p.risk_level === "HIGH").length;

  return (
    <div className="space-y-3" role="region" aria-label="AI Risk Predictions">
      {/* Mesh & Offline Status */}
      <MeshAlertBanner />
      <OfflinePredictionEngine />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <h3 className="font-display text-xs font-bold text-muted-foreground tracking-widest uppercase">
            AI Risk Predictions
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-display">
          <Cpu className="w-3 h-3" />
          <span>{data.model_source === "ml_model" ? "ML Model" : "Heuristic"}</span>
        </div>
      </div>

      {/* Global Summary Card */}
      <div className={`p-3 rounded-lg border ${levelColor(globalLevel)}`} role="alert" aria-live="polite">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm font-display font-bold">Overall: {globalLevel}</span>
          </div>
          <div className="flex items-center gap-1 text-xs opacity-80">
            <Clock className="w-3 h-3" aria-hidden="true" />
            48h forecast
          </div>
        </div>
        {criticalCount > 0 && (
          <p className="text-xs opacity-90">
            <AlertTriangle className="w-3 h-3 inline mr-1" aria-hidden="true" />
            {criticalCount} region{criticalCount > 1 ? "s" : ""} at elevated risk
          </p>
        )}
        <p className="text-xs opacity-60 mt-1">{data.grid_count} monitoring points • Updated {new Date(data.timestamp).toLocaleTimeString()}</p>
      </div>

      {/* Risk Type Filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelectedRisk("all")}
          className={`px-2 py-1 rounded-full text-xs font-display transition-colors ${
            selectedRisk === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        {RISK_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setSelectedRisk(key)}
            className={`px-2 py-1 rounded-full text-xs font-display transition-colors flex items-center gap-1 ${
              selectedRisk === key ? "text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
            style={selectedRisk === key ? { background: RISK_COLORS[key] } : undefined}
          >
            <span>{RISK_ICONS[key]}</span>
            {RISK_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Prediction Cards */}
      <div className="space-y-2">
        {filtered.map((point, idx) => {
          const isExpanded = expandedPoint === idx;
          const dominantRisk = RISK_KEYS.reduce((a, b) => point.predictions[a] > point.predictions[b] ? a : b);
          const maxVal = point.predictions[dominantRisk];

          return (
            <motion.div
              key={`${point.label}-${idx}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="rounded-lg border border-border bg-card overflow-hidden cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => {
                setExpandedPoint(isExpanded ? null : idx);
                // Dispatch event to zoom map to this point
                window.dispatchEvent(new CustomEvent("focus-prediction", {
                  detail: { lat: point.latitude, lng: point.longitude, label: point.label, riskLevel: point.risk_level },
                }));
              }}
            >
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-base">{RISK_ICONS[dominantRisk]}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-display font-bold text-foreground truncate">{point.label}</p>
                    <p className="text-xs text-muted-foreground">{RISK_LABELS[dominantRisk]} {(maxVal * 100).toFixed(0)}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-display px-2 py-0.5 rounded-full border ${levelColor(point.risk_level)}`}>
                    {point.risk_level}
                  </span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                </div>
              </div>

              {/* Risk Bars (always visible) */}
              <div className="px-3 pb-2">
                <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden bg-secondary">
                  {RISK_KEYS.map((key) => (
                    <motion.div
                      key={key}
                      className="h-full rounded-full"
                      style={{ background: RISK_COLORS[key] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${point.predictions[key] * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  ))}
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-border"
                  >
                    <div className="p-3 space-y-3">
                      {/* Individual risk bars */}
                      <div className="space-y-2">
                        {RISK_KEYS.map((key) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-xs w-4">{RISK_ICONS[key]}</span>
                            <span className="text-xs text-muted-foreground w-20">{RISK_LABELS[key]}</span>
                            <div className="flex-1 h-1.5 rounded-full bg-secondary">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: RISK_COLORS[key] }}
                                initial={{ width: 0 }}
                                animate={{ width: `${point.predictions[key] * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                              />
                            </div>
                            <span className="text-xs font-display text-foreground w-10 text-right">
                              {(point.predictions[key] * 100).toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      {point.recommended_actions.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-display font-bold text-muted-foreground">Recommended Actions</p>
                          {point.recommended_actions.map((action, i) => (
                            <p key={i} className="text-xs text-foreground flex items-start gap-1.5">
                              <AlertTriangle className="w-3 h-3 text-warning mt-0.5 shrink-0" />
                              {action}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Explainability */}
                      {point.explainability && (
                        <div className="pt-1 border-t border-border">
                          <ExplainabilityTooltip explainability={point.explainability} alertTier={point.alert_tier} />
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
                        <span>Confidence: {(point.confidence * 100).toFixed(0)}%</span>
                        <span>{point.model_version}</span>
                        <span>{point.forecast_hours}h forecast</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PredictionPanel;
