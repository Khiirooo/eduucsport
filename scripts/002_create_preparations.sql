-- Create preparations table
CREATE TABLE IF NOT EXISTS public.preparations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  discipline TEXT NOT NULL,
  classe TEXT,
  duree INTEGER,
  objectifs TEXT,
  materiel TEXT,
  deroulement TEXT,
  evaluation TEXT,
  category TEXT DEFAULT 'general',
  location TEXT DEFAULT 'interieur' CHECK (location IN ('interieur', 'exterieur', 'les_deux')),
  reglement TEXT,
  file_url TEXT,
  file_type TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  visibility TEXT DEFAULT 'all' CHECK (visibility IN ('teacher', 'student', 'all')),
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.preparations ENABLE ROW LEVEL SECURITY;

-- Anyone verified can read published preparations (respecting visibility)
CREATE POLICY "preparations_select_published" ON public.preparations 
  FOR SELECT USING (
    is_published = TRUE 
    AND EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.account_status = 'verified'
      AND (
        preparations.visibility = 'all' 
        OR preparations.visibility = p.role
        OR p.role = 'admin'
      )
    )
  );

-- Users can read their own preparations
CREATE POLICY "preparations_select_own" ON public.preparations 
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own preparations
CREATE POLICY "preparations_insert_own" ON public.preparations 
  FOR INSERT WITH CHECK (
    user_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND account_status = 'verified'
    )
  );

-- Users can update their own preparations
CREATE POLICY "preparations_update_own" ON public.preparations 
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own preparations
CREATE POLICY "preparations_delete_own" ON public.preparations 
  FOR DELETE USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS preparations_user_id_idx ON public.preparations(user_id);
CREATE INDEX IF NOT EXISTS preparations_discipline_idx ON public.preparations(discipline);
CREATE INDEX IF NOT EXISTS preparations_published_idx ON public.preparations(is_published);
CREATE INDEX IF NOT EXISTS preparations_score_idx ON public.preparations(score DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS preparations_updated_at ON public.preparations;
CREATE TRIGGER preparations_updated_at
  BEFORE UPDATE ON public.preparations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
