# 📧 카카오 이메일 정보 받아오기 완전 가이드

## 🚨 현재 문제

**문제**: `kakao_1755697557111@temp.com` 같은 temp 이메일이 계속 생성됨
**원인**: 카카오에서 실제 이메일 정보를 제공하지 않음

## 🔧 해결 방법

### 1. 카카오 개발자 콘솔 설정 확인

#### 1-1. 동의항목 설정 확인
1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. **내 애플리케이션** > **Roomie** (앱 이름) 선택
3. **제품 설정** > **카카오 로그인** > **동의항목**으로 이동

#### 1-2. 이메일 동의항목 활성화
**필수 설정**:
```
✅ 닉네임 (선택동의)
✅ 카카오계정(이메일) (선택동의)  ← 이것이 핵심!
```

**설정 방법**:
1. **카카오계정(이메일)** 항목 찾기
2. **필수동의** 또는 **선택동의**로 설정
3. **개인정보 수집 및 이용목적** 입력:
   ```
   서비스 이용자 식별 및 고객 문의 응대
   ```
4. **수집하는 개인정보 항목** 확인:
   ```
   카카오계정(이메일)
   ```

#### 1-3. 비즈니스 채널 설정 (선택)
이메일 동의항목을 사용하려면 비즈니스 채널이 필요할 수 있음:
1. **비즈니스** > **채널** > **새 채널 만들기**
2. 채널 정보 입력 후 생성
3. **카카오 로그인**과 연결

### 2. 앱에서 이메일 요청 로직 개선

#### 2-1. 개선된 카카오 로그인 로직
```typescript
// LoginScreen.tsx에서 구현됨
kakaoResult = await kakaoLogin();

// 이메일 정보가 없으면 추가 정보 요청
if (!kakaoResult?.kakaoAccount?.email) {
  const { getProfile } = await import('@react-native-kakao/user');
  const profileResult = await getProfile();
  // 이메일 정보 병합
}
```

#### 2-2. 상세한 디버깅 로그
```javascript
console.log("=== EMAIL ANALYSIS ===");
console.log("kakaoAccount.email:", kakaoResult?.kakaoAccount?.email);
console.log("kakaoAccount.emailValid:", kakaoResult?.kakaoAccount?.emailValid);
console.log("kakaoAccount.isEmailVerified:", kakaoResult?.kakaoAccount?.isEmailVerified);
```

## 🧪 테스트 시나리오

### Case 1: 이메일 동의가 설정된 경우
```bash
npm start
# 로그인 후 예상 로그:
```
```javascript
=== EMAIL ANALYSIS ===
kakaoAccount exists: true
kakaoAccount.email: "user@kakao.com"          // 실제 이메일!
kakaoAccount.emailValid: true
kakaoAccount.isEmailVerified: true

extractedEmail: "user@kakao.com"              // temp가 아님!
```

### Case 2: 이메일 동의가 없는 경우
```javascript
=== EMAIL ANALYSIS ===
kakaoAccount exists: true
kakaoAccount.email: undefined                 // 이메일 없음
kakaoAccount.emailValid: undefined
No email in initial result, trying to get additional info...
Additional profile result: { /* 추가 프로필 정보 */ }

extractedEmail: null                          // 여전히 없음
sanitizedEmail: "kakao_123456789@temp.roomie.app"  // temp 이메일 사용
```

### Case 3: 추가 프로필 요청으로 이메일 획득
```javascript
No email in initial result, trying to get additional info...
Additional profile result: {
  "kakaoAccount": {
    "email": "user@kakao.com",
    "emailValid": true
  }
}
Email info merged from profile
extractedEmail: "user@kakao.com"              // 성공!
```

## 📱 카카오 개발자 콘솔 설정 확인

### 현재 설정 확인 방법
1. **제품 설정** > **카카오 로그인** > **동의항목**
2. 다음 항목들이 활성화되어 있는지 확인:
   - ✅ **닉네임** (선택동의)
   - ✅ **카카오계정(이메일)** (선택동의) ← 필수!

### 문제 진단
- **이메일 항목이 없는 경우**: 비즈니스 채널 생성 필요
- **이메일 항목이 비활성화된 경우**: 활성화 설정
- **여전히 temp 이메일인 경우**: 사용자가 이메일 동의를 거부했을 가능성

## 🎯 기대 결과

### 성공적인 설정 후:
1. **첫 로그인**: 카카오에서 이메일 동의 요청
2. **동의 후**: 실제 이메일로 Supabase 계정 생성
3. **재로그인**: 동일한 실제 이메일로 로그인

### Supabase Dashboard 확인:
- **Authentication > Users**: `user@kakao.com` (실제 이메일)
- **Table Editor > profiles**: 동일한 실제 이메일

## ⚠️ 주의사항

1. **사용자 동의**: 이메일은 민감 정보이므로 사용자가 거부할 수 있음
2. **비즈니스 채널**: 이메일 동의항목 사용에 필요할 수 있음
3. **앱 심사**: 카카오 앱 심사에서 이메일 사용 목적 명시 필요
4. **대안**: 이메일 없이도 앱이 정상 작동하도록 구현됨

이제 카카오 개발자 콘솔에서 **이메일 동의항목을 활성화**하면 실제 이메일을 받을 수 있습니다! 🎉