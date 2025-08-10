// 모던하고 세련된 코랄 색상 팔레트
const primaryCoral = "#FF6F61"; // 메인 코랄
const lightCoral = "#FF8A7A"; // 라이트 코랄
const extraLightCoral = "#FFF4F3"; // 매우 연한 코랄
const darkCoral = "#E8554A"; // 다크 코랄
const accentCoral = "#FFB3A8"; // 소프트 코랄
const subTeal = "#4FD1C7"; // 서브 컬러 (틸/터키석 - 코랄의 보색)
const completionCoral = "#FF9F7D"; // 완료용 코랄 (더 밝은 코랄)
const gradientStart = "#FF6F61"; // 그라데이션 시작
const gradientEnd = "#FF8A7A"; // 그라데이션 끝

export default {
  light: {
    text: "#1F2937", // 깔끔한 다크 그레이 텍스트
    background: "#FFFEFE", // 매우 연한 코랄 배경
    tint: "#FF6F61", // 메인 코랄
    tabIconDefault: "#FFB3A8", // 연한 코랄
    tabIconSelected: "#FF6F61",
    primary: "#FF6F61", // 메인 코랄 (생동감 있는 코랄색)
    secondary: "#FF8A7A", // 부드러운 라이트 코랄
    accent: "#F8FAFC", // 매우 연한 그레이 악센트
    accentBlue: "#FFF4F3", // 연코랄 악센트
    gradientStart: "#FF6F61",
    gradientEnd: "#FF8A7A",
    gradientPrimary: ["#FF6F61", "#FF8A7A"], // 예쁜 코랄 그라디언트
    gradientSecondary: ["#FF8A7A", "#FFE6E4"], // 밝은 코랄 그라디언트
    cardBackground: "#FFFFFF",
    surface: "#F8FAFC", // 연한 그레이 서피스
    surfaceVariant: "#F1F5F9", // 중간 그레이
    borderColor: "#E2E8F0", // 연한 그레이 테두리
    mutedText: "#64748B", // 음소거된 그레이 텍스트
    placeholderText: "#94A3B8",
    divider: "#E2E8F0",
    shadow: "#000000",
    overlay: "rgba(255, 111, 97, 0.5)", // 코랄 오버레이
    successColor: "#FF9F7D", // 성공 색상 - 완료용 코랄
    warningColor: "#F59E0B", // 경고는 노란색 유지
    errorColor: "#EF4444", // 에러는 빨간색 유지
    infoColor: "#FF6F61", // 정보 색상은 코랄
    completedColor: "#FF9F7D", // 완료 색상 - 완료용 코랄
    subColor: "#4FD1C7", // 서브 컬러 (틸) - 버튼 등에 사용
    pendingColor: "#F59E0B",
    inProgressColor: "#FF6F61",
  },
  dark: {
    text: "#F1F5F9",
    background: "#0F172A", // 진한 다크 배경
    tint: "#FF8A7A",
    tabIconDefault: "#94A3B8",
    tabIconSelected: "#FF8A7A",
    primary: "#FF8A7A", // 다크모드용 밝은 코랄
    secondary: "#FFB3A8",
    accent: "#1E293B",
    accentBlue: "#2D1B17",
    gradientStart: "#FF8A7A",
    gradientEnd: "#FFB3A8",
    gradientPrimary: ["#FF8A7A", "#FFB3A8"],
    gradientSecondary: ["#FF6F61", "#F3F4F6"],
    cardBackground: "#1E293B",
    surface: "#334155",
    surfaceVariant: "#475569",
    borderColor: "#64748B",
    mutedText: "#94A3B8",
    placeholderText: "#64748B",
    divider: "#475569",
    shadow: "#000000",
    overlay: "rgba(0, 0, 0, 0.7)",
    successColor: "#FFB399", // 다크모드 성공 색상 - 밝은 완료용 코랄
    warningColor: "#F59E0B",
    errorColor: "#EF4444",
    infoColor: "#FF8A7A",
    completedColor: "#FFB399", // 다크모드 완료 색상 - 밝은 완료용 코랄
    subColor: "#38B2AC", // 다크모드 서브 컬러 (다크 틸)
    pendingColor: "#F59E0B",
    inProgressColor: "#FF8A7A",
  },
};
