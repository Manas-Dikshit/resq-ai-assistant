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

    // 1. USGS Earthquake data (real-time)
    const usgsUrl = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${getDateDaysAgo(30)}&minlatitude=${centerLat - 5}&maxlatitude=${centerLat + 5}&minlongitude=${centerLng - 5}&maxlongitude=${centerLng + 5}&minmagnitude=2`;

    // 2. Open-Meteo comprehensive weather (hourly + daily)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${centerLat}&longitude=${centerLng}&hourly=temperature_2m,relative_humidity_2m,precipitation,rain,weathercode,pressure_msl,surface_pressure,windspeed_10m,winddirection_10m,windgusts_10m,cloudcover,visibility,uv_index&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,weathercode,sunrise,sunset,uv_index_max,precipitation_hours&timezone=Asia/Kolkata&past_days=7&forecast_days=7`;

    // 3. NASA EONET (Earth Observatory Natural Event Tracker) - real events
    const eonetUrl = `https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=50`;

    // 4. Open-Meteo Air Quality for Odisha
    const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${centerLat}&longitude=${centerLng}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,aerosol_optical_depth,dust,uv_index&timezone=Asia/Kolkata`;

    // 5. Open-Meteo Marine/Wave data (Bay of Bengal)
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=19.5&longitude=86.0&hourly=wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,swell_wave_direction&timezone=Asia/Kolkata`;

    // 6. Multi-city weather grid across Odisha
    const odishaCities = [
      { name: "Bhubaneswar", lat: 20.2961, lng: 85.8245 },
      { name: "Cuttack", lat: 20.4625, lng: 85.8828 },
      { name: "Puri", lat: 19.8135, lng: 85.8312 },
      { name: "Sambalpur", lat: 21.4669, lng: 83.9812 },
      { name: "Balasore", lat: 21.4934, lng: 86.9389 },
      { name: "Berhampur", lat: 19.3150, lng: 84.7941 },
      { name: "Rourkela", lat: 22.2604, lng: 84.8536 },
      { name: "Paradip", lat: 20.3165, lng: 86.6115 },
    ];
    const cityLats = odishaCities.map(c => c.lat).join(",");
    const cityLngs = odishaCities.map(c => c.lng).join(",");
    const multiCityUrl = `https://api.open-meteo.com/v1/forecast?latitude=${cityLats}&longitude=${cityLngs}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weathercode,cloudcover,pressure_msl,surface_pressure,windspeed_10m,winddirection_10m,windgusts_10m&timezone=Asia/Kolkata`;

    const [earthquakeRes, weatherRes, eonetRes, airQualityRes, marineRes, multiCityRes] = await Promise.all([
      fetch(usgsUrl).catch(() => null),
      fetch(weatherUrl).catch(() => null),
      fetch(eonetUrl).catch(() => null),
      fetch(airQualityUrl).catch(() => null),
      fetch(marineUrl).catch(() => null),
      fetch(multiCityUrl).catch(() => null),
    ]);

    const earthquakes = earthquakeRes?.ok ? await earthquakeRes.json() : { features: [] };
    const weather = weatherRes?.ok ? await weatherRes.json() : null;
    const eonet = eonetRes?.ok ? await eonetRes.json() : { events: [] };
    const airQuality = airQualityRes?.ok ? await airQualityRes.json() : null;
    const marine = marineRes?.ok ? await marineRes.json() : null;
    const multiCity = multiCityRes?.ok ? await multiCityRes.json() : null;

    // Process earthquake data (filter to Odisha region)
    const earthquakeEvents = (earthquakes.features || []).filter((f: any) => {
      const lat = f.geometry.coordinates[1];
      const lng = f.geometry.coordinates[0];
      return Math.abs(lat - centerLat) < 5 && Math.abs(lng - centerLng) < 5;
    }).slice(0, 20).map((f: any) => ({
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
      source: 'USGS',
    }));

    // Process NASA EONET events (filter near Odisha region)
    const nasaEvents = (eonet.events || []).filter((e: any) => {
      const geo = e.geometry?.[0];
      if (!geo?.coordinates) return false;
      const [eLng, eLat] = geo.coordinates;
      return Math.abs(eLat - centerLat) < 15 && Math.abs(eLng - centerLng) < 15;
    }).map((e: any) => ({
      id: e.id,
      type: mapEonetCategory(e.categories?.[0]?.id),
      title: e.title,
      lat: e.geometry?.[0]?.coordinates?.[1],
      lng: e.geometry?.[0]?.coordinates?.[0],
      severity: 0.6,
      description: `NASA EONET: ${e.categories?.[0]?.title || 'Natural Event'}`,
      timestamp: e.geometry?.[0]?.date || new Date().toISOString(),
      url: e.link,
      source: 'NASA EONET',
    }));

    // Process comprehensive weather
    const weatherAnalysis = weather?.daily ? {
      dates: weather.daily.time,
      precipitation: weather.daily.precipitation_sum,
      maxTemp: weather.daily.temperature_2m_max,
      minTemp: weather.daily.temperature_2m_min,
      maxWind: weather.daily.windspeed_10m_max,
      maxGusts: weather.daily.windgusts_10m_max,
      dominantWindDir: weather.daily.winddirection_10m_dominant,
      weatherCodes: weather.daily.weathercode,
      sunrise: weather.daily.sunrise,
      sunset: weather.daily.sunset,
      uvIndexMax: weather.daily.uv_index_max,
      precipHours: weather.daily.precipitation_hours,
      floodRisk: calculateFloodRisk(weather.daily.precipitation_sum),
      stormRisk: calculateStormRisk(weather.daily.windspeed_10m_max, weather.daily.weathercode),
    } : null;

    // Current hourly snapshot
    const hourlyWeather = weather?.hourly ? {
      time: weather.hourly.time?.slice(-24),
      temperature: weather.hourly.temperature_2m?.slice(-24),
      humidity: weather.hourly.relative_humidity_2m?.slice(-24),
      precipitation: weather.hourly.precipitation?.slice(-24),
      pressure: weather.hourly.pressure_msl?.slice(-24),
      windSpeed: weather.hourly.windspeed_10m?.slice(-24),
      windDirection: weather.hourly.winddirection_10m?.slice(-24),
      windGusts: weather.hourly.windgusts_10m?.slice(-24),
      cloudCover: weather.hourly.cloudcover?.slice(-24),
      visibility: weather.hourly.visibility?.slice(-24),
      uvIndex: weather.hourly.uv_index?.slice(-24),
      weatherCode: weather.hourly.weathercode?.slice(-24),
    } : null;

    // Air quality data
    const airQualityData = airQuality?.hourly ? {
      time: airQuality.hourly.time?.slice(-24),
      pm25: airQuality.hourly.pm2_5?.slice(-24),
      pm10: airQuality.hourly.pm10?.slice(-24),
      co: airQuality.hourly.carbon_monoxide?.slice(-24),
      no2: airQuality.hourly.nitrogen_dioxide?.slice(-24),
      so2: airQuality.hourly.sulphur_dioxide?.slice(-24),
      ozone: airQuality.hourly.ozone?.slice(-24),
      dust: airQuality.hourly.dust?.slice(-24),
      aerosolDepth: airQuality.hourly.aerosol_optical_depth?.slice(-24),
      uvIndex: airQuality.hourly.uv_index?.slice(-24),
    } : null;

    // Marine data (Bay of Bengal)
    const marineData = marine?.hourly ? {
      time: marine.hourly.time?.slice(-24),
      waveHeight: marine.hourly.wave_height?.slice(-24),
      waveDirection: marine.hourly.wave_direction?.slice(-24),
      wavePeriod: marine.hourly.wave_period?.slice(-24),
      windWaveHeight: marine.hourly.wind_wave_height?.slice(-24),
      swellHeight: marine.hourly.swell_wave_height?.slice(-24),
      swellDirection: marine.hourly.swell_wave_direction?.slice(-24),
    } : null;

    // Multi-city current weather
    const cityWeather = multiCity ? (Array.isArray(multiCity) ? multiCity : [multiCity]).map((c: any, i: number) => ({
      city: odishaCities[i]?.name || `City ${i}`,
      lat: odishaCities[i]?.lat,
      lng: odishaCities[i]?.lng,
      temperature: c.current?.temperature_2m,
      feelsLike: c.current?.apparent_temperature,
      humidity: c.current?.relative_humidity_2m,
      precipitation: c.current?.precipitation,
      rain: c.current?.rain,
      windSpeed: c.current?.windspeed_10m,
      windDirection: c.current?.winddirection_10m,
      windGusts: c.current?.windgusts_10m,
      cloudCover: c.current?.cloudcover,
      pressure: c.current?.pressure_msl,
      weatherCode: c.current?.weathercode,
    })) : [];

    // NASA Satellite imagery links (Worldview)
    const satelliteLinks = {
      trueColor: `https://worldview.earthdata.nasa.gov/?v=80.5,17.5,90.5,23.5&l=VIIRS_SNPP_CorrectedReflectance_TrueColor,Coastlines_15m&t=${getDateDaysAgo(0)}`,
      thermalAnomalies: `https://worldview.earthdata.nasa.gov/?v=80.5,17.5,90.5,23.5&l=VIIRS_SNPP_Thermal_Anomalies_375m_All,Coastlines_15m&t=${getDateDaysAgo(0)}`,
      nightLights: `https://worldview.earthdata.nasa.gov/?v=80.5,17.5,90.5,23.5&l=VIIRS_SNPP_DayNightBand_ENCC&t=${getDateDaysAgo(1)}`,
      precipitation: `https://worldview.earthdata.nasa.gov/?v=80.5,17.5,90.5,23.5&l=IMERG_Precipitation_Rate&t=${getDateDaysAgo(0)}`,
      aerosol: `https://worldview.earthdata.nasa.gov/?v=80.5,17.5,90.5,23.5&l=MODIS_Aqua_AOD_Deep_Blue_Combined&t=${getDateDaysAgo(0)}`,
    };

    // Windy embed URL for live wind visualization
    const windyEmbed = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h&zoom=7&overlay=wind&product=ecmwf&level=surface&lat=${centerLat}&lon=${centerLng}`;

    return new Response(JSON.stringify({
      earthquakes: earthquakeEvents,
      nasaEvents,
      weather: weatherAnalysis,
      hourlyWeather,
      airQuality: airQualityData,
      marine: marineData,
      cityWeather,
      satelliteLinks,
      windyEmbed,
      region: { lat: centerLat, lng: centerLng, radius },
      fetchedAt: new Date().toISOString(),
      sources: ['USGS', 'NASA EONET', 'Open-Meteo Weather', 'Open-Meteo Air Quality', 'Open-Meteo Marine', 'NASA Worldview', 'Windy'],
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

function mapEonetCategory(catId: string): string {
  const map: Record<string, string> = {
    wildfires: 'fire', severeStorms: 'storm', floods: 'flood',
    earthquakes: 'earthquake', volcanoes: 'earthquake', landslides: 'earthquake',
    seaLakeIce: 'flood', drought: 'fire', dustHaze: 'storm',
    tempExtremes: 'fire', waterColor: 'flood', manmade: 'fire',
  };
  return map[catId] || 'storm';
}

function calculateFloodRisk(precipitationArr: number[]): number {
  if (!precipitationArr || precipitationArr.length === 0) return 0;
  const recent = precipitationArr.slice(-7);
  const totalRecent = recent.reduce((a: number, b: number) => a + (b || 0), 0);
  return Math.min(totalRecent / 150, 1);
}

function calculateStormRisk(windArr: number[], weatherCodes: number[]): number {
  if (!windArr || windArr.length === 0) return 0;
  const maxWind = Math.max(...windArr.map((w: number) => w || 0));
  const hasSevereWeather = (weatherCodes || []).some((c: number) => c >= 95);
  const windRisk = Math.min(maxWind / 120, 1);
  return hasSevereWeather ? Math.min(windRisk + 0.3, 1) : windRisk;
}
