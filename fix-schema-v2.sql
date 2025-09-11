-- 문제 해결을 위한 간단한 스키마 (RLS 없이)
-- Supabase Dashboard의 SQL Editor에서 실행하세요

-- 기존 정책들과 테이블 제거
DROP POLICY IF EXISTS "Team members can view their teams" ON teams;
DROP POLICY IF EXISTS "Users can create teams" ON teams;  
DROP POLICY IF EXISTS "Team admins can update teams" ON teams;
DROP POLICY IF EXISTS "Anyone can create teams" ON teams;
DROP POLICY IF EXISTS "Users can view teams they are members of" ON teams;
DROP POLICY IF EXISTS "Team creators can update their teams" ON teams;

DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_memberships;
DROP POLICY IF EXISTS "Team admins can manage team members" ON team_memberships;
DROP POLICY IF EXISTS "Users can join teams" ON team_memberships;
DROP POLICY IF EXISTS "Anyone can join teams" ON team_memberships;
DROP POLICY IF EXISTS "Users can view team members" ON team_memberships;
DROP POLICY IF EXISTS "Users can leave teams" ON team_memberships;

-- 기존 테이블 제거
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS team_memberships CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- RLS 비활성화로 간단한 Teams 테이블 생성
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  invite_code VARCHAR(50) UNIQUE NOT NULL DEFAULT upper(substr(replace(uuid_generate_v4()::text, '-', ''), 1, 8)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Team Memberships 테이블 생성 (team_members 대신)
CREATE TABLE team_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- 인덱스 생성
CREATE INDEX idx_team_memberships_team_id ON team_memberships(team_id);
CREATE INDEX idx_team_memberships_user_id ON team_memberships(user_id);

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

-- RLS는 일단 비활성화 (테스트 완료 후 나중에 활성화)
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships DISABLE ROW LEVEL SECURITY;

-- 확인용 쿼리
SELECT 'Teams table created successfully' as status;
SELECT 'Team memberships table created successfully' as status;