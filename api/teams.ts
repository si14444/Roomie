import { supabase } from "@/lib/supabase";
import { Team } from "@/types/team.types";

export const teamsAPI = {
  // 팀 생성
  createTeam: async (data: {
    name: string;
    description: string;
    created_by: string;
  }): Promise<Team> => {
    const { data: team, error } = await supabase
      .from("teams")
      .insert([
        {
          name: data.name,
          description: data.description,
          created_by: data.created_by,
          invite_code: Math.random().toString(36).substring(7).toUpperCase(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("팀 생성 오류:", error);
      throw new Error("Failed to create team");
    }

    return team;
  },

  // 초대 코드로 팀 찾기
  findTeamByInviteCode: async (inviteCode: string): Promise<Team | null> => {
    const { data: team, error } = await supabase
      .from("teams")
      .select("*")
      .eq("invite_code", inviteCode)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      console.error("팀 찾기 오류:", error);
      throw new Error("Failed to find team");
    }

    return team;
  },

  // 팀 참가
  joinTeam: async (teamId: string, userId: string): Promise<void> => {
    const { error } = await supabase.from("team_members").insert([
      {
        team_id: teamId,
        user_id: userId,
        role: "member",
      },
    ]);

    if (error) {
      console.error("팀 참가 오류:", error);
      throw new Error("Failed to join team");
    }
  },

  // 사용자의 팀 목록 가져오기
  getUserTeams: async (userId: string): Promise<Team[]> => {
    const { data: teamMembers, error } = await supabase
      .from("team_members")
      .select(
        `
        teams (*)
      `
      )
      .eq("user_id", userId);

    if (error) {
      console.error("사용자 팀 목록 가져오기 오류:", error);
      throw new Error("Failed to get user teams");
    }

    return teamMembers?.map((item: any) => item.teams).filter(Boolean) || [];
  },

  // 팀 나가기
  leaveTeam: async (teamId: string, userId: string): Promise<void> => {
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("user_id", userId);

    if (error) {
      console.error("팀 나가기 오류:", error);
      throw new Error("Failed to leave team");
    }
  },

  // 멤버 초대 (이메일로)
  inviteMember: async (teamId: string, email: string): Promise<void> => {
    // TODO: 이메일로 사용자 찾기 로직 구현 필요
    // 현재는 단순히 로그만 출력
    console.log("멤버 초대:", { teamId, email });

    // 실제 구현 시에는 이메일로 사용자를 찾고 team_members에 추가
    throw new Error("Member invitation not implemented yet");
  },

  // 멤버 제거
  removeMember: async (teamId: string, memberId: string): Promise<void> => {
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("user_id", memberId);

    if (error) {
      console.error("멤버 제거 오류:", error);
      throw new Error("Failed to remove member");
    }
  },

  // 멤버 역할 업데이트
  updateMemberRole: async (
    teamId: string,
    memberId: string,
    role: "admin" | "member"
  ): Promise<void> => {
    const { error } = await supabase
      .from("team_members")
      .update({ role: role })
      .eq("team_id", teamId)
      .eq("user_id", memberId);

    if (error) {
      console.error("멤버 역할 업데이트 오류:", error);
      throw new Error("Failed to update member role");
    }
  },
};
