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
} from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

export interface Announcement {
  id: string;
  team_id: string;
  author_id: string;
  author_name: string;
  message: string;
  is_important: boolean;
  created_at: string;
}

interface CreateAnnouncementData {
  team_id: string;
  author_id: string;
  author_name: string;
  message: string;
  is_important: boolean;
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
 * 공지사항 생성
 */
export const createAnnouncement = async (data: CreateAnnouncementData): Promise<Announcement> => {
  try {
    const announcementData = {
      team_id: data.team_id,
      author_id: data.author_id,
      author_name: data.author_name,
      message: data.message,
      is_important: data.is_important,
      created_at: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'announcements'), announcementData);

    return {
      id: docRef.id,
      team_id: data.team_id,
      author_id: data.author_id,
      author_name: data.author_name,
      message: data.message,
      is_important: data.is_important,
      created_at: new Date().toISOString(),
    };
  } catch (error: any) {
    throw new Error(error.message || '공지사항 생성에 실패했습니다.');
  }
};

/**
 * 팀의 공지사항 목록 조회
 */
export const getTeamAnnouncements = async (teamId: string): Promise<Announcement[]> => {
  try {
    const q = query(
      collection(db, 'announcements'),
      where('team_id', '==', teamId),
      orderBy('created_at', 'desc')
    );

    const querySnapshot = await getDocs(q);

    const announcements: Announcement[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        team_id: data.team_id,
        author_id: data.author_id,
        author_name: data.author_name,
        message: data.message,
        is_important: data.is_important,
        created_at: timestampToDate(data.created_at).toISOString(),
      };
    });

    return announcements;
  } catch (error: any) {
    throw new Error(error.message || '공지사항 조회에 실패했습니다.');
  }
};

/**
 * 팀의 공지사항 실시간 리스너 구독
 */
export const subscribeToTeamAnnouncements = (
  teamId: string,
  onUpdate: (announcements: Announcement[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(db, 'announcements'),
    where('team_id', '==', teamId),
    orderBy('created_at', 'desc')
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const announcements: Announcement[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          team_id: data.team_id,
          author_id: data.author_id,
          author_name: data.author_name,
          message: data.message,
          is_important: data.is_important,
          created_at: timestampToDate(data.created_at).toISOString(),
        };
      });
      onUpdate(announcements);
    },
    (error) => {
      console.error('Announcement subscription error:', error);
      if (onError) {
        onError(new Error(error.message || '공지사항 실시간 업데이트에 실패했습니다.'));
      }
    }
  );

  return unsubscribe;
};
