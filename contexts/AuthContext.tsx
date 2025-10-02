import React, { createContext, ReactNode, useContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '@/services/authService';

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
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
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

  // 앱 시작 시 Firebase 인증 상태 확인
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true);
        setUser(firebaseUser);
        // AsyncStorage에 저장
        await AsyncStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(firebaseUser));
      } else {
        setIsAuthenticated(false);
        setUser(null);
        // AsyncStorage에서 제거
        await AsyncStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userData = await authService.login({ email, password });
      // Firebase onAuthStateChanged가 상태를 자동으로 업데이트합니다
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const userData = await authService.signup({ name, email, password });
      // Firebase onAuthStateChanged가 상태를 자동으로 업데이트합니다
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      // Firebase onAuthStateChanged가 상태를 자동으로 업데이트합니다
    } catch (error) {
      setIsLoading(false);
      throw error;
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
    signup,
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