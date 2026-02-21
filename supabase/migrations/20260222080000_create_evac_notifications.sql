-- Migration: create evac_notifications table
CREATE TABLE IF NOT EXISTS public.evac_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_lat double precision NOT NULL,
  user_lng double precision NOT NULL,
  shelter_id uuid,
  message text,
  created_at timestamptz DEFAULT now()
);

-- Optional index to speed queries by shelter
CREATE INDEX IF NOT EXISTS idx_evac_notifications_shelter_id ON public.evac_notifications(shelter_id);
