-- Migration: Fix missing columns across all tables
-- Run this after existing migrations

-- ─── profiles: add missing profile fields ───
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialite TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS annee_etude TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS maitre_du_stage TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ecole_stage TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- ─── cycles: add missing annee column and fix preps_liees type ───
ALTER TABLE public.cycles ADD COLUMN IF NOT EXISTS annee TEXT DEFAULT '';

-- Change preps_liees from UUID[] to JSONB to store full prep objects
-- (Drop and recreate column safely; existing data will be lost if any)
ALTER TABLE public.cycles DROP COLUMN IF EXISTS preps_liees;
ALTER TABLE public.cycles ADD COLUMN preps_liees JSONB DEFAULT '[]';

-- ─── ecoles: add missing columns ───
ALTER TABLE public.ecoles ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.ecoles ADD COLUMN IF NOT EXISTS infrastructure TEXT DEFAULT '';
ALTER TABLE public.ecoles ADD COLUMN IF NOT EXISTS ecole_photos JSONB DEFAULT '[]';
ALTER TABLE public.ecoles ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]';

-- ─── forum_posts: add reply_list and likes columns ───
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS reply_list JSONB DEFAULT '[]';
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS liked_by TEXT[] DEFAULT '{}';
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS replies_count INTEGER DEFAULT 0;

-- ─── innovations: add likes column ───
ALTER TABLE public.innovations ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
