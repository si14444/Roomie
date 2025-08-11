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
    loadStoredAuthData();
  }, []);

  const loadStoredAuthData = async () => {
    try {
      setIsLoading(true);
      
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
      console.error('Failed to load auth data:', error);
    } finally {
      setIsLoading(false);
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

  const logout = async () => {
    try {
      setIsAuthenticated(false);
      setUser(null);
      
      // AsyncStorage에서 제거
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA)
      ]);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
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