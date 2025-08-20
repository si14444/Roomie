# 📋 데이터베이스 설정 완전 가이드

카카오 로그인 에러 `column profiles.provider_id does not exist` 해결 가이드입니다.

## 🚨 에러 원인
- Supabase 데이터베이스의 `profiles` 테이블에 `provider_id`와 `provider` 컬럼이 없음
- 카카오 로그인을 위해서는 이 컬럼들이 필요함

## 🔧 해결 방법

### 옵션 1: 새로 데이터베이스 생성 (권장)

**새 Supabase 프로젝트를 생성하는 경우:**

1. **새 Supabase 프로젝트 생성**
   - [Supabase](https://supabase.com)에서 새 프로젝트 생성

2. **업데이트된 SQL 실행**
   ```sql
   -- SUPABASE_INIT.sql 파일 내용을 복사하여 실행
   -- 이미 provider_id, provider 컬럼이 포함되어 있음
   ```

3. **환경 변수 설정**
   ```bash
   cp .env.example .env
   # .env 파일에서 새 Supabase URL과 키 설정
   ```

### 옵션 2: 기존 데이터베이스 마이그레이션

**기존 Supabase 프로젝트가 있는 경우:**

1. **Supabase 대시보드 접속**
   - 프로젝트 > SQL Editor 이동

2. **마이그레이션 SQL 실행**
   ```sql
   -- SUPABASE_MIGRATION_KAKAO.sql 파일 내용을 복사하여 실행
   -- provider_id, provider 컬럼을 기존 테이블에 추가
   ```

3. **마이그레이션 확인**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'profiles' AND table_schema = 'public';
   ```

   다음 컬럼들이 포함되어야 함:
   - `provider` (text)
   - `provider_id` (text)

## 🧪 테스트 방법

1. **앱 재시작**
   ```bash
   npm start
   ```

2. **카카오 로그인 테스트**
   - 로그인 화면에서 "카카오로 시작하기" 클릭
   - 에러 없이 로그인 완료 확인

3. **데이터베이스 확인**
   - Supabase 대시보드 > Table Editor > profiles 테이블
   - 새 사용자 레코드가 생성되었는지 확인
   - `provider: 'kakao'`, `provider_id` 값이 올바르게 저장되었는지 확인

## 🔄 Fallback 처리

코드에서 자동 fallback 처리가 구현되어 있어서:
- 데이터베이스 스키마가 준비되지 않은 경우 → 로컬 저장소만 사용
- 네트워크 연결 문제 → 로컬 저장소로 fallback
- 에러 발생 시 상세한 로그 출력

## 📁 관련 파일들

- `SUPABASE_INIT.sql` - 완전한 초기 스키마 (provider_id 포함)
- `SUPABASE_MIGRATION_KAKAO.sql` - 기존 DB에 컬럼 추가하는 마이그레이션
- `lib/supabase.ts` - Supabase 클라이언트 및 에러 처리
- `.env.example` - 환경 변수 템플릿

## ⚡ 빠른 해결책

에러를 빠르게 해결하려면:

1. **마이그레이션 실행** (30초)
   ```sql
   -- Supabase SQL Editor에서 실행
   ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';
   ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS provider_id TEXT;
   ```

2. **앱 재시작**
   ```bash
   npm start
   ```

3. **카카오 로그인 재시도**

## 🎯 완료 후 확인사항

✅ 카카오 로그인이 에러 없이 완료됨  
✅ Supabase profiles 테이블에 새 레코드 생성됨  
✅ provider='kakao', provider_id에 카카오 사용자 ID 저장됨  
✅ 앱 재시작 시 로그인 상태 유지됨  

이제 카카오 로그인이 완전히 작동할 것입니다! 🎉