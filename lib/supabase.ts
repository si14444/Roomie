import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

// TODO: 실제 Supabase 프로젝트 URL과 키로 교체해야 합니다
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project-ref.supabase.co'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// 카카오 사용자 정보를 Supabase 프로필에 매핑하는 헬퍼 함수
export const mapKakaoUserToProfile = (kakaoUser: any) => {
  // 카카오 사용자 ID 안전 처리
  const kakaoId = kakaoUser?.id || kakaoUser?.userId || Date.now().toString();
  const providerId = kakaoId ? kakaoId.toString() : Date.now().toString();
  
  console.log('Kakao user data:', {
    id: kakaoUser?.id,
    userId: kakaoUser?.userId,
    email: kakaoUser.kakaoAccount?.email,
    nickname: kakaoUser.kakaoAccount?.profile?.nickname
  });
  
  return {
    id: `kakao_${providerId}`,
    email: kakaoUser.kakaoAccount?.email || `kakao_${providerId}@temp.com`,
    full_name: kakaoUser.kakaoAccount?.profile?.nickname || '카카오 사용자',
    avatar_url: kakaoUser.kakaoAccount?.profile?.profileImageUrl || null,
    provider: 'kakao',
    provider_id: providerId,
  }
}

// 카카오 사용자를 Supabase Auth 사용자로 생성/로그인 (간소화된 버전)
export const signInWithKakaoUser = async (kakaoUser: any) => {
  if (!kakaoUser) {
    throw new Error('카카오 사용자 정보가 없습니다.');
  }

  console.log('Creating Supabase Auth session from Kakao user:', kakaoUser);
  
  const profile = mapKakaoUserToProfile(kakaoUser);
  
  try {
    // 1. 고유한 이메일 생성 (카카오 사용자 ID 기반)
    const uniqueEmail = profile.email.includes('@') ? profile.email : `kakao_${profile.provider_id}@temp.roomie.app`;
    
    // 2. 임시 비밀번호로 Supabase Auth 계정 생성/로그인
    const tempPassword = `KakaoUser_${profile.provider_id}_${Date.now()}`;
    
    console.log('Attempting to create Supabase user:', { email: uniqueEmail, providerId: profile.provider_id });
    
    // 3. 회원가입 시도 (이미 존재하면 에러 발생)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: uniqueEmail,
      password: tempPassword,
      options: {
        data: {
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          provider: profile.provider,
          provider_id: profile.provider_id,
        },
        emailRedirectTo: undefined, // 이메일 확인 스킵
      }
    });

    let finalUser = signUpData?.user;

    // 4. 이미 존재하는 사용자인 경우 로그인 시도
    if (signUpError && signUpError.message.includes('already registered')) {
      console.log('User already exists, attempting sign in');
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: uniqueEmail,
        password: tempPassword,
      });
      
      if (signInError) {
        // 비밀번호가 다를 수 있으므로 다른 방법 시도
        console.log('Password sign in failed, creating new account with different email');
        const timestampEmail = `kakao_${profile.provider_id}_${Date.now()}@temp.roomie.app`;
        
        const { data: newSignUpData, error: newSignUpError } = await supabase.auth.signUp({
          email: timestampEmail,
          password: tempPassword,
          options: {
            data: {
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
              provider: profile.provider,
              provider_id: profile.provider_id,
            }
          }
        });

        if (newSignUpError) {
          throw new Error(`Supabase 인증 실패: ${newSignUpError.message}`);
        }
        
        finalUser = newSignUpData.user;
      } else {
        finalUser = signInData.user;
      }
    } else if (signUpError) {
      throw new Error(`Supabase 회원가입 실패: ${signUpError.message}`);
    }

    if (!finalUser) {
      throw new Error('Supabase 사용자 생성에 실패했습니다.');
    }

    // 5. 프로필 정보 저장/업데이트 (database schema가 준비된 경우만)
    try {
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: finalUser.id,
          email: uniqueEmail,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          provider: profile.provider,
          provider_id: profile.provider_id,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (upsertError) {
        console.warn('Profile upsert warning (continuing anyway):', upsertError.message);
      }
    } catch (profileError) {
      console.warn('Profile creation failed (continuing anyway):', profileError);
    }

    console.log('Supabase Auth session created successfully:', {
      userId: finalUser.id,
      email: finalUser.email
    });

    return finalUser;
    
  } catch (error) {
    console.error('Supabase Auth session creation failed:', error);
    throw error;
  }
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