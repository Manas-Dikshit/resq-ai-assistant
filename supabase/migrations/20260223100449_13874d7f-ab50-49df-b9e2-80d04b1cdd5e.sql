
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create damage_assessments table
CREATE TABLE public.damage_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID REFERENCES public.incidents(id),
  assessor_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  district TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Odisha',
  location_name TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  damage_type TEXT NOT NULL DEFAULT 'structural',
  severity TEXT NOT NULL DEFAULT 'moderate',
  status TEXT NOT NULL DEFAULT 'assessed',
  affected_households INTEGER DEFAULT 0,
  affected_population INTEGER DEFAULT 0,
  estimated_cost_inr NUMERIC DEFAULT 0,
  infrastructure_damage JSONB DEFAULT '{}',
  photo_urls TEXT[] DEFAULT '{}',
  recovery_phase TEXT NOT NULL DEFAULT 'assessment',
  recovery_progress INTEGER DEFAULT 0,
  priority TEXT NOT NULL DEFAULT 'medium',
  notes TEXT,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.damage_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view damage assessments"
  ON public.damage_assessments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create assessments"
  ON public.damage_assessments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own assessments"
  ON public.damage_assessments FOR UPDATE
  USING (auth.uid()::text = assessor_id);

CREATE POLICY "Admins can update any assessment"
  ON public.damage_assessments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete assessments"
  ON public.damage_assessments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

ALTER PUBLICATION supabase_realtime ADD TABLE public.damage_assessments;

CREATE TRIGGER update_damage_assessments_updated_at
  BEFORE UPDATE ON public.damage_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
