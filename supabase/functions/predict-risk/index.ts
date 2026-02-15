import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * ML Model Integration Stub
 * 
 * HOW TO INTEGRATE YOUR ML MODEL:
 * 1. Deploy your ML model as an API (Flask, FastAPI, TensorFlow Serving, etc.)
 * 2. Set the ML_MODEL_URL secret in your project settings
 * 3. The function will automatically call your ML model instead of heuristics
 * 
 * INPUT FORMAT (what your ML model receives per grid point):
 * { latitude, longitude, features: { precipitation_7d, temperature_max, wind_speed_max, humidity, ... } }
 * 
 * OUTPUT FORMAT (what your ML model should return):
 * { predictions: { flood_risk, cyclone_risk, fire_risk, earthquake_risk, landslide_risk, heat_wave_risk }, confidence, risk_level, recommended_actions }
 */

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    
    // Support both single-point and multi-point (grid) requests
    const points: { latitude: number; longitude: number; label?: string; features?: any }[] = body.points || [
      { latitude: body.latitude || 20.9517, longitude: body.longitude || 85.0985, features: body.features }
    ];

    const ML_MODEL_URL = Deno.env.get("ML_MODEL_URL");

    const results = await Promise.all(points.map(async (point) => {
      // ============================================
      // REAL ML MODEL CALL (auto-activates when ML_MODEL_URL is set)
      // ============================================
      if (ML_MODEL_URL) {
        try {
          const mlResponse = await fetch(ML_MODEL_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude: point.latitude, longitude: point.longitude, features: point.features }),
          });
          if (mlResponse.ok) {
            const mlResult = await mlResponse.json();
            return {
              ...mlResult,
              latitude: point.latitude,
              longitude: point.longitude,
              label: point.label,
              source: "ml_model",
            };
          }
          console.error("ML model error:", mlResponse.status);
        } catch (e) {
          console.error("ML model fetch failed:", e);
        }
      }

      // FALLBACK: Heuristic-based prediction
      const prediction = generateHeuristicPrediction(point.latitude, point.longitude, point.features);
      return {
        ...prediction,
        latitude: point.latitude,
        longitude: point.longitude,
        label: point.label,
        source: "heuristic_fallback",
      };
    }));

    return new Response(JSON.stringify({
      predictions: results,
      grid_count: results.length,
      model_source: ML_MODEL_URL ? "ml_model" : "heuristic_fallback",
      note: ML_MODEL_URL ? undefined : "Using heuristic model. Set ML_MODEL_URL secret to connect your ML model.",
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("predict-risk error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateHeuristicPrediction(lat: number, lng: number, features?: any) {
  const isCoastal = lng > 85.5 || lat < 20;
  const isRiverDelta = (lat > 20 && lat < 21 && lng > 85 && lng < 87);
  const isForested = (lat > 21.5 && lng > 85.5 && lng < 87);
  const isWestern = lng < 84;
  
  const month = new Date().getMonth();
  const isMonsoon = month >= 5 && month <= 9;
  const isCycloneSeason = month >= 9 && month <= 11;
  const isSummer = month >= 2 && month <= 4;

  let floodRisk = 0.1;
  let cycloneRisk = 0.05;
  let fireRisk = 0.05;
  let earthquakeRisk = 0.02;
  let landslideRisk = 0.03;
  let heatWaveRisk = 0.05;

  if (isMonsoon) floodRisk += 0.5;
  if (isRiverDelta) floodRisk += 0.3;
  if (isCoastal) { floodRisk += 0.15; cycloneRisk += 0.2; }
  if (isCycloneSeason && isCoastal) cycloneRisk += 0.4;
  if (isForested && isSummer) fireRisk += 0.35;
  if (isSummer) heatWaveRisk += 0.4;
  if (isWestern) landslideRisk += 0.1;

  if (features) {
    if (features.precipitation_7d > 100) floodRisk = Math.min(floodRisk + 0.3, 1);
    if (features.wind_speed_max > 80) cycloneRisk = Math.min(cycloneRisk + 0.4, 1);
    if (features.temperature_max > 42) { fireRisk += 0.2; heatWaveRisk += 0.3; }
    if (features.sea_surface_temp > 27) cycloneRisk = Math.min(cycloneRisk + 0.15, 1);
  }

  const clamp = (v: number) => Math.min(Math.max(v, 0), 1);
  floodRisk = clamp(floodRisk);
  cycloneRisk = clamp(cycloneRisk);
  fireRisk = clamp(fireRisk);
  earthquakeRisk = clamp(earthquakeRisk);
  landslideRisk = clamp(landslideRisk);
  heatWaveRisk = clamp(heatWaveRisk);

  const maxRisk = Math.max(floodRisk, cycloneRisk, fireRisk, earthquakeRisk, landslideRisk, heatWaveRisk);
  const riskLevel = maxRisk > 0.8 ? "CRITICAL" : maxRisk > 0.6 ? "HIGH" : maxRisk > 0.3 ? "MEDIUM" : "LOW";

  const actions: string[] = [];
  if (floodRisk > 0.6) actions.push("Move to higher ground immediately", "Avoid river banks and low-lying areas");
  if (cycloneRisk > 0.6) actions.push("Secure loose objects outdoors", "Move to designated cyclone shelters");
  if (fireRisk > 0.5) actions.push("Clear dry vegetation around structures", "Keep emergency water supply ready");
  if (heatWaveRisk > 0.5) actions.push("Stay indoors during peak hours", "Stay hydrated");
  if (landslideRisk > 0.3) actions.push("Avoid hilly terrain during rain", "Monitor slope conditions");
  if (actions.length === 0) actions.push("Stay alert and monitor official announcements");

  return {
    predictions: {
      flood_risk: Math.round(floodRisk * 100) / 100,
      cyclone_risk: Math.round(cycloneRisk * 100) / 100,
      fire_risk: Math.round(fireRisk * 100) / 100,
      earthquake_risk: Math.round(earthquakeRisk * 100) / 100,
      landslide_risk: Math.round(landslideRisk * 100) / 100,
      heat_wave_risk: Math.round(heatWaveRisk * 100) / 100,
    },
    confidence: 0.65,
    risk_level: riskLevel,
    recommended_actions: actions,
    forecast_hours: 48,
    model_version: "heuristic-v1.0",
  };
}
