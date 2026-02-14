import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * ML Model Integration Stub
 * 
 * This edge function is designed to be easily connected to your ML model.
 * 
 * HOW TO INTEGRATE YOUR ML MODEL:
 * 
 * 1. Deploy your ML model as an API (Flask, FastAPI, TensorFlow Serving, etc.)
 * 2. Set the ML_MODEL_URL secret in your project settings
 * 3. Uncomment the "REAL ML MODEL CALL" section below
 * 4. The input/output format is already defined for you
 * 
 * INPUT FORMAT (what your ML model should accept):
 * {
 *   "latitude": 20.9517,
 *   "longitude": 85.0985,
 *   "features": {
 *     "precipitation_7d": 145.2,    // mm rainfall last 7 days
 *     "temperature_max": 38.5,      // °C
 *     "wind_speed_max": 85.0,       // km/h
 *     "humidity": 92,               // %
 *     "soil_moisture": 0.85,        // 0-1
 *     "river_level": 12.5,          // meters
 *     "sea_surface_temp": 28.5,     // °C (for cyclone prediction)
 *     "historical_events_30d": 3,   // count of events in last 30 days
 *     "elevation": 45,              // meters above sea level
 *     "proximity_to_coast": 25      // km
 *   }
 * }
 * 
 * OUTPUT FORMAT (what your ML model should return):
 * {
 *   "predictions": {
 *     "flood_risk": 0.85,           // 0-1 probability
 *     "cyclone_risk": 0.72,         // 0-1 probability
 *     "fire_risk": 0.05,            // 0-1 probability
 *     "earthquake_risk": 0.03,      // 0-1 probability
 *     "landslide_risk": 0.15,       // 0-1 probability
 *     "heat_wave_risk": 0.20        // 0-1 probability
 *   },
 *   "confidence": 0.89,
 *   "risk_level": "HIGH",           // LOW, MEDIUM, HIGH, CRITICAL
 *   "recommended_actions": ["Evacuate low-lying areas", "Stock emergency supplies"],
 *   "forecast_hours": 48,
 *   "model_version": "v2.1.0"
 * }
 */

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { latitude, longitude, features } = await req.json();
    const lat = latitude || 20.9517;
    const lng = longitude || 85.0985;

    // ============================================
    // REAL ML MODEL CALL (uncomment when ready)
    // ============================================
    // const ML_MODEL_URL = Deno.env.get("ML_MODEL_URL");
    // if (ML_MODEL_URL) {
    //   const mlResponse = await fetch(ML_MODEL_URL, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ latitude: lat, longitude: lng, features }),
    //   });
    //   if (mlResponse.ok) {
    //     const mlResult = await mlResponse.json();
    //     return new Response(JSON.stringify({
    //       ...mlResult,
    //       source: "ml_model",
    //       timestamp: new Date().toISOString(),
    //     }), {
    //       headers: { ...corsHeaders, "Content-Type": "application/json" },
    //     });
    //   }
    //   console.error("ML model error:", mlResponse.status);
    // }
    // ============================================

    // FALLBACK: Heuristic-based prediction (used until ML model is connected)
    const prediction = generateHeuristicPrediction(lat, lng, features);

    return new Response(JSON.stringify({
      ...prediction,
      source: "heuristic_fallback",
      note: "Using heuristic model. Set ML_MODEL_URL secret to connect your ML model.",
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
  // Odisha-specific heuristic based on geography
  const isCoastal = lng > 85.5 || lat < 20;
  const isRiverDelta = (lat > 20 && lat < 21 && lng > 85 && lng < 87);
  const isForested = (lat > 21.5 && lng > 85.5 && lng < 87);
  const isWestern = lng < 84;
  
  const month = new Date().getMonth(); // 0-indexed
  const isMonsoon = month >= 5 && month <= 9; // June to October
  const isCycloneSeason = month >= 9 && month <= 11; // Oct to Dec
  const isSummer = month >= 2 && month <= 4; // Mar to May

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

  // Apply feature overrides if provided
  if (features) {
    if (features.precipitation_7d > 100) floodRisk = Math.min(floodRisk + 0.3, 1);
    if (features.wind_speed_max > 80) cycloneRisk = Math.min(cycloneRisk + 0.4, 1);
    if (features.temperature_max > 42) { fireRisk += 0.2; heatWaveRisk += 0.3; }
    if (features.sea_surface_temp > 27) cycloneRisk = Math.min(cycloneRisk + 0.15, 1);
  }

  // Clamp all values
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
