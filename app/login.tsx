import { useRouter } from 'expo-router';
import LoginScreen from '@/components/auth/LoginScreen';

export default function LoginRoute() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    // 로그인 성공 후 메인 앱으로 이동 (라우팅 로직은 RootLayoutNav에서 처리)
    router.replace('/(tabs)');
  };

  return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
}