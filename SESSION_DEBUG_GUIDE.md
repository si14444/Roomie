# 🔍 세션 복원 문제 해결 가이드

## ✅ 수정된 문제들

1. **INITIAL_SESSION 이벤트 처리**: `session`이 `undefined`여도 로컬 저장소 확인
2. **과도한 로그아웃 방지**: `SIGNED_OUT` 이벤트에서만 상태 정리
3. **로딩 상태 관리**: 적절한 시점에 `isLoading` 해제

## 🧪 테스트 시나리오

### 1. 새로운 로그인 테스트
```bash
# 1. 앱 시작
npm start

# 2. 예상 콘솔 로그:
```

**정상적인 초기화 로그**:
```
Supabase config: {url: "https://rcvidhfhkidywdhmicje...", hasKey: true, isProduction: true}
Loading team data: {storedCurrentTeam: null, storedUserTeams: null, storedHasSelected: null}
Auth state changed: INITIAL_SESSION undefined
Initial session check - no active session, checking local storage
AppNavigator: Loading... {authLoading: false, teamLoading: false, isAuthenticated: false}
AppNavigator: Navigating to login - user not authenticated
```

### 2. 로그인 후 테스트
```
Starting Kakao login - current team state: {hasSelectedTeam: false}
Kakao login result: {id: ...}
Creating Supabase Auth session from Kakao user: ...
Supabase Auth session created successfully: {userId: ...}
Auth state changed: SIGNED_IN {userId}
Login successful, creating default team for quick start...
Default team created successfully
AppNavigator: Navigation decision {isAuthenticated: true, hasSelectedTeam: true}
AppNavigator: Navigating to main app - team selected
```

### 3. 앱 재시작 후 세션 복원 테스트
```
Supabase config: {url: "https://rcvidhfhkidywdhmicje...", hasKey: true, isProduction: true}
Loading team data: {storedCurrentTeam: exists, storedUserTeams: exists, storedHasSelected: true}
Auth state changed: INITIAL_SESSION {userId}  // 세션이 복원되면 userId가 표시됨
Processing user session: {userId}
AppNavigator: Loading... {authLoading: false, teamLoading: false, isAuthenticated: true}
AppNavigator: Navigation decision {isAuthenticated: true, hasSelectedTeam: true}
AppNavigator: Already in main app
```

## 🚨 문제 진단

### 문제 1: 환경 변수가 로드되지 않는 경우
**증상**: `hasKey: false` 또는 `isProduction: false`
**해결**: 
```bash
# .env 파일 확인
cat .env

# 앱 재시작 (환경변수 새로고침)
npm start
```

### 문제 2: Supabase 연결 실패
**증상**: `Error getting session` 로그
**해결**: Fallback 모드로 자동 전환됨

### 문제 3: 세션이 계속 undefined
**증상**: `INITIAL_SESSION undefined` 반복
**해결**: 로컬 저장소 확인 및 fallback 모드 작동

## 🔧 디버깅 명령어

### 현재 인증 상태 확인
```javascript
// Chrome DevTools 콘솔에서 실행
AsyncStorage.getItem('is_authenticated').then(console.log);
AsyncStorage.getItem('user_data').then(console.log);
```

### Supabase 세션 직접 확인
```javascript
// 개발자 도구에서 실행
supabase.auth.getSession().then(console.log);
```

### 로컬 저장소 초기화 (문제 해결용)
```javascript
// 완전 초기화가 필요한 경우
AsyncStorage.clear().then(() => console.log('Storage cleared'));
```

## 📱 기대되는 동작

1. **첫 실행**: 로그인 화면 표시
2. **로그인 성공**: 메인 앱으로 이동 + 기본 팀 생성
3. **앱 재시작**: 로그인 상태 유지되어 바로 메인 앱 표시
4. **네트워크 문제**: Fallback 모드로 로컬 인증 유지

이제 세션 복원 문제가 해결되어 정상적으로 작동할 것입니다! 🚀