import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { auth } from '@/config/firebaseConfig';
import { Team } from '@/types/team.types';

export interface CreateTeamData {
  name: string;
  description?: string;
}

/**
 * 랜덤 초대 코드 생성 (6자리 영숫자)
 */
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Firestore Timestamp를 Date로 변환
 */
const timestampToDate = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

/**
 * 팀 생성
 */
export const createTeam = async (data: CreateTeamData): Promise<Team> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('사용자가 로그인되지 않았습니다.');
    }

    const inviteCode = generateInviteCode();
    const teamData = {
      name: data.name,
      description: data.description || '',
      invite_code: inviteCode,
      created_by: currentUser.uid,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };

    // 팀 생성
    const teamRef = await addDoc(collection(db, 'teams'), teamData);

    // 생성자를 admin이자 방장으로 팀 멤버에 추가
    await addDoc(collection(db, 'team_members'), {
      team_id: teamRef.id,
      user_id: currentUser.uid,
      role: 'admin',
      is_leader: true, // 팀 생성자는 방장
      joined_at: serverTimestamp(),
    });

    // 생성된 팀 데이터 반환
    const teamDoc = await getDoc(teamRef);
    const team = teamDoc.data();

    return {
      id: teamRef.id,
      name: team!.name,
      description: team!.description,
      invite_code: team!.invite_code,
      created_by: team!.created_by,
      created_at: timestampToDate(team!.created_at).toISOString(),
      updated_at: timestampToDate(team!.updated_at).toISOString(),
    };
  } catch (error: any) {
    console.error('Failed to create team:', error);
    throw new Error(error.message || '팀 생성에 실패했습니다.');
  }
};

/**
 * 초대 코드로 팀 찾기
 */
export const findTeamByInviteCode = async (inviteCode: string): Promise<Team | null> => {
  try {
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where('invite_code', '==', inviteCode.toUpperCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const teamDoc = querySnapshot.docs[0];
    const team = teamDoc.data();

    return {
      id: teamDoc.id,
      name: team.name,
      description: team.description,
      invite_code: team.invite_code,
      created_by: team.created_by,
      created_at: timestampToDate(team.created_at).toISOString(),
      updated_at: timestampToDate(team.updated_at).toISOString(),
    };
  } catch (error: any) {
    console.error('Failed to find team:', error);
    throw new Error(error.message || '팀을 찾을 수 없습니다.');
  }
};

/**
 * 팀 참가
 */
export const joinTeam = async (teamId: string, userId: string): Promise<void> => {
  try {
    // 이미 팀 멤버인지 확인
    const membersRef = collection(db, 'team_members');
    const q = query(
      membersRef,
      where('team_id', '==', teamId),
      where('user_id', '==', userId)
    );
    const existingMember = await getDocs(q);

    if (!existingMember.empty) {
      throw new Error('이미 이 팀의 멤버입니다.');
    }

    // 팀 멤버로 추가 (일반 멤버는 방장 아님)
    await addDoc(collection(db, 'team_members'), {
      team_id: teamId,
      user_id: userId,
      role: 'member',
      is_leader: false,
      joined_at: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Failed to join team:', error);
    throw new Error(error.message || '팀 참가에 실패했습니다.');
  }
};

/**
 * 사용자가 속한 팀 목록 조회
 */
export const getUserTeams = async (userId: string): Promise<Team[]> => {
  try {
    // 사용자가 멤버인 팀 ID 목록 조회
    const membersRef = collection(db, 'team_members');
    const q = query(membersRef, where('user_id', '==', userId));
    const memberSnapshot = await getDocs(q);

    const teamIds = memberSnapshot.docs.map(doc => doc.data().team_id);

    if (teamIds.length === 0) {
      return [];
    }

    // 팀 정보 조회
    const teams: Team[] = [];
    for (const teamId of teamIds) {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      if (teamDoc.exists()) {
        const team = teamDoc.data();
        teams.push({
          id: teamDoc.id,
          name: team.name,
          description: team.description,
          invite_code: team.invite_code,
          created_by: team.created_by,
          created_at: timestampToDate(team.created_at).toISOString(),
          updated_at: timestampToDate(team.updated_at).toISOString(),
        });
      }
    }

    return teams;
  } catch (error: any) {
    console.error('Failed to get user teams:', error);
    throw new Error(error.message || '팀 목록 조회에 실패했습니다.');
  }
};

/**
 * 팀 나가기
 */
export const leaveTeam = async (teamId: string, userId: string): Promise<void> => {
  try {
    // 팀 멤버 문서 찾기
    const membersRef = collection(db, 'team_members');
    const q = query(
      membersRef,
      where('team_id', '==', teamId),
      where('user_id', '==', userId)
    );
    const memberSnapshot = await getDocs(q);

    if (memberSnapshot.empty) {
      throw new Error('팀 멤버가 아닙니다.');
    }

    // 팀 멤버 삭제
    const memberDoc = memberSnapshot.docs[0];
    await deleteDoc(doc(db, 'team_members', memberDoc.id));

    // 팀에 남은 멤버 확인
    const remainingMembersQuery = query(membersRef, where('team_id', '==', teamId));
    const remainingMembers = await getDocs(remainingMembersQuery);

    // 마지막 멤버였다면 팀도 삭제
    if (remainingMembers.empty) {
      await deleteDoc(doc(db, 'teams', teamId));
    }
  } catch (error: any) {
    console.error('Failed to leave team:', error);
    throw new Error(error.message || '팀 나가기에 실패했습니다.');
  }
};

/**
 * 팀 정보 업데이트
 */
export const updateTeam = async (
  teamId: string,
  data: Partial<CreateTeamData>
): Promise<void> => {
  try {
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, {
      ...data,
      updated_at: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Failed to update team:', error);
    throw new Error(error.message || '팀 정보 업데이트에 실패했습니다.');
  }
};

/**
 * 팀 삭제
 */
export const deleteTeam = async (teamId: string): Promise<void> => {
  try {
    // 팀 멤버 모두 삭제
    const membersRef = collection(db, 'team_members');
    const q = query(membersRef, where('team_id', '==', teamId));
    const memberSnapshot = await getDocs(q);

    const deletePromises = memberSnapshot.docs.map(memberDoc =>
      deleteDoc(doc(db, 'team_members', memberDoc.id))
    );
    await Promise.all(deletePromises);

    // 팀 삭제
    await deleteDoc(doc(db, 'teams', teamId));
  } catch (error: any) {
    console.error('Failed to delete team:', error);
    throw new Error(error.message || '팀 삭제에 실패했습니다.');
  }
};

/**
 * 팀 멤버 목록 조회
 */
export interface TeamMemberData {
  id: string;
  team_id: string;
  user_id: string;
  role: 'admin' | 'member';
  is_leader: boolean; // 방장 여부
  joined_at: string;
}

export const getTeamMembers = async (teamId: string): Promise<TeamMemberData[]> => {
  try {
    const membersRef = collection(db, 'team_members');
    const q = query(membersRef, where('team_id', '==', teamId));
    const memberSnapshot = await getDocs(q);

    const members: TeamMemberData[] = memberSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        team_id: data.team_id,
        user_id: data.user_id,
        role: data.role,
        is_leader: data.is_leader || false, // 기본값 false
        joined_at: timestampToDate(data.joined_at).toISOString(),
      };
    });

    return members;
  } catch (error: any) {
    console.error('Failed to get team members:', error);
    throw new Error(error.message || '팀 멤버 조회에 실패했습니다.');
  }
};
