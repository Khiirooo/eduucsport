-- Create cycles table
CREATE TABLE IF NOT EXISTS public.cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  discipline TEXT NOT NULL,
  classe TEXT,
  nb_seances INTEGER DEFAULT 1,
  objectifs TEXT,
  date_debut DATE,
  date_fin DATE,
  preps_liees UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cycles_select_own" ON public.cycles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "cycles_insert_own" ON public.cycles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "cycles_update_own" ON public.cycles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "cycles_delete_own" ON public.cycles FOR DELETE USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS cycles_user_id_idx ON public.cycles(user_id);

DROP TRIGGER IF EXISTS cycles_updated_at ON public.cycles;
CREATE TRIGGER cycles_updated_at BEFORE UPDATE ON public.cycles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create seances table (journal)
CREATE TABLE IF NOT EXISTS public.seances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  classe TEXT,
  date DATE NOT NULL,
  heure TIME,
  duree INTEGER,
  objectifs TEXT,
  observations TEXT,
  notes TEXT,
  prep_liee_id UUID REFERENCES public.preparations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.seances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seances_select_own" ON public.seances FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "seances_insert_own" ON public.seances FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "seances_update_own" ON public.seances FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "seances_delete_own" ON public.seances FOR DELETE USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS seances_user_id_idx ON public.seances(user_id);
CREATE INDEX IF NOT EXISTS seances_date_idx ON public.seances(date);

DROP TRIGGER IF EXISTS seances_updated_at ON public.seances;
CREATE TRIGGER seances_updated_at BEFORE UPDATE ON public.seances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create ecoles table
CREATE TABLE IF NOT EXISTS public.ecoles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  adresse TEXT,
  ville TEXT,
  photo TEXT,
  couleur TEXT DEFAULT '#3b82f6',
  classes JSONB DEFAULT '[]',
  materiel JSONB DEFAULT '[]',
  journal JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ecoles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ecoles_select_own" ON public.ecoles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "ecoles_insert_own" ON public.ecoles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "ecoles_update_own" ON public.ecoles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "ecoles_delete_own" ON public.ecoles FOR DELETE USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS ecoles_user_id_idx ON public.ecoles(user_id);

DROP TRIGGER IF EXISTS ecoles_updated_at ON public.ecoles;
CREATE TRIGGER ecoles_updated_at BEFORE UPDATE ON public.ecoles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create forum_posts table
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  contenu TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "forum_posts_select_all" ON public.forum_posts 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND account_status = 'verified')
  );
CREATE POLICY "forum_posts_insert_own" ON public.forum_posts 
  FOR INSERT WITH CHECK (
    user_id = auth.uid() 
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND account_status = 'verified')
  );
CREATE POLICY "forum_posts_update_own" ON public.forum_posts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "forum_posts_delete_own" ON public.forum_posts FOR DELETE USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS forum_posts_user_id_idx ON public.forum_posts(user_id);
CREATE INDEX IF NOT EXISTS forum_posts_score_idx ON public.forum_posts(score DESC);

DROP TRIGGER IF EXISTS forum_posts_updated_at ON public.forum_posts;
CREATE TRIGGER forum_posts_updated_at BEFORE UPDATE ON public.forum_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create innovations table
CREATE TABLE IF NOT EXISTS public.innovations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  image_url TEXT,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.innovations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "innovations_select_all" ON public.innovations 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND account_status = 'verified')
  );
CREATE POLICY "innovations_insert_own" ON public.innovations 
  FOR INSERT WITH CHECK (
    user_id = auth.uid() 
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND account_status = 'verified')
  );
CREATE POLICY "innovations_update_own" ON public.innovations FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "innovations_delete_own" ON public.innovations FOR DELETE USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS innovations_user_id_idx ON public.innovations(user_id);
CREATE INDEX IF NOT EXISTS innovations_score_idx ON public.innovations(score DESC);

DROP TRIGGER IF EXISTS innovations_updated_at ON public.innovations;
CREATE TRIGGER innovations_updated_at BEFORE UPDATE ON public.innovations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to update forum_post score
CREATE OR REPLACE FUNCTION public.update_forum_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_score INTEGER;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.target_type = 'forum_post' THEN
      SELECT COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 WHEN vote_type = 'down' THEN -1 ELSE 0 END), 0) 
      INTO new_score FROM public.votes WHERE target_type = 'forum_post' AND target_id = NEW.target_id;
      UPDATE public.forum_posts SET score = new_score WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'innovation' THEN
      SELECT COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 WHEN vote_type = 'down' THEN -1 ELSE 0 END), 0) 
      INTO new_score FROM public.votes WHERE target_type = 'innovation' AND target_id = NEW.target_id;
      UPDATE public.innovations SET score = new_score WHERE id = NEW.target_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'forum_post' THEN
      SELECT COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 WHEN vote_type = 'down' THEN -1 ELSE 0 END), 0) 
      INTO new_score FROM public.votes WHERE target_type = 'forum_post' AND target_id = OLD.target_id;
      UPDATE public.forum_posts SET score = new_score WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'innovation' THEN
      SELECT COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 WHEN vote_type = 'down' THEN -1 ELSE 0 END), 0) 
      INTO new_score FROM public.votes WHERE target_type = 'innovation' AND target_id = OLD.target_id;
      UPDATE public.innovations SET score = new_score WHERE id = OLD.target_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$;

-- Update the votes trigger to handle all types
DROP TRIGGER IF EXISTS votes_update_scores ON public.votes;
CREATE OR REPLACE FUNCTION public.update_all_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_score INTEGER;
  target TEXT;
  tid UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target := OLD.target_type;
    tid := OLD.target_id;
  ELSE
    target := NEW.target_type;
    tid := NEW.target_id;
  END IF;

  SELECT COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 WHEN vote_type = 'down' THEN -1 ELSE 0 END), 0) 
  INTO new_score FROM public.votes WHERE target_type = target AND target_id = tid;

  IF target = 'preparation' THEN
    UPDATE public.preparations SET score = new_score WHERE id = tid;
  ELSIF target = 'forum_post' THEN
    UPDATE public.forum_posts SET score = new_score WHERE id = tid;
  ELSIF target = 'innovation' THEN
    UPDATE public.innovations SET score = new_score WHERE id = tid;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

CREATE TRIGGER votes_update_all_scores
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_all_scores();
