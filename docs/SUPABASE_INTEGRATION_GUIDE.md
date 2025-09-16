# Supabase 연동 가이드

Roomie 앱의 Supabase 통합을 위한 완전한 가이드입니다.

## 📋 필요한 작업 리스트

### 1. 데이터베이스 스키마 설정
- [ ] **ERD 기반 SQL 실행**: `supabase/migrations/001_create_initial_schema.sql` 파일을 Supabase SQL Editor에서 실행
- [ ] **RLS 정책 수정**: `supabase/migrations/002_fix_rls_policies.sql` 실행하거나 `supabase/rls_disable_script.sql`로 개발용 비활성화

### 2. 인증 시스템 연동
- [ ] **프로필 자동 생성**: 로그인 시 `users` 테이블에 프로필 자동 생성
- [ ] **카카오 로그인 연동**: 기존 코드와 새 스키마 연결

### 3. 팀 관리 시스템
- [ ] **팀 생성 API**: `teamsService.createTeam()` 구현
- [ ] **팀 참가 API**: 초대 코드로 팀 참가
- [ ] **팀 멤버 관리**: 멤버 조회, 역할 관리

### 4. 핵심 기능별 API 구현
- [ ] **루틴 관리**: CRUD + 완료 기록
- [ ] **공과금 관리**: CRUD + 결제 기록
- [ ] **아이템 관리**: CRUD + 구매 요청
- [ ] **알림 시스템**: 실시간 알림 + 읽음 처리

## 🗂️ 파일 구조

```
📁 Roomie/
├── 📁 supabase/
│   ├── migrations/
│   │   ├── 001_create_initial_schema.sql    ✅ 완성
│   │   └── 002_fix_rls_policies.sql         ✅ 완성
│   └── rls_disable_script.sql               ✅ 완성
├── 📁 lib/
│   ├── supabase.ts                          🔄 수정 필요
│   └── supabase-service.ts                  🔄 수정 필요
├── 📁 contexts/
│   ├── AuthContext.tsx                      🔄 수정 필요
│   └── TeamContext.tsx                      🔄 수정 필요
├── 📁 types/
│   └── team.types.ts                        ✅ 완성
└── 📁 docs/
    ├── ERD.md                               ✅ 완성
    └── SUPABASE_INTEGRATION_GUIDE.md        ✅ 이 파일
```

## 🎯 핵심 API 패턴

### 기본 CRUD 패턴
```typescript
// 조회
const { data, error } = await supabase.from('table_name').select('*');

// 생성
const { data, error } = await supabase.from('table_name').insert([newData]);

// 수정
const { data, error } = await supabase.from('table_name').update(updates).eq('id', id);

// 삭제
const { data, error } = await supabase.from('table_name').delete().eq('id', id);
```

### 관계 데이터 조회
```typescript
// 팀과 멤버 함께 조회
const { data } = await supabase
  .from('teams')
  .select(`
    *,
    team_members(
      *,
      users(name, email, avatar_url)
    )
  `)
  .eq('team_members.user_id', userId);
```

### 실시간 구독
```typescript
supabase
  .channel('team-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'teams'
  }, (payload) => {
    console.log('팀 데이터 변경:', payload);
  })
  .subscribe();
```

## 📊 데이터베이스 테이블 관계

### 핵심 엔티티
1. **users** (프로필)
2. **teams** (팀)
3. **team_members** (팀 멤버십)
4. **routines** (루틴)
5. **routine_completions** (루틴 완료)
6. **bills** (공과금)
7. **bill_payments** (공과금 결제)
8. **items** (아이템)
9. **purchase_requests** (구매 요청)
10. **notifications** (알림)
11. **feedback** (피드백)

### 주요 관계
- `teams` ← `team_members` → `users`
- `teams` → `routines` → `routine_completions`
- `teams` → `bills` → `bill_payments`
- `teams` → `items` → `purchase_requests`
- `teams` → `notifications` → `users`

## ⚠️ 주의사항

### RLS (Row Level Security)
- 개발 중에는 `rls_disable_script.sql` 실행하여 비활성화
- 프로덕션에서는 반드시 RLS 활성화 후 정책 적용

### 초대 코드
- 8자리 대문자/숫자 조합 자동 생성
- 중복 방지 로직 필요

### 에러 처리
- Supabase 에러는 `{ data, error }` 형태로 반환
- `error.code`, `error.message` 확인 필요

## 🚀 구현 우선순위

1. **Phase 1**: 기본 인증 + 프로필 연동
2. **Phase 2**: 팀 생성/참가 기능
3. **Phase 3**: 루틴 관리 시스템
4. **Phase 4**: 공과금 & 아이템 관리
5. **Phase 5**: 실시간 알림 시스템

## 🔧 개발 팁

### 디버깅
```typescript
// Supabase 에러 상세 확인
if (error) {
  console.error('Supabase Error:', {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint
  });
}
```

### 성능 최적화
```typescript
// 필요한 컬럼만 선택
.select('id, name, created_at')

// 페이지네이션
.range(0, 9)  // 0-9번째 레코드

// 정렬
.order('created_at', { ascending: false })
```

### 실시간 구독 정리
```typescript
// 구독 해제 꼭 해주기
const subscription = supabase.channel('updates').subscribe();

// 컴포넌트 언마운트 시
useEffect(() => {
  return () => {
    subscription.unsubscribe();
  };
}, []);
```