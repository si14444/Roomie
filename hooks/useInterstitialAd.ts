import { useEffect, useState, useCallback } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdConfig, AdFrequency, AdEnabled } from '@/constants/AdConfig';

const STORAGE_KEY = 'interstitial_ad_data';

interface AdData {
  actionCount: number;
  lastAdTime: number;
}

/**
 * 전면 광고 관리 훅
 *
 * 사용 타이밍:
 * - 공과금 추가 완료 후
 * - 물품 구매 요청 완료 후
 * - 루틴 완료 후 (3개 이상)
 * - 투표 참여 후
 * - 피드백 제출 후
 *
 * 조건:
 * - 최소 5회 액션 후
 * - 마지막 광고 후 3분 이상 경과
 */
export function useInterstitialAd() {
  const [loaded, setLoaded] = useState(false);
  const [actionCount, setActionCount] = useState(0);
  const [lastAdTime, setLastAdTime] = useState(0);
  const [interstitial, setInterstitial] = useState<InterstitialAd | null>(null);

  // 광고 초기화
  useEffect(() => {
    if (!AdEnabled.interstitial || !AdConfig.interstitial) {
      console.log('[useInterstitialAd] Interstitial ads are disabled');
      return;
    }

    const ad = InterstitialAd.createForAdRequest(AdConfig.interstitial, {
      requestNonPersonalizedAdsOnly: false,
    });

    setInterstitial(ad);

    // 광고 로드 완료
    const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      console.log('[useInterstitialAd] Ad loaded successfully');
      setLoaded(true);
    });

    // 광고 표시 완료
    const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('[useInterstitialAd] Ad closed, resetting counters');
      setLoaded(false);
      setActionCount(0);
      setLastAdTime(Date.now());
      saveAdData(0, Date.now());

      // 다음 광고 미리 로드
      ad.load();
    });

    // 광고 로드 실패
    const unsubscribeError = ad.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.error('[useInterstitialAd] Ad failed to load:', error);
        setLoaded(false);
      }
    );

    // 초기 로드
    ad.load();
    loadAdData();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, []);

  // 저장된 데이터 로드
  const loadAdData = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const { actionCount: count, lastAdTime: lastTime }: AdData = JSON.parse(data);
        setActionCount(count || 0);
        setLastAdTime(lastTime || 0);
        console.log('[useInterstitialAd] Loaded data:', { count, lastTime });
      }
    } catch (error) {
      console.error('[useInterstitialAd] Failed to load data:', error);
    }
  };

  // 데이터 저장
  const saveAdData = async (count: number, lastTime: number) => {
    try {
      const data: AdData = {
        actionCount: count,
        lastAdTime: lastTime,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('[useInterstitialAd] Saved data:', data);
    } catch (error) {
      console.error('[useInterstitialAd] Failed to save data:', error);
    }
  };

  // 액션 카운트 증가
  const incrementAction = useCallback(async () => {
    const newCount = actionCount + 1;
    setActionCount(newCount);
    await saveAdData(newCount, lastAdTime);
    console.log('[useInterstitialAd] Action incremented:', newCount);
  }, [actionCount, lastAdTime]);

  // 광고 표시 조건 확인
  const shouldShowAd = useCallback((): boolean => {
    if (!AdEnabled.interstitial || !loaded) {
      return false;
    }

    const timeSinceLast = Date.now() - lastAdTime;
    const meetsActionRequirement = actionCount >= AdFrequency.interstitial.minActions;
    const meetsTimeRequirement = timeSinceLast >= AdFrequency.interstitial.minInterval;

    console.log('[useInterstitialAd] Should show ad check:', {
      loaded,
      actionCount,
      timeSinceLast: Math.floor(timeSinceLast / 1000) + 's',
      meetsActionRequirement,
      meetsTimeRequirement,
    });

    return meetsActionRequirement && meetsTimeRequirement;
  }, [loaded, actionCount, lastAdTime]);

  // 광고 표시
  const showAd = useCallback(async (): Promise<boolean> => {
    if (!interstitial) {
      console.log('[useInterstitialAd] Interstitial ad not initialized');
      return false;
    }

    if (!shouldShowAd()) {
      console.log('[useInterstitialAd] Conditions not met for showing ad');
      return false;
    }

    try {
      console.log('[useInterstitialAd] Showing interstitial ad');
      await interstitial.show();
      return true;
    } catch (error) {
      console.error('[useInterstitialAd] Failed to show ad:', error);
      setLoaded(false);

      // 다시 로드 시도
      interstitial.load();
      return false;
    }
  }, [interstitial, shouldShowAd]);

  return {
    loaded,
    actionCount,
    incrementAction,
    shouldShowAd,
    showAd,
  };
}
