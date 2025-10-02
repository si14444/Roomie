import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

interface SignupScreenProps {
  onSignupSuccess?: () => void;
}

export default function SignupScreen({ onSignupSuccess }: SignupScreenProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 유효성 검사
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSignup = async () => {
    // 입력값 검증
    if (!name.trim()) {
      Alert.alert("오류", "이름을 입력해주세요.");
      return;
    }

    if (!email.trim()) {
      Alert.alert("오류", "이메일을 입력해주세요.");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("오류", "유효한 이메일 주소를 입력해주세요.");
      return;
    }

    if (!password) {
      Alert.alert("오류", "비밀번호를 입력해주세요.");
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert("오류", "비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setIsLoading(true);

      // TODO: 실제 회원가입 API 호출
      // const response = await authService.signup({ name, email, password });

      // 임시: 성공 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        "회원가입 성공",
        "회원가입이 완료되었습니다. 로그인해주세요.",
        [
          {
            text: "확인",
            onPress: () => {
              onSignupSuccess?.();
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Signup failed:", error);
      Alert.alert("오류", "회원가입에 실패했습니다. 다시 시도해주세요.");
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Ionicons name="person-add" size={60} color="white" />
              <Text style={styles.title}>회원가입</Text>
              <Text style={styles.subtitle}>
                Roomie와 함께 시작하세요
              </Text>
            </View>
          </View>

          {/* 회원가입 폼 */}
          <View style={styles.formSection}>
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>계정 정보 입력</Text>

              {/* 이름 입력 */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={Colors.light.mutedText}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="이름"
                  placeholderTextColor={Colors.light.mutedText}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>

              {/* 이메일 입력 */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={Colors.light.mutedText}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="이메일"
                  placeholderTextColor={Colors.light.mutedText}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              {/* 비밀번호 입력 */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={Colors.light.mutedText}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호 (최소 6자)"
                  placeholderTextColor={Colors.light.mutedText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              {/* 비밀번호 확인 */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={Colors.light.mutedText}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호 확인"
                  placeholderTextColor={Colors.light.mutedText}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              {/* 회원가입 버튼 */}
              <TouchableOpacity
                style={[styles.signupButton, isLoading && styles.disabledButton]}
                onPress={handleSignup}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Text style={styles.signupButtonText}>가입하기</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </>
                )}
              </TouchableOpacity>

              {/* 약관 동의 안내 */}
              <View style={styles.termsSection}>
                <Text style={styles.termsText}>
                  가입하면 서비스 이용약관 및{"\n"}
                  개인정보처리방침에 동의하게 됩니다.
                </Text>
              </View>

              {/* 로그인 링크 */}
              <View style={styles.loginLinkSection}>
                <Text style={styles.loginLinkText}>이미 계정이 있으신가요? </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.loginLink}>로그인</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  formSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 24,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
  },
  inputIconContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
  signupButton: {
    flexDirection: "row",
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    gap: 8,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  disabledButton: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  termsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderColor,
  },
  termsText: {
    fontSize: 12,
    color: Colors.light.mutedText,
    textAlign: "center",
    lineHeight: 18,
  },
  loginLinkSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  loginLinkText: {
    fontSize: 14,
    color: Colors.light.mutedText,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.primary,
  },
});
