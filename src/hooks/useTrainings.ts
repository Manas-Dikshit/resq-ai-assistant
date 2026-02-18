import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Training {
  id: string;
  title: string;
  theme: string;
  organizer: string;
  institution_id: string | null;
  location_name: string;
  lat: number | null;
  lng: number | null;
  state: string;
  level: string;
  start_date: string;
  end_date: string;
  participants_total: number;
  participants_male: number;
  participants_female: number;
  trainer_names: string | null;
  outcome_summary: string | null;
  documents: string[] | null;
  created_by: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrainingInsert {
  title: string;
  theme: string;
  organizer: string;
  institution_id?: string | null;
  location_name: string;
  lat?: number | null;
  lng?: number | null;
  state: string;
  level: string;
  start_date: string;
  end_date: string;
  participants_total: number;
  participants_male: number;
  participants_female: number;
  trainer_names?: string | null;
  outcome_summary?: string | null;
  created_by: string;
}

export interface TrainingFilters {
  state?: string;
  theme?: string;
  level?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useTrainings(filters?: TrainingFilters) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["trainings", filters],
    queryFn: async () => {
      let q = supabase
        .from("trainings")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.state) q = q.eq("state", filters.state);
      if (filters?.theme) q = q.eq("theme", filters.theme);
      if (filters?.level) q = q.eq("level", filters.level);
      if (filters?.dateFrom) q = q.gte("start_date", filters.dateFrom);
      if (filters?.dateTo) q = q.lte("start_date", filters.dateTo);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Training[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("trainings-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "trainings" }, () => {
        queryClient.invalidateQueries({ queryKey: ["trainings"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
}

export function useTrainingThemes() {
  return useQuery({
    queryKey: ["training-themes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("training_themes").select("*").order("theme_name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useInstitutions() {
  return useQuery({
    queryKey: ["institutions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("institutions").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAddTraining() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (training: TrainingInsert) => {
      const { data, error } = await supabase.from("trainings").insert(training).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      toast({ title: "Training recorded", description: "Training event has been successfully added." });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to add training", description: err.message, variant: "destructive" });
    },
  });
}

export function useVerifyTraining() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, verified }: { id: string; verified: boolean }) => {
      const { error } = await supabase.from("trainings").update({ verified }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      toast({ title: "Training updated", description: "Verification status changed." });
    },
  });
}
