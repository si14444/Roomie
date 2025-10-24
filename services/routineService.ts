import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { getTeamMembersPushTokens } from './teamService';
import { sendPushNotifications } from './notificationService';

export interface Routine {
  id: string;
  team_id: string;
  title: string;
  description?: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  frequency_details?: Record<string, any>;
  assigned_to: string;
  assigned_name: string;
  priority: 'low' | 'medium' | 'high';
  is_active: boolean;
  postpone_until?: string; // 미루기 날짜
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface RoutineCompletion {
  id: string;
  routine_id: string;
  completed_by: string;
  completed_by_name: string;
  completed_at: string;
  notes?: string;
}

interface CreateRoutineData {
  team_id: string;
  title: string;
  description?: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  frequency_details?: Record<string, any>;
  assigned_to: string;
  assigned_name: string;
  priority: 'low' | 'medium' | 'high';
  created_by: string;
}

interface CreateCompletionData {
  routine_id: string;
  completed_by: string;
  completed_by_name: string;
  notes?: string;
}

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
 * 루틴 생성
 */
export const createRoutine = async (data: CreateRoutineData): Promise<Routine> => {
  try {
    const routineData = {
      team_id: data.team_id,
      title: data.title,
      description: data.description || '',
      category: data.category,
      frequency: data.frequency,
      frequency_details: data.frequency_details || {},
      assigned_to: data.assigned_to,
      assigned_name: data.assigned_name,
      priority: data.priority,
      is_active: true,
      created_by: data.created_by,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'routines'), routineData);

    return {
      id: docRef.id,
      team_id: data.team_id,
      title: data.title,
      description: data.description,
      category: data.category,
      frequency: data.frequency,
      frequency_details: data.frequency_details,
      assigned_to: data.assigned_to,
      assigned_name: data.assigned_name,
      priority: data.priority,
      is_active: true,
      created_by: data.created_by,
      created_at: new Date().toISOString(),
    };
  } catch (error: any) {
    throw new Error(error.message || '루틴 생성에 실패했습니다.');
  }
};

/**
 * 팀의 루틴 목록 조회
 */
export const getTeamRoutines = async (teamId: string): Promise<Routine[]> => {
  try {
    const q = query(
      collection(db, 'routines'),
      where('team_id', '==', teamId),
      where('is_active', '==', true),
      orderBy('created_at', 'desc')
    );

    const querySnapshot = await getDocs(q);

    const routines: Routine[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        team_id: data.team_id,
        title: data.title,
        description: data.description,
        category: data.category,
        frequency: data.frequency,
        frequency_details: data.frequency_details,
        assigned_to: data.assigned_to,
        assigned_name: data.assigned_name,
        priority: data.priority,
        is_active: data.is_active,
        postpone_until: data.postpone_until,
        created_by: data.created_by,
        created_at: timestampToDate(data.created_at).toISOString(),
        updated_at: data.updated_at ? timestampToDate(data.updated_at).toISOString() : undefined,
      };
    });

    return routines;
  } catch (error: any) {
    throw new Error(error.message || '루틴 조회에 실패했습니다.');
  }
};

/**
 * 팀의 루틴 실시간 리스너 구독
 */
export const subscribeToTeamRoutines = (
  teamId: string,
  onUpdate: (routines: Routine[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(db, 'routines'),
    where('team_id', '==', teamId),
    where('is_active', '==', true),
    orderBy('created_at', 'desc')
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const routines: Routine[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          team_id: data.team_id,
          title: data.title,
          description: data.description,
          category: data.category,
          frequency: data.frequency,
          frequency_details: data.frequency_details,
          assigned_to: data.assigned_to,
          assigned_name: data.assigned_name,
          priority: data.priority,
          is_active: data.is_active,
          postpone_until: data.postpone_until,
          created_by: data.created_by,
          created_at: timestampToDate(data.created_at).toISOString(),
          updated_at: data.updated_at ? timestampToDate(data.updated_at).toISOString() : undefined,
        };
      });
      onUpdate(routines);
    },
    (error) => {
      console.error('Routine subscription error:', error);
      if (onError) {
        onError(new Error(error.message || '루틴 실시간 업데이트에 실패했습니다.'));
      }
    }
  );

  return unsubscribe;
};

/**
 * 루틴 수정
 */
export const updateRoutine = async (
  routineId: string,
  updates: Partial<Omit<Routine, 'id' | 'created_at' | 'team_id'>>
): Promise<void> => {
  try {
    const routineRef = doc(db, 'routines', routineId);
    await updateDoc(routineRef, {
      ...updates,
      updated_at: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || '루틴 수정에 실패했습니다.');
  }
};

/**
 * 루틴 삭제 (소프트 삭제)
 */
export const deleteRoutine = async (routineId: string): Promise<void> => {
  try {
    const routineRef = doc(db, 'routines', routineId);
    await updateDoc(routineRef, {
      is_active: false,
      updated_at: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || '루틴 삭제에 실패했습니다.');
  }
};

/**
 * 루틴 완료 기록 생성
 */
export const createRoutineCompletion = async (
  data: CreateCompletionData
): Promise<RoutineCompletion> => {
  try {
    const completionData = {
      routine_id: data.routine_id,
      completed_by: data.completed_by,
      completed_by_name: data.completed_by_name,
      completed_at: serverTimestamp(),
      notes: data.notes || '',
    };

    const docRef = await addDoc(collection(db, 'routine_completions'), completionData);

    const completion: RoutineCompletion = {
      id: docRef.id,
      routine_id: data.routine_id,
      completed_by: data.completed_by,
      completed_by_name: data.completed_by_name,
      completed_at: new Date().toISOString(),
      notes: data.notes,
    };

    // 루틴 정보 가져오기 및 팀원들에게 푸시 알림 전송 (비동기로 처리, 에러 무시)
    getDoc(doc(db, 'routines', data.routine_id))
      .then(async (routineDoc) => {
        if (routineDoc.exists()) {
          const routine = routineDoc.data();
          const pushTokens = await getTeamMembersPushTokens(routine.team_id, data.completed_by, 'routine_completed');

          if (pushTokens.length > 0) {
            // 상세한 알림 메시지 - 시간 정보 포함
            const completedTime = new Date().toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit'
            });
            const notesInfo = data.notes ? ` (메모: ${data.notes})` : '';

            sendPushNotifications(
              pushTokens,
              `✅ ${routine.title} 루틴 완료`,
              `${data.completed_by_name}님이 ${completedTime}에 완료했습니다${notesInfo}`,
              { type: 'routine_completed', completionId: docRef.id, routineId: data.routine_id }
            );
          }
        }
      })
      .catch((error) => {
        console.error('Failed to send push notification:', error);
      });

    return completion;
  } catch (error: any) {
    throw new Error(error.message || '루틴 완료 기록 생성에 실패했습니다.');
  }
};

/**
 * 루틴의 완료 기록 조회
 */
export const getRoutineCompletions = async (routineId: string): Promise<RoutineCompletion[]> => {
  try {
    const q = query(
      collection(db, 'routine_completions'),
      where('routine_id', '==', routineId),
      orderBy('completed_at', 'desc')
    );

    const querySnapshot = await getDocs(q);

    const completions: RoutineCompletion[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        routine_id: data.routine_id,
        completed_by: data.completed_by,
        completed_by_name: data.completed_by_name,
        completed_at: timestampToDate(data.completed_at).toISOString(),
        notes: data.notes,
      };
    });

    return completions;
  } catch (error: any) {
    throw new Error(error.message || '루틴 완료 기록 조회에 실패했습니다.');
  }
};

/**
 * 오늘의 완료 기록 조회 (특정 루틴에 대해)
 */
export const getTodayCompletion = async (
  routineId: string,
  userId: string
): Promise<RoutineCompletion | null> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, 'routine_completions'),
      where('routine_id', '==', routineId),
      where('completed_by', '==', userId),
      orderBy('completed_at', 'desc')
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    // Get the most recent completion
    const mostRecent = querySnapshot.docs[0];
    const data = mostRecent.data();
    const completedAt = timestampToDate(data.completed_at);

    // Check if it's from today
    if (completedAt >= today) {
      return {
        id: mostRecent.id,
        routine_id: data.routine_id,
        completed_by: data.completed_by,
        completed_by_name: data.completed_by_name,
        completed_at: completedAt.toISOString(),
        notes: data.notes,
      };
    }

    return null;
  } catch (error: any) {
    throw new Error(error.message || '오늘의 완료 기록 조회에 실패했습니다.');
  }
};

/**
 * 특정 루틴의 오늘 완료 여부 확인
 */
export const checkTodayCompletion = async (routineId: string): Promise<RoutineCompletion | null> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, 'routine_completions'),
      where('routine_id', '==', routineId),
      orderBy('completed_at', 'desc')
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    // Get the most recent completion
    const mostRecent = querySnapshot.docs[0];
    const data = mostRecent.data();
    const completedAt = timestampToDate(data.completed_at);

    // Check if it's from today
    if (completedAt >= today) {
      return {
        id: mostRecent.id,
        routine_id: data.routine_id,
        completed_by: data.completed_by,
        completed_by_name: data.completed_by_name,
        completed_at: completedAt.toISOString(),
        notes: data.notes,
      };
    }

    return null;
  } catch (error: any) {
    throw new Error(error.message || '완료 기록 조회에 실패했습니다.');
  }
};
