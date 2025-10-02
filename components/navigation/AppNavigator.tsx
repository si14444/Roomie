import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import Colors from '@/constants/Colors';

export default function AppNavigator({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasSelectedTeam, isLoading: teamLoading } = useTeam();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // 로딩 중이면 대기
    if (authLoading || (isAuthenticated && teamLoading)) {
      console.log('AppNavigator: Loading...', { authLoading, teamLoading, isAuthenticated });
      return;
    }

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup';
    const inTeamSelection = segments[0] === 'team-selection';
    const inMainApp = segments[0] === '(tabs)';

    console.log('AppNavigator: Navigation decision', {
      isAuthenticated,
      hasSelectedTeam,
      authLoading,
      teamLoading,
      currentSegment: segments[0],
      allSegments: segments,
      inAuthGroup,
      inTeamSelection,
      inMainApp,
      timestamp: new Date().toISOString()
    });

    // Navigation flow logic based on auth and team state

    if (!isAuthenticated) {
      // 인증되지 않은 경우 로그인 화면으로
      if (!inAuthGroup) {
        console.log('AppNavigator: Navigating to login - user not authenticated');
        router.replace('/login');
      }
    } else {
      // 인증된 경우
      if (!hasSelectedTeam) {
        // 팀이 선택되지 않은 경우 팀 선택 화면으로
        if (!inTeamSelection) {
          console.log('AppNavigator: Navigating to team-selection - no team selected');
          router.replace('/team-selection');
        } else {
          console.log('AppNavigator: Already in team-selection screen');
        }
      } else {
        // 팀이 선택된 경우 메인 앱으로
        if (!inMainApp) {
          console.log('AppNavigator: Navigating to main app - team selected');
          router.replace('/(tabs)');
        } else {
          console.log('AppNavigator: Already in main app');
        }
      }
    }
  }, [isAuthenticated, hasSelectedTeam, authLoading, teamLoading, segments, router]);

  // 로딩 중 화면 표시
  if (authLoading || (isAuthenticated && teamLoading)) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
      }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return <>{children}</>;
}