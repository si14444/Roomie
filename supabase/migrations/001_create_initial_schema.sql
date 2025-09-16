-- Roomie App Database Schema
-- Based on ERD documentation in docs/ERD.md

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- ================================
-- Drop existing tables (in reverse dependency order)
-- ================================

DROP TABLE IF EXISTS public.feedback CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.purchase_requests CASCADE;
DROP TABLE IF EXISTS public.items CASCADE;
DROP TABLE IF EXISTS public.bill_payments CASCADE;
DROP TABLE IF EXISTS public.bills CASCADE;
DROP TABLE IF EXISTS public.routine_completions CASCADE;
DROP TABLE IF EXISTS public.routines CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ================================
-- Core Tables
-- ================================

-- Extended user profile (auth.users is managed by Supabase)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  provider TEXT,
  provider_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Team members (many-to-many relationship)
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- ================================
-- Routine Management
-- ================================

-- Routines table
CREATE TABLE public.routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  frequency_details JSONB, -- Store custom frequency configuration
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Routine completions
CREATE TABLE public.routine_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  completed_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  due_date DATE,
  is_late BOOLEAN DEFAULT false
);

-- ================================
-- Bill Management
-- ================================

-- Bills table
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
  category TEXT,
  due_date DATE,
  is_recurring BOOLEAN DEFAULT false,
  recurring_period TEXT CHECK (recurring_period IN ('monthly', 'quarterly', 'yearly') OR recurring_period IS NULL),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Bill payments
CREATE TABLE public.bill_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_method TEXT,
  notes TEXT
);

-- ================================
-- Item Management
-- ================================

-- Items table
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  current_quantity INTEGER DEFAULT 0 CHECK (current_quantity >= 0),
  min_quantity INTEGER DEFAULT 1 CHECK (min_quantity >= 0),
  unit TEXT,
  estimated_price DECIMAL(10,2) CHECK (estimated_price >= 0),
  preferred_store TEXT,
  last_purchased_at TIMESTAMP WITH TIME ZONE,
  last_purchased_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Purchase requests
CREATE TABLE public.purchase_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.items(id) ON DELETE SET NULL, -- Allow general requests
  requested_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'purchased', 'rejected')),
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  purchased_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  purchased_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- Notification System
-- ================================

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'routine_completed',
    'routine_overdue',
    'bill_added',
    'bill_due_soon',
    'bill_payment_added',
    'item_low_stock',
    'purchase_request_created',
    'purchase_request_approved',
    'team_member_joined'
  )),
  related_id UUID, -- ID of related entity (routine, bill, etc.)
  action_data JSONB, -- Additional action data
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- Feedback System
-- ================================

-- Monthly feedback
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- Format: YYYY-MM
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id, month)
);

-- ================================
-- Indexes for Performance
-- ================================

-- Team-based indexes (for RLS queries)
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_routines_team_id ON public.routines(team_id);
CREATE INDEX idx_routine_completions_routine_id ON public.routine_completions(routine_id);
CREATE INDEX idx_bills_team_id ON public.bills(team_id);
CREATE INDEX idx_bill_payments_bill_id ON public.bill_payments(bill_id);
CREATE INDEX idx_items_team_id ON public.items(team_id);
CREATE INDEX idx_purchase_requests_team_id ON public.purchase_requests(team_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_team_id ON public.notifications(team_id);
CREATE INDEX idx_feedback_team_id ON public.feedback(team_id);

-- Performance indexes
CREATE INDEX idx_routines_assigned_to ON public.routines(assigned_to);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_bills_due_date ON public.bills(due_date);
CREATE INDEX idx_items_current_quantity ON public.items(current_quantity);

-- ================================
-- Row Level Security (RLS)
-- ================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- ================================
-- RLS Policies
-- ================================

-- Users: Can only see and update their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Teams: Can only see teams they're members of
CREATE POLICY "Users can view teams they belong to" ON public.teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = teams.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team admins can update teams" ON public.teams
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = teams.id AND user_id = auth.uid() AND role = 'admin'
    )
  );

-- Team Members: Can view team members of teams they belong to
CREATE POLICY "Users can view team members of their teams" ON public.team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join teams" ON public.team_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Routines: Team-based access
CREATE POLICY "Team members can view routines" ON public.routines
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = routines.team_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create routines" ON public.routines
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = routines.team_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update routines" ON public.routines
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = routines.team_id AND user_id = auth.uid()
    )
  );

-- Routine Completions: Team-based access
CREATE POLICY "Team members can view routine completions" ON public.routine_completions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.routines r
      JOIN public.team_members tm ON r.team_id = tm.team_id
      WHERE r.id = routine_completions.routine_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create routine completions" ON public.routine_completions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.routines r
      JOIN public.team_members tm ON r.team_id = tm.team_id
      WHERE r.id = routine_completions.routine_id AND tm.user_id = auth.uid()
    )
  );

-- Bills: Team-based access
CREATE POLICY "Team members can view bills" ON public.bills
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = bills.team_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create bills" ON public.bills
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = bills.team_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update bills" ON public.bills
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = bills.team_id AND user_id = auth.uid()
    )
  );

-- Bill Payments: Team-based access
CREATE POLICY "Team members can view bill payments" ON public.bill_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bills b
      JOIN public.team_members tm ON b.team_id = tm.team_id
      WHERE b.id = bill_payments.bill_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create bill payments" ON public.bill_payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bills b
      JOIN public.team_members tm ON b.team_id = tm.team_id
      WHERE b.id = bill_payments.bill_id AND tm.user_id = auth.uid()
    )
  );

-- Items: Team-based access
CREATE POLICY "Team members can view items" ON public.items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = items.team_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create items" ON public.items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = items.team_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update items" ON public.items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = items.team_id AND user_id = auth.uid()
    )
  );

-- Purchase Requests: Team-based access
CREATE POLICY "Team members can view purchase requests" ON public.purchase_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = purchase_requests.team_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create purchase requests" ON public.purchase_requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = purchase_requests.team_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update purchase requests" ON public.purchase_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = purchase_requests.team_id AND user_id = auth.uid()
    )
  );

-- Notifications: User can only see their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Feedback: Team-based access
CREATE POLICY "Team members can view feedback" ON public.feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = feedback.team_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create feedback" ON public.feedback
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = feedback.team_id AND user_id = auth.uid()
    )
  );

-- ================================
-- Functions and Triggers
-- ================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routines_updated_at BEFORE UPDATE ON public.routines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON public.bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_requests_updated_at BEFORE UPDATE ON public.purchase_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  WHILE i < 8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    i := i + 1;
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invite codes for teams
CREATE OR REPLACE FUNCTION set_team_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code = generate_invite_code();
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.teams WHERE invite_code = NEW.invite_code) LOOP
      NEW.invite_code = generate_invite_code();
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_teams_invite_code BEFORE INSERT ON public.teams
  FOR EACH ROW EXECUTE FUNCTION set_team_invite_code();

-- ================================
-- Initial Data / Seed
-- ================================

-- Insert some default categories (optional)
-- This could be handled by the application instead

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;