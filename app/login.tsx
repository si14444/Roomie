import Colors from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const { setAuthenticated } = useAuth();
  const router = useRouter();

  // 카카오 로그인 핸들러 (추후 Supabase 연동)
  const handleKakaoLogin = () => {
    // TODO: 카카오 OAuth 연동 및 Supabase 인증 처리
    setAuthenticated(true); // 임시: 로그인 성공 처리
    router.replace("/"); // 메인으로 이동
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Roomie</Text>
      <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLogin}>
        <Image
          source={{
            uri: "https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png",
          }}
          style={styles.kakaoIcon}
        />
        <Text style={styles.kakaoText}>카카오로 시작하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 12, // 기존 24에서 12로 변경
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.light.primary,
    marginBottom: 48,
  },
  kakaoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.subColor,
    width: "90%",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  kakaoIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  kakaoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF", // 흰색 텍스트로 변경하여 틸 배경과 대비 개선
  },
});
