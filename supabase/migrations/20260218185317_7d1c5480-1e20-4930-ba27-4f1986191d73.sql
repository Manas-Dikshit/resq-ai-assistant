
-- Create institutions table
CREATE TABLE public.institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'ATI', -- ATI / NGO / SDMA / Central
  contact_person text,
  contact_email text,
  state text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view institutions"
  ON public.institutions FOR SELECT USING (true);

CREATE POLICY "Admins can manage institutions"
  ON public.institutions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can insert institutions"
  ON public.institutions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create themes table
CREATE TABLE public.training_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.training_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view themes"
  ON public.training_themes FOR SELECT USING (true);

CREATE POLICY "Admins can manage themes"
  ON public.training_themes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed default themes
INSERT INTO public.training_themes (theme_name, description) VALUES
  ('Flood Management', 'Training on flood preparedness, response and mitigation'),
  ('Earthquake Response', 'Search and rescue, structural assessment post-earthquake'),
  ('Cyclone Preparedness', 'Evacuation planning and cyclone shelter management'),
  ('Chemical Safety', 'HAZMAT response and industrial accident management'),
  ('Fire Safety', 'Firefighting techniques and fire prevention'),
  ('Landslide Response', 'Landslide risk assessment and rescue operations'),
  ('Heat Wave Management', 'Heat stroke prevention and community response'),
  ('Medical First Response', 'Emergency medical care and triage procedures'),
  ('Community Awareness', 'Public awareness and community resilience building'),
  ('Search & Rescue', 'Urban and wilderness search and rescue operations');

-- Create trainings table
CREATE TABLE public.trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  theme text NOT NULL,
  organizer text NOT NULL,
  institution_id uuid REFERENCES public.institutions(id) ON DELETE SET NULL,
  location_name text NOT NULL,
  lat double precision,
  lng double precision,
  state text NOT NULL,
  level text NOT NULL DEFAULT 'State', -- National / State / District / Community
  start_date date NOT NULL,
  end_date date NOT NULL,
  participants_total integer NOT NULL DEFAULT 0,
  participants_male integer NOT NULL DEFAULT 0,
  participants_female integer NOT NULL DEFAULT 0,
  trainer_names text,
  outcome_summary text,
  documents text[],
  created_by uuid NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view trainings"
  ON public.trainings FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create trainings"
  ON public.trainings FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own trainings"
  ON public.trainings FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all trainings"
  ON public.trainings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for trainings
ALTER PUBLICATION supabase_realtime ADD TABLE public.trainings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.institutions;

-- Trigger for updated_at
CREATE TRIGGER update_trainings_updated_at
  BEFORE UPDATE ON public.trainings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
