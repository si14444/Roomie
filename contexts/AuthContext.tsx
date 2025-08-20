import React, { createContext, ReactNode, useContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, signInWithKakaoUser, createSupabaseSessionFromKakao } from '@/lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextProps {
  isAuthenticated: boolean;
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
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
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 Supabase 세션 및 저장된 인증 정보 로드
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Supabase 세션 먼저 확인
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
      }

      if (session?.user) {
        // Supabase 세션이 있으면 프로필 정보 가져오기
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setSession(session);
          setSupabaseUser(session.user);
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.full_name || '사용자',
            avatar: profile.avatar_url || undefined,
          });
          setIsAuthenticated(true);
        }
      } else {
        // Supabase 세션이 없으면 로컬 저장소 확인 (기존 호환성)
        await loadStoredAuthData();
      }

      // 인증 상태 변경 감지
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id);
          
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setSession(session);
              setSupabaseUser(session.user);
              setUser({
                id: profile.id,
                email: profile.email,
                name: profile.full_name || '사용자',
                avatar: profile.avatar_url || undefined,
              });
              setIsAuthenticated(true);
            }
          } else {
            setSession(null);
            setSupabaseUser(null);
            setUser(null);
            setIsAuthenticated(false);
          }
          setIsLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
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
      
      // AsyncStorage에 저장 (기존 호환성)
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
      
      console.log('Starting Kakao login process with user:', kakaoUser);
      
      // 입력 데이터 검증
      if (!kakaoUser) {
        throw new Error('카카오 로그인 정보가 비어있습니다.');
      }
      
      // 카카오 사용자를 실제 Supabase Auth 세션으로 변환
      const authUser = await signInWithKakaoUser(kakaoUser);
      
      if (!authUser) {
        throw new Error('Supabase Auth 세션 생성에 실패했습니다.');
      }
      
      // Supabase 세션 확인 (onAuthStateChange가 자동으로 처리하지만 확실히 하기 위해)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.warn('Session retrieval warning:', sessionError);
      }

      // 프로필 정보 가져오기
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.warn('Profile retrieval warning:', profileError);
        // 프로필이 없어도 기본 정보로 진행
      }

      // 로컬 상태 업데이트 (onAuthStateChange에서도 처리되지만 즉시 반영을 위해)
      const userData = {
        id: authUser.id,
        email: authUser.email || profile?.email || '사용자',
        name: profile?.full_name || authUser.user_metadata?.full_name || '카카오 사용자',
        avatar: profile?.avatar_url || authUser.user_metadata?.avatar_url || undefined,
      };

      setUser(userData);
      setSupabaseUser(authUser);
      setSession(session);
      setIsAuthenticated(true);

      // AsyncStorage에도 저장 (기존 호환성)
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true'),
        AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData))
      ]);

      console.log('Kakao login successful with Supabase Auth:', {
        userId: authUser.id,
        email: userData.email,
        hasSession: !!session,
        hasProfile: !!profile
      });
      
    } catch (error) {
      console.error('Failed to login with Kakao:', error);
      
      // 상태 초기화
      setIsAuthenticated(false);
      setUser(null);
      setSupabaseUser(null);
      setSession(null);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Supabase 로그아웃
      if (session) {
        await supabase.auth.signOut();
      }
      
      // 로컬 상태 초기화
      setIsAuthenticated(false);
      setUser(null);
      setSupabaseUser(null);
      setSession(null);
      
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
    supabaseUser,
    session,
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