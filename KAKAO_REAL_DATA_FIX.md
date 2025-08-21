# 카카오 로그인 실제 데이터 추출 개선

## 문제점
카카오 로그인 시 실제 카카오 이메일과 닉네임 대신 fallback 데이터만 사용되는 문제

## 해결 방안

### 1. 카카오 로그인 권한 요청 개선 (`LoginScreen.tsx`)

```typescript
// 이메일과 닉네임 권한을 명시적으로 요청
kakaoResult = await kakaoLogin({
  scopes: ['account_email', 'profile_nickname']
});
```

- `account_email`: 카카오 계정 이메일 접근 권한
- `profile_nickname`: 카카오 프로필 닉네임 접근 권한

### 2. 데이터 추출 로직 강화 (`lib/supabase.ts`)

#### 이메일 추출 경로 확장
```typescript
const possibleEmailPaths = [
  user?.kakaoAccount?.email,                    // 일반적인 경로
  user?.kakaoAccount?.account?.email,           // 계정 하위 경로
  user?.email,                                  // 직접 경로
  user?.account?.email,                         // 단축 경로
];
```

#### 닉네임 추출 경로 확장
```typescript
const possiblePaths = [
  user?.kakaoAccount?.profile?.nickname,        // 일반적인 경로
  user?.kakaoAccount?.profile?.nickName,        // 대소문자 변형
  user?.profile?.nickname,                      // 단축 경로
  user?.nickname,                               // 직접 경로
  user?.name                                    // 이름 필드
];
```

### 3. 상세 디버깅 로그 추가

```typescript
console.log('=== KAKAO USER DATA EXTRACTION ===');
console.log('Extracted Email:', userEmail, '(is real kakao email:', !!userEmail, ')');
console.log('Extracted Nickname:', nickname, '(is real kakao nickname:', !!nickname, ')');
```

- 실제 카카오 데이터인지 fallback인지 명확히 구분
- 각 추출 경로별 결과 확인

### 4. Fallback 로직 개선

- **실제 카카오 데이터 우선 사용**
- **fallback은 최후 수단으로만 사용**
- **더 간단한 fallback 이메일 형식**: `user{providerId}@roomie.app`

## 테스트 방법

1. **카카오 로그인 시도**
2. **콘솔 로그 확인**:
   ```
   === KAKAO USER DATA EXTRACTION ===
   Extracted Email: your@kakao.com (is real kakao email: true)
   Extracted Nickname: 실제닉네임 (is real kakao nickname: true)
   ```

3. **Supabase Auth 대시보드 확인**:
   - 이메일: 실제 카카오 이메일
   - Display Name: 실제 카카오 닉네임

## 주의사항

### 카카오 개발자 콘솔 설정 확인
1. **카카오 로그인** > **동의항목** 설정에서:
   - **카카오계정(이메일)**: 필수 동의 또는 선택 동의로 설정
   - **프로필 정보(닉네임/프로필 사진)**: 필수 동의로 설정

2. **앱 검수** 상태 확인:
   - 이메일 동의항목이 승인되었는지 확인
   - 미승인 시 테스트 계정에서만 이메일 접근 가능

### SDK 버전 호환성
- `@react-native-kakao/user@2.4.0` 사용 중
- `scopes` 파라미터가 지원되지 않을 경우 기본 로그인으로 fallback

## 기대 결과
- ✅ 실제 카카오 이메일 사용 (권한이 있는 경우)
- ✅ 실제 카카오 닉네임 사용 (권한이 있는 경우)
- ✅ temp 문자 완전 제거
- ✅ 권한이 없어도 정상 동작 (fallback 사용)