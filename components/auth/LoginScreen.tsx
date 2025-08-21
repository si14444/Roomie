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

      console.log("Starting Kakao login - current team state:", { hasSelectedTeam });

      // 카카오 로그인 시도 (이메일 권한 포함하여 요청)
      console.log("Requesting Kakao login with email permission...");
      try {
        // 이메일 권한을 포함하여 로그인 요청
        kakaoResult = await kakaoLogin({
          scopes: ['account_email', 'profile_nickname']
        });
      } catch (scopeError) {
        console.log("Scoped login failed, trying basic login:", scopeError);
        // scope가 지원되지 않으면 기본 로그인
        kakaoResult = await kakaoLogin();
      }
      
      // 이메일 정보가 없으면 추가 정보 요청 시도
      if (!kakaoResult?.kakaoAccount?.email) {
        console.log("No email in initial result, trying to get additional info...");
        try {
          // React Native Kakao SDK - 사용자 정보 다시 요청 시도
          const KakaoUser = await import('@react-native-kakao/user');
          if ('getProfile' in KakaoUser) {
            const profileResult = await (KakaoUser as any).getProfile();
            console.log("Additional profile result:", JSON.stringify(profileResult, null, 2));
            
            // 추가 정보가 있으면 병합
            if (profileResult?.kakaoAccount?.email) {
              kakaoResult = {
                ...kakaoResult,
                kakaoAccount: {
                  ...kakaoResult.kakaoAccount,
                  email: profileResult.kakaoAccount.email,
                  emailValid: profileResult.kakaoAccount.emailValid,
                  isEmailVerified: profileResult.kakaoAccount.isEmailVerified
                }
              };
              console.log("Email info merged from profile");
            }
          } else {
            console.log("getProfile method not available in this SDK version");
          }
        } catch (profileError) {
          console.warn('Failed to get additional profile info:', profileError);
        }
      }
      console.log("=== KAKAO LOGIN RESULT ANALYSIS ===");
      console.log("Raw Kakao login result:", JSON.stringify(kakaoResult, null, 2));
      console.log("=== EMAIL ANALYSIS ===");
      console.log("kakaoAccount exists:", !!kakaoResult?.kakaoAccount);
      console.log("kakaoAccount.email:", kakaoResult?.kakaoAccount?.email);
      console.log("kakaoAccount.emailValid:", kakaoResult?.kakaoAccount?.emailValid);
      console.log("kakaoAccount.isEmailVerified:", kakaoResult?.kakaoAccount?.isEmailVerified);
      console.log("=== PROFILE ANALYSIS ===");
      console.log("profile exists:", !!kakaoResult?.kakaoAccount?.profile);
      console.log("profile.nickname:", kakaoResult?.kakaoAccount?.profile?.nickname);
      console.log("Kakao user info extraction check:", {
        // 닉네임 경로들
        nickname1: kakaoResult?.kakaoAccount?.profile?.nickname,
        nickname2: kakaoResult?.kakaoAccount?.profile?.nickName,
        nickname3: kakaoResult?.profile?.nickname,
        nickname4: kakaoResult?.nickname,
        nickname5: kakaoResult?.name,
        // 이메일 경로들  
        email1: kakaoResult?.kakaoAccount?.email,
        email2: kakaoResult?.kakaoAccount?.account?.email,
        email3: kakaoResult?.email,
        email4: kakaoResult?.account?.email
      });

      // 카카오 로그인 결과를 Supabase와 연동하여 로그인 처리
      await loginWithKakao(kakaoResult);

      console.log("Login successful, creating default team for quick start...");
      
      // 로그인 후 바로 기본 팀 생성 (사용자 편의를 위해)
      try {
        await skipTeamSelection();
        console.log("Default team created successfully");
      } catch (teamError) {
        console.warn("Failed to create default team, user will need to select team manually:", teamError);
      }

      // 성공 콜백 호출
      onLoginSuccess?.();
    } catch (error) {
      console.error("Kakao login error details:", {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        kakaoResult: kakaoResult,
        hasKakaoResult: !!kakaoResult,
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      let errorMessage = "카카오 로그인에 실패했습니다.";
      if (error instanceof Error) {
        errorMessage += `\n상세 오류: ${error.message}`;
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
