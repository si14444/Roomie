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
  return {
    id: `kakao_${kakaoUser.id}`,
    email: kakaoUser.kakaoAccount?.email || `kakao_${kakaoUser.id}@temp.com`,
    full_name: kakaoUser.kakaoAccount?.profile?.nickname || '카카오 사용자',
    avatar_url: kakaoUser.kakaoAccount?.profile?.profileImageUrl || null,
    provider: 'kakao',
    provider_id: kakaoUser.id.toString(),
  }
}

// 카카오 로그인 결과를 Supabase 세션으로 변환
export const createSupabaseSessionFromKakao = async (kakaoUser: any) => {
  const profile = mapKakaoUserToProfile(kakaoUser)
  
  // 프로필이 존재하는지 확인
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('provider_id', profile.provider_id)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching profile:', fetchError)
    throw fetchError
  }

  // 프로필이 없으면 생성
  if (!existingProfile) {
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
      throw insertError
    }
  } else {
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
      throw updateError
    }
  }

  return existingProfile || profile
}