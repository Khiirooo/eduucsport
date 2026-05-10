-- Create votes table (for preparations, forum posts, innovations)
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('preparation', 'forum_post', 'innovation')),
  target_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);

-- Enable RLS
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Users can see all votes
CREATE POLICY "votes_select_all" ON public.votes 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND account_status = 'verified'
    )
  );

-- Users can insert their own votes
CREATE POLICY "votes_insert_own" ON public.votes 
  FOR INSERT WITH CHECK (
    user_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND account_status = 'verified'
    )
  );

-- Users can update their own votes (change up to down or vice versa)
CREATE POLICY "votes_update_own" ON public.votes 
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own votes (remove vote)
CREATE POLICY "votes_delete_own" ON public.votes 
  FOR DELETE USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS votes_user_id_idx ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS votes_target_idx ON public.votes(target_type, target_id);

-- Function to update preparation score when vote changes
CREATE OR REPLACE FUNCTION public.update_preparation_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_score INTEGER;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.target_type = 'preparation' THEN
      SELECT COALESCE(
        SUM(CASE WHEN vote_type = 'up' THEN 1 WHEN vote_type = 'down' THEN -1 ELSE 0 END), 
        0
      ) INTO new_score
      FROM public.votes
      WHERE target_type = 'preparation' AND target_id = NEW.target_id;
      
      UPDATE public.preparations SET score = new_score WHERE id = NEW.target_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'preparation' THEN
      SELECT COALESCE(
        SUM(CASE WHEN vote_type = 'up' THEN 1 WHEN vote_type = 'down' THEN -1 ELSE 0 END), 
        0
      ) INTO new_score
      FROM public.votes
      WHERE target_type = 'preparation' AND target_id = OLD.target_id;
      
      UPDATE public.preparations SET score = new_score WHERE id = OLD.target_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$;

-- Trigger to update scores
DROP TRIGGER IF EXISTS votes_update_scores ON public.votes;
CREATE TRIGGER votes_update_scores
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_preparation_score();
