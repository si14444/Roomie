# 카카오 로그인 연동 가이드

Supabase + 카카오 로그인 완전 연동 가이드입니다.

## 🚀 1. 카카오 개발자 콘솔 설정

### 1-1. 카카오 개발자 계정 생성
1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 카카오 계정으로 로그인
3. **앱 만들기** 클릭

### 1-2. 앱 기본 정보 설정
```
앱 이름: Roomie
회사명: (본인 이름 또는 회사명)
카테고리: 라이프스타일
```

### 1-3. 플랫폼 등록
**Android:**
```
패키지명: com.roomie.app (또는 실제 패키지명)
키 해시: (개발용/배포용 키 해시)
```

**iOS:**
```
번들 ID: com.roomie.app (또는 실제 번들 ID)
```

### 1-4. 카카오 로그인 활성화
1. **제품 설정** → **카카오 로그인** 클릭
2. **활성화 설정** ON
3. **OpenID Connect 활성화** ON
4. **Redirect URI** 설정:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```

### 1-5. 동의항목 설정
**필수 동의항목:**
- 닉네임 (필수)
- 이메일 (필수)

**선택 동의항목:**
- 프로필 사진
- 성별
- 연령대

### 1-6. 앱 키 확인
- **REST API 키** 복사 (Supabase에서 사용)
- **JavaScript 키** 복사 (클라이언트에서 사용)

## ⚙️ 2. Supabase 설정

### 2-1. Authentication Provider 설정
1. Supabase 대시보드 → **Authentication** → **Providers**
2. **Kakao** 찾아서 **Enable** 체크
3. 설정 정보 입력:
   ```
   Client ID: 카카오 REST API 키
   Client Secret: (카카오에서는 사용하지 않음 - 빈 값)
   Redirect URL: https://your-project.supabase.co/auth/v1/callback
   ```

### 2-2. Site URL 설정
**Authentication** → **Settings**:
```
Site URL: exp://192.168.1.100:8081 (개발용)
Additional Redirect URLs:
- exp://localhost:8081
- roomie://auth/callback (배포용)
```

## 📱 3. React Native 앱 설정

### 3-1. 패키지 설치
```bash
# 기본 Supabase 패키지 (이미 설치되어 있을 수 있음)
npm install @supabase/supabase-js

# Expo AuthSession (카카오 로그인용)
npx expo install expo-auth-session expo-crypto expo-web-browser

# React Native 카카오 SDK (선택사항 - 네이티브 SDK 사용시)
npm install @react-native-seoul/kakao-login
```

### 3-2. app.json 설정
```json
{
  "expo": {
    "scheme": "roomie",
    "plugins": [
      [
        "expo-auth-session",
        {
          "schemes": ["roomie"]
        }
      ]
    ]
  }
}
```

### 3-3. 카카오 로그인 훅 구현
```typescript
// hooks/useKakaoAuth.ts
import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

const kakaoEndpoints = {
  authorizationEndpoint: 'https://kauth.kakao.com/oauth/authorize',
  tokenEndpoint: 'https://kauth.kakao.com/oauth/token',
  revocationEndpoint: 'https://kauth.kakao.com/oauth/logout',
};

export function useKakaoAuth() {
  const redirectUri = makeRedirectUri({
    scheme: 'roomie',
    path: 'auth/callback',
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'YOUR_KAKAO_REST_API_KEY',
      scopes: ['profile_nickname', 'account_email'],
      redirectUri,
      responseType: 'code',
      extraParams: {},
      additionalParameters: {},
    },
    kakaoEndpoints
  );

  const signInWithKakao = async () => {
    try {
      const result = await promptAsync();
      
      if (result.type === 'success') {
        const { code } = result.params;
        
        // Supabase에 카카오 OAuth 코드 전달
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'kakao',
          options: {
            redirectTo: redirectUri,
            queryParams: {
              code,
            },
          },
        });

        if (error) {
          Alert.alert('로그인 실패', error.message);
          return { success: false, error };
        }

        return { success: true, data };
      }
    } catch (error) {
      console.error('Kakao login error:', error);
      Alert.alert('오류', '카카오 로그인 중 오류가 발생했습니다.');
      return { success: false, error };
    }
  };

  return {
    signInWithKakao,
    request,
  };
}
```

### 3-4. AuthContext 업데이트
```typescript
// contexts/AuthContext.tsx
import { useKakaoAuth } from '@/hooks/useKakaoAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { signInWithKakao } = useKakaoAuth();

  useEffect(() => {
    // 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithKakao, // 카카오 로그인 추가
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 3-5. 로그인 화면 업데이트
```typescript
// components/auth/LoginScreen.tsx
import { useAuth } from '@/contexts/AuthContext';

export function LoginScreen() {
  const { signInWithEmail, signInWithKakao, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailLogin = async () => {
    const { error } = await signInWithEmail(email, password);
    if (error) {
      Alert.alert('로그인 실패', error.message);
    }
  };

  const handleKakaoLogin = async () => {
    const result = await signInWithKakao();
    if (!result.success) {
      Alert.alert('로그인 실패', '카카오 로그인에 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      {/* 이메일 로그인 폼 */}
      <View style={styles.emailForm}>
        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity 
          style={styles.emailButton} 
          onPress={handleEmailLogin}
          disabled={loading}
        >
          <Text style={styles.emailButtonText}>이메일로 로그인</Text>
        </TouchableOpacity>
      </View>

      {/* 소셜 로그인 구분선 */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>또는</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* 카카오 로그인 버튼 */}
      <TouchableOpacity 
        style={styles.kakaoButton} 
        onPress={handleKakaoLogin}
        disabled={loading}
      >
        <Image 
          source={require('@/assets/images/kakao-logo.png')} 
          style={styles.kakaoLogo} 
        />
        <Text style={styles.kakaoButtonText}>카카오로 로그인</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  emailForm: {
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  emailButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  emailButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#666',
    fontSize: 14,
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kakaoLogo: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  kakaoButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

## 🔧 4. 프로필 정보 자동 동기화

### 4-1. 카카오 사용자 정보 처리
현재 SQL의 `handle_new_user()` 함수가 자동으로 처리하지만, 카카오 특화 정보를 위해 업데이트:

```sql
-- 카카오 사용자 정보 처리 개선
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'nickname'
        ),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4-2. 카카오 사용자 정보 확인
```typescript
// utils/kakaoProfile.ts
export const getKakaoUserInfo = (user: User) => {
  const metadata = user.user_metadata;
  
  return {
    id: user.id,
    email: user.email,
    name: metadata.full_name || metadata.name || metadata.nickname,
    avatar: metadata.avatar_url || metadata.picture,
    provider: 'kakao',
    kakaoId: metadata.provider_id,
  };
};
```

## 🚨 5. 주의사항

### 5-1. 환경 변수 설정
```env
# .env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_KAKAO_REST_API_KEY=your_kakao_rest_api_key
```

### 5-2. 배포시 설정
**Android:**
- 릴리즈 키 해시 추가
- 패키지명 확인

**iOS:**
- Bundle ID 일치 확인
- URL Scheme 설정

### 5-3. 테스트 체크리스트
- [ ] 카카오 로그인 성공
- [ ] Supabase 세션 생성 확인
- [ ] profiles 테이블에 자동 추가 확인
- [ ] 팀 가입/생성 정상 작동
- [ ] 실시간 기능 정상 작동

## 🎯 6. 요약

**기존 SQL 파일 그대로 사용 ✅**
- `auth.users` 자동 관리
- `profiles` 테이블로 확장 정보 저장
- 자동 트리거로 연동 완료

**카카오 로그인 추가 작업:**
1. 카카오 개발자 콘솔 설정
2. Supabase Provider 활성화
3. React Native 코드 추가

**결론: 현재 SQL은 완벽하고, 카카오 로그인만 추가 설정하면 됩니다!** 🚀