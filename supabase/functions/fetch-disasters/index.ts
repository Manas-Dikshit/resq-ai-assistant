import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lat, lng, radius_km } = await req.json();
    const centerLat = lat || 20.9517;
    const centerLng = lng || 85.0985;
    const radius = radius_km || 500;

    // Fetch real earthquake data from USGS
    const usgsUrl = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${getDateDaysAgo(30)}&minlatitude=${centerLat - 5}&maxlatitude=${centerLat + 5}&minlongitude=${centerLng - 5}&maxlongitude=${centerLng + 5}&minmagnitude=2`;
    
    // Fetch weather data from Open-Meteo (free, no key needed)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${centerLat}&longitude=${centerLng}&daily=precipitation_sum,temperature_2m_max,windspeed_10m_max,weathercode&timezone=Asia/Kolkata&past_days=7&forecast_days=7`;

    const [earthquakeRes, weatherRes] = await Promise.all([
      fetch(usgsUrl).catch(() => null),
      fetch(weatherUrl).catch(() => null),
    ]);

    const earthquakes = earthquakeRes?.ok ? await earthquakeRes.json() : { features: [] };
    const weather = weatherRes?.ok ? await weatherRes.json() : null;

    // Process earthquake data
    const earthquakeEvents = (earthquakes.features || []).slice(0, 20).map((f: any) => ({
      id: f.id,
      type: 'earthquake',
      title: f.properties.title,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      magnitude: f.properties.mag,
      severity: Math.min(f.properties.mag / 8, 1),
      description: f.properties.place,
      timestamp: new Date(f.properties.time).toISOString(),
      url: f.properties.url,
    }));

    // Process weather data for flood/storm risk
    const weatherAnalysis = weather?.daily ? {
      dates: weather.daily.time,
      precipitation: weather.daily.precipitation_sum,
      maxTemp: weather.daily.temperature_2m_max,
      maxWind: weather.daily.windspeed_10m_max,
      weatherCodes: weather.daily.weathercode,
      floodRisk: calculateFloodRisk(weather.daily.precipitation_sum),
      stormRisk: calculateStormRisk(weather.daily.windspeed_10m_max, weather.daily.weathercode),
    } : null;

    return new Response(JSON.stringify({
      earthquakes: earthquakeEvents,
      weather: weatherAnalysis,
      region: { lat: centerLat, lng: centerLng, radius },
      fetchedAt: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-disasters error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function calculateFloodRisk(precipitationArr: number[]): number {
  if (!precipitationArr || precipitationArr.length === 0) return 0;
  const recent = precipitationArr.slice(-7);
  const totalRecent = recent.reduce((a: number, b: number) => a + (b || 0), 0);
  // >100mm in 7 days = high flood risk for Odisha
  return Math.min(totalRecent / 150, 1);
}

function calculateStormRisk(windArr: number[], weatherCodes: number[]): number {
  if (!windArr || windArr.length === 0) return 0;
  const maxWind = Math.max(...windArr.map((w: number) => w || 0));
  const hasSevereWeather = (weatherCodes || []).some((c: number) => c >= 95);
  const windRisk = Math.min(maxWind / 120, 1);
  return hasSevereWeather ? Math.min(windRisk + 0.3, 1) : windRisk;
}
