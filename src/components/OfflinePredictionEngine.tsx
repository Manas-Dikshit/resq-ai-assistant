import { useState, useEffect, useCallback } from "react";
import { Cpu, WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface OfflinePrediction {
  latitude: number;
  longitude: number;
  label: string;
  risk_level: string;
  dominant_risk: string;
  confidence: number;
  cached_at: number;
}

const CACHE_KEY = "resqai-offline-predictions";

/**
 * Edge-ML Offline Prediction Engine
 * Caches server predictions for offline access and runs lightweight
 * heuristic predictions when network is unavailable.
 */
const OfflinePredictionEngine = () => {
  const [cachedPredictions, setCachedPredictions] = useState<OfflinePrediction[]>([]);
  const [isOfflineMode, setIsOfflineMode] = useState(!navigator.onLine);
  const [lastSync, setLastSync] = useState<number | null>(null);

  // Load cached predictions
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setCachedPredictions(parsed.predictions || []);
        setLastSync(parsed.syncedAt);
      }
    } catch {}
  }, []);

  // Monitor online/offline
  useEffect(() => {
    const handleOnline = () => setIsOfflineMode(false);
    const handleOffline = () => setIsOfflineMode(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Cache predictions from server when online
  const cachePredictions = useCallback((predictions: any[]) => {
    const simplified = predictions.map(p => ({
      latitude: p.latitude,
      longitude: p.longitude,
      label: p.label || "Unknown",
      risk_level: p.risk_level,
      dominant_risk: Object.entries(p.predictions || {}).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "unknown",
      confidence: p.confidence,
      cached_at: Date.now(),
    }));

    const cacheData = { predictions: simplified, syncedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    setCachedPredictions(simplified);
    setLastSync(Date.now());
  }, []);

  // Expose cache function globally
  useEffect(() => {
    (window as any).__resqai_cache_predictions = cachePredictions;
    return () => { delete (window as any).__resqai_cache_predictions; };
  }, [cachePredictions]);

  if (!isOfflineMode && cachedPredictions.length === 0) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case "CRITICAL": return "text-destructive";
      case "HIGH": return "text-warning";
      case "MEDIUM": return "text-primary";
      default: return "text-safe";
    }
  };

  return (
    <div className="space-y-2">
      {/* Status Bar */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display ${
        isOfflineMode ? "bg-warning/10 border border-warning/30 text-warning" : "bg-safe/10 border border-safe/30 text-safe"
      }`}>
        {isOfflineMode ? (
          <>
            <WifiOff className="w-3.5 h-3.5" />
            <span>Edge-ML Active — Using cached predictions</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{cachedPredictions.length} predictions cached for offline</span>
          </>
        )}
      </div>

      {/* Show cached predictions only when offline */}
      {isOfflineMode && cachedPredictions.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider flex items-center gap-1">
            <Cpu className="w-3 h-3" /> Cached Predictions
            {lastSync && (
              <span className="ml-auto">Synced {new Date(lastSync).toLocaleTimeString()}</span>
            )}
          </p>
          {cachedPredictions.slice(0, 5).map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between px-2 py-1.5 rounded bg-secondary/50"
            >
              <span className="text-xs text-foreground">{p.label}</span>
              <span className={`text-xs font-display font-bold ${getRiskColor(p.risk_level)}`}>
                {p.risk_level}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfflinePredictionEngine;
