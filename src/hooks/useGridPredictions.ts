import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Grid points covering Odisha's key regions
const PREDICTION_GRID = [
  { latitude: 19.81, longitude: 85.83, label: "Puri Coast" },
  { latitude: 20.46, longitude: 85.88, label: "Cuttack" },
  { latitude: 20.30, longitude: 85.82, label: "Bhubaneswar" },
  { latitude: 20.50, longitude: 86.42, label: "Kendrapara" },
  { latitude: 20.84, longitude: 86.33, label: "Jajpur" },
  { latitude: 21.49, longitude: 86.94, label: "Balasore" },
  { latitude: 21.94, longitude: 86.74, label: "Mayurbhanj" },
  { latitude: 20.32, longitude: 86.61, label: "Paradip" },
  { latitude: 20.72, longitude: 83.48, label: "Balangir" },
  { latitude: 21.47, longitude: 83.97, label: "Sambalpur" },
  { latitude: 22.26, longitude: 84.85, label: "Rourkela" },
  { latitude: 19.31, longitude: 84.79, label: "Berhampur" },
  { latitude: 18.81, longitude: 82.56, label: "Koraput" },
  { latitude: 20.58, longitude: 84.32, label: "Boudh" },
  { latitude: 21.21, longitude: 85.10, label: "Dhenkanal" },
];

export interface GridPredictionPoint {
  latitude: number;
  longitude: number;
  label?: string;
  source: string;
  predictions: {
    flood_risk: number;
    cyclone_risk: number;
    fire_risk: number;
    earthquake_risk: number;
    landslide_risk: number;
    heat_wave_risk: number;
  };
  confidence: number;
  risk_level: string;
  recommended_actions: string[];
  forecast_hours: number;
  model_version: string;
  explainability?: {
    factors: { factor: string; impact: number; direction: string }[];
    summary: string;
    method: string;
  };
  alert_tier?: string;
}

export interface GridPredictionResponse {
  predictions: GridPredictionPoint[];
  grid_count: number;
  model_source: string;
  timestamp: string;
}

export type RiskType = keyof GridPredictionPoint["predictions"];

export const RISK_COLORS: Record<RiskType, string> = {
  flood_risk: "#3b82f6",
  cyclone_risk: "#a855f7",
  fire_risk: "#ef4444",
  earthquake_risk: "#f97316",
  landslide_risk: "#84cc16",
  heat_wave_risk: "#eab308",
};

export const RISK_LABELS: Record<RiskType, string> = {
  flood_risk: "Flood",
  cyclone_risk: "Cyclone",
  fire_risk: "Wildfire",
  earthquake_risk: "Earthquake",
  landslide_risk: "Landslide",
  heat_wave_risk: "Heat Wave",
};

export const RISK_ICONS: Record<RiskType, string> = {
  flood_risk: "🌊",
  cyclone_risk: "🌀",
  fire_risk: "🔥",
  earthquake_risk: "🏔️",
  landslide_risk: "⛰️",
  heat_wave_risk: "🌡️",
};

export const REFETCH_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

export const useGridPredictions = () => {
  const queryClient = useQueryClient();

  const query = useQuery<GridPredictionResponse>({
    queryKey: ["grid-predictions"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("predict-risk", {
        body: { points: PREDICTION_GRID },
      });
      if (error) throw error;

      // Cache predictions for offline use
      if ((window as any).__resqai_cache_predictions) {
        (window as any).__resqai_cache_predictions(data.predictions);
      }

      // Persist grid to risk_predictions table for realtime sync across clients
      try {
        await supabase.from("risk_predictions").insert(
          data.predictions.map((p: GridPredictionPoint) => ({
            lat: p.latitude,
            lng: p.longitude,
            region: p.label,
            flood_risk: p.predictions.flood_risk,
            quake_risk: p.predictions.earthquake_risk,
            fire_risk: p.predictions.fire_risk,
            cyclone_risk: p.predictions.cyclone_risk,
            landslide_risk: p.predictions.landslide_risk,
            heat_wave_risk: p.predictions.heat_wave_risk,
            risk_level: p.risk_level,
            explanation: p.explainability as any,
            trust_score: p.confidence,
          }))
        );
      } catch (_) {
        // Non-critical — don't throw if DB write fails
      }

      return data;
    },
    staleTime: 60 * 1000,               // 1 min cache
    refetchInterval: REFETCH_INTERVAL_MS,
    retry: 2,
  });

  // Realtime: re-fetch when new risk_predictions are inserted by any client / admin tool
  useEffect(() => {
    const riskChannel = supabase
      .channel("risk-predictions-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "risk_predictions" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["grid-predictions"] });
        }
      )
      .subscribe();

    // Also trigger re-prediction on critical/high alerts
    const alertChannel = supabase
      .channel("alerts-prediction-trigger")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alerts" },
        (payload) => {
          const alert = payload.new as any;
          if (alert.severity === "critical" || alert.severity === "high") {
            queryClient.invalidateQueries({ queryKey: ["grid-predictions"] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(riskChannel);
      supabase.removeChannel(alertChannel);
    };
  }, [queryClient]);

  return query;
};
