# 광고 구현 현황

## ✅ 완료된 작업 (Phase 1: 배너 광고)

### 1. AdBanner 컴포넌트 생성
**파일**: `components/ads/AdBanner.tsx`

**특징**:
- Adaptive Banner 크기 (화면 너비에 자동 맞춤)
- 로딩 인디케이터 표시
- 광고 로드 실패 시 자동 숨김
- 개발/프로덕션 광고 ID 자동 전환
- 광고 활성화 토글 지원

### 2. 배너 광고 적용 화면

#### ✅ 홈 화면 (`app/(tabs)/index.tsx`)
- 위치: 화면 하단 고정
- ScrollView 아래에 배치

#### ✅ 공과금 화면 (`app/(tabs)/bills.tsx`)
- 위치: 화면 하단 고정
- ScrollView 아래에 배치

#### ✅ 물품 화면 (`app/(tabs)/items.tsx`)
- 위치: 화면 하단 고정
- ScrollView 아래에 배치

#### ✅ 루틴 화면 (`app/(tabs)/routines.tsx`)
- 위치: 화면 하단 고정
- ScrollView 아래에 배치

### 3. 기존 설정 파일
- ✅ `constants/AdConfig.ts`: 광고 설정 완료
- ✅ `app.json`: AdMob 플러그인 설정 완료
- ✅ 테스트 광고 ID 설정 완료

---

## ⏳ 다음 단계 (Phase 2-4)

### Phase 2: 전면 광고 (Interstitial Ads)
**예상 기간**: 1-2주

**구현할 컴포넌트**:
```typescript
// components/ads/AdInterstitial.tsx
export function useInterstitialAd() {
  // 광고 로드 및 표시 로직
  // 액션 카운터 관리
  // 최소 간격 체크
}
```

**적용할 타이밍**:
- ✅ 공과금 추가 완료 후
- ✅ 물품 구매 요청 완료 후
- ✅ 루틴 완료 후 (3개 이상)
- ✅ 투표 참여 후
- ✅ 피드백 제출 후

**설정**:
- 최소 액션 수: 5회
- 최소 간격: 3분
- AsyncStorage로 상태 관리

**예상 수익 증가**: 월 $90-180 (10-20만원)

---

### Phase 3: 보상형 광고 (Rewarded Ads)
**예상 기간**: 2-3주

**구현할 컴포넌트**:
```typescript
// components/ads/AdRewarded.tsx
export function useRewardedAd()

// components/premium/PremiumFeatureButton.tsx
// 프리미엄 기능 잠금 해제 UI
```

**프리미엄 기능 아이디어**:
1. 📊 고급 통계 (차트, 월별 분석) - 24시간
2. 📅 과거 데이터 조회 (3개월+) - 1회성
3. 🎨 테마 변경 (다크모드) - 24시간
4. 📤 데이터 내보내기 (Excel, PDF) - 1회성
5. 🔔 알림 우선순위 - 7일

**예상 수익 증가**: 월 $120-240 (13-25만원)

---

### Phase 4: 유료 구독 (In-App Purchase)
**예상 기간**: 2-3주

**구독 플랜**:

**🌟 프리미엄 (월 3,000원)**
- ✅ 모든 광고 제거
- ✅ 고급 통계 무제한
- ✅ 과거 데이터 무제한
- ✅ 모든 테마 사용
- ✅ 데이터 내보내기 무제한

**💎 프리미엄 플러스 (월 5,000원)**
- ✅ 프리미엄 모든 기능
- ✅ AI 지출 분석
- ✅ 자동 공과금 입력
- ✅ 맞춤형 추천

**구현 필요**:
- react-native-iap 설치
- Google Play In-App Products 설정
- App Store Connect 구독 설정
- 구매 플로우 구현
- 영수증 검증
- 구독 복원 기능

**예상 수익** (MAU 1,000명 기준):
- 전환율 2%: 월 60,000원
- 전환율 5%: 월 150,000원

---

## 🚀 빌드 및 배포 체크리스트

### 1. 개발 환경에서 테스트
```bash
# Development Build 생성 (Expo Go는 AdMob 미지원)
npx expo prebuild
npx expo run:ios
npx expo run:android
```

**테스트 항목**:
- [ ] 배너 광고가 모든 화면에 표시되는지 확인
- [ ] 광고 로드 실패 시 숨김 처리 확인
- [ ] 로딩 인디케이터 정상 작동 확인
- [ ] 화면 레이아웃이 깨지지 않는지 확인

### 2. 프로덕션 광고 ID 설정

**.env 파일 생성**:
```env
# Android
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-xxxxx~xxxxx
EXPO_PUBLIC_ADMOB_ANDROID_BANNER=ca-app-pub-xxxxx/xxxxx
EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL=ca-app-pub-xxxxx/xxxxx
EXPO_PUBLIC_ADMOB_ANDROID_REWARDED=ca-app-pub-xxxxx/xxxxx

# iOS
EXPO_PUBLIC_ADMOB_IOS_APP_ID=ca-app-pub-xxxxx~xxxxx
EXPO_PUBLIC_ADMOB_IOS_BANNER=ca-app-pub-xxxxx/xxxxx
EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL=ca-app-pub-xxxxx/xxxxx
EXPO_PUBLIC_ADMOB_IOS_REWARDED=ca-app-pub-xxxxx/xxxxx
```

### 3. AdMob 콘솔에서 광고 단위 생성

**Android**:
1. AdMob 콘솔 접속: https://apps.admob.com
2. "앱" → "앱 추가" → Android 선택
3. 앱 이름: "Roomie"
4. 광고 단위 생성:
   - 홈_배너
   - 공과금_배너
   - 물품_배너
   - 루틴_배너

**iOS**:
1. 같은 과정으로 iOS 앱 추가
2. 광고 단위 생성

### 4. 빌드 및 배포
```bash
# EAS Build로 프로덕션 빌드
eas build --platform android --profile production
eas build --platform ios --profile production

# 스토어 제출
eas submit --platform android
eas submit --platform ios
```

---

## 📊 예상 수익 (Phase 1 배너 광고만)

### DAU 300명 기준
- 배너 노출: 90,000회/월
- CPM: $1 (평균)
- **월 수익: $90 (약 10만원)**

### 성장 시나리오
| 월 | DAU | 배너 수익 | 비고 |
|----|-----|----------|------|
| 1월 | 100 | $30 | Phase 1 완료 |
| 2월 | 200 | $60 | 사용자 증가 |
| 3월 | 300 | $90 | Phase 2 준비 |
| 4월 | 500 | $150 | Phase 2 완료 (전면 광고) |
| 5월 | 800 | $240 | Phase 3 완료 (보상형) |
| 6월 | 1,200 | $360 | Phase 4 완료 (구독) |

---

## 🔧 트러블슈팅

### 광고가 표시되지 않는 경우

1. **Expo Go에서 테스트 중인 경우**
   - ❌ Expo Go는 AdMob을 지원하지 않습니다
   - ✅ Development Build를 사용하세요

2. **광고 ID가 잘못된 경우**
   - AdMob 콘솔에서 광고 단위 ID 확인
   - .env 파일 또는 app.json 설정 확인

3. **네트워크 문제**
   - 인터넷 연결 확인
   - 광고 서버 연결 상태 확인

4. **광고 제한 정책**
   - AdMob 정책 위반 여부 확인
   - 계정 상태 확인

---

## 📚 참고 자료

### AdMob
- 공식 문서: https://developers.google.com/admob
- 커뮤니티: https://groups.google.com/forum/#!forum/google-admob-ads-sdk

### React Native Google Mobile Ads
- GitHub: https://github.com/invertase/react-native-google-mobile-ads
- 공식 문서: https://docs.page/invertase/react-native-google-mobile-ads

### Expo
- AdMob 가이드: https://docs.expo.dev/versions/latest/sdk/admob/

---

**마지막 업데이트**: 2025-01-09
**버전**: 1.0.0 (Phase 1 완료)
