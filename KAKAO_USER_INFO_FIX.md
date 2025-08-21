# 카카오 로그인 사용자 정보 temp 문제 해결

## 문제점
카카오 로그인 시 Supabase Auth에서 사용자 이름과 이메일이 temp로 저장되는 문제

## 해결한 사항

### 1. 이메일 처리 개선 (`lib/supabase.ts`)
- `temp.com` → `users.roomie.app`로 도메인 변경
- 더 의미있는 이메일 형식 사용: `kakao-user-{providerId}@users.roomie.app`
- fallback 이메일 개선으로 temp 문자 제거

### 2. 사용자 이름 처리 개선
- `mapKakaoUserToProfile` 함수에서 기본 이름을 더 구체적으로 변경
- `'카카오 사용자'` → `'카카오사용자_{providerId 마지막 4자리}'`
- 사용자 구분이 가능한 고유 이름 생성

### 3. Auth 메타데이터 처리 강화
- `display_name`과 `full_name` 모두 설정하여 이름 정보 보강
- `user_metadata`에서 이름 추출 시 다양한 경로 확인
- 이메일에서 사용자명 추출 로직 추가

### 4. 프로필 생성/업데이트 로직 개선
- Auth 사용자 메타데이터에 provider 정보 추가
- 프로필 자동 생성 시 올바른 이름 정보 사용
- 기존 사용자 메타데이터 업데이트 강화

## 주요 변경사항

### `lib/supabase.ts`
1. `mapKakaoUserToProfile()`: 더 구체적인 기본 이름과 이메일 생성
2. `sanitizeEmail()`: temp 도메인을 users.roomie.app으로 변경
3. `signInWithKakaoUser()`: Auth 메타데이터에 provider 정보 추가
4. `createNewAuthUser()`: timestamp 이메일 형식 개선

### `contexts/AuthContext.tsx`
1. 사용자 정보 추출 시 `display_name` 필드도 확인
2. 이메일에서 사용자명 추출 로직 추가
3. 프로필 자동 생성 시 provider를 'kakao'로 설정

## 테스트 방법
1. 앱에서 카카오 로그인 실행
2. Supabase Auth 대시보드에서 사용자 정보 확인
3. 이메일이 `kakao-user-{id}@users.roomie.app` 형식인지 확인
4. 이름이 카카오 닉네임 또는 `카카오사용자_{id}`인지 확인
5. temp 문자가 더 이상 나타나지 않는지 확인

## 기대 효과
- 사용자 식별이 용이한 의미있는 이메일/이름 생성
- temp 문자 완전 제거
- 카카오 닉네임이 있는 경우 정확한 이름 표시
- 사용자 경험 개선