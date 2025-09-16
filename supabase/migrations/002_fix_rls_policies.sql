-- Fix RLS policies to prevent infinite recursion
-- Drop problematic policies and recreate them

-- Drop existing team_members policies
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;
DROP POLICY IF EXISTS "Users can join teams" ON public.team_members;

-- Recreate team_members policies without recursion
-- Allow users to see team members of teams they belong to (using a different approach)
CREATE POLICY "Users can view team members" ON public.team_members
  FOR SELECT USING (
    -- Allow viewing if user is the member being viewed
    auth.uid() = user_id
    OR
    -- Allow viewing if user is admin of the team
    EXISTS (
      SELECT 1 FROM public.team_members admin_check
      WHERE admin_check.team_id = team_members.team_id
      AND admin_check.user_id = auth.uid()
      AND admin_check.role = 'admin'
    )
    OR
    -- Allow viewing if user is any member of the same team (simplified check)
    team_id IN (
      SELECT tm.team_id FROM public.team_members tm
      WHERE tm.user_id = auth.uid()
    )
  );

-- Allow users to join teams (insert their own membership)
CREATE POLICY "Users can join teams" ON public.team_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow admins to manage team members
CREATE POLICY "Admins can manage team members" ON public.team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.team_members admin_check
      WHERE admin_check.team_id = team_members.team_id
      AND admin_check.user_id = auth.uid()
      AND admin_check.role = 'admin'
    )
  );

-- Allow users to leave teams (delete their own membership)
CREATE POLICY "Users can leave teams" ON public.team_members
  FOR DELETE USING (auth.uid() = user_id);

-- Also fix teams policy to be more specific
DROP POLICY IF EXISTS "Users can view teams they belong to" ON public.teams;

CREATE POLICY "Users can view teams they belong to" ON public.teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- Update teams policies
DROP POLICY IF EXISTS "Team admins can update teams" ON public.teams;

CREATE POLICY "Team admins can update teams" ON public.teams
  FOR UPDATE USING (
    id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add delete policy for teams
CREATE POLICY "Team admins can delete teams" ON public.teams
  FOR DELETE USING (
    id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );