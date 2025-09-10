import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Colors from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/contexts/TeamContext";
import { Ionicons } from "@expo/vector-icons";
import { login as kakaoLogin } from "@react-native-kakao/user";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { loginWithKakao } = useAuth();
  const { hasSelectedTeam, skipTeamSelection } = useTeam();
  const [isLoading, setIsLoading] = useState(false);

  const handleKakaoLogin = async () => {
    let kakaoResult: any = null;

    try {
      setIsLoading(true);

      // 카카오 로그인 (이메일, 닉네임, 프로필 이미지 권한 요청)
      await kakaoLogin();

      // 사용자 정보 가져오기
      const { me } = await import("@react-native-kakao/user");
      kakaoResult = await me();

      console.log("Kakao user data:", kakaoResult);

      // me() API는 이미 사용자 정보를 반환하므로 kakaoAccount 형태로 변환
      if (kakaoResult) {
        // KakaoUser 형태를 AuthContext에서 예상하는 형태로 변환
        const transformedResult = {
          id: kakaoResult.id,
          kakaoAccount: {
            email: kakaoResult.email,
            emailValid: kakaoResult.isEmailValid,
            isEmailVerified: kakaoResult.isEmailVerified,
            profile: {
              nickname: kakaoResult.nickname,
              profileImageUrl: kakaoResult.profileImageUrl,
            },
          },
        };
        kakaoResult = transformedResult;
      }

      // 카카오 로그인 결과를 Supabase와 연동하여 로그인 처리
      await loginWithKakao(kakaoResult);

      // 로그인 후 바로 기본 팀 생성 (사용자 편의를 위해)
      try {
        await skipTeamSelection();
      } catch (teamError) {
        console.warn(
          "Failed to create default team, user will need to select team manually:",
          teamError
        );
      }

      // 성공 콜백 호출
      onLoginSuccess?.();
    } catch (error) {
      console.error("Kakao login failed:", error);
      let errorMessage = "카카오 로그인에 실패했습니다.";
      if (error instanceof Error) {
        // 사용자에게 더 친숙한 에러 메시지 제공
        if (
          error.message.includes("user_cancel") ||
          error.message.includes("cancelled")
        ) {
          errorMessage = "로그인이 취소되었습니다.";
        } else if (
          error.message.includes("network") ||
          error.message.includes("connection")
        ) {
          errorMessage = "네트워크 연결을 확인해주세요.";
        } else if (
          error.message.includes("invalid") ||
          error.message.includes("auth")
        ) {
          errorMessage =
            "인증 과정에서 문제가 발생했습니다. 다시 시도해주세요.";
        } else if (
          error.message.includes("KakaoSDK") ||
          error.message.includes("initialize")
        ) {
          errorMessage =
            "카카오 앱 초기화 문제가 있습니다. 앱을 재시작해주세요.";
        } else {
          errorMessage += `\n상세 오류: ${error.message}`;
        }
      }

      Alert.alert("오류", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={Colors.light.gradientPrimary}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* 로고 및 헤더 */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="home" size={80} color="white" />
              <Text style={styles.title}>Roomie</Text>
              <Text style={styles.subtitle}>
                룸메이트와 함께하는 즐거운 생활
              </Text>
            </View>
          </View>

          {/* 로그인 섹션 */}
          <View style={styles.loginSection}>
            <View style={styles.loginCard}>
              <Text style={styles.loginTitle}>시작하기</Text>
              <Text style={styles.loginSubtitle}>
                카카오 계정으로 간편하게 시작하세요
              </Text>

              <TouchableOpacity
                style={[styles.kakaoButton, isLoading && styles.disabledButton]}
                onPress={handleKakaoLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#3C1E1E" />
                ) : (
                  <>
                    <Image
                      source={{
                        uri: "https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png",
                      }}
                      style={styles.kakaoIcon}
                    />
                    <Text style={styles.kakaoButtonText}>
                      카카오로 시작하기
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.infoSection}>
                <Text style={styles.infoText}>
                  로그인하면 서비스 이용약관 및{"\n"}개인정보처리방침에 동의하게
                  됩니다.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
    marginTop: 20,
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontWeight: "400",
  },
  loginSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loginCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: Colors.light.mutedText,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  kakaoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE500", // 카카오 공식 색상
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
    shadowColor: "#FEE500",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  kakaoIcon: {
    width: 24,
    height: 24,
  },
  kakaoButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3C1E1E", // 카카오 공식 텍스트 색상
  },
  disabledButton: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  infoSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderColor,
  },
  infoText: {
    fontSize: 12,
    color: Colors.light.mutedText,
    textAlign: "center",
    lineHeight: 16,
  },
});
