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
} from 'firebase/firestore';
import { db, auth } from '@/config/firebaseConfig';
import { getTeamMembersPushTokens } from './teamService';
import { sendPushNotifications } from './notificationService';

export interface Item {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  category: 'food' | 'household' | 'cleaning' | 'toiletries' | 'other';
  current_quantity: number;
  min_quantity: number;
  unit?: string;
  estimated_price?: number;
  preferred_store?: string;
  last_purchased_at?: string;
  last_purchased_by?: string;
  created_at: string;
  updated_at?: string;
  created_by: string;
}

export interface PurchaseRequest {
  id: string;
  team_id: string;
  item_id?: string;
  item_name?: string; // For new items not yet in inventory
  requested_by: string;
  requested_by_name: string;
  quantity: number;
  urgency: 'urgent' | 'normal' | 'low';
  notes?: string;
  status: 'pending' | 'approved' | 'purchased' | 'rejected';
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string;
  purchased_by?: string;
  purchased_by_name?: string;
  purchased_at?: string;
  estimated_price?: number;
  preferred_store?: string;
  created_at: string;
  updated_at?: string;
}

interface CreateItemData {
  team_id: string;
  name: string;
  description?: string;
  category: 'food' | 'household' | 'cleaning' | 'toiletries' | 'other';
  current_quantity: number;
  min_quantity: number;
  unit?: string;
  estimated_price?: number;
  preferred_store?: string;
  created_by: string;
}

interface CreatePurchaseRequestData {
  team_id: string;
  item_id?: string;
  item_name?: string;
  requested_by: string;
  requested_by_name: string;
  quantity: number;
  urgency: 'urgent' | 'normal' | 'low';
  notes?: string;
  estimated_price?: number;
  preferred_store?: string;
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
 * 아이템 생성
 */
export const createItem = async (data: CreateItemData): Promise<Item> => {
  try {
    // Firebase Auth 상태 확인
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('Firebase 인증이 필요합니다. 로그인해주세요.');
    }

    const itemData = {
      team_id: data.team_id,
      name: data.name,
      description: data.description || '',
      category: data.category,
      current_quantity: data.current_quantity,
      min_quantity: data.min_quantity,
      unit: data.unit || '개',
      estimated_price: data.estimated_price || 0,
      preferred_store: data.preferred_store || '',
      created_by: data.created_by,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'items'), itemData);

    return {
      id: docRef.id,
      team_id: data.team_id,
      name: data.name,
      description: data.description,
      category: data.category,
      current_quantity: data.current_quantity,
      min_quantity: data.min_quantity,
      unit: data.unit,
      estimated_price: data.estimated_price,
      preferred_store: data.preferred_store,
      created_by: data.created_by,
      created_at: new Date().toISOString(),
    };
  } catch (error: any) {
    if (__DEV__) {
      console.error('❌ [Firebase] 저장 실패:', error);
      console.error('❌ [Firebase] 에러 코드:', error.code);
      console.error('❌ [Firebase] 에러 메시지:', error.message);
    }
    throw new Error(error.message || '아이템 생성에 실패했습니다.');
  }
};

/**
 * 팀의 아이템 목록 조회
 */
export const getTeamItems = async (teamId: string): Promise<Item[]> => {
  try {
    const q = query(
      collection(db, 'items'),
      where('team_id', '==', teamId),
      orderBy('created_at', 'desc')
    );

    const querySnapshot = await getDocs(q);

    const items: Item[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        team_id: data.team_id,
        name: data.name,
        description: data.description,
        category: data.category,
        current_quantity: data.current_quantity,
        min_quantity: data.min_quantity,
        unit: data.unit,
        estimated_price: data.estimated_price,
        preferred_store: data.preferred_store,
        last_purchased_at: data.last_purchased_at ? timestampToDate(data.last_purchased_at).toISOString() : undefined,
        last_purchased_by: data.last_purchased_by,
        created_by: data.created_by,
        created_at: timestampToDate(data.created_at).toISOString(),
        updated_at: data.updated_at ? timestampToDate(data.updated_at).toISOString() : undefined,
      };
    });

    return items;
  } catch (error: any) {
    throw new Error(error.message || '아이템 조회에 실패했습니다.');
  }
};

/**
 * 팀의 아이템 실시간 리스너 구독
 */
export const subscribeToTeamItems = (
  teamId: string,
  onUpdate: (items: Item[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(db, 'items'),
    where('team_id', '==', teamId),
    orderBy('created_at', 'desc')
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const items: Item[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          team_id: data.team_id,
          name: data.name,
          description: data.description,
          category: data.category,
          current_quantity: data.current_quantity,
          min_quantity: data.min_quantity,
          unit: data.unit,
          estimated_price: data.estimated_price,
          preferred_store: data.preferred_store,
          last_purchased_at: data.last_purchased_at ? timestampToDate(data.last_purchased_at).toISOString() : undefined,
          last_purchased_by: data.last_purchased_by,
          created_by: data.created_by,
          created_at: timestampToDate(data.created_at).toISOString(),
          updated_at: data.updated_at ? timestampToDate(data.updated_at).toISOString() : undefined,
        };
      });
      onUpdate(items);
    },
    (error) => {
      console.error('Item subscription error:', error);
      if (onError) {
        onError(new Error(error.message || '아이템 실시간 업데이트에 실패했습니다.'));
      }
    }
  );

  return unsubscribe;
};

/**
 * 아이템 수정
 */
export const updateItem = async (
  itemId: string,
  updates: Partial<Omit<Item, 'id' | 'created_at' | 'team_id'>>
): Promise<void> => {
  try {
    const itemRef = doc(db, 'items', itemId);
    await updateDoc(itemRef, {
      ...updates,
      updated_at: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || '아이템 수정에 실패했습니다.');
  }
};

/**
 * 아이템 삭제
 */
export const deleteItem = async (itemId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'items', itemId));
  } catch (error: any) {
    throw new Error(error.message || '아이템 삭제에 실패했습니다.');
  }
};

/**
 * 구매 요청 생성
 */
export const createPurchaseRequest = async (
  data: CreatePurchaseRequestData
): Promise<PurchaseRequest> => {
  try {
    const requestData = {
      team_id: data.team_id,
      item_id: data.item_id || '',
      item_name: data.item_name || '',
      requested_by: data.requested_by,
      requested_by_name: data.requested_by_name,
      quantity: data.quantity,
      urgency: data.urgency,
      notes: data.notes || '',
      status: 'pending' as const,
      estimated_price: data.estimated_price || 0,
      preferred_store: data.preferred_store || '',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'purchase_requests'), requestData);

    const request: PurchaseRequest = {
      id: docRef.id,
      team_id: data.team_id,
      item_id: data.item_id,
      item_name: data.item_name,
      requested_by: data.requested_by,
      requested_by_name: data.requested_by_name,
      quantity: data.quantity,
      urgency: data.urgency,
      notes: data.notes,
      status: 'pending',
      estimated_price: data.estimated_price,
      preferred_store: data.preferred_store,
      created_at: new Date().toISOString(),
    };

    // 팀원들에게 푸시 알림 전송 (비동기로 처리, 에러 무시)
    getTeamMembersPushTokens(data.team_id, data.requested_by, 'item_request')
      .then((pushTokens) => {
        if (pushTokens.length > 0) {
          const urgencyEmoji = data.urgency === 'urgent' ? '🔥 ' : '';
          sendPushNotifications(
            pushTokens,
            `📦 ${urgencyEmoji}새로운 구매 요청`,
            `${data.item_name} ${data.quantity}개`,
            { type: 'item_request', requestId: docRef.id }
          );
        }
      })
      .catch((error) => {
        console.error('Failed to send push notification:', error);
      });

    return request;
  } catch (error: any) {
    throw new Error(error.message || '구매 요청 생성에 실패했습니다.');
  }
};

/**
 * 팀의 구매 요청 목록 조회
 */
export const getTeamPurchaseRequests = async (teamId: string): Promise<PurchaseRequest[]> => {
  try {
    const q = query(
      collection(db, 'purchase_requests'),
      where('team_id', '==', teamId),
      orderBy('created_at', 'desc')
    );

    const querySnapshot = await getDocs(q);

    const requests: PurchaseRequest[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        team_id: data.team_id,
        item_id: data.item_id,
        item_name: data.item_name,
        requested_by: data.requested_by,
        requested_by_name: data.requested_by_name,
        quantity: data.quantity,
        urgency: data.urgency,
        notes: data.notes,
        status: data.status,
        approved_by: data.approved_by,
        approved_by_name: data.approved_by_name,
        approved_at: data.approved_at ? timestampToDate(data.approved_at).toISOString() : undefined,
        purchased_by: data.purchased_by,
        purchased_by_name: data.purchased_by_name,
        purchased_at: data.purchased_at ? timestampToDate(data.purchased_at).toISOString() : undefined,
        estimated_price: data.estimated_price,
        preferred_store: data.preferred_store,
        created_at: timestampToDate(data.created_at).toISOString(),
        updated_at: data.updated_at ? timestampToDate(data.updated_at).toISOString() : undefined,
      };
    });

    return requests;
  } catch (error: any) {
    throw new Error(error.message || '구매 요청 조회에 실패했습니다.');
  }
};

/**
 * 팀의 구매 요청 실시간 리스너 구독
 */
export const subscribeToTeamPurchaseRequests = (
  teamId: string,
  onUpdate: (requests: PurchaseRequest[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(db, 'purchase_requests'),
    where('team_id', '==', teamId),
    orderBy('created_at', 'desc')
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const requests: PurchaseRequest[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          team_id: data.team_id,
          item_id: data.item_id,
          item_name: data.item_name,
          requested_by: data.requested_by,
          requested_by_name: data.requested_by_name,
          quantity: data.quantity,
          urgency: data.urgency,
          notes: data.notes,
          status: data.status,
          approved_by: data.approved_by,
          approved_by_name: data.approved_by_name,
          approved_at: data.approved_at ? timestampToDate(data.approved_at).toISOString() : undefined,
          purchased_by: data.purchased_by,
          purchased_by_name: data.purchased_by_name,
          purchased_at: data.purchased_at ? timestampToDate(data.purchased_at).toISOString() : undefined,
          estimated_price: data.estimated_price,
          preferred_store: data.preferred_store,
          created_at: timestampToDate(data.created_at).toISOString(),
          updated_at: data.updated_at ? timestampToDate(data.updated_at).toISOString() : undefined,
        };
      });
      onUpdate(requests);
    },
    (error) => {
      console.error('Purchase request subscription error:', error);
      if (onError) {
        onError(new Error(error.message || '구매 요청 실시간 업데이트에 실패했습니다.'));
      }
    }
  );

  return unsubscribe;
};

/**
 * 구매 요청 승인
 */
export const approvePurchaseRequest = async (
  requestId: string,
  approvedBy: string,
  approvedByName: string
): Promise<void> => {
  try {
    const requestRef = doc(db, 'purchase_requests', requestId);
    await updateDoc(requestRef, {
      status: 'approved',
      approved_by: approvedBy,
      approved_by_name: approvedByName,
      approved_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || '구매 요청 승인에 실패했습니다.');
  }
};

/**
 * 구매 요청 거절
 */
export const rejectPurchaseRequest = async (requestId: string): Promise<void> => {
  try {
    const requestRef = doc(db, 'purchase_requests', requestId);
    await updateDoc(requestRef, {
      status: 'rejected',
      updated_at: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || '구매 요청 거절에 실패했습니다.');
  }
};

/**
 * 구매 완료 처리
 */
export const markAsPurchased = async (
  requestId: string,
  purchasedBy: string,
  purchasedByName: string
): Promise<void> => {
  try {
    const requestRef = doc(db, 'purchase_requests', requestId);
    await updateDoc(requestRef, {
      status: 'purchased',
      purchased_by: purchasedBy,
      purchased_by_name: purchasedByName,
      purchased_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || '구매 완료 처리에 실패했습니다.');
  }
};

/**
 * 구매 요청 삭제
 */
export const deletePurchaseRequest = async (requestId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'purchase_requests', requestId));
  } catch (error: any) {
    throw new Error(error.message || '구매 요청 삭제에 실패했습니다.');
  }
};
