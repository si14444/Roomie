import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Team, TeamMember, CreateTeamRequest, JoinTeamRequest } from '@/types/team.types';

interface TeamContextType {
  // 현재 선택된 팀
  currentTeam: Team | null;
  // 사용자가 속한 모든 팀
  userTeams: Team[];
  // 로딩 상태
  isLoading: boolean;
  // 팀 선택 여부 (초기화면 표시 여부)
  hasSelectedTeam: boolean;

  // 팀 관리 함수들
  createTeam: (teamData: CreateTeamRequest) => Promise<Team>;
  joinTeam: (joinData: JoinTeamRequest) => Promise<Team>;
  selectTeam: (team: Team) => Promise<void>;
  leaveTeam: (teamId: string) => Promise<void>;
  refreshTeams: () => Promise<void>;
  
  // 팀 멤버 관리
  inviteMember: (email: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: 'admin' | 'member') => Promise<void>;
  
  // 개발 모드 전용 함수
  skipTeamSelection: () => Promise<void>;
  
  // 팀 데이터 초기화 (새 사용자 로그인 시)
  resetTeamData: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_TEAM: 'current_team',
  USER_TEAMS: 'user_teams',
  HAS_SELECTED_TEAM: 'has_selected_team'
};

export function TeamProvider({ children }: { children: ReactNode }) {
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSelectedTeam, setHasSelectedTeam] = useState(false);

  // 앱 시작 시 저장된 팀 정보 로드
  useEffect(() => {
    loadStoredTeamData();
  }, []);


  const loadStoredTeamData = async () => {
    try {
      setIsLoading(true);
      
      const [storedCurrentTeam, storedUserTeams, storedHasSelected] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TEAM),
        AsyncStorage.getItem(STORAGE_KEYS.USER_TEAMS),
        AsyncStorage.getItem(STORAGE_KEYS.HAS_SELECTED_TEAM)
      ]);

      console.log('Loading team data:', {
        storedCurrentTeam: storedCurrentTeam ? 'exists' : 'null',
        storedUserTeams: storedUserTeams ? 'exists' : 'null',
        storedHasSelected
      });

      if (storedCurrentTeam) {
        setCurrentTeam(JSON.parse(storedCurrentTeam));
      } else {
        setCurrentTeam(null);
      }

      if (storedUserTeams) {
        setUserTeams(JSON.parse(storedUserTeams));
      } else {
        setUserTeams([]);
      }

      // hasSelectedTeam은 명시적으로 'true'일 때만 true로 설정
      const hasSelected = storedHasSelected === 'true';
      setHasSelectedTeam(hasSelected);
      
      console.log('Team data loaded:', {
        hasSelectedTeam: hasSelected,
        currentTeam: storedCurrentTeam ? 'exists' : 'null',
        userTeamsCount: storedUserTeams ? JSON.parse(storedUserTeams).length : 0
      });
    } catch (error) {
      console.error('Failed to load team data:', error);
      // 오류 발생 시 안전한 기본값으로 설정
      setCurrentTeam(null);
      setUserTeams([]);
      setHasSelectedTeam(false);
    } finally {
      setIsLoading(false);
    }
  };

  const createTeam = async (teamData: CreateTeamRequest): Promise<Team> => {
    try {
      // TODO: API 호출로 실제 팀 생성
      // 임시로 목업 데이터 생성
      const newTeam: Team = {
        id: `team_${Date.now()}`,
        name: teamData.name,
        description: teamData.description,
        members: [{
          id: 'member_1',
          userId: 'current_user',
          userName: '나',
          email: 'user@example.com',
          role: 'owner',
          joinedAt: new Date().toISOString()
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: 'current_user',
        inviteCode: Math.random().toString(36).substring(7),
        settings: {
          allowMemberInvites: true,
          autoAssignNewRoutines: false,
          notificationPreferences: {
            routineReminders: true,
            billAlerts: true,
            chatMessages: true
          },
          ...teamData.settings
        }
      };

      // 팀 목록에 추가
      const updatedTeams = [...userTeams, newTeam];
      setUserTeams(updatedTeams);
      
      // 새 팀을 현재 팀으로 설정
      await selectTeam(newTeam);
      
      // 로컬 스토리지에 저장
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TEAMS, JSON.stringify(updatedTeams));

      return newTeam;
    } catch (error) {
      console.error('Failed to create team:', error);
      throw error;
    }
  };

  const joinTeam = async (joinData: JoinTeamRequest): Promise<Team> => {
    try {
      // TODO: API 호출로 실제 팀 참가
      // 임시로 목업 팀 생성 (초대 코드 기반)
      const joinedTeam: Team = {
        id: `team_${Date.now()}`,
        name: '참가한 팀',
        description: '초대 코드로 참가한 팀입니다.',
        members: [
          {
            id: 'member_1',
            userId: 'other_user',
            userName: '팀장',
            email: 'owner@example.com',
            role: 'owner',
            joinedAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 'member_2',
            userId: 'current_user',
            userName: '나',
            email: 'user@example.com',
            role: 'member',
            joinedAt: new Date().toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: 'other_user',
        inviteCode: joinData.inviteCode,
        settings: {
          allowMemberInvites: true,
          autoAssignNewRoutines: true,
          notificationPreferences: {
            routineReminders: true,
            billAlerts: true,
            chatMessages: true
          }
        }
      };

      // 팀 목록에 추가
      const updatedTeams = [...userTeams, joinedTeam];
      setUserTeams(updatedTeams);
      
      // 참가한 팀을 현재 팀으로 설정
      await selectTeam(joinedTeam);
      
      // 로컬 스토리지에 저장
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TEAMS, JSON.stringify(updatedTeams));

      return joinedTeam;
    } catch (error) {
      console.error('Failed to join team:', error);
      throw error;
    }
  };

  const selectTeam = async (team: Team) => {
    try {
      setCurrentTeam(team);
      setHasSelectedTeam(true);
      
      // 로컬 스토리지에 저장
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.CURRENT_TEAM, JSON.stringify(team)),
        AsyncStorage.setItem(STORAGE_KEYS.HAS_SELECTED_TEAM, 'true')
      ]);
    } catch (error) {
      console.error('Failed to select team:', error);
      throw error;
    }
  };

  const leaveTeam = async (teamId: string) => {
    try {
      // TODO: API 호출로 실제 팀 나가기
      
      const updatedTeams = userTeams.filter(team => team.id !== teamId);
      setUserTeams(updatedTeams);

      // 현재 선택된 팀을 나가는 경우
      if (currentTeam?.id === teamId) {
        // 다른 팀이 있으면 첫 번째 팀 선택, 없으면 null
        const nextTeam = updatedTeams[0] || null;
        setCurrentTeam(nextTeam);
        
        if (!nextTeam) {
          setHasSelectedTeam(false);
          await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_TEAM);
          await AsyncStorage.setItem(STORAGE_KEYS.HAS_SELECTED_TEAM, 'false');
        } else {
          await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_TEAM, JSON.stringify(nextTeam));
        }
      }

      await AsyncStorage.setItem(STORAGE_KEYS.USER_TEAMS, JSON.stringify(updatedTeams));
    } catch (error) {
      console.error('Failed to leave team:', error);
      throw error;
    }
  };

  const refreshTeams = async () => {
    try {
      // TODO: API 호출로 팀 목록 새로고침
      console.log('Refreshing teams...');
    } catch (error) {
      console.error('Failed to refresh teams:', error);
      throw error;
    }
  };

  const inviteMember = async (email: string) => {
    try {
      // TODO: API 호출로 멤버 초대
      console.log('Inviting member:', email);
    } catch (error) {
      console.error('Failed to invite member:', error);
      throw error;
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      // TODO: API 호출로 멤버 제거
      console.log('Removing member:', memberId);
    } catch (error) {
      console.error('Failed to remove member:', error);
      throw error;
    }
  };

  const updateMemberRole = async (memberId: string, role: 'admin' | 'member') => {
    try {
      // TODO: API 호출로 멤버 역할 업데이트
      console.log('Updating member role:', memberId, role);
    } catch (error) {
      console.error('Failed to update member role:', error);
      throw error;
    }
  };

  const resetTeamData = async () => {
    try {
      console.log('Resetting team data...');
      
      // 상태 초기화
      setCurrentTeam(null);
      setUserTeams([]);
      setHasSelectedTeam(false);
      
      // 로컬 스토리지에서 제거
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_TEAM),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_TEAMS),
        AsyncStorage.removeItem(STORAGE_KEYS.HAS_SELECTED_TEAM)
      ]);
      
      console.log('Team data reset complete');
    } catch (error) {
      console.error('Failed to reset team data:', error);
      throw error;
    }
  };

  const skipTeamSelection = async () => {
    try {
      // 개발 모드 전용: 더미 팀 데이터 생성하여 hasSelectedTeam을 true로 설정
      const dummyTeam: Team = {
        id: 'dev_team',
        name: '개발 팀',
        description: '개발 모드용 더미 팀',
        members: [{
          id: 'dev_member_1',
          userId: 'dev_user',
          userName: '개발자',
          email: 'dev@example.com',
          role: 'owner',
          joinedAt: new Date().toISOString()
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: 'dev_user',
        inviteCode: 'DEV123',
        settings: {
          allowMemberInvites: true,
          autoAssignNewRoutines: false,
          notificationPreferences: {
            routineReminders: true,
            billAlerts: true,
            chatMessages: true
          }
        }
      };

      setCurrentTeam(dummyTeam);
      setUserTeams([dummyTeam]);
      setHasSelectedTeam(true);
      
      // 로컬 스토리지에 저장
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.CURRENT_TEAM, JSON.stringify(dummyTeam)),
        AsyncStorage.setItem(STORAGE_KEYS.USER_TEAMS, JSON.stringify([dummyTeam])),
        AsyncStorage.setItem(STORAGE_KEYS.HAS_SELECTED_TEAM, 'true')
      ]);
    } catch (error) {
      console.error('Failed to skip team selection:', error);
      throw error;
    }
  };

  const value = {
    currentTeam,
    userTeams,
    isLoading,
    hasSelectedTeam,
    createTeam,
    joinTeam,
    selectTeam,
    leaveTeam,
    refreshTeams,
    inviteMember,
    removeMember,
    updateMemberRole,
    skipTeamSelection,
    resetTeamData
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}