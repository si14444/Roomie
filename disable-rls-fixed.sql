-- RLS만 완전히 비활성화하는 스크립트 (수정된 버전)
-- Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1단계: 모든 RLS 정책 강제 제거
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename || ' CASCADE';
    END LOOP;
END $$;

-- 2단계: 모든 테이블에서 RLS 강제 비활성화
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS team_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS routines DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS routine_completions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bills DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bill_splits DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS items DISABLE ROW LEVEL SECURITY;

-- 3단계: 확인
SELECT 'RLS disabled on all tables' as status;

-- 4단계: 테이블 목록 확인 (수정된 쿼리)
SELECT 
    table_name,
    CASE 
        WHEN c.relrowsecurity = true THEN 'enabled'
        ELSE 'disabled'
    END as rls_status
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema = 'public' 
AND t.table_type = 'BASE TABLE'
ORDER BY table_name;