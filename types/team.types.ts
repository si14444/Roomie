export interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  inviteCode?: string;
  settings: TeamSettings;
}

export interface TeamMember {
  id: string;
  userId: string;
  userName: string;
  email: string;
  role: TeamRole;
  joinedAt: string;
  avatar?: string;
}

export interface TeamSettings {
  allowMemberInvites: boolean;
  autoAssignNewRoutines: boolean;
  notificationPreferences: {
    routineReminders: boolean;
    billAlerts: boolean;
    chatMessages: boolean;
  };
}

export type TeamRole = 'owner' | 'admin' | 'member';

export interface CreateTeamRequest {
  name: string;
  description?: string;
  settings?: Partial<TeamSettings>;
}

export interface JoinTeamRequest {
  inviteCode: string;
}

export interface TeamInvite {
  id: string;
  teamId: string;
  teamName: string;
  inviterName: string;
  inviteCode: string;
  expiresAt: string;
  createdAt: string;
}