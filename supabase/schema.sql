-- Roomie 앱 데이터베이스 스키마
-- 실행 전에 Supabase Dashboard의 SQL Editor에서 실행하세요

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams 테이블 (룸메이트 그룹)
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  invite_code VARCHAR(50) UNIQUE NOT NULL DEFAULT upper(substr(replace(uuid_generate_v4()::text, '-', ''), 1, 8)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Profiles 테이블 (사용자 프로필) - 이미 존재할 수 있음
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  provider VARCHAR(50) DEFAULT 'kakao',
  provider_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members 테이블 (팀 멤버십)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Routines 테이블 (반복 작업)
CREATE TABLE IF NOT EXISTS routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general', -- 'cleaning', 'cooking', 'shopping', 'maintenance', 'general'
  frequency VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
  frequency_details JSONB, -- { "days": ["mon", "tue"], "time": "09:00" }
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  priority VARCHAR(20) DEFAULT 'medium', -- 'high', 'medium', 'low'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Routine Completions 테이블 (루틴 완료 기록)
CREATE TABLE IF NOT EXISTS routine_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
  completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  due_date DATE, -- 해당 루틴이 완료되어야 했던 날짜
  is_late BOOLEAN DEFAULT false
);

-- Bills 테이블 (공과금)
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) DEFAULT 'utilities', -- 'utilities', 'rent', 'internet', 'food', 'other'
  due_date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurring_period VARCHAR(20), -- 'monthly', 'yearly' if is_recurring is true
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Bill Payments 테이블 (공과금 납부 기록)
CREATE TABLE IF NOT EXISTS bill_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_method VARCHAR(50), -- 'cash', 'transfer', 'card', 'other'
  notes TEXT
);

-- Items 테이블 (공용물품)
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general', -- 'food', 'toiletries', 'cleaning', 'maintenance', 'general'
  current_quantity INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 1, -- 최소 재고 (알림 기준)
  unit VARCHAR(50) DEFAULT 'ea', -- 'ea', 'kg', 'L', 'box', etc.
  estimated_price DECIMAL(8,2),
  preferred_store VARCHAR(255),
  last_purchased_at TIMESTAMP WITH TIME ZONE,
  last_purchased_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Purchase Requests 테이블 (구매 요청)
CREATE TABLE IF NOT EXISTS purchase_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  urgency VARCHAR(20) DEFAULT 'normal', -- 'urgent', 'normal', 'low'
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'purchased', 'rejected'
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  purchased_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  purchased_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications 테이블 (알림)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'routine_completed', 'bill_added', 'item_request', etc.
  related_id UUID, -- 관련된 엔티티 ID (routine, bill, item 등)
  action_data JSONB, -- 알림 클릭 시 필요한 데이터
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback 테이블 (룸메이트 피드백)
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- 피드백 대상 월 (YYYY-MM-01 형식)
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id, month)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_routines_team_id ON routines(team_id);
CREATE INDEX IF NOT EXISTS idx_routines_assigned_to ON routines(assigned_to);
CREATE INDEX IF NOT EXISTS idx_routine_completions_routine_id ON routine_completions(routine_id);
CREATE INDEX IF NOT EXISTS idx_routine_completions_due_date ON routine_completions(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_team_id ON bills(team_id);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bill_payments_bill_id ON bill_payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_items_team_id ON items(team_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_team_id ON purchase_requests(team_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_feedback_team_id_month ON feedback(team_id, month);

-- Row Level Security (RLS) 정책 설정
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Profiles 정책 (자신의 프로필만 읽기/수정 가능)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Teams 정책 (팀 멤버만 접근 가능)
CREATE POLICY "Team members can view their teams" ON teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams" ON teams
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team admins can update teams" ON teams
  FOR UPDATE USING (
    id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Team Members 정책
CREATE POLICY "Users can view team members of their teams" ON team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage team members" ON team_members
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can join teams" ON team_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Routines 정책
CREATE POLICY "Team members can view team routines" ON routines
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create routines" ON routines
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    ) AND created_by = auth.uid()
  );

CREATE POLICY "Team members can update routines" ON routines
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Routine Completions 정책
CREATE POLICY "Team members can view routine completions" ON routine_completions
  FOR SELECT USING (
    routine_id IN (
      SELECT r.id FROM routines r
      JOIN team_members tm ON r.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create routine completions" ON routine_completions
  FOR INSERT WITH CHECK (
    routine_id IN (
      SELECT r.id FROM routines r
      JOIN team_members tm ON r.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    ) AND completed_by = auth.uid()
  );

-- Bills 정책 (Routines와 유사)
CREATE POLICY "Team members can view team bills" ON bills
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create bills" ON bills
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    ) AND created_by = auth.uid()
  );

CREATE POLICY "Team members can update bills" ON bills
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Bill Payments 정책
CREATE POLICY "Team members can view bill payments" ON bill_payments
  FOR SELECT USING (
    bill_id IN (
      SELECT b.id FROM bills b
      JOIN team_members tm ON b.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create bill payments" ON bill_payments
  FOR INSERT WITH CHECK (
    bill_id IN (
      SELECT b.id FROM bills b
      JOIN team_members tm ON b.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    ) AND user_id = auth.uid()
  );

-- Items 정책
CREATE POLICY "Team members can view team items" ON items
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can manage items" ON items
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Purchase Requests 정책
CREATE POLICY "Team members can view purchase requests" ON purchase_requests
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create purchase requests" ON purchase_requests
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    ) AND requested_by = auth.uid()
  );

CREATE POLICY "Team members can update purchase requests" ON purchase_requests
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Notifications 정책
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Team members can create team notifications" ON notifications
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Feedback 정책
CREATE POLICY "Team members can view team feedback" ON feedback
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their feedback" ON feedback
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    ) AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their feedback" ON feedback
  FOR UPDATE USING (user_id = auth.uid());

-- 실시간 구독을 위한 함수들
-- 자동으로 updated_at 필드를 업데이트하는 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routines_updated_at BEFORE UPDATE ON routines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_requests_updated_at BEFORE UPDATE ON purchase_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 댓글: 
-- 이 스키마를 Supabase SQL Editor에서 실행한 후,
-- 각 테이블에 대한 실시간 구독을 활성화하려면:
-- 1. Supabase Dashboard > Database > Replication으로 이동
-- 2. 각 테이블을 체크하여 실시간 복제 활성화
-- 3. 또는 SQL로 실행: ALTER PUBLICATION supabase_realtime ADD TABLE [table_name];