import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CityWeather {
  city: string;
  lat: number;
  lng: number;
  temperature: number;
  feelsLike: number;
  humidity: number;
  precipitation: number;
  rain: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  cloudCover: number;
  pressure: number;
  weatherCode: number;
}

export interface HourlyWeather {
  time: string[];
  temperature: number[];
  humidity: number[];
  precipitation: number[];
  pressure: number[];
  windSpeed: number[];
  windDirection: number[];
  windGusts: number[];
  cloudCover: number[];
  visibility: number[];
  uvIndex: number[];
  weatherCode: number[];
}

export interface AirQualityData {
  time: string[];
  pm25: number[];
  pm10: number[];
  co: number[];
  no2: number[];
  so2: number[];
  ozone: number[];
  dust: number[];
  aerosolDepth: number[];
  uvIndex: number[];
}

export interface MarineData {
  time: string[];
  waveHeight: number[];
  waveDirection: number[];
  wavePeriod: number[];
  windWaveHeight: number[];
  swellHeight: number[];
  swellDirection: number[];
}

export interface RealDisasterData {
  earthquakes: any[];
  nasaEvents: any[];
  weather: any;
  hourlyWeather: HourlyWeather | null;
  airQuality: AirQualityData | null;
  marine: MarineData | null;
  cityWeather: CityWeather[];
  satelliteLinks: Record<string, string>;
  windyEmbed: string;
  region: { lat: number; lng: number; radius: number };
  fetchedAt: string;
  sources: string[];
}

interface PredictionData {
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
  source: string;
}

export const useRealDisasterData = () => {
  return useQuery<RealDisasterData>({
    queryKey: ['real-disasters'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-disasters', {
        body: { lat: 20.9517, lng: 85.0985, radius_km: 500 },
      });
      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 min cache for real-time feel
    refetchInterval: 3 * 60 * 1000, // Auto-refetch every 3 min
    retry: 2,
  });
};

export const useRiskPrediction = (lat = 20.9517, lng = 85.0985) => {
  return useQuery<PredictionData>({
    queryKey: ['risk-prediction', lat, lng],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('predict-risk', {
        body: { latitude: lat, longitude: lng },
      });
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });
};

export const useRealtimeAlerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(10)
      .then(({ data }) => { if (data) setAlerts(data); });

    const channel = supabase
      .channel('alerts-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload) => {
        setAlerts(prev => [payload.new as any, ...prev].slice(0, 20));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return alerts;
};

// Weather code to description
export const getWeatherDescription = (code: number): string => {
  const descriptions: Record<number, string> = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snowfall", 73: "Moderate snowfall", 75: "Heavy snowfall",
    80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
    95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail",
  };
  return descriptions[code] || "Unknown";
};

export const getWindDirectionLabel = (deg: number): string => {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
};

// ─── NASA FIRMS – Forest Fire / Active Fire Hotspots ─────────────────────────
export interface ForestFireHotspot {
  latitude: number;
  longitude: number;
  bright_ti4: number;   // brightness temperature channel 4 (K)
  bright_ti5: number;   // brightness temperature channel 5 (K)
  frp: number;          // fire radiative power (MW)
  acq_date: string;     // "YYYY-MM-DD"
  acq_time: string;     // "HHMM"
  satellite: string;    // "N" = NOAA-20, "NPP" = Suomi NPP
  confidence: string;   // "high" | "nominal" | "low"
  daynight: string;     // "D" | "N"
  scan: number;
  track: number;
}

/**
 * Fetches active forest-fire hotspots from NASA FIRMS VIIRS_SNPP_NRT for a
 * bounding box that covers Odisha (and surrounding regions).
 *
 * API key (MAP_KEY): https://firms.modaps.eosdis.nasa.gov/usfs/api/area/
 * Set VITE_NASA_FIRMS_API_KEY in your .env file.
 */
export const useForestFireData = (days = 1) => {
  const apiKey = import.meta.env.VITE_NASA_FIRMS_API_KEY as string | undefined;

  return useQuery<ForestFireHotspot[]>({
    queryKey: ["forest-fires", days],
    queryFn: async () => {
      if (!apiKey || apiKey === "YOUR_FIRMS_MAP_KEY_HERE") {
        // Return mock hotspots when no key is configured
        return [
          { latitude: 21.8282, longitude: 86.374, bright_ti4: 340.1, bright_ti5: 305.6, frp: 28.4, acq_date: new Date().toISOString().slice(0, 10), acq_time: "0610", satellite: "NPP", confidence: "high", daynight: "D", scan: 0.4, track: 0.4 },
          { latitude: 21.6740, longitude: 86.2800, bright_ti4: 332.8, bright_ti5: 301.2, frp: 14.2, acq_date: new Date().toISOString().slice(0, 10), acq_time: "0612", satellite: "NPP", confidence: "nominal", daynight: "D", scan: 0.4, track: 0.4 },
          { latitude: 21.9100, longitude: 86.5500, bright_ti4: 358.3, bright_ti5: 312.1, frp: 52.7, acq_date: new Date().toISOString().slice(0, 10), acq_time: "0615", satellite: "N", confidence: "high", daynight: "D", scan: 0.4, track: 0.4 },
          { latitude: 20.4200, longitude: 84.9600, bright_ti4: 325.0, bright_ti5: 298.5, frp: 8.1, acq_date: new Date().toISOString().slice(0, 10), acq_time: "0618", satellite: "N", confidence: "low", daynight: "N", scan: 0.4, track: 0.4 },
        ];
      }

      // Bounding box covering Odisha + buffer: west,south,east,north
      const area = "81.3,17.7,87.4,22.6";
      const url = `https://firms.modaps.eosdis.nasa.gov/api/area/json/${apiKey}/VIIRS_SNPP_NRT/${area}/${days}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`FIRMS API error: ${response.status} ${response.statusText}`);
      const json = await response.json();
      return (json as ForestFireHotspot[]);
    },
    staleTime: 10 * 60 * 1000,    // 10-min cache
    refetchInterval: 15 * 60 * 1000, // refresh every 15 min
    retry: 2,
  });
};
