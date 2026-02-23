
ALTER TABLE public.evac_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view evac notifications"
  ON public.evac_notifications FOR SELECT USING (true);

CREATE POLICY "Anyone can create evac notifications"
  ON public.evac_notifications FOR INSERT WITH CHECK (true);
