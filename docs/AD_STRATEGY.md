# 광고 배치 전략 가이드

Roomie 앱의 광고 수익화 전략 및 구현 가이드

## 목차
- [광고 플랫폼 선택](#광고-플랫폼-선택)
- [광고 유형별 특징](#광고-유형별-특징)
- [배치 전략](#배치-전략)
- [단계별 구현 로드맵](#단계별-구현-로드맵)
- [수익 예상](#수익-예상)
- [사용자 경험 최적화](#사용자-경험-최적화)
- [구현 가이드](#구현-가이드)

---

## 광고 플랫폼 선택

### 🥇 Google AdMob (강력 추천)

**선택 이유:**
- ✅ 가장 큰 광고 네트워크 (전 세계 광고주)
- ✅ 한국 광고주 많음 (높은 CPM)
- ✅ Firebase와 완벽한 통합
- ✅ 다양한 광고 형식 지원
- ✅ 상세한 분석 대시보드
- ✅ React Native 공식 지원

**대안:**
- **Facebook Audience Network**: AdMob과 함께 사용 (Mediation)
- **IronSource**: 여러 광고 네트워크 통합 관리

---

## 광고 유형별 특징

### 1. 배너 광고 (Banner Ads)

**특징:**
```
위치: 화면 상단 또는 하단에 고정
크기: 320x50 (기본), 320x100 (대형), Adaptive
지속성: 화면에 계속 표시
```

**장점:**
- 💰 안정적인 수익 (지속적 노출)
- 👍 사용자 방해 최소화
- 🔄 자동 새로고침 (30-60초)

**단점:**
- 💵 낮은 CPM ($0.5-2)
- 📱 화면 공간 차지

**최적 배치:**
- ✅ 홈 화면 하단
- ✅ 리스트 화면 하단 (공과금, 물품)
- ❌ 채팅 화면 (사용자 경험 저해)

**예상 수익:**
- DAU 100명 기준: 월 $30-60 (3-6만원)
- DAU 500명 기준: 월 $150-300 (15-30만원)

---

### 2. 전면 광고 (Interstitial Ads)

**특징:**
```
위치: 전체 화면 차지
타이밍: 화면 전환 시, 작업 완료 후
지속성: 5초 후 건너뛰기 가능
```

**장점:**
- 💰 높은 CPM ($3-8)
- 👀 높은 가시성
- 🎯 전환율 높음

**단점:**
- 😤 사용자 불편 (과도하면 이탈)
- ⏱️ 앱 사용 흐름 방해

**최적 배치 타이밍:**
```typescript
// ✅ 좋은 타이밍
- 공과금 추가 완료 후
- 물품 구매 요청 완료 후
- 루틴 완료 후
- 투표 참여 후

// ❌ 나쁜 타이밍
- 앱 시작 시
- 채팅 작성 중
- 긴급 작업 중
```

**노출 빈도 제어:**
```
권장: 5-10회 액션당 1회 전면 광고
최소 간격: 마지막 전면 광고 후 3분 이상
```

**예상 수익:**
- 일 전면 광고 노출 100회: 월 $90-240 (10-25만원)
- 일 전면 광고 노출 300회: 월 $270-720 (30-75만원)

---

### 3. 보상형 광고 (Rewarded Ads)

**특징:**
```
위치: 사용자 선택으로 시청
보상: 프리미엄 기능 임시 사용
지속성: 15-30초 시청 필수 (건너뛰기 불가)
```

**장점:**
- 💰 최고 CPM ($10-20)
- 😊 사용자 만족도 높음 (선택적)
- 🎁 프리미엄 전환 유도

**단점:**
- 📊 노출 수 낮음 (자발적 시청)
- 🎨 UI 설계 필요

**보상 아이디어:**

| 보상 | 제공 혜택 | 지속 시간 |
|------|----------|----------|
| 📊 고급 통계 보기 | 월별 지출 분석, 그래프 | 24시간 |
| 📅 과거 데이터 | 3개월 전 데이터 조회 | 1회성 |
| 🎨 테마 변경 | 다크모드, 커스텀 색상 | 24시간 |
| 📤 데이터 내보내기 | Excel, PDF 다운로드 | 1회성 |
| 🔔 알림 우선순위 | 중요 알림 우선 표시 | 7일 |

**구현 예시:**
```typescript
// PremiumFeatureButton.tsx
<TouchableOpacity onPress={showRewardedAd}>
  <Text>📊 고급 통계 보기</Text>
  <Text style={styles.watchAdText}>
    광고 시청하고 24시간 무료 사용
  </Text>
</TouchableOpacity>
```

**예상 수익:**
- 일 보상형 시청 20회: 월 $120-240 (13-25만원)
- 일 보상형 시청 50회: 월 $300-600 (33-65만원)

---

### 4. 네이티브 광고 (Native Ads)

**특징:**
```
위치: 콘텐츠 리스트 내 자연스럽게 통합
형태: 일반 콘텐츠와 유사한 디자인
```

**장점:**
- 👀 높은 클릭률 (자연스러움)
- 💰 중간 CPM ($2-5)
- 🎨 커스텀 디자인 가능

**단점:**
- 🔨 구현 복잡도 높음
- 📱 광고 표시 명시 필요 (법적 요구사항)

**최적 배치:**
```
공과금 리스트: 3-5개 항목마다 1개 광고
물품 리스트: 5-7개 항목마다 1개 광고
최근 활동: 4-6개 항목마다 1개 광고
```

**예상 수익:**
- 일 네이티브 노출 200회: 월 $120-300 (13-33만원)

---

## 배치 전략

### 무료 사용자 광고 배치

```
┌─────────────────────────────────┐
│ 📱 홈 (Home)                     │
│  - 오늘의 할 일                   │
│  - 최근 활동                      │
│  - 빠른 액션                      │
│  └─ [배너 광고] ← 하단 고정       │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 💰 공과금 (Bills)                │
│  - 공과금 카드 1                  │
│  - 공과금 카드 2                  │
│  - 공과금 카드 3                  │
│  - [네이티브 광고] ← 3개마다      │
│  - 공과금 카드 4                  │
│  └─ [배너 광고] ← 하단 고정       │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 📦 물품 (Items)                  │
│  - 물품 카드 1                    │
│  - 물품 카드 2                    │
│  - 구매 요청 1                    │
│  - [네이티브 광고] ← 5개마다      │
│  └─ [배너 광고] ← 하단 고정       │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 💬 채팅 (Chat)                   │
│  - 메시지 리스트                  │
│  - 투표                          │
│  └─ ❌ 광고 없음 (UX 중요)        │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ ✅ 루틴 (Routines)               │
│  - 루틴 카드 1                    │
│  - 루틴 카드 2                    │
│  └─ [배너 광고] ← 하단 고정       │
└─────────────────────────────────┘
```

### 전면 광고 트리거 이벤트

```typescript
// 광고 노출 조건
const shouldShowInterstitial = () => {
  const actionCount = getActionCount(); // 마지막 광고 이후 액션 수
  const timeSinceLastAd = getTimeSinceLastAd(); // 마지막 광고 이후 경과 시간

  return (
    actionCount >= 5 && // 최소 5회 액션
    timeSinceLastAd >= 180000 // 최소 3분 경과
  );
};

// 광고 표시 시점
✅ 공과금 추가 완료 후
✅ 물품 구매 요청 완료 후
✅ 루틴 완료 후 (3개 이상 완료 시)
✅ 투표 참여 후
✅ 피드백 제출 후

❌ 앱 시작 직후
❌ 오류 발생 후
❌ 채팅 작성 중
❌ 결제 진행 중
```

### 보상형 광고 배치

```
설정 화면:
┌─────────────────────────────────┐
│ ⚙️ 설정                          │
│                                  │
│ 📊 프리미엄 기능                  │
│  ┌──────────────────────────┐   │
│  │ 📈 고급 통계                │   │
│  │ 광고 보고 24시간 사용       │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │ 🎨 테마 변경                │   │
│  │ 광고 보고 24시간 사용       │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │ 📤 데이터 내보내기          │   │
│  │ 광고 보고 1회 사용          │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘

통계 화면 (잠금):
┌─────────────────────────────────┐
│ 📊 통계 (프리미엄)                │
│                                  │
│  🔒 프리미엄 기능입니다            │
│                                  │
│  [광고 보고 24시간 사용하기]       │
│  또는                             │
│  [월 3,000원 구독하기]            │
└─────────────────────────────────┘
```

---

## 단계별 구현 로드맵

### Phase 1: 배너 광고 (Week 1-2)

**목표:** 안정적인 기본 수익 구조 확립

**구현:**
1. ✅ AdMob 계정 생성 및 앱 등록
2. ✅ `react-native-google-mobile-ads` 설치
3. ✅ 배너 광고 컴포넌트 생성
4. ✅ 홈, 공과금, 물품 화면에 배너 추가
5. ✅ 테스트 광고로 검증

**예상 수익:** DAU 300명 기준 월 $90-180 (10-20만원)

**체크리스트:**
```
□ AdMob 계정 생성
□ Android 앱 ID 발급
□ iOS 앱 ID 발급
□ app.json 설정
□ AdBanner 컴포넌트 생성
□ 각 화면에 배너 추가
□ 테스트 광고 확인
□ 실제 광고 전환
□ 1주일 데이터 모니터링
```

---

### Phase 2: 전면 광고 (Week 3-4)

**목표:** 수익 2배 증대

**구현:**
1. ✅ 전면 광고 로직 구현
2. ✅ 액션 카운터 추가
3. ✅ 적절한 타이밍 선정
4. ✅ 사용자 피드백 수집

**예상 수익:** DAU 300명 기준 월 $270-420 (30-45만원)

**체크리스트:**
```
□ InterstitialAd 컴포넌트 생성
□ 광고 노출 로직 구현 (AsyncStorage)
□ 액션 카운터 추가
□ 타이밍 최적화
□ A/B 테스트 (5회 vs 7회 vs 10회)
□ 사용자 피드백 분석
□ 이탈률 모니터링
```

---

### Phase 3: 보상형 광고 (Week 5-6)

**목표:** 프리미엄 기능 도입 및 수익 다각화

**구현:**
1. ✅ 프리미엄 기능 정의
2. ✅ 보상형 광고 구현
3. ✅ 임시 권한 시스템
4. ✅ UI/UX 디자인

**예상 수익:** DAU 300명 기준 월 $420-660 (45-70만원)

**프리미엄 기능:**
```typescript
// 구현할 기능
1. 고급 통계 (차트, 월별 분석)
2. 과거 데이터 조회 (3개월+)
3. 테마 변경 (다크모드)
4. 데이터 내보내기 (Excel, PDF)
5. 알림 우선순위
```

**체크리스트:**
```
□ 프리미엄 기능 UI 구현
□ RewardedAd 컴포넌트 생성
□ 임시 권한 시스템 (AsyncStorage)
□ 권한 만료 타이머
□ 프리미엄 화면 디자인
□ 보상 안내 모달
□ 시청 완료 처리
□ 전환율 추적
```

---

### Phase 4: 유료 구독 (Week 7-8)

**목표:** 광고 제거 옵션 제공 및 추가 수익

**구현:**
1. ✅ In-App Purchase 설정
2. ✅ 구독 플랜 디자인
3. ✅ 광고 제거 로직
4. ✅ 복원 기능

**구독 플랜:**
```
🌟 프리미엄 (월 3,000원)
- ✅ 모든 광고 제거
- ✅ 고급 통계 무제한
- ✅ 과거 데이터 무제한
- ✅ 모든 테마 사용
- ✅ 데이터 내보내기 무제한
- ✅ 우선 고객 지원

💎 프리미엄 플러스 (월 5,000원)
- ✅ 프리미엄 모든 기능
- ✅ AI 지출 분석
- ✅ 자동 공과금 입력
- ✅ 맞춤형 추천
```

**예상 수익:**
```
MAU 1,000명 기준
- 전환율 2%: 20명 구독 = 월 60,000원
- 전환율 5%: 50명 구독 = 월 150,000원
- 광고 수익: 월 450,000원
- 총 수익: 월 510,000-600,000원
```

**체크리스트:**
```
□ Google Play In-App Products 설정
□ App Store Connect 구독 설정
□ react-native-iap 설치
□ 구독 화면 UI
□ 구매 플로우 구현
□ 영수증 검증
□ 구독 복원 기능
□ 광고 제거 로직
□ 구독 상태 동기화
```

---

## 수익 예상

### 시나리오별 월 수익 (DAU 300명 기준)

#### 시나리오 1: 배너만
```
배너 노출: 90,000회/월
CPM: $1 (평균)
수익: $90 (약 10만원)
```

#### 시나리오 2: 배너 + 전면
```
배너 노출: 90,000회/월
배너 수익: $90

전면 노출: 9,000회/월 (DAU당 1회)
CPM: $5 (평균)
전면 수익: $45

총 수익: $135 (약 15만원)
```

#### 시나리오 3: 배너 + 전면 (최적화)
```
배너 노출: 90,000회/월
배너 수익: $90

전면 노출: 18,000회/월 (DAU당 2회)
CPM: $5 (평균)
전면 수익: $90

총 수익: $180 (약 20만원)
```

#### 시나리오 4: 배너 + 전면 + 보상형
```
배너 수익: $90
전면 수익: $90

보상형 시청: 3,000회/월 (DAU당 0.3회)
CPM: $15 (평균)
보상형 수익: $45

총 수익: $225 (약 25만원)
```

#### 시나리오 5: 풀 패키지 + 구독
```
광고 수익: $225

구독 (2% 전환):
- 구독자: 20명
- 월 구독료: 3,000원
- 구독 수익: 60,000원 ($55)

총 수익: $280 (약 31만원)
```

### 성장 시나리오 (6개월)

| 월 | DAU | 광고 수익 | 구독 수익 | 총 수익 |
|----|-----|----------|----------|---------|
| 1월 | 100 | $75 | $0 | $75 (8만원) |
| 2월 | 200 | $150 | $18 | $168 (18만원) |
| 3월 | 300 | $225 | $55 | $280 (31만원) |
| 4월 | 500 | $375 | $110 | $485 (53만원) |
| 5월 | 800 | $600 | $220 | $820 (90만원) |
| 6월 | 1,200 | $900 | $385 | $1,285 (141만원) |

---

## 사용자 경험 최적화

### 광고 피로도 관리

**문제:** 과도한 광고 → 사용자 이탈

**해결책:**

1. **빈도 제한 (Frequency Capping)**
```typescript
const AD_FREQUENCY = {
  INTERSTITIAL_MIN_INTERVAL: 180000, // 3분
  INTERSTITIAL_MIN_ACTIONS: 5, // 5회 액션
  BANNER_REFRESH: 60000, // 60초
  REWARDED_COOLDOWN: 3600000, // 1시간
};
```

2. **스마트 타이밍**
```typescript
// ✅ 좋은 타이밍
- 작업 완료 후 (성취감 + 자연스러운 휴식)
- 화면 전환 시 (컨텍스트 전환점)
- 세션 종료 전 (앱 나가기 전)

// ❌ 나쁜 타이밍
- 앱 시작 직후 (첫인상 나쁨)
- 작업 진행 중 (흐름 방해)
- 오류 후 (부정적 경험 강화)
```

3. **사용자 세그먼트별 전략**
```typescript
// 신규 사용자 (첫 7일)
- 배너만 표시
- 전면 광고 없음
- 보상형 적극 권장

// 활성 사용자 (7일+)
- 배너 + 전면
- 전면 빈도 낮게
- 보상형 제공

// 파워 유저 (30일+, 높은 활동)
- 구독 권장
- 전면 광고 줄이기
- 보상형 프리미엄 기능 강조
```

### 광고 로딩 UX

**문제:** 광고 로딩 실패 시 빈 공간

**해결책:**
```typescript
// AdBanner.tsx
const [adLoaded, setAdLoaded] = useState(false);
const [adError, setAdError] = useState(false);

return (
  <View style={styles.adContainer}>
    {!adLoaded && !adError && (
      <ActivityIndicator /> // 로딩 인디케이터
    )}

    <BannerAd
      onAdLoaded={() => setAdLoaded(true)}
      onAdFailedToLoad={() => setAdError(true)}
    />

    {adError && (
      <View style={styles.adPlaceholder}>
        {/* 빈 공간 또는 대체 콘텐츠 */}
      </View>
    )}
  </View>
);
```

### 광고 없는 경험 유지

**중요 원칙:**
```
채팅 화면: 광고 없음
긴급 작업 중: 광고 없음
결제 진행 중: 광고 없음
오류 발생 후: 광고 없음
```

---

## 구현 가이드

### 1. AdMob 설정

**1단계: AdMob 계정 생성**
1. https://admob.google.com 방문
2. Google 계정으로 로그인
3. "시작하기" 클릭
4. 국가, 시간대 설정

**2단계: 앱 등록**
```
1. "앱" → "앱 추가" 클릭
2. 플랫폼 선택 (Android/iOS)
3. 앱 이름: "Roomie"
4. 앱 ID 복사 저장
   - Android: ca-app-pub-xxxxx~xxxxx
   - iOS: ca-app-pub-xxxxx~xxxxx
```

**3단계: 광고 단위 생성**
```
배너 광고:
- 형식: 배너
- 이름: "홈_배너", "공과금_배너", "물품_배너"
- 광고 단위 ID 복사

전면 광고:
- 형식: 전면 광고
- 이름: "작업_완료_전면"
- 광고 단위 ID 복사

보상형 광고:
- 형식: 보상형
- 이름: "프리미엄_보상형"
- 보상: 프리미엄_접근, 1개
- 광고 단위 ID 복사
```

### 2. 프로젝트 설정

**패키지 설치:**
```bash
npx expo install react-native-google-mobile-ads
```

**app.json 설정:**
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-xxxxx~xxxxx",
          "iosAppId": "ca-app-pub-xxxxx~xxxxx",
          "userTrackingPermission": "이 앱은 더 나은 광고 경험을 제공하기 위해 데이터를 사용합니다."
        }
      ]
    ]
  }
}
```

**Development Build 생성:**
```bash
# Expo Go는 AdMob을 지원하지 않음
npx expo prebuild
npx expo run:ios
npx expo run:android
```

### 3. 광고 컴포넌트 구현

**components/ads/AdBanner.tsx:**
```typescript
import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import Colors from '@/constants/Colors';

interface AdBannerProps {
  position?: 'top' | 'bottom';
}

export function AdBanner({ position = 'bottom' }: AdBannerProps) {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  // 개발 중에는 테스트 ID 사용
  const adUnitId = __DEV__
    ? TestIds.BANNER
    : 'ca-app-pub-xxxxx/xxxxx'; // 실제 광고 단위 ID

  if (adError) {
    return null; // 광고 로드 실패 시 숨김
  }

  return (
    <View style={[
      styles.container,
      position === 'top' ? styles.top : styles.bottom
    ]}>
      {!adLoaded && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.light.mutedText} />
        </View>
      )}

      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => setAdLoaded(true)}
        onAdFailedToLoad={(error) => {
          console.error('Banner ad failed to load:', error);
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
```

**components/ads/AdInterstitial.tsx:**
```typescript
import { useEffect, useState } from 'react';
import { InterstitialAd, TestIds, AdEventType } from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';

const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-xxxxx/xxxxx';

const interstitial = InterstitialAd.createForAdRequest(adUnitId);

const AD_CONFIG = {
  MIN_ACTIONS: 5, // 최소 액션 수
  MIN_INTERVAL: 180000, // 최소 간격 (3분)
};

export function useInterstitialAd() {
  const [loaded, setLoaded] = useState(false);
  const [actionCount, setActionCount] = useState(0);
  const [lastAdTime, setLastAdTime] = useState(0);

  useEffect(() => {
    // 광고 로드
    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => setLoaded(true)
    );

    // 광고 표시 완료
    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setLoaded(false);
        interstitial.load(); // 다음 광고 로드
        setActionCount(0);
        setLastAdTime(Date.now());
        saveAdData(0, Date.now());
      }
    );

    // 초기 로드
    interstitial.load();
    loadAdData();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);

  const loadAdData = async () => {
    const data = await AsyncStorage.getItem('interstitial_ad_data');
    if (data) {
      const { count, lastTime } = JSON.parse(data);
      setActionCount(count || 0);
      setLastAdTime(lastTime || 0);
    }
  };

  const saveAdData = async (count: number, lastTime: number) => {
    await AsyncStorage.setItem(
      'interstitial_ad_data',
      JSON.stringify({ count, lastTime })
    );
  };

  const incrementAction = async () => {
    const newCount = actionCount + 1;
    setActionCount(newCount);
    await saveAdData(newCount, lastAdTime);
  };

  const shouldShowAd = () => {
    const timeSinceLast = Date.now() - lastAdTime;
    return (
      loaded &&
      actionCount >= AD_CONFIG.MIN_ACTIONS &&
      timeSinceLast >= AD_CONFIG.MIN_INTERVAL
    );
  };

  const showAd = async () => {
    if (shouldShowAd()) {
      try {
        await interstitial.show();
      } catch (error) {
        console.error('Failed to show interstitial ad:', error);
        setLoaded(false);
        interstitial.load();
      }
    }
  };

  return {
    showAd,
    incrementAction,
    shouldShowAd,
  };
}
```

**components/ads/AdRewarded.tsx:**
```typescript
import { useEffect, useState } from 'react';
import { RewardedAd, TestIds, RewardedAdEventType } from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';

const adUnitId = __DEV__
  ? TestIds.REWARDED
  : 'ca-app-pub-xxxxx/xxxxx';

const rewarded = RewardedAd.createForAdRequest(adUnitId);

export function useRewardedAd() {
  const [loaded, setLoaded] = useState(false);
  const [earning, setEarning] = useState(false);

  useEffect(() => {
    const unsubscribeLoaded = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => setLoaded(true)
    );

    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      reward => {
        console.log('User earned reward:', reward);
        setEarning(true);
      }
    );

    const unsubscribeClosed = rewarded.addAdEventListener(
      RewardedAdEventType.CLOSED,
      () => {
        setLoaded(false);
        rewarded.load();
      }
    );

    rewarded.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
    };
  }, []);

  const showAd = async (onReward: () => void) => {
    if (loaded) {
      try {
        await rewarded.show();
        if (earning) {
          onReward();
          setEarning(false);
        }
      } catch (error) {
        console.error('Failed to show rewarded ad:', error);
      }
    }
  };

  return {
    loaded,
    showAd,
  };
}

// 프리미엄 기능 임시 권한 관리
export const grantPremiumAccess = async (
  feature: string,
  duration: number = 86400000 // 24시간
) => {
  const expiryTime = Date.now() + duration;
  await AsyncStorage.setItem(
    `premium_${feature}`,
    expiryTime.toString()
  );
};

export const hasPremiumAccess = async (feature: string): Promise<boolean> => {
  const expiryTime = await AsyncStorage.getItem(`premium_${feature}`);
  if (!expiryTime) return false;
  return Date.now() < parseInt(expiryTime);
};
```

### 4. 화면별 적용

**app/(tabs)/index.tsx (홈 화면):**
```typescript
import { AdBanner } from '@/components/ads/AdBanner';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* 기존 콘텐츠 */}
      </ScrollView>

      <AdBanner position="bottom" />
    </SafeAreaView>
  );
}
```

**app/(tabs)/bills.tsx (공과금 화면):**
```typescript
import { AdBanner } from '@/components/ads/AdBanner';
import { useInterstitialAd } from '@/components/ads/AdInterstitial';

export default function BillsScreen() {
  const { showAd, incrementAction } = useInterstitialAd();

  const handleAddBill = async (bill: NewBill) => {
    await addBill(bill);

    // 액션 카운트 증가
    await incrementAction();

    // 조건 충족 시 전면 광고 표시
    showAd();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* 공과금 리스트 */}
      </ScrollView>

      <AdBanner position="bottom" />
    </SafeAreaView>
  );
}
```

**components/settings/PremiumFeature.tsx:**
```typescript
import { useRewardedAd, grantPremiumAccess } from '@/components/ads/AdRewarded';

export function PremiumFeatureButton() {
  const { loaded, showAd } = useRewardedAd();

  const handleWatchAd = () => {
    showAd(async () => {
      // 보상 지급
      await grantPremiumAccess('advanced_stats', 86400000); // 24시간
      Alert.alert(
        '프리미엄 잠금 해제!',
        '고급 통계 기능을 24시간 동안 사용할 수 있습니다.'
      );
    });
  };

  return (
    <TouchableOpacity
      style={styles.premiumButton}
      onPress={handleWatchAd}
      disabled={!loaded}
    >
      <Ionicons name="stats-chart" size={24} color={Colors.light.primary} />
      <View style={styles.premiumInfo}>
        <Text style={styles.premiumTitle}>고급 통계 보기</Text>
        <Text style={styles.premiumSubtitle}>
          {loaded ? '광고 보고 24시간 무료 사용' : '광고 로딩 중...'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.light.mutedText} />
    </TouchableOpacity>
  );
}
```

---

## A/B 테스트 전략

### 테스트할 변수

1. **전면 광고 빈도**
   - A: 5회 액션당 1회
   - B: 7회 액션당 1회
   - C: 10회 액션당 1회
   - 측정: 이탈률, 세션 길이, 광고 수익

2. **배너 위치**
   - A: 상단
   - B: 하단
   - C: 없음 (컨트롤)
   - 측정: 클릭률, 사용자 만족도

3. **보상형 광고 보상**
   - A: 24시간 접근
   - B: 7일 접근
   - C: 영구 접근 (1회만)
   - 측정: 시청률, 구독 전환율

### 성공 지표

```
광고 수익: 목표 월 $300+ (33만원)
이탈률: <5%
세션당 광고 노출: 3-5회
보상형 시청률: >10%
구독 전환율: >2%
```

---

## 법적 고려사항

### 필수 준수사항

1. **개인정보 처리방침**
```
- AdMob의 데이터 수집 명시
- 광고 ID 사용 설명
- 맞춤 광고 옵트아웃 안내
```

2. **아동 보호 (COPPA)**
```
- 13세 미만 사용자 대상 아님 명시
- 연령 제한 설정
```

3. **유럽 GDPR**
```
- 동의 관리 플랫폼 (CMP) 사용
- 데이터 처리 동의 획득
```

4. **광고 표시 명시**
```
네이티브 광고: "광고" 또는 "Sponsored" 라벨 필수
```

---

## 모니터링 및 최적화

### 주간 체크리스트

```
□ 광고 노출 수 확인
□ 클릭률 (CTR) 분석
□ 수익 추이 확인
□ 이탈률 모니터링
□ 사용자 피드백 확인
□ A/B 테스트 결과 분석
□ 광고 로드 실패율 확인
```

### 최적화 전략

1. **저성과 광고 단위 교체**
2. **타이밍 조정**
3. **빈도 최적화**
4. **새로운 광고 형식 테스트**
5. **사용자 세그먼트별 전략 수립**

---

## 문의 및 지원

**AdMob 지원:**
- 문서: https://developers.google.com/admob
- 커뮤니티: https://groups.google.com/forum/#!forum/google-admob-ads-sdk

**React Native Google Mobile Ads:**
- GitHub: https://github.com/invertase/react-native-google-mobile-ads
- 문서: https://rnfirebase.io/

---

**마지막 업데이트:** 2025-01-07
**버전:** 1.0.0
