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

// 카카오 로그인 결과를 Supabase 세션으로 변환
export const createSupabaseSessionFromKakao = async (kakaoUser: any) => {
  // 입력 데이터 검증
  if (!kakaoUser) {
    throw new Error('카카오 사용자 정보가 없습니다.');
  }

  console.log('Processing Kakao user:', kakaoUser);
  
  const profile = mapKakaoUserToProfile(kakaoUser);
  
  console.log('Generated profile:', profile);
  
  try {
    // 프로필이 존재하는지 확인
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('provider_id', profile.provider_id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching profile:', fetchError)
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
        console.error('Error creating profile:', insertError)
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
    throw error;
  }
}