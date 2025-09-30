import { Team } from "@/types/team.types";

// TODO: Replace with actual backend API implementation
export const teamsAPI = {
  // 팀 생성
  createTeam: async (data: {
    name: string;
    description: string;
    created_by: string;
  }): Promise<Team> => {
    console.log("teamsAPI.createTeam - Not implemented yet");

    const team: Team = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      created_by: data.created_by,
      invite_code: Math.random().toString(36).substring(7).toUpperCase(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return team;
  },

  // 초대 코드로 팀 찾기
  findTeamByInviteCode: async (inviteCode: string): Promise<Team | null> => {
    console.log("teamsAPI.findTeamByInviteCode - Not implemented yet");
    return null;
  },

  // 팀 참가
  joinTeam: async (teamId: string, userId: string): Promise<void> => {
    console.log("teamsAPI.joinTeam - Not implemented yet");
  },

  // 사용자의 팀 목록 가져오기
  getUserTeams: async (userId: string): Promise<Team[]> => {
    console.log("teamsAPI.getUserTeams - Not implemented yet");
    return [];
  },

  // 팀 나가기
  leaveTeam: async (teamId: string, userId: string): Promise<void> => {
    console.log("teamsAPI.leaveTeam - Not implemented yet");
  },

  // 멤버 초대 (이메일로)
  inviteMember: async (teamId: string, email: string): Promise<void> => {
    console.log("teamsAPI.inviteMember - Not implemented yet");
    throw new Error("Member invitation not implemented yet");
  },

  // 멤버 제거
  removeMember: async (teamId: string, memberId: string): Promise<void> => {
    console.log("teamsAPI.removeMember - Not implemented yet");
  },

  // 멤버 역할 업데이트
  updateMemberRole: async (
    teamId: string,
    memberId: string,
    role: "admin" | "member"
  ): Promise<void> => {
    console.log("teamsAPI.updateMemberRole - Not implemented yet");
  },
};