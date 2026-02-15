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
