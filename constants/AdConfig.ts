import { Platform } from 'react-native';

/**
 * Google AdMob 광고 설정
 *
 * 테스트 모드 (__DEV__):
 * - Google 제공 테스트 광고 ID 사용
 * - 실제 광고 노출 없음
 * - 수익 발생 없음
 *
 * 프로덕션 모드:
 * - .env 파일의 실제 광고 단위 ID 사용
 * - AdMob 콘솔에서 발급받은 ID로 교체 필요
 *
 * AdMob 콘솔: https://apps.admob.com
 */

// Google AdMob 테스트 광고 단위 ID
// 개발 중에는 이 ID들이 자동으로 사용됨
export const TestAdUnitIds = {
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
  },
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    rewarded: 'ca-app-pub-3940256099942544/1712485313',
  },
};

/**
 * AdMob App ID
 * app.json의 plugins 설정에서 사용됨
 */
export const AdMobAppId = {
  android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID || '',
  ios: process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID || '',
};

/**
 * 광고 설정
 */
export const AdConfig = {
  /**
   * 앱 ID (app.json에서 사용)
   */
  appId: Platform.select({
    android: AdMobAppId.android,
    ios: AdMobAppId.ios,
  }),

  /**
   * 배너 광고 단위 ID
   * 사용 위치: 홈, 공과금, 물품, 루틴 화면 하단
   * .env에 실제 광고 ID가 있으면 사용, 없으면 테스트 ID 사용
   */
  banner: Platform.select({
    android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER || TestAdUnitIds.android.banner,
    ios: process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER || TestAdUnitIds.ios.banner,
  }),

  /**
   * 전면 광고 단위 ID
   * 사용 위치: 공과금 추가, 물품 요청, 루틴 완료 후
   * .env에 실제 광고 ID가 있으면 사용, 없으면 테스트 ID 사용
   */
  interstitial: Platform.select({
    android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL || TestAdUnitIds.android.interstitial,
    ios: process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL || TestAdUnitIds.ios.interstitial,
  }),

  /**
   * 보상형 광고 단위 ID
   * 사용 위치: 프리미엄 기능 잠금 해제
   * .env에 실제 광고 ID가 있으면 사용, 없으면 테스트 ID 사용
   */
  rewarded: Platform.select({
    android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED || TestAdUnitIds.android.rewarded,
    ios: process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED || TestAdUnitIds.ios.rewarded,
  }),
};

/**
 * 광고 노출 설정
 */
export const AdFrequency = {
  /**
   * 전면 광고 설정
   * 개발 모드: 테스트하기 쉽게 조건 완화
   * 프로덕션 모드: 사용자 경험을 위한 적절한 조건
   */
  interstitial: {
    minActions: __DEV__ ? 1 : 5, // 개발: 1회, 프로덕션: 5회
    minInterval: __DEV__ ? 10000 : 180000, // 개발: 10초, 프로덕션: 3분
  },

  /**
   * 배너 광고 설정
   */
  banner: {
    refreshInterval: 60000, // 새로고침 간격 (밀리초) - 60초
  },

  /**
   * 보상형 광고 설정
   */
  rewarded: {
    cooldown: 3600000, // 쿨다운 (밀리초) - 1시간
  },
};

/**
 * 프리미엄 기능 접근 기간 (밀리초)
 */
export const PremiumAccessDuration = {
  advanced_stats: 86400000, // 고급 통계: 24시간
  theme_change: 86400000, // 테마 변경: 24시간
  data_export: 0, // 데이터 내보내기: 1회성 (기간 없음)
  notification_priority: 604800000, // 알림 우선순위: 7일
};

/**
 * 광고 활성화 여부
 * 개발 중이나 특정 환경에서 광고를 끄고 싶을 때 사용
 */
export const AdEnabled = {
  banner: true,
  interstitial: true,
  rewarded: true,
};

export default AdConfig;
