import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/Colors';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleKakaoLogin = async () => {
    try {
      setIsLoading(true);
      
      // TODO: 실제 카카오 SDK 연동
      // 임시로 더미 사용자 데이터로 로그인 처리
      await login({
        id: 'kakao_user_1',
        email: 'user@kakao.com',
        name: '카카오 사용자',
        avatar: 'https://via.placeholder.com/100x100/FFD700/000000?text=K'
      });
      
      onLoginSuccess?.();
      Alert.alert('성공', '카카오 로그인이 완료되었습니다!');
    } catch (error) {
      Alert.alert('오류', '카카오 로그인에 실패했습니다.');
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
              <Text style={styles.subtitle}>룸메이트와 함께하는 즐거운 생활</Text>
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
                        uri: "https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png"
                      }}
                      style={styles.kakaoIcon}
                    />
                    <Text style={styles.kakaoButtonText}>카카오로 시작하기</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.infoSection}>
                <Text style={styles.infoText}>
                  로그인하면 서비스 이용약관 및{'\n'}개인정보처리방침에 동의하게 됩니다.
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '400',
  },
  loginSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loginCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: Colors.light.mutedText,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  kakaoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE500', // 카카오 공식 색상
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    shadowColor: '#FEE500',
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
    fontWeight: '700',
    color: '#3C1E1E', // 카카오 공식 텍스트 색상
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
    textAlign: 'center',
    lineHeight: 16,
  },
});