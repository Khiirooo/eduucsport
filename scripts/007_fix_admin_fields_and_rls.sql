-- =====================================================
-- Fix 007: Colonnes admin manquantes + RLS corrigées
-- Exécuter dans Supabase SQL Editor
-- =====================================================

-- Ajouter les colonnes manquantes si elles n'existent pas
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_role TEXT DEFAULT 'user' CHECK (user_role IN ('user', 'moderator', 'admin'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'pending_verification';

-- Corriger la colonne visibility dans preparations (si contrainte incorrecte)
-- La UI utilise 'commun'/'prof'/'eleve', on normalise vers 'all'/'teacher'/'student'
DO $$
BEGIN
  -- Drop old constraint if exists
  ALTER TABLE public.preparations DROP CONSTRAINT IF EXISTS preparations_visibility_check;
  -- Add new constraint accepting both UI and DB values during migration
  ALTER TABLE public.preparations ADD CONSTRAINT preparations_visibility_check 
    CHECK (visibility IN ('teacher', 'student', 'all', 'prof', 'eleve', 'commun'));
EXCEPTION WHEN OTHERS THEN
  -- Constraint may not exist, that's ok
  NULL;
END $$;

-- Politique RLS pour lire tous les profils (nécessaire pour charger les préparations avec profil auteur)
DROP POLICY IF EXISTS "profiles_select_for_content" ON public.profiles;
CREATE POLICY "profiles_select_for_content" ON public.profiles
  FOR SELECT USING (
    -- Tout utilisateur vérifié peut voir les profils de base (pour afficher l'auteur)
    auth.uid() IS NOT NULL
  );

-- Politique RLS pour les préparations publiées - visible à tous les utilisateurs vérifiés
DROP POLICY IF EXISTS "preparations_select_published" ON public.preparations;
CREATE POLICY "preparations_select_published" ON public.preparations
  FOR SELECT USING (
    -- Mes propres préparations (brouillons inclus)
    user_id = auth.uid()
    OR
    -- Préparations publiées pour les utilisateurs connectés et vérifiés
    (
      is_published = TRUE
      AND auth.uid() IS NOT NULL
    )
  );

-- Accès admin à toutes les préparations
DROP POLICY IF EXISTS "preparations_admin_all" ON public.preparations;
CREATE POLICY "preparations_admin_all" ON public.preparations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND (is_admin = TRUE OR user_role = 'admin' OR role = 'admin')
    )
  );

-- Table reports (si pas encore créée)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reporter_name TEXT,
  target_type TEXT CHECK (target_type IN ('preparation', 'forum_post', 'innovation', 'user')),
  target_id TEXT,
  target_title TEXT,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  resolution TEXT
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_insert_verified" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "reports_admin_all" ON public.reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND (is_admin = TRUE OR user_role IN ('admin', 'moderator') OR role = 'admin')
    )
  );

-- Table admin_logs
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id),
  admin_name TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  target_name TEXT,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_logs_admin_only" ON public.admin_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND (is_admin = TRUE OR user_role IN ('admin', 'moderator') OR role = 'admin')
    )
  );

-- Assigner admin au premier compte admin (remplacer par votre email)
-- UPDATE public.profiles SET is_admin = TRUE, user_role = 'admin', role = 'admin' 
-- WHERE email = 'votre@email.com';

