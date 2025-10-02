import { useRouter } from 'expo-router';
import SignupScreen from '@/components/auth/SignupScreen';

export default function SignupRoute() {
  const router = useRouter();

  const handleSignupSuccess = () => {
    // 회원가입 성공 후 로그인 페이지로 이동
    router.replace('/login');
  };

  return <SignupScreen onSignupSuccess={handleSignupSuccess} />;
}
