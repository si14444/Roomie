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
    text: "#1F2937", // 깔끔한 다크 그레이 텍스트
    background: "#FDFCFF", // 매우 연한 보라 배경
    tint: "#8B5CF6", // 예쁜 바이올렛
    tabIconDefault: "#C084FC", // 연한 라벤더
    tabIconSelected: "#8B5CF6",
    primary: "#8B5CF6", // 메인 바이올렛 (밝고 생동감 있는 보라색)
    secondary: "#C084FC", // 부드러운 라벤더
    accent: "#F8FAFC", // 매우 연한 그레이 악센트
    accentBlue: "#EDE9FE", // 연보라 악센트
    gradientStart: "#8B5CF6",
    gradientEnd: "#C084FC",
    gradientPrimary: ["#8B5CF6", "#C084FC"], // 예쁜 보라 그라디언트
    gradientSecondary: ["#A78BFA", "#DDD6FE"], // 밝은 라벤더 그라디언트
    cardBackground: "#FFFFFF",
    surface: "#F8FAFC", // 연한 그레이 서피스
    surfaceVariant: "#F1F5F9", // 중간 그레이
    borderColor: "#E2E8F0", // 연한 그레이 테두리
    mutedText: "#64748B", // 음소거된 그레이 텍스트
    placeholderText: "#94A3B8",
    divider: "#E2E8F0",
    shadow: "#000000",
    overlay: "rgba(139, 92, 246, 0.5)", // 바이올렛 오버레이
    successColor: "#10B981", // 성공 색상은 그린으로
    warningColor: "#F59E0B", // 경고는 노란색 유지
    errorColor: "#EF4444", // 에러는 빨간색 유지
    infoColor: "#8B5CF6", // 정보 색상은 바이올렛
    completedColor: "#10B981",
    pendingColor: "#F59E0B",
    inProgressColor: "#8B5CF6",
  },
  dark: {
    text: "#F1F5F9",
    background: "#0F172A", // 진한 다크 배경
    tint: "#C084FC",
    tabIconDefault: "#94A3B8",
    tabIconSelected: "#C084FC",
    primary: "#C084FC", // 다크모드용 밝은 라벤더
    secondary: "#DDD6FE",
    accent: "#1E293B",
    accentBlue: "#312E81",
    gradientStart: "#C084FC",
    gradientEnd: "#DDD6FE",
    gradientPrimary: ["#C084FC", "#DDD6FE"],
    gradientSecondary: ["#A78BFA", "#F3F4F6"],
    cardBackground: "#1E293B",
    surface: "#334155",
    surfaceVariant: "#475569",
    borderColor: "#64748B",
    mutedText: "#94A3B8",
    placeholderText: "#64748B",
    divider: "#475569",
    shadow: "#000000",
    overlay: "rgba(0, 0, 0, 0.7)",
    successColor: "#10B981",
    warningColor: "#F59E0B",
    errorColor: "#EF4444",
    infoColor: "#C084FC",
    completedColor: "#10B981",
    pendingColor: "#F59E0B",
    inProgressColor: "#C084FC",
  },
};
