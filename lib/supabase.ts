import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project-ref.supabase.co'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// 환경 변수 로드 확인
console.log('Supabase config:', {
  url: supabaseUrl?.substring(0, 30) + '...',
  hasKey: !!supabaseAnonKey && supabaseAnonKey.length > 20,
  isProduction: supabaseUrl !== 'https://your-project-ref.supabase.co'
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Supabase 연결 상태 확인 (타임아웃 포함)
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Checking Supabase connection...');
    
    // 5초 타임아웃으로 연결 상태 확인
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .abortSignal(controller.signal);
    
    clearTimeout(timeoutId);
    
    if (error) {
      console.warn('⚠️ Supabase connection check failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn('⏰ Supabase connection timeout after 5 seconds');
    } else {
      console.warn('❌ Supabase connection error:', error.message);
    }
    return false;
  }
};

// 에러 타입 정의
export interface AuthError extends Error {
  code?: string;
  status?: number;
  isFallbackMode?: boolean;
}

// 통합 에러 핸들러
export const handleAuthError = (error: any, context: string): AuthError => {
  const authError: AuthError = new Error(`${context}: ${error.message || error}`);
  authError.code = error.code;
  authError.status = error.status;
  
  // 에러 로깅
  console.error(`Auth Error [${context}]:`, {
    message: error.message,
    code: error.code,
    status: error.status,
    details: error
  });
  
  return authError;
};

// 카카오 사용자 정보를 Supabase 프로필에 매핑하는 헬퍼 함수
export const mapKakaoUserToProfile = (kakaoUser: any) => {
  console.log('🔄 Starting Kakao user mapping...');
  
  // 카카오 사용자 ID 안전 처리 - 더 많은 경로 지원
  const kakaoId = kakaoUser?.id || 
                  kakaoUser?.userId || 
                  kakaoUser?.user_id ||
                  kakaoUser?.kakaoAccount?.profile?.id ||
                  Date.now().toString();
  const providerId = kakaoId ? kakaoId.toString() : Date.now().toString();
  
  console.log('🆔 Kakao ID extraction:', {
    originalId: kakaoUser?.id,
    userId: kakaoUser?.userId,
    user_id: kakaoUser?.user_id,
    profileId: kakaoUser?.kakaoAccount?.profile?.id,
    finalProviderId: providerId
  });
  
  // 카카오 닉네임을 다양한 경로에서 추출
  const extractNickname = (user: any) => {
    console.log('=== NICKNAME EXTRACTION DEBUG ===');
    
    // 가능한 모든 닉네임 경로 확인
    const possiblePaths = [
      { path: 'kakaoAccount.profile.nickname', value: user?.kakaoAccount?.profile?.nickname },
      { path: 'kakaoAccount.profile.nickName', value: user?.kakaoAccount?.profile?.nickName },
      { path: 'kakaoAccount.profile.display_name', value: user?.kakaoAccount?.profile?.display_name },
      { path: 'kakaoAccount.profile.name', value: user?.kakaoAccount?.profile?.name },
      { path: 'profile.nickname', value: user?.profile?.nickname },
      { path: 'profile.nickName', value: user?.profile?.nickName },
      { path: 'profile.display_name', value: user?.profile?.display_name },
      { path: 'profile.name', value: user?.profile?.name },
      { path: 'nickname', value: user?.nickname },
      { path: 'nickName', value: user?.nickName },
      { path: 'display_name', value: user?.display_name },
      { path: 'name', value: user?.name },
      { path: 'kakaoAccount.name', value: user?.kakaoAccount?.name }
    ];
    
    // 각 경로 체크 로그
    possiblePaths.forEach(({ path, value }) => {
      console.log(`${path}:`, value, `(type: ${typeof value})`);
    });
    
    // null이 아닌 첫 번째 유효한 값 반환
    for (const { path, value } of possiblePaths) {
      if (value && typeof value === 'string' && value.trim()) {
        console.log(`✅ NICKNAME FOUND at ${path}:`, value.trim());
        return value.trim();
      }
    }
    
    console.log('❌ NO VALID NICKNAME FOUND');
    return null;
  };
  
  const nickname = extractNickname(kakaoUser);
  
  // 카카오 이메일을 다양한 경로에서 추출
  const extractEmail = (user: any) => {
    console.log('📧 Starting email extraction...');
    
    const possibleEmailPaths = [
      user?.kakaoAccount?.email,                    // 일반적인 경로
      user?.kakaoAccount?.account?.email,           // 계정 하위 경로
      user?.email,                                  // 직접 경로
      user?.account?.email,                         // 단축 경로
    ];
    
    possibleEmailPaths.forEach((email, index) => {
      console.log(`Email path ${index + 1}:`, email, `(valid: ${email && typeof email === 'string' && email.includes('@')})`);
    });
    
    for (const email of possibleEmailPaths) {
      if (email && typeof email === 'string' && email.includes('@') && email.trim()) {
        console.log('✅ Valid email found:', email.trim());
        return email.trim();
      }
    }
    
    console.log('⚠️ No valid email found in any path');
    return null;
  };
  
  const userEmail = extractEmail(kakaoUser);
  
  console.log('=== KAKAO USER DATA EXTRACTION ===');
  console.log('Kakao User ID:', kakaoUser?.id);
  console.log('Provider ID:', providerId);
  console.log('Extracted Email:', userEmail);
  console.log('Extracted Nickname:', nickname);
  console.log('=== EMAIL PATHS CHECK ===');
  console.log('kakaoAccount.email:', kakaoUser?.kakaoAccount?.email);
  console.log('kakaoAccount.emailValid:', kakaoUser?.kakaoAccount?.emailValid);
  console.log('kakaoAccount.isEmailVerified:', kakaoUser?.kakaoAccount?.isEmailVerified);
  console.log('=== NICKNAME PATHS CHECK ===');
  console.log('kakaoAccount.profile.nickname:', kakaoUser?.kakaoAccount?.profile?.nickname);
  console.log('profile.nickname:', kakaoUser?.profile?.nickname);
  console.log('=== FULL KAKAO OBJECT ===');
  console.log('Full structure:', JSON.stringify(kakaoUser, null, 2));
  
  // 최종 이메일과 이름 결정 - 일관된 fallback 도메인 사용
  const finalEmail = userEmail || `kakao_user_${providerId}@roomie.app`;
  const finalName = nickname || `카카오사용자${providerId.slice(-4)}`;
  
  console.log('=== FINAL MAPPING RESULT ===');
  console.log('Final Email:', finalEmail, '(is real kakao email:', !!userEmail, ')');
  console.log('Final Name:', finalName, '(is real kakao nickname:', !!nickname, ')');
  
  return {
    id: `kakao_${providerId}`,
    email: finalEmail,
    full_name: finalName,
    avatar_url: kakaoUser.kakaoAccount?.profile?.profileImageUrl || 
                kakaoUser.kakaoAccount?.profile?.profile_image_url || 
                kakaoUser?.profile?.profileImageUrl || 
                null,
    provider: 'kakao',
    provider_id: providerId,
  }
}

// 카카오 사용자를 Supabase Auth 사용자로 생성/로그인 (완전 구현 + 에러 처리)
export const signInWithKakaoUser = async (kakaoUser: any) => {
  console.log('🚀 signInWithKakaoUser called with data type:', typeof kakaoUser);
  
  if (!kakaoUser) {
    throw handleAuthError(new Error('카카오 사용자 정보가 없습니다.'), 'KAKAO_USER_VALIDATION');
  }

  // 더 상세한 디버깅을 위한 로그
  console.log('📄 Creating Supabase Auth session from Kakao user:', {
    hasId: !!kakaoUser.id,
    hasUserId: !!kakaoUser.userId,
    hasKakaoAccount: !!kakaoUser.kakaoAccount,
    topKeys: Object.keys(kakaoUser).slice(0, 10), // 처음 10개 키만
    dataStructure: typeof kakaoUser
  });
  
  const profile = mapKakaoUserToProfile(kakaoUser);
  
  // Supabase 연결 상태 확인
  const isConnected = await checkSupabaseConnection();
  if (!isConnected) {
    console.warn('Supabase connection failed, using fallback mode');
    const fallbackError: AuthError = new Error('Supabase 연결 실패 - 오프라인 모드로 진행');
    fallbackError.isFallbackMode = true;
    throw fallbackError;
  }
  
  try {
    // 1. 기존 사용자 확인 (provider_id로 검색)
    let existingProfile;
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('provider_id', profile.provider_id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw handleAuthError(profileError, 'PROFILE_SEARCH');
      }
      
      existingProfile = data;
    } catch (searchError) {
      console.warn('Profile search failed, proceeding as new user:', searchError);
      existingProfile = null;
    }

    let finalUser;
    
    if (existingProfile) {
      // 기존 사용자가 있으면 해당 계정으로 로그인
      console.log('Existing user found, signing in:', existingProfile.id);
      
      try {
        // 기존 사용자의 이메일로 로그인 시도
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: existingProfile.email,
          password: `KakaoUser_${profile.provider_id}`,
        });

        if (signInData?.user) {
          finalUser = signInData.user;
        } else {
          console.log('Password mismatch, creating new session for existing user');
          finalUser = await createNewAuthUser(profile, existingProfile.email);
        }
      } catch (loginError) {
        console.log('Existing user login failed, creating new session:', loginError);
        finalUser = await createNewAuthUser(profile, existingProfile.email);
      }
      
      // 기존 프로필 정보 업데이트 (실패해도 계속 진행)
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingProfile.id);
        console.log('Profile updated successfully');
      } catch (updateError) {
        console.warn('Profile update failed (continuing):', updateError);
      }

      // Supabase Auth 사용자 메타데이터도 업데이트
      try {
        console.log('=== UPDATING AUTH USER METADATA ===');
        console.log('Updating with name:', profile.full_name);
        
        await supabase.auth.updateUser({
          data: {
            full_name: profile.full_name,
            display_name: profile.full_name,
            name: profile.full_name,
            nickname: profile.full_name,
            avatar_url: profile.avatar_url,
            provider: profile.provider,
            provider_id: profile.provider_id,
          }
        });
        console.log('✅ Auth user metadata updated successfully with name:', profile.full_name);
      } catch (authUpdateError) {
        console.warn('❌ Auth metadata update failed (continuing):', authUpdateError);
      }

    } else {
      // 새 사용자 생성
      console.log('New user, creating Supabase Auth account');
      
      console.log('Using email for new user:', { 
        originalEmail: profile.email,
        emailValid: profile.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)
      });
      
      finalUser = await createNewAuthUser(profile, profile.email);
      
      // 새 프로필 생성 (실패해도 계속 진행)
      try {
        await supabase
          .from('profiles')
          .insert({
            id: finalUser!.id,
            email: finalUser!.email || profile.email, // Auth 사용자의 실제 이메일 사용
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            provider: profile.provider,
            provider_id: profile.provider_id,
          });
        console.log('Profile created successfully');
      } catch (createError) {
        console.warn('Profile creation failed (continuing):', createError);
      }
    }

    if (!finalUser) {
      throw handleAuthError(new Error('Supabase 사용자 생성에 실패했습니다.'), 'USER_CREATION');
    }

    console.log('Supabase Auth session created successfully:', {
      userId: finalUser.id,
      email: finalUser.email,
      isNewUser: !existingProfile
    });

    return finalUser;
    
  } catch (error: any) {
    // 이미 AuthError인 경우 그대로 전달
    if (error.isFallbackMode || error.code) {
      throw error;
    }
    
    // 일반 에러는 AuthError로 변환
    throw handleAuthError(error, 'SUPABASE_AUTH_SESSION');
  }
};

// 이메일 validation 및 정제 함수
const sanitizeEmail = (email: string, providerId: string): string => {
  if (!email || typeof email !== 'string') {
    return `kakao_user_${providerId}@roomie.app`;
  }
  
  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.warn('Invalid email format, using fallback email:', email);
    return `kakao_user_${providerId}@roomie.app`;
  }
  
  // 이메일 길이 검증 (Supabase 제한: 보통 254자)
  if (email.length > 250) {
    console.warn('Email too long, using fallback email:', email.length);
    return `kakao_user_${providerId}@roomie.app`;
  }
  
  // 특수문자 정제 (기본적인 이메일 문자만 허용)
  const cleanEmail = email.toLowerCase().trim();
  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(cleanEmail)) {
    console.warn('Email contains invalid characters, using fallback email:', email);
    return `kakao_user_${providerId}@roomie.app`;
  }
  
  return cleanEmail;
};

// 새 Auth 사용자 생성 헬퍼 함수
const createNewAuthUser = async (profile: any, email: string) => {
  const password = `KakaoUser_${profile.provider_id}`;
  const sanitizedEmail = sanitizeEmail(email, profile.provider_id);
  
  console.log('Email sanitization:', {
    original: email,
    sanitized: sanitizedEmail,
    changed: email !== sanitizedEmail
  });
  
  console.log('=== CREATING AUTH USER ===');
  console.log('Email:', sanitizedEmail);
  console.log('Profile name for Auth:', profile.full_name);
  console.log('Creating user with metadata...');
  
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: sanitizedEmail,
    password: password,
    options: {
      data: {
        full_name: profile.full_name,
        display_name: profile.full_name,  // display_name도 명시적으로 설정
        name: profile.full_name,         // name 필드도 추가
        nickname: profile.full_name,     // nickname 필드도 추가
        avatar_url: profile.avatar_url,
        provider: profile.provider,
        provider_id: profile.provider_id,
      },
      emailRedirectTo: undefined,
    }
  });
  
  console.log('Supabase Auth signup attempt:', {
    email: sanitizedEmail,
    full_name: profile.full_name,
    display_name: profile.full_name,
    success: !signUpError,
    error: signUpError?.message
  });

  if (signUpError) {
    console.error('Supabase signup error details:', {
      message: signUpError.message,
      status: signUpError.status,
      code: signUpError.code,
      email: sanitizedEmail,
      emailLength: sanitizedEmail?.length,
      emailValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail || '')
    });
    // 이메일 관련 에러 처리 (이미 사용 중이거나 invalid인 경우)
    if (signUpError.message.includes('already registered') || 
        signUpError.message.includes('invalid') || 
        signUpError.message.includes('email')) {
      const timestampEmail = `kakao_user_${profile.provider_id}_${Date.now()}@roomie.app`;
      
      const { data: retryData, error: retryError } = await supabase.auth.signUp({
        email: timestampEmail,
        password: password,
        options: {
          data: {
            full_name: profile.full_name,
            display_name: profile.full_name,  // display_name도 명시적으로 설정
            name: profile.full_name,         // name 필드도 추가
            nickname: profile.full_name,     // nickname 필드도 추가
            avatar_url: profile.avatar_url,
            provider: profile.provider,
            provider_id: profile.provider_id,
          }
        }
      });
      
      console.log('Supabase Auth retry signup:', {
        email: timestampEmail,
        full_name: profile.full_name,
        success: !retryError
      });

      if (retryError) {
        throw new Error(`Supabase 회원가입 실패: ${retryError.message}`);
      }
      
      return retryData.user;
    }
    
    throw new Error(`Supabase 회원가입 실패: ${signUpError.message}`);
  }

  return signUpData.user;
};

// 카카오 로그인 결과를 Supabase 세션으로 변환 (기존 호환성)
export const createSupabaseSessionFromKakao = async (kakaoUser: any) => {
  console.log('Processing Kakao user (legacy method):', kakaoUser);
  
  const profile = mapKakaoUserToProfile(kakaoUser);
  
  console.log('Generated profile:', profile);
  
  try {
    // 프로필이 존재하는지 확인
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('provider_id', profile.provider_id)
      .single()

    // 데이터베이스 테이블이나 컬럼이 없는 경우 처리
    if (fetchError) {
      console.warn('Profile fetch error:', fetchError);
      
      // 테이블이나 컬럼이 존재하지 않는 경우
      if (fetchError.code === 'PGRST116' || 
          fetchError.message?.includes('column') || 
          fetchError.message?.includes('does not exist')) {
        console.log('Database schema not ready, returning profile for local storage only');
        return profile;
      }
      
      throw new Error(`프로필 조회 실패: ${fetchError.message}`)
    }

    // 프로필이 없으면 생성
    if (!existingProfile) {
      console.log('Creating new profile:', profile);
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          provider: profile.provider,
          provider_id: profile.provider_id,
        }])

      if (insertError) {
        console.error('Error creating profile:', insertError);
        
        // 스키마 문제인 경우 로컬 처리로 fallback
        if (insertError.message?.includes('column') || 
            insertError.message?.includes('does not exist')) {
          console.log('Database schema not ready for new columns, using local storage only');
          return profile;
        }
        
        throw new Error(`프로필 생성 실패: ${insertError.message}`)
      }

      console.log('Profile created successfully');
      return profile;
    } else {
      console.log('Updating existing profile:', existingProfile.id);
      
      // 기존 프로필 정보 업데이트
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProfile.id)

      if (updateError) {
        console.error('Error updating profile:', updateError)
        // 업데이트 실패는 치명적이지 않으므로 경고만 출력
        console.warn(`프로필 업데이트 실패: ${updateError.message}`)
      }

      console.log('Profile updated successfully');
      return existingProfile;
    }
  } catch (error) {
    console.error('Supabase operation failed:', error);
    
    // 데이터베이스 연결이나 스키마 문제인 경우 로컬 처리로 fallback
    if (error instanceof Error && 
        (error.message.includes('column') || 
         error.message.includes('does not exist') ||
         error.message.includes('connection'))) {
      console.log('Database not available, proceeding with local storage only');
      return profile;
    }
    
    throw error;
  }
}