import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RealDisasterData {
  earthquakes: any[];
  weather: any;
  region: { lat: number; lng: number; radius: number };
  fetchedAt: string;
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
    staleTime: 5 * 60 * 1000, // 5 min cache
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
    // Fetch initial alerts
    supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(10)
      .then(({ data }) => { if (data) setAlerts(data); });

    // Subscribe to new alerts
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
