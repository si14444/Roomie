import React, { createContext, ReactNode, useContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextProps {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (user: User) => Promise<void>;
  loginWithKakao: (kakaoUser: any) => Promise<void>;
  logout: () => Promise<void>;
  // 기존 호환성을 위한 deprecated 메서드들
  setAuthenticated: (auth: boolean) => void;
  setUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const STORAGE_KEYS = {
  IS_AUTHENTICATED: 'is_authenticated',
  USER_DATA: 'user_data'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 저장된 인증 정보 로드
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      await loadStoredAuthData();
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStoredAuthData = async () => {
    try {
      const [storedAuth, storedUser] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED),
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA)
      ]);

      if (storedAuth === 'true' && storedUser) {
        const userData = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to load stored auth data:', error);
    }
  };

  const login = async (userData: User) => {
    try {
      setIsAuthenticated(true);
      setUser(userData);

      // AsyncStorage에 저장
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true'),
        AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData))
      ]);
    } catch (error) {
      console.error('Failed to save auth data:', error);
      throw error;
    }
  };

  const loginWithKakao = async (kakaoUser: any) => {
    try {
      setIsLoading(true);

      console.log('🚀 Starting Kakao login process');

      // 입력 데이터 검증
      if (!kakaoUser) {
        console.error('❌ No Kakao user data provided');
        throw new Error('카카오 로그인 정보가 비어있습니다.');
      }

      // 카카오 사용자 정보 추출
      const kakaoId = kakaoUser.id || kakaoUser.userId;
      const kakaoAccount = kakaoUser.kakaoAccount || {};
      const profile = kakaoAccount.profile || {};

      if (!kakaoId) {
        console.error('❌ No valid Kakao ID found');
        throw new Error('카카오 사용자 식별 정보를 찾을 수 없습니다.');
      }

      console.log('✅ Kakao user data validation passed');

      // 사용자 프로필 생성
      const userData: User = {
        id: `kakao_${kakaoId}`,
        email: kakaoAccount.email || `kakao_${kakaoId}@kakao.user`,
        name: profile.nickname || kakaoAccount.name || '카카오 사용자',
        avatar: profile.profile_image_url || profile.thumbnail_image_url || undefined,
      };

      // 로컬 상태 업데이트
      setUser(userData);
      setIsAuthenticated(true);

      // AsyncStorage에 저장
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true'),
        AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData))
      ]);

      console.log('✅ Kakao login successful:', {
        userId: userData.id,
        email: userData.email,
        name: userData.name
      });

    } catch (error) {
      console.error('Failed to login with Kakao:', error);

      // 상태 초기화
      setIsAuthenticated(false);
      setUser(null);

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // 로컬 상태 초기화
      setIsAuthenticated(false);
      setUser(null);

      // AsyncStorage에서 제거
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA)
      ]);
    } catch (error) {
      console.error('Failed to logout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 기존 호환성을 위한 deprecated 메서드들
  const setAuthenticated = (auth: boolean) => {
    console.warn('setAuthenticated is deprecated. Use login/logout instead.');
    setIsAuthenticated(auth);
  };

  const setUserDeprecated = (userData: any) => {
    console.warn('setUser is deprecated. Use login instead.');
    setUser(userData);
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    loginWithKakao,
    logout,
    // 기존 호환성
    setAuthenticated,
    setUser: setUserDeprecated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}