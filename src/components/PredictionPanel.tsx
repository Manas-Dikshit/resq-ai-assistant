import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, ChevronDown, ChevronUp, AlertTriangle, Shield, Clock,
  Cpu, RefreshCw, TrendingUp, TrendingDown, Minus, Wifi, WifiOff,
} from "lucide-react";
import {
  useGridPredictions,
  GridPredictionPoint,
  RiskType,
  RISK_COLORS,
  RISK_LABELS,
  RISK_ICONS,
  REFETCH_INTERVAL_MS,
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

const getDelta = (prev: number, curr: number) => {
  const diff = curr - prev;
  if (Math.abs(diff) < 0.02) return null; // below threshold
  return diff;
};

const DeltaBadge = ({ delta }: { delta: number | null }) => {
  if (delta === null) return <Minus className="w-3 h-3 text-muted-foreground/40" />;
  if (delta > 0) return (
    <span className="flex items-center gap-0.5 text-destructive text-[9px] font-mono font-bold">
      <TrendingUp className="w-2.5 h-2.5" />+{(delta * 100).toFixed(0)}%
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-safe text-[9px] font-mono font-bold">
      <TrendingDown className="w-2.5 h-2.5" />{(delta * 100).toFixed(0)}%
    </span>
  );
};

/** Live countdown to next auto-refresh */
const useCountdown = (dataUpdatedAt: number, intervalMs: number) => {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - dataUpdatedAt;
      const remaining = Math.max(0, Math.ceil((intervalMs - elapsed) / 1000));
      setSecondsLeft(remaining);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dataUpdatedAt, intervalMs]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  return { secondsLeft, display: `${mm}:${ss}` };
};

const PredictionPanel = () => {
  const { data, isLoading, error, isFetching, refetch, dataUpdatedAt } = useGridPredictions();
  const [expandedPoint, setExpandedPoint] = useState<number | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<RiskType | "all">("all");
  const [flashKey, setFlashKey] = useState(0);
  const { t } = useTranslation();
  const prevDataRef = useRef<GridPredictionPoint[] | null>(null);
  const { display: countdownDisplay, secondsLeft } = useCountdown(dataUpdatedAt, REFETCH_INTERVAL_MS);

  // Detect data change → flash animation
  useEffect(() => {
    if (data && prevDataRef.current) {
      setFlashKey((k) => k + 1);
    }
    if (data) {
      prevDataRef.current = data.predictions;
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-primary animate-pulse" />
          <h3 className="font-display text-xs font-bold text-muted-foreground tracking-widest uppercase">{t('prediction.loading')}</h3>
        </div>
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-3">
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-destructive" />
            <p className="text-xs text-destructive font-display">{t('prediction.failed')}</p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-display bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> {t('prediction.retry')}
          </button>
        </div>
        <OfflinePredictionEngine />
      </div>
    );
  }

  const sorted = [...data.predictions].sort((a, b) => {
    const aMax = Math.max(...RISK_KEYS.map((k) => a.predictions[k]));
    const bMax = Math.max(...RISK_KEYS.map((k) => b.predictions[k]));
    return bMax - aMax;
  });

  const filtered = selectedRisk === "all" ? sorted : sorted.filter(p => p.predictions[selectedRisk] > 0.2);

  const globalMax = Math.max(...sorted.flatMap(p => RISK_KEYS.map(k => p.predictions[k])));
  const globalLevel = globalMax > 0.8 ? "CRITICAL" : globalMax > 0.6 ? "HIGH" : globalMax > 0.3 ? "MEDIUM" : "LOW";
  const criticalCount = sorted.filter(p => p.risk_level === "CRITICAL" || p.risk_level === "HIGH").length;

  // Build delta map vs previous fetch
  const deltaMap: Record<string, Record<RiskType, number | null>> = {};
  if (prevDataRef.current) {
    const prevByLabel: Record<string, GridPredictionPoint> = {};
    prevDataRef.current.forEach((p) => { if (p.label) prevByLabel[p.label] = p; });
    sorted.forEach((p) => {
      if (!p.label) return;
      const prev = prevByLabel[p.label];
      if (!prev) return;
      deltaMap[p.label] = {} as Record<RiskType, number | null>;
      RISK_KEYS.forEach((k) => {
        deltaMap[p.label!][k] = getDelta(prev.predictions[k], p.predictions[k]);
      });
    });
  }

  const isRefreshing = isFetching;
  const urgentRefresh = secondsLeft <= 15;

  return (
    <div className="space-y-3" role="region" aria-label="AI Risk Predictions">
      <MeshAlertBanner />
      <OfflinePredictionEngine />

      {/* Header with LIVE badge + refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <h3 className="font-display text-xs font-bold text-muted-foreground tracking-widest uppercase">
            {t('prediction.title')}
          </h3>
          {/* LIVE pulsing dot */}
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-safe/10 border border-safe/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safe opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-safe" />
            </span>
            <span className="text-[9px] font-mono text-safe font-bold">{t('prediction.live')}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Countdown timer */}
          <span
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
              urgentRefresh
                ? "text-warning border-warning/30 bg-warning/10 animate-pulse"
                : "text-muted-foreground border-border"
            }`}
            title="Next auto-refresh in"
          >
            ↻ {countdownDisplay}
          </span>
          {/* Manual refresh */}
          <button
            onClick={() => refetch()}
            disabled={isRefreshing}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors disabled:opacity-50"
            title="Refresh predictions now"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
          </button>
          {/* Model source */}
          <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-display">
            <Cpu className="w-3 h-3" />
            <span>{data.model_source === "ml_model" ? "ML" : "Heuristic"}</span>
          </div>
        </div>
      </div>

      {/* Global Summary Card — flashes on update */}
      <motion.div
        key={`summary-${flashKey}`}
        initial={{ opacity: 0.6, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`p-3 rounded-lg border ${levelColor(globalLevel)}`}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm font-display font-bold">{t('prediction.overall')}: {globalLevel}</span>
          </div>
          <div className="flex items-center gap-2 text-xs opacity-80">
            <Clock className="w-3 h-3" aria-hidden="true" />
            <span>{t('prediction.forecast48h')}</span>
            {isRefreshing && (
              <span className="text-[9px] font-mono opacity-60 animate-pulse">{t('prediction.updating')}</span>
            )}
          </div>
        </div>
        {criticalCount > 0 && (
          <p className="text-xs opacity-90">
          <AlertTriangle className="w-3 h-3 inline mr-1" aria-hidden="true" />
            {criticalCount} {criticalCount > 1 ? t('prediction.regionsPlural') : t('prediction.regions')} {t('prediction.elevatedRisk')}
          </p>
        )}
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs opacity-60">{data.grid_count} {t('prediction.monitoringPoints')}</p>
          <p className="text-xs opacity-60">
            {t('prediction.updated')} {new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
        </div>
      </motion.div>

      {/* Realtime feed status bar */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-secondary/50 border border-border">
        <Wifi className="w-3 h-3 text-safe" />
        <span className="text-[10px] font-mono text-muted-foreground flex-1">
          {t('prediction.realtimeFeed')}
        </span>
        <span className={`text-[9px] font-mono px-1 py-0.5 rounded ${isRefreshing ? "text-primary animate-pulse" : "text-safe"}`}>
          {isRefreshing ? t('prediction.syncing') : t('prediction.inSync')}
        </span>
      </div>

      {/* Risk Type Filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelectedRisk("all")}
          className={`px-2 py-1 rounded-full text-xs font-display transition-colors ${
            selectedRisk === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          {t('prediction.all')}
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
        <AnimatePresence mode="popLayout">
          {filtered.map((point, idx) => {
            const isExpanded = expandedPoint === idx;
            const dominantRisk = RISK_KEYS.reduce((a, b) => point.predictions[a] > point.predictions[b] ? a : b);
            const maxVal = point.predictions[dominantRisk];
            const deltas = point.label ? deltaMap[point.label] : null;
            const dominantDelta = deltas ? deltas[dominantRisk] : null;
            const hasIncrease = deltas && RISK_KEYS.some((k) => (deltas[k] ?? 0) > 0.02);

            return (
              <motion.div
                key={`${point.label}-${flashKey}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ delay: idx * 0.025, duration: 0.3 }}
                className={`rounded-lg border bg-card overflow-hidden cursor-pointer transition-colors ${
                  hasIncrease ? "border-warning/40 hover:border-warning/60" : "border-border hover:border-primary/30"
                }`}
                onClick={() => {
                  setExpandedPoint(isExpanded ? null : idx);
                  window.dispatchEvent(new CustomEvent("focus-prediction", {
                    detail: { lat: point.latitude, lng: point.longitude, label: point.label, riskLevel: point.risk_level },
                  }));
                }}
              >
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-base">{RISK_ICONS[dominantRisk]}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-display font-bold text-foreground truncate">{point.label}</p>
                        {hasIncrease && (
                          <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-warning/10 text-warning border border-warning/20 shrink-0">
                            ↑ {t('prediction.rising')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs text-muted-foreground">{RISK_LABELS[dominantRisk]} {(maxVal * 100).toFixed(0)}%</p>
                        <DeltaBadge delta={dominantDelta} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-display px-2 py-0.5 rounded-full border ${levelColor(point.risk_level)}`}>
                      {point.risk_level}
                    </span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                </div>

                {/* Stacked risk bar */}
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
                        {/* Individual risk bars with deltas */}
                        <div className="space-y-2">
                          {RISK_KEYS.map((key) => {
                            const delta = deltas ? deltas[key] : null;
                            return (
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
                                <div className="w-12 flex justify-end">
                                  <DeltaBadge delta={delta} />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Actions */}
                        {point.recommended_actions.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-display font-bold text-muted-foreground">{t('prediction.recommendedActions')}</p>
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

                        {/* Meta + realtime indicator */}
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
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PredictionPanel;
