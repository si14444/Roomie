# AdMob 설정 가이드

Google AdMob을 Roomie 앱에 연동하는 방법을 설명합니다.

## 1. AdMob 계정 및 앱 등록

### 1.1 AdMob 계정 생성
1. https://admob.google.com 방문
2. Google 계정으로 로그인
3. "시작하기" 클릭
4. 국가, 시간대, 통화 설정

### 1.2 앱 등록

**Android 앱 등록:**
1. AdMob 콘솔 → "앱" → "앱 추가"
2. 플랫폼: Android 선택
3. 앱 이름: `Roomie`
4. 패키지 이름: `com.si14444.Roomie` (app.json의 android.package와 동일)
5. **Android App ID 복사** (예: `ca-app-pub-xxxxx~xxxxx`)

**iOS 앱 등록:**
1. AdMob 콘솔 → "앱" → "앱 추가"
2. 플랫폼: iOS 선택
3. 앱 이름: `Roomie`
4. Bundle ID: `com.si14444.Roomie` (app.json의 ios.bundleIdentifier와 동일)
5. **iOS App ID 복사** (예: `ca-app-pub-xxxxx~xxxxx`)

## 2. 광고 단위 생성

각 플랫폼(Android/iOS)별로 3개씩, 총 6개의 광고 단위를 생성해야 합니다.

### 2.1 Android 광고 단위

**배너 광고:**
1. AdMob 콘솔 → Android 앱 선택 → "광고 단위" → "광고 단위 추가"
2. 형식: **배너** 선택
3. 광고 단위 이름: `Roomie_Banner_Android`
4. 광고 크기: **Adaptive banner** (권장)
5. "광고 단위 만들기" 클릭
6. **광고 단위 ID 복사** (예: `ca-app-pub-xxxxx/1111111111`)

**전면 광고:**
1. 형식: **전면 광고** 선택
2. 광고 단위 이름: `Roomie_Interstitial_Android`
3. "광고 단위 만들기" 클릭
4. **광고 단위 ID 복사** (예: `ca-app-pub-xxxxx/2222222222`)

**보상형 광고:**
1. 형식: **보상형** 선택
2. 광고 단위 이름: `Roomie_Rewarded_Android`
3. 보상 유형: `premium_access`
4. 보상 수량: `1`
5. "광고 단위 만들기" 클릭
6. **광고 단위 ID 복사** (예: `ca-app-pub-xxxxx/3333333333`)

### 2.2 iOS 광고 단위

Android와 동일한 과정을 iOS 앱에서 반복:
- `Roomie_Banner_iOS`
- `Roomie_Interstitial_iOS`
- `Roomie_Rewarded_iOS`

## 3. 환경 변수 설정

### 3.1 .env 파일 업데이트

`.env` 파일을 열고 AdMob 관련 값을 교체:

```bash
# AdMob App IDs (위에서 복사한 App ID로 교체)
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-xxxxx~xxxxx
EXPO_PUBLIC_ADMOB_IOS_APP_ID=ca-app-pub-xxxxx~xxxxx

# Android Ad Unit IDs (위에서 복사한 광고 단위 ID로 교체)
EXPO_PUBLIC_ADMOB_ANDROID_BANNER=ca-app-pub-xxxxx/1111111111
EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL=ca-app-pub-xxxxx/2222222222
EXPO_PUBLIC_ADMOB_ANDROID_REWARDED=ca-app-pub-xxxxx/3333333333

# iOS Ad Unit IDs (위에서 복사한 광고 단위 ID로 교체)
EXPO_PUBLIC_ADMOB_IOS_BANNER=ca-app-pub-xxxxx/4444444444
EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL=ca-app-pub-xxxxx/5555555555
EXPO_PUBLIC_ADMOB_IOS_REWARDED=ca-app-pub-xxxxx/6666666666
```

### 3.2 app.json 업데이트

`app.json`의 `admob` 섹션에 App ID 입력:

```json
{
  "expo": {
    "admob": {
      "androidAppId": "ca-app-pub-xxxxx~xxxxx",
      "iosAppId": "ca-app-pub-xxxxx~xxxxx",
      "userTrackingPermission": "이 앱은 더 나은 광고 경험을 제공하기 위해 데이터를 사용합니다."
    }
  }
}
```

## 4. AdMob SDK 설치

```bash
# react-native-google-mobile-ads 설치
npx expo install react-native-google-mobile-ads

# Development Build 생성 (필수!)
# Expo Go는 AdMob을 지원하지 않습니다
npx expo prebuild

# iOS 실행
npx expo run:ios

# Android 실행
npx expo run:android
```

## 5. 테스트

### 5.1 개발 중 테스트 광고

개발 모드(`__DEV__`)에서는 자동으로 Google 테스트 광고가 표시됩니다.
- 실제 수익 발생 없음
- 계정 정지 위험 없음
- 광고 노출/클릭 테스트 가능

### 5.2 실제 광고 테스트

프로덕션 빌드에서 실제 광고를 테스트할 때:

⚠️ **주의:** 절대 자신의 광고를 클릭하지 마세요! (계정 정지 위험)

**안전한 테스트 방법:**
1. AdMob 콘솔 → "설정" → "테스트 기기"
2. 테스트 기기 추가 (Device ID 입력)
3. 테스트 기기에서는 실제 광고가 표시되지만 클릭해도 안전

**Device ID 확인:**
```bash
# Android
adb logcat | grep "Use RequestConfiguration"

# iOS
Xcode 콘솔에서 AdMob 로그 확인
```

## 6. 광고 배치 확인

### 6.1 배너 광고
- ✅ 홈 화면 하단
- ✅ 공과금 화면 하단
- ✅ 물품 화면 하단
- ✅ 루틴 화면 하단

### 6.2 전면 광고
- ✅ 공과금 추가 완료 후 (5회 액션마다)
- ✅ 물품 요청 완료 후
- ✅ 루틴 완료 후

### 6.3 보상형 광고
- ✅ 설정 → 프리미엄 기능 (고급 통계, 테마 등)

## 7. 수익 확인

### 7.1 AdMob 콘솔
- https://apps.admob.com
- "수익 보고서" 메뉴에서 실시간 수익 확인
- 예상 수익: 익일 업데이트
- 확정 수익: 월말 정산

### 7.2 주요 지표
- **노출수 (Impressions)**: 광고가 화면에 표시된 횟수
- **클릭수 (Clicks)**: 광고를 클릭한 횟수
- **CTR (Click-Through Rate)**: 클릭률 = (클릭수 / 노출수) × 100
- **CPM (Cost Per Mille)**: 1,000회 노출당 수익
- **수익 (Revenue)**: 예상 수익 (USD)

### 7.3 수익 최적화
1. **배치 테스트**: 광고 위치별 성과 비교
2. **빈도 최적화**: 전면 광고 노출 빈도 조정
3. **사용자 경험**: 이탈률과 수익의 균형
4. **A/B 테스트**: 다양한 전략 실험

## 8. 지급 설정

### 8.1 지급 정보 입력
1. AdMob 콘솔 → "지급" → "지급 정보"
2. 주소 입력 (PIN 우편 발송)
3. PIN 번호 입력 (우편 수령 후)
4. 세금 정보 입력
5. 지급 방법 설정 (은행 계좌 연결)

### 8.2 지급 기준
- **최소 금액**: $100 (약 13만원)
- **지급 일정**: 매월 21일경
- **통화**: 한국은 KRW로 지급 가능

## 9. 정책 준수

### 9.1 필수 사항
- ✅ 개인정보처리방침에 AdMob 데이터 수집 명시
- ✅ 13세 미만 사용자 대상 아님 표시
- ✅ 광고 클릭 유도 금지
- ✅ 네이티브 광고에 "광고" 라벨 표시

### 9.2 금지 사항
- ❌ 본인의 광고 클릭
- ❌ 클릭 유도 문구 (예: "광고를 클릭해주세요")
- ❌ 광고 주변에 클릭을 유도하는 UI
- ❌ 부적절한 콘텐츠와 광고 함께 표시

### 9.3 정책 위반 시
- 경고 → 광고 제한 → 계정 정지
- 계정 복구 매우 어려움
- 처음부터 정책 준수 필수!

## 10. 문제 해결

### 광고가 표시되지 않을 때

**1. 개발 모드 확인**
```typescript
// AdConfig.ts에서 __DEV__ 값 확인
console.log('Dev mode:', __DEV__);
```

**2. 광고 단위 ID 확인**
```typescript
// constants/AdConfig.ts 확인
console.log('Banner ID:', AdConfig.banner);
```

**3. 로그 확인**
```bash
# Android
npx react-native log-android

# iOS
npx react-native log-ios
```

**4. AdMob 콘솔 확인**
- 광고 단위 상태: "활성" 확인
- 앱 상태: "승인됨" 확인 (신규 앱은 승인까지 수 시간 소요)

### 에러 메시지별 해결

**"Ad failed to load"**
- 광고 인벤토리 부족 (나중에 다시 시도)
- 광고 단위 ID 오류 (`.env` 파일 확인)

**"Invalid request"**
- 광고 단위 ID가 잘못됨
- App ID와 광고 단위 ID 플랫폼 불일치

**"No fill"**
- 해당 지역에 광고 없음 (정상)
- VPN 사용 시 발생 가능

## 11. 참고 자료

- **AdMob 공식 문서**: https://developers.google.com/admob
- **React Native Google Mobile Ads**: https://github.com/invertase/react-native-google-mobile-ads
- **Expo AdMob**: https://docs.expo.dev/versions/latest/sdk/admob/
- **정책 센터**: https://support.google.com/admob/answer/6128543

## 12. 체크리스트

```
□ AdMob 계정 생성
□ Android 앱 등록 및 App ID 발급
□ iOS 앱 등록 및 App ID 발급
□ Android 배너 광고 단위 생성
□ Android 전면 광고 단위 생성
□ Android 보상형 광고 단위 생성
□ iOS 배너 광고 단위 생성
□ iOS 전면 광고 단위 생성
□ iOS 보상형 광고 단위 생성
□ .env 파일에 모든 ID 입력
□ app.json에 App ID 입력
□ react-native-google-mobile-ads 설치
□ Development Build 생성
□ 테스트 광고 확인 (개발 모드)
□ 실제 광고 확인 (프로덕션 빌드)
□ 지급 정보 입력
□ 개인정보처리방침 업데이트
□ 정책 준수 확인
```

---

**마지막 업데이트:** 2025-01-07
**작성자:** Claude Code
