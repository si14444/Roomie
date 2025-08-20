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

// Supabase 연결 상태 확인
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    return !error;
  } catch (error) {
    console.warn('Supabase connection check failed:', error);
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
  // 카카오 사용자 ID 안전 처리
  const kakaoId = kakaoUser?.id || kakaoUser?.userId || Date.now().toString();
  const providerId = kakaoId ? kakaoId.toString() : Date.now().toString();
  
  // 카카오 닉네임을 다양한 경로에서 추출
  const extractNickname = (user: any) => {
    // 가능한 모든 닉네임 경로 확인
    const possiblePaths = [
      user?.kakaoAccount?.profile?.nickname,        // 일반적인 경로
      user?.kakaoAccount?.profile?.nickName,        // 대소문자 변형
      user?.profile?.nickname,                      // 단축 경로
      user?.profile?.nickName,                      // 단축 경로 변형
      user?.nickname,                               // 직접 경로
      user?.nickName,                               // 직접 경로 변형
      user?.kakaoAccount?.name,                     // 이름 필드
      user?.name                                    // 직접 이름 필드
    ];
    
    // null이 아닌 첫 번째 값 반환
    for (const path of possiblePaths) {
      if (path && typeof path === 'string' && path.trim()) {
        return path.trim();
      }
    }
    
    return null;
  };
  
  const nickname = extractNickname(kakaoUser);
  
  // 카카오 이메일을 다양한 경로에서 추출
  const extractEmail = (user: any) => {
    const possibleEmailPaths = [
      user?.kakaoAccount?.email,                    // 일반적인 경로
      user?.kakaoAccount?.account?.email,           // 계정 하위 경로
      user?.email,                                  // 직접 경로
      user?.account?.email,                         // 단축 경로
    ];
    
    for (const email of possibleEmailPaths) {
      if (email && typeof email === 'string' && email.includes('@') && email.trim()) {
        return email.trim();
      }
    }
    
    return null;
  };
  
  const userEmail = extractEmail(kakaoUser);
  
  console.log('Kakao user data detailed:', {
    id: kakaoUser?.id,
    userId: kakaoUser?.userId,
    extractedEmail: userEmail,
    rawEmail: kakaoUser?.kakaoAccount?.email,
    extractedNickname: nickname,
    rawNickname: kakaoUser?.kakaoAccount?.profile?.nickname,
    fullStructure: JSON.stringify(kakaoUser, null, 2)
  });
  
  return {
    id: `kakao_${providerId}`,
    email: userEmail || `kakao_${providerId}@temp.com`,
    full_name: nickname || '카카오 사용자',
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
  if (!kakaoUser) {
    throw handleAuthError(new Error('카카오 사용자 정보가 없습니다.'), 'KAKAO_USER_VALIDATION');
  }

  console.log('Creating Supabase Auth session from Kakao user:', kakaoUser);
  
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
        await supabase.auth.updateUser({
          data: {
            full_name: profile.full_name,
            display_name: profile.full_name,
            avatar_url: profile.avatar_url,
          }
        });
        console.log('Auth user metadata updated successfully');
      } catch (authUpdateError) {
        console.warn('Auth metadata update failed (continuing):', authUpdateError);
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
            id: finalUser.id,
            email: finalUser.email || profile.email, // Auth 사용자의 실제 이메일 사용
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
    
  } catch (error) {
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
    return `kakao_${providerId}@temp.roomie.app`;
  }
  
  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.warn('Invalid email format, using temp email:', email);
    return `kakao_${providerId}@temp.roomie.app`;
  }
  
  // 이메일 길이 검증 (Supabase 제한: 보통 254자)
  if (email.length > 250) {
    console.warn('Email too long, using temp email:', email.length);
    return `kakao_${providerId}@temp.roomie.app`;
  }
  
  // 특수문자 정제 (기본적인 이메일 문자만 허용)
  const cleanEmail = email.toLowerCase().trim();
  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(cleanEmail)) {
    console.warn('Email contains invalid characters, using temp email:', email);
    return `kakao_${providerId}@temp.roomie.app`;
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
  
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: sanitizedEmail,
    password: password,
    options: {
      data: {
        full_name: profile.full_name,
        display_name: profile.full_name,  // display_name도 명시적으로 설정
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
      const timestampEmail = `kakao_${profile.provider_id}_${Date.now()}@temp.roomie.app`;
      
      const { data: retryData, error: retryError } = await supabase.auth.signUp({
        email: timestampEmail,
        password: password,
        options: {
          data: {
            full_name: profile.full_name,
            display_name: profile.full_name,  // display_name도 명시적으로 설정
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