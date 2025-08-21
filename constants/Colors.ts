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

const Colors = {
  light: {
    text: "#1F2937", // 깔끔한 다크 그레이 텍스트
    background: "#FFFFFF", // 깔끔한 화이트 배경
    tint: "#FF6F61", // 메인 코랄 (탭 선택 등 하이라이트용)
    tabIconDefault: "#94A3B8", // 중성적인 회색
    tabIconSelected: "#FF6F61",
    primary: "#FF6F61", // 메인 코랄 (버튼과 중요한 하이라이트만)
    secondary: "#6B7280", // 중성적인 회색으로 변경
    accent: "#F8FAFC", // 매우 연한 그레이 악센트
    accentBlue: "#F1F5F9", // 중성적인 연한 회색
    gradientStart: "#FF6F61",
    gradientEnd: "#FF8A7A",
    gradientPrimary: ["#FF6F61", "#FF8A7A"] as const, // 예쁜 코랄 그라디언트
    gradientSecondary: ["#F8FAFC", "#F1F5F9"] as const, // 중성적인 회색 그라디언트
    cardBackground: "#FFFFFF",
    surface: "#F8FAFC", // 연한 그레이 서피스
    surfaceVariant: "#F1F5F9", // 중간 그레이
    borderColor: "#E2E8F0", // 연한 그레이 테두리
    mutedText: "#64748B", // 음소거된 그레이 텍스트
    placeholderText: "#94A3B8",
    inputBackground: "#F8FAFC", // 입력 필드 배경색
    divider: "#E2E8F0",
    shadow: "#000000",
    overlay: "rgba(0, 0, 0, 0.5)", // 중성적인 어둠 오버레이
    successColor: "#10B981", // 표준 성공 색상 (초록)
    warningColor: "#F59E0B", // 경고는 노란색 유지
    errorColor: "#EF4444", // 에러는 빨간색 유지
    infoColor: "#3B82F6", // 표준 정보 색상 (파랑)
    completedColor: "#10B981", // 완료 색상 - 표준 초록
    subColor: "#6B7280", // 서브 컬러를 중성적인 회색으로 변경
    pendingColor: "#F59E0B",
    inProgressColor: "#FF6F61", // 진행중만 메인 색상 유지
  },
  dark: {
    text: "#F1F5F9",
    background: "#0F172A", // 진한 다크 배경
    tint: "#FF8A7A", // 다크모드용 밝은 코랄
    tabIconDefault: "#64748B",
    tabIconSelected: "#FF8A7A",
    primary: "#FF8A7A", // 다크모드용 밝은 코랄 (버튼과 중요한 하이라이트만)
    secondary: "#64748B", // 중성적인 회색
    accent: "#1E293B",
    accentBlue: "#1E293B",
    gradientStart: "#FF8A7A",
    gradientEnd: "#FFB3A8",
    gradientPrimary: ["#FF8A7A", "#FFB3A8"] as const,
    gradientSecondary: ["#1E293B", "#334155"] as const, // 중성적인 다크 그레이 그라디언트
    cardBackground: "#1E293B",
    surface: "#334155",
    surfaceVariant: "#475569",
    borderColor: "#64748B",
    mutedText: "#94A3B8",
    placeholderText: "#64748B",
    inputBackground: "#334155", // 다크모드 입력 필드 배경색
    divider: "#475569",
    shadow: "#000000",
    overlay: "rgba(0, 0, 0, 0.7)",
    successColor: "#10B981", // 표준 성공 색상 (초록)
    warningColor: "#F59E0B",
    errorColor: "#EF4444",
    infoColor: "#3B82F6", // 표준 정보 색상 (파랑)
    completedColor: "#10B981", // 완료 색상 - 표준 초록
    subColor: "#64748B", // 서브 컬러를 중성적인 회색으로 변경
    pendingColor: "#F59E0B",
    inProgressColor: "#FF8A7A", // 진행중만 메인 색상 유지
  },
};

export default Colors;
export { Colors };
