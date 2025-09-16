-- Temporary script to disable RLS for development
-- RUN THIS IN SUPABASE SQL EDITOR

-- Disable RLS on team_members table to prevent recursion
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;

-- Disable RLS on teams table temporarily
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;

-- You can also run these to drop all policies if needed:
-- DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;
-- DROP POLICY IF EXISTS "Users can join teams" ON public.team_members;
-- DROP POLICY IF EXISTS "Users can view teams they belong to" ON public.teams;
-- DROP POLICY IF EXISTS "Users can create teams" ON public.teams;
-- DROP POLICY IF EXISTS "Team admins can update teams" ON public.teams;