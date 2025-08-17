// 디버깅용 스크립트 - 이 코드를 앱에서 실행해보세요
import AsyncStorage from '@react-native-async-storage/async-storage';

const debugAuthState = async () => {
  console.log('=== Auth Debug Info ===');
  
  // 모든 AsyncStorage 키 확인
  const allKeys = await AsyncStorage.getAllKeys();
  console.log('All AsyncStorage keys:', allKeys);
  
  // 인증 관련 데이터 확인
  const authData = await AsyncStorage.getItem('is_authenticated');
  const userData = await AsyncStorage.getItem('user_data');
  const hasSelectedTeam = await AsyncStorage.getItem('has_selected_team');
  const currentTeam = await AsyncStorage.getItem('current_team');
  
  console.log('Auth data:', {
    isAuthenticated: authData,
    userData: userData ? JSON.parse(userData) : null,
    hasSelectedTeam: hasSelectedTeam,
    currentTeam: currentTeam ? JSON.parse(currentTeam) : null,
  });
};

const resetAuthState = async () => {
  console.log('=== Resetting Auth State ===');
  
  await AsyncStorage.multiRemove([
    'is_authenticated',
    'user_data', 
    'has_selected_team',
    'current_team',
    'user_teams'
  ]);
  
  console.log('Auth state reset complete');
};

// 실행
debugAuthState();

// 필요하면 리셋
// resetAuthState();