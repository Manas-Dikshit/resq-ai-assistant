
-- ============================================================
-- ResQAI: National Ecosystem Tables
-- ============================================================

-- 1. RESOURCES (IDRN-inspired)
CREATE TABLE IF NOT EXISTS public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'Equipment',
  category text NOT NULL DEFAULT 'Search & Rescue',
  quantity integer NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'units',
  condition text NOT NULL DEFAULT 'Good',
  status text NOT NULL DEFAULT 'available',
  state text NOT NULL,
  location_name text NOT NULL,
  lat double precision,
  lng double precision,
  owner_org text NOT NULL,
  contact_person text,
  contact_phone text,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create resources" ON public.resources FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own resources" ON public.resources FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage all resources" ON public.resources FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. INCIDENTS (ICR-ER)
CREATE TABLE IF NOT EXISTS public.incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'Flood',
  severity text NOT NULL DEFAULT 'Medium',
  status text NOT NULL DEFAULT 'open',
  state text NOT NULL,
  district text,
  location_name text NOT NULL,
  lat double precision,
  lng double precision,
  affected_population integer DEFAULT 0,
  responders_deployed integer DEFAULT 0,
  resources_deployed text[],
  photo_url text,
  created_by uuid NOT NULL,
  assigned_to uuid,
  closed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view incidents" ON public.incidents FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create incidents" ON public.incidents FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own incidents" ON public.incidents FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage all incidents" ON public.incidents FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Responders can update incidents" ON public.incidents FOR UPDATE USING (has_role(auth.uid(), 'responder'::app_role));

-- 3. INCIDENT LOGS (timeline entries)
CREATE TABLE IF NOT EXISTS public.incident_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  message text NOT NULL,
  log_type text NOT NULL DEFAULT 'update',
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.incident_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view incident logs" ON public.incident_logs FOR SELECT USING (true);
CREATE POLICY "Authenticated can add logs" ON public.incident_logs FOR INSERT WITH CHECK (auth.uid() = created_by);

-- 4. FLOOD STATIONS (CWC-inspired)
CREATE TABLE IF NOT EXISTS public.flood_stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  river text NOT NULL,
  state text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  danger_level double precision NOT NULL DEFAULT 10.0,
  warning_level double precision NOT NULL DEFAULT 8.0,
  current_level double precision NOT NULL DEFAULT 5.0,
  forecast_24h double precision,
  forecast_48h double precision,
  forecast_72h double precision,
  rainfall_mm double precision DEFAULT 0,
  status text NOT NULL DEFAULT 'normal',
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.flood_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view flood stations" ON public.flood_stations FOR SELECT USING (true);
CREATE POLICY "Admins can manage flood stations" ON public.flood_stations FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. LANDSLIDE ZONES (GSI-inspired)
CREATE TABLE IF NOT EXISTS public.landslide_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district text NOT NULL,
  state text NOT NULL,
  risk_score double precision NOT NULL DEFAULT 0.0,
  risk_level text NOT NULL DEFAULT 'Low',
  rainfall_mm double precision DEFAULT 0,
  soil_saturation double precision DEFAULT 0,
  slope_angle double precision DEFAULT 0,
  advisory text,
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.landslide_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view landslide zones" ON public.landslide_zones FOR SELECT USING (true);
CREATE POLICY "Admins can manage landslide zones" ON public.landslide_zones FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. OCEAN STATIONS (INCOIS-inspired)
CREATE TABLE IF NOT EXISTS public.ocean_stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'Buoy',
  state text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  sea_level_m double precision DEFAULT 0,
  wave_height_m double precision DEFAULT 0,
  wave_period_s double precision DEFAULT 8,
  tsunami_probability double precision DEFAULT 0,
  alert_level text NOT NULL DEFAULT 'normal',
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ocean_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view ocean stations" ON public.ocean_stations FOR SELECT USING (true);
CREATE POLICY "Admins can manage ocean stations" ON public.ocean_stations FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE OR REPLACE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime for incidents and resources
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resources;
ALTER PUBLICATION supabase_realtime ADD TABLE public.flood_stations;
