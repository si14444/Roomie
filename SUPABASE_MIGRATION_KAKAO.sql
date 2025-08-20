-- ============================================================================
-- 카카오 로그인 지원을 위한 Supabase 마이그레이션 SQL
-- 기존 데이터베이스에 provider_id와 provider 컬럼을 추가합니다
-- ============================================================================

-- 1. profiles 테이블에 카카오 로그인을 위한 컬럼 추가
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS provider_id TEXT;

-- 2. provider_id에 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_profiles_provider_id ON public.profiles(provider_id);

-- 3. provider와 provider_id 조합에 고유 제약 조건 추가 (중복 방지)
ALTER TABLE public.profiles 
ADD CONSTRAINT IF NOT EXISTS unique_provider_id_per_provider 
UNIQUE (provider, provider_id);

-- 4. 기존 사용자들의 provider 값을 'email'로 설정 (이미 DEFAULT로 설정됨)
UPDATE public.profiles 
SET provider = 'email' 
WHERE provider IS NULL;

-- 5. handle_new_user 함수 업데이트 (카카오 사용자 정보 처리)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, provider, provider_id)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'nickname'
        ),
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.raw_user_meta_data->>'provider', 'email'),
        NEW.raw_user_meta_data->>'provider_id'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 완료 메시지
SELECT 'Kakao login migration completed successfully!' as status;

-- ============================================================================
-- 사용 방법:
-- 1. Supabase SQL Editor에서 이 파일의 내용을 복사하여 실행
-- 2. 에러 없이 실행되면 마이그레이션 완료
-- 3. 앱에서 카카오 로그인 테스트
-- ============================================================================