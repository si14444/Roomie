import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import Colors from '@/constants/Colors';
import { AdConfig, AdEnabled } from '@/constants/AdConfig';

interface AdBannerProps {
  position?: 'top' | 'bottom';
}

/**
 * 배너 광고 컴포넌트
 *
 * 사용 위치: 홈, 공과금, 물품, 루틴 화면 하단
 * 크기: Adaptive Banner (화면 너비에 맞춰 자동 조정)
 * 새로고침: 60초마다 자동
 */
export function AdBanner({ position = 'bottom' }: AdBannerProps) {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  // 광고가 비활성화되어 있거나 광고 단위 ID가 없으면 렌더링하지 않음
  if (!AdEnabled.banner || !AdConfig.banner) {
    return null;
  }

  // 광고 로드 실패 시 숨김
  if (adError) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        position === 'top' ? styles.top : styles.bottom
      ]}
    >
      {!adLoaded && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.light.mutedText} />
        </View>
      )}

      <BannerAd
        unitId={AdConfig.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          setAdLoaded(true);
          if (__DEV__) console.log('[AdBanner] Ad loaded successfully');
        }}
        onAdFailedToLoad={(error) => {
          if (__DEV__) console.error('[AdBanner] Failed to load:', error);
          setAdError(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    paddingVertical: 8,
  },
  top: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderColor,
  },
  bottom: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderColor,
  },
  loadingContainer: {
    height: 50,
    justifyContent: 'center',
  },
});
