
-- Report validations (community confirm/deny)
CREATE TABLE public.report_validations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('confirm', 'deny')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(report_id, user_id)
);

ALTER TABLE public.report_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view validations" ON public.report_validations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON public.report_validations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vote" ON public.report_validations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vote" ON public.report_validations FOR DELETE USING (auth.uid() = user_id);

-- Add trust_score and validation counts to reports
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS confirm_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS deny_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS trust_score DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Function to update report trust score when validations change
CREATE OR REPLACE FUNCTION public.update_report_trust_score()
RETURNS TRIGGER AS $$
DECLARE
  confirms INTEGER;
  denies INTEGER;
  score DOUBLE PRECISION;
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE vote = 'confirm'),
    COUNT(*) FILTER (WHERE vote = 'deny')
  INTO confirms, denies
  FROM public.report_validations
  WHERE report_id = COALESCE(NEW.report_id, OLD.report_id);
  
  -- Trust score: confirms / (confirms + denies), weighted by total votes
  IF confirms + denies > 0 THEN
    score := confirms::DOUBLE PRECISION / (confirms + denies)::DOUBLE PRECISION;
  ELSE
    score := 0;
  END IF;
  
  UPDATE public.reports 
  SET confirm_count = confirms, deny_count = denies, trust_score = score,
      verified = (confirms >= 3 AND score >= 0.7)
  WHERE id = COALESCE(NEW.report_id, OLD.report_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_trust_score_on_validation
AFTER INSERT OR UPDATE OR DELETE ON public.report_validations
FOR EACH ROW EXECUTE FUNCTION public.update_report_trust_score();

-- Add explainability fields to predict-risk output storage
ALTER TABLE public.risk_predictions ADD COLUMN IF NOT EXISTS cyclone_risk DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE public.risk_predictions ADD COLUMN IF NOT EXISTS landslide_risk DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE public.risk_predictions ADD COLUMN IF NOT EXISTS heat_wave_risk DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE public.risk_predictions ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'LOW';
ALTER TABLE public.risk_predictions ADD COLUMN IF NOT EXISTS explanation JSONB;
ALTER TABLE public.risk_predictions ADD COLUMN IF NOT EXISTS trust_score DOUBLE PRECISION DEFAULT 0;
ALTER TABLE public.risk_predictions ADD COLUMN IF NOT EXISTS community_validations INTEGER DEFAULT 0;

-- Enable realtime for report_validations
ALTER PUBLICATION supabase_realtime ADD TABLE public.report_validations;
