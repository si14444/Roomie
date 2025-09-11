-- 문제가 있는 테이블과 정책들을 다시 생성하는 스크립트
-- Supabase Dashboard의 SQL Editor에서 실행하세요

-- 기존 정책들 제거 (존재한다면)
DROP POLICY IF EXISTS "Team members can view their teams" ON teams;
DROP POLICY IF EXISTS "Users can create teams" ON teams;  
DROP POLICY IF EXISTS "Team admins can update teams" ON teams;
DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;
DROP POLICY IF EXISTS "Team admins can manage team members" ON team_members;
DROP POLICY IF EXISTS "Users can join teams" ON team_members;

-- 기존 테이블 제거 (필요한 경우)
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- Teams 테이블 생성
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  invite_code VARCHAR(50) UNIQUE NOT NULL DEFAULT upper(substr(replace(uuid_generate_v4()::text, '-', ''), 1, 8)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Team Members 테이블 생성
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- RLS 활성화
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- 단순화된 Teams 정책들
CREATE POLICY "Anyone can create teams" ON teams
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view teams they are members of" ON teams
  FOR SELECT USING (
    id IN (
      SELECT tm.team_id FROM team_members tm WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team creators can update their teams" ON teams
  FOR UPDATE USING (created_by = auth.uid());

-- 단순화된 Team Members 정책들  
CREATE POLICY "Anyone can join teams" ON team_members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view team members" ON team_members
  FOR SELECT USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can leave teams" ON team_members
  FOR DELETE USING (user_id = auth.uid());

-- 인덱스 생성
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 확인용 쿼리
SELECT 'Teams table created successfully' as status;
SELECT 'Team members table created successfully' as status;