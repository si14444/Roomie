import { CreateTeamRequest, JoinTeamRequest, Team } from "@/types/team.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import * as teamService from "@/services/teamService";

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
  updateMemberRole: (
    memberId: string,
    role: "admin" | "member"
  ) => Promise<void>;

  // 개발 모드 전용 함수
  skipTeamSelection: () => Promise<void>;

  // 팀 데이터 초기화 (새 사용자 로그인 시)
  resetTeamData: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_TEAM: "current_team",
  USER_TEAMS: "user_teams",
  HAS_SELECTED_TEAM: "has_selected_team",
};

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSelectedTeam, setHasSelectedTeam] = useState(false);

  // 앱 시작 시 저장된 팀 정보 로드
  useEffect(() => {
    loadStoredTeamData();
  }, []);

  // 사용자가 로그인하면 팀 목록 새로고침
  useEffect(() => {
    if (user) {
      refreshTeams();
    } else {
      // 로그아웃 시 팀 데이터 리셋
      resetTeamData();
    }
  }, [user]);

  const loadStoredTeamData = async () => {
    try {
      setIsLoading(true);

      const [storedCurrentTeam, storedUserTeams, storedHasSelected] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TEAM),
          AsyncStorage.getItem(STORAGE_KEYS.USER_TEAMS),
          AsyncStorage.getItem(STORAGE_KEYS.HAS_SELECTED_TEAM),
        ]);

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
      const hasSelected = storedHasSelected === "true";
      setHasSelectedTeam(hasSelected);
    } catch (error) {
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
      if (!user) {
        throw new Error("사용자가 로그인되지 않았습니다.");
      }

      const newTeam = await teamService.createTeam({
        name: teamData.name,
        description: teamData.description,
      });

      // 팀 목록에 추가
      const updatedTeams = [...userTeams, newTeam];
      setUserTeams(updatedTeams);

      // 새 팀을 현재 팀으로 설정
      await selectTeam(newTeam);

      // 로컬 스토리지에 저장
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_TEAMS,
        JSON.stringify(updatedTeams)
      );

      return newTeam;
    } catch (error) {
      throw error;
    }
  };

  const joinTeam = async (joinData: JoinTeamRequest): Promise<Team> => {
    try {
      if (!user) {
        throw new Error("사용자가 로그인되지 않았습니다.");
      }

      // 초대 코드로 팀 찾기
      const team = await teamService.findTeamByInviteCode(joinData.inviteCode);
      if (!team) {
        throw new Error("유효하지 않은 초대 코드입니다.");
      }

      // 팀에 참가
      await teamService.joinTeam(team.id, user.id);

      // 팀 목록에 추가
      const updatedTeams = [...userTeams, team];
      setUserTeams(updatedTeams);

      // 참가한 팀을 현재 팀으로 설정
      await selectTeam(team);

      // 로컬 스토리지에 저장
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_TEAMS,
        JSON.stringify(updatedTeams)
      );

      return team;
    } catch (error) {
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
        AsyncStorage.setItem(STORAGE_KEYS.HAS_SELECTED_TEAM, "true"),
      ]);
    } catch (error) {
      throw error;
    }
  };

  const leaveTeam = async (teamId: string) => {
    try {
      if (!user) {
        throw new Error("사용자가 로그인되지 않았습니다.");
      }

      // Firebase로 실제 팀 나가기
      await teamService.leaveTeam(teamId, user.id);

      const updatedTeams = userTeams.filter((team) => team.id !== teamId);
      setUserTeams(updatedTeams);

      // 현재 선택된 팀을 나가는 경우
      if (currentTeam?.id === teamId) {
        // 다른 팀이 있으면 첫 번째 팀 선택, 없으면 null
        const nextTeam = updatedTeams[0] || null;
        setCurrentTeam(nextTeam);

        if (!nextTeam) {
          setHasSelectedTeam(false);
          await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_TEAM);
          await AsyncStorage.setItem(STORAGE_KEYS.HAS_SELECTED_TEAM, "false");
        } else {
          await AsyncStorage.setItem(
            STORAGE_KEYS.CURRENT_TEAM,
            JSON.stringify(nextTeam)
          );
        }
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_TEAMS,
        JSON.stringify(updatedTeams)
      );
    } catch (error) {
      throw error;
    }
  };

  const refreshTeams = async () => {
    try {
      if (!user) {
        return;
      }

      const teams = await teamService.getUserTeams(user.id);
      setUserTeams(teams);

      // 로컬 스토리지에 저장
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_TEAMS,
        JSON.stringify(teams)
      );

      // 팀이 있으면 자동으로 첫 번째 팀 선택
      if (teams.length > 0 && !hasSelectedTeam) {
        await selectTeam(teams[0]);
      }

      // 현재 선택된 팀이 목록에 없다면 첫 번째 팀으로 설정
      if (currentTeam && !teams.find((t) => t.id === currentTeam.id)) {
        if (teams.length > 0) {
          await selectTeam(teams[0]);
        } else {
          setCurrentTeam(null);
          setHasSelectedTeam(false);
          await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_TEAM);
          await AsyncStorage.setItem(STORAGE_KEYS.HAS_SELECTED_TEAM, "false");
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const inviteMember = async (email: string) => {
    try {
      if (!currentTeam) {
        throw new Error("선택된 팀이 없습니다.");
      }

      // TODO: 이메일 초대 기능은 추후 구현
    } catch (error) {
      throw error;
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      if (!currentTeam) {
        throw new Error("선택된 팀이 없습니다.");
      }

      // TODO: 멤버 제거 기능은 추후 구현
    } catch (error) {
      throw error;
    }
  };

  const updateMemberRole = async (
    memberId: string,
    role: "admin" | "member"
  ) => {
    try {
      if (!currentTeam) {
        throw new Error("선택된 팀이 없습니다.");
      }

      // TODO: 멤버 역할 변경 기능은 추후 구현
    } catch (error) {
      throw error;
    }
  };

  const resetTeamData = async () => {
    try {
      // 상태 초기화
      setCurrentTeam(null);
      setUserTeams([]);
      setHasSelectedTeam(false);

      // 로컬 스토리지에서 제거
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_TEAM),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_TEAMS),
        AsyncStorage.removeItem(STORAGE_KEYS.HAS_SELECTED_TEAM),
      ]);
    } catch (error) {
      throw error;
    }
  };

  const skipTeamSelection = async () => {
    // 개발 모드 기능 제거됨 - 더 이상 사용하지 않음
    throw new Error("개발 모드 기능이 제거되었습니다. 팀을 생성하거나 참가해주세요.");
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
    resetTeamData,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return context;
}
