// 현재 상태 확인용 스크립트
// 이 코드를 앱 내에서 실행해서 현재 상태를 확인하세요

import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkCurrentState = async () => {
  console.log('=== 현재 AsyncStorage 상태 확인 ===');
  
  try {
    // 모든 키 가져오기
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('All keys:', allKeys);
    
    // 인증 관련 데이터
    const authData = await AsyncStorage.getItem('is_authenticated');
    const userData = await AsyncStorage.getItem('user_data');
    
    // 팀 관련 데이터
    const currentTeam = await AsyncStorage.getItem('current_team');
    const userTeams = await AsyncStorage.getItem('user_teams');
    const hasSelectedTeam = await AsyncStorage.getItem('has_selected_team');
    
    console.log('=== 인증 상태 ===');
    console.log('is_authenticated:', authData);
    console.log('user_data:', userData ? JSON.parse(userData) : null);
    
    console.log('=== 팀 상태 ===');
    console.log('current_team:', currentTeam ? JSON.parse(currentTeam) : null);
    console.log('user_teams:', userTeams ? JSON.parse(userTeams) : null);
    console.log('has_selected_team:', hasSelectedTeam);
    
    console.log('=== 상태 요약 ===');
    console.log('로그인 상태:', authData === 'true');
    console.log('팀 선택 상태:', hasSelectedTeam === 'true');
    console.log('==================');
    
  } catch (error) {
    console.error('상태 확인 중 오류:', error);
  }
};

export const clearAllData = async () => {
  console.log('=== 모든 데이터 초기화 ===');
  try {
    await AsyncStorage.clear();
    console.log('모든 데이터가 초기화되었습니다.');
  } catch (error) {
    console.error('데이터 초기화 중 오류:', error);
  }
};

// 사용법:
// import { checkCurrentState, clearAllData } from './debug-current-state';
// checkCurrentState(); // 현재 상태 확인
// clearAllData(); // 모든 데이터 초기화