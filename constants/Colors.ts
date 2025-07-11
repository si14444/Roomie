// 모던하고 세련된 색상 팔레트
const primaryBlue = "#4F46E5"; // 인디고 블루
const lightBlue = "#6366F1"; // 라이트 인디고
const extraLightBlue = "#EEF2FF"; // 베이지 블루
const darkBlue = "#3730A3"; // 다크 인디고
const accentBlue = "#818CF8"; // 소프트 라벤더
const gradientStart = "#4F46E5"; // 그라데이션 시작
const gradientEnd = "#7C3AED"; // 그라데이션 끝 (보라)

export default {
  light: {
    text: "#2D1B69", // 진한 보라빛 텍스트
    background: "#FDFCFF", // 매우 연한 보라 배경
    tint: "#8B5A8C", // 한국적 자주색
    tabIconDefault: "#B794B7", // 연한 자주색
    tabIconSelected: "#8B5A8C",
    primary: "#8B5A8C", // 메인 자주색 (한국 전통 자주)
    secondary: "#A855F7", // 보조 보라색
    accent: "#F8F5FF", // 매우 연한 보라 악센트
    accentBlue: "#EDE7FF", // 연보라 악센트
    gradientStart: "#8B5A8C",
    gradientEnd: "#B794B7",
    gradientPrimary: ["#8B5A8C", "#B794B7"], // 자주색 그라디언트
    gradientSecondary: ["#A855F7", "#C084FC"], // 밝은 보라 그라디언트
    cardBackground: "#FFFFFF",
    surface: "#F8F5FF", // 연보라 서피스
    surfaceVariant: "#F0EAFF", // 중간 연보라
    borderColor: "#E5D9FF", // 연보라 테두리
    mutedText: "#8B7BA8", // 음소거된 보라 텍스트
    placeholderText: "#B794B7",
    divider: "#E5D9FF",
    shadow: "#000000",
    overlay: "rgba(139, 90, 140, 0.5)", // 자주색 오버레이
    successColor: "#7C3AED", // 성공 색상도 보라 계열
    warningColor: "#F59E0B", // 경고는 노란색 유지
    errorColor: "#DC2626", // 에러는 빨간색 유지
    infoColor: "#8B5A8C", // 정보 색상도 자주색
    completedColor: "#7C3AED",
    pendingColor: "#F59E0B",
    inProgressColor: "#8B5A8C",
  },
  dark: {
    text: "#F0EAFF",
    background: "#1A0B2E", // 진한 보라 배경
    tint: "#B794B7",
    tabIconDefault: "#8B7BA8",
    tabIconSelected: "#B794B7",
    primary: "#B794B7", // 다크모드용 밝은 자주색
    secondary: "#C084FC",
    accent: "#2D1B69",
    accentBlue: "#3730A3",
    gradientStart: "#B794B7",
    gradientEnd: "#C084FC",
    gradientPrimary: ["#B794B7", "#C084FC"],
    gradientSecondary: ["#C084FC", "#DDD6FE"],
    cardBackground: "#2D1B69",
    surface: "#3730A3",
    surfaceVariant: "#4C1D95",
    borderColor: "#5B21B6",
    mutedText: "#B794B7",
    placeholderText: "#8B7BA8",
    divider: "#5B21B6",
    shadow: "#000000",
    overlay: "rgba(0, 0, 0, 0.7)",
    successColor: "#8B5CF6",
    warningColor: "#F59E0B",
    errorColor: "#EF4444",
    infoColor: "#B794B7",
    completedColor: "#8B5CF6",
    pendingColor: "#F59E0B",
    inProgressColor: "#B794B7",
  },
};
