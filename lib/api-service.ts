// Mock API service - TODO: Replace with actual backend implementation
// This file provides type definitions and placeholder functions for the new backend

export interface Bill {
  id: string;
  team_id: string;
  title: string;
  total_amount: number;
  category: string;
  due_date: string;
  is_recurring: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  payments?: BillPayment[];
}

export interface BillPayment {
  id: string;
  bill_id: string;
  user_id: string;
  amount: number;
  payment_method?: string;
  paid_at: string;
  user_profile?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface Routine {
  id: string;
  team_id: string;
  title: string;
  description?: string;
  category: string;
  frequency: string;
  frequency_details: any;
  assigned_to: string;
  priority: string;
  is_active: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  assigned_profile?: {
    id: string;
    full_name: string;
  };
}

export interface RoutineCompletion {
  id: string;
  routine_id: string;
  completed_by: string;
  completed_at: string;
  notes?: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: {
    id: string;
    full_name: string;
    email: string;
  };
  user?: {
    id: string;
    full_name?: string;
    email?: string;
  };
}

// Bills Service
export const billsService = {
  getTeamBills: async (teamId: string): Promise<Bill[]> => {
    try {
      const { collection, query, where, getDocs, orderBy, Timestamp } = await import('firebase/firestore');
      const { db } = await import('@/config/firebaseConfig');

      const billsRef = collection(db, 'bills');
      const q = query(
        billsRef,
        where('team_id', '==', teamId),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const bills: Bill[] = [];
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();

        // Get payments for this bill
        const paymentsRef = collection(db, 'bill_payments');
        const paymentsQuery = query(paymentsRef, where('bill_id', '==', docSnapshot.id));
        const paymentsSnapshot = await getDocs(paymentsQuery);

        const payments: BillPayment[] = paymentsSnapshot.docs.map(payDoc => {
          const payData = payDoc.data();
          return {
            id: payDoc.id,
            bill_id: payData.bill_id,
            user_id: payData.user_id,
            amount: payData.amount,
            payment_method: payData.payment_method,
            paid_at: payData.paid_at instanceof Timestamp
              ? payData.paid_at.toDate().toISOString()
              : payData.paid_at,
            user_profile: payData.user_profile,
          };
        });

        bills.push({
          id: docSnapshot.id,
          team_id: data.team_id,
          title: data.title,
          total_amount: data.total_amount,
          category: data.category,
          due_date: data.due_date,
          is_recurring: data.is_recurring || false,
          created_by: data.created_by,
          created_at: data.created_at instanceof Timestamp
            ? data.created_at.toDate().toISOString()
            : data.created_at,
          updated_at: data.updated_at instanceof Timestamp
            ? data.updated_at.toDate().toISOString()
            : data.updated_at,
          payments,
        });
      }

      return bills;
    } catch (error: any) {
      console.error('Failed to get team bills:', error);
      throw new Error(error.message || '청구서 조회에 실패했습니다.');
    }
  },

  createBill: async (billData: Omit<Bill, 'id' | 'created_at' | 'updated_at'>): Promise<Bill> => {
    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('@/config/firebaseConfig');

      const billRef = await addDoc(collection(db, 'bills'), {
        team_id: billData.team_id,
        title: billData.title,
        total_amount: billData.total_amount,
        category: billData.category,
        due_date: billData.due_date,
        is_recurring: billData.is_recurring || false,
        created_by: billData.created_by,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      return {
        id: billRef.id,
        ...billData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Failed to create bill:', error);
      throw new Error(error.message || '청구서 생성에 실패했습니다.');
    }
  },

  updateBill: async (billId: string, updates: Partial<Bill>): Promise<Bill> => {
    try {
      const { doc, updateDoc, getDoc, serverTimestamp, Timestamp } = await import('firebase/firestore');
      const { db } = await import('@/config/firebaseConfig');

      const billRef = doc(db, 'bills', billId);
      await updateDoc(billRef, {
        ...updates,
        updated_at: serverTimestamp(),
      });

      const updatedDoc = await getDoc(billRef);
      const data = updatedDoc.data()!;

      return {
        id: billId,
        team_id: data.team_id,
        title: data.title,
        total_amount: data.total_amount,
        category: data.category,
        due_date: data.due_date,
        is_recurring: data.is_recurring || false,
        created_by: data.created_by,
        created_at: data.created_at instanceof Timestamp
          ? data.created_at.toDate().toISOString()
          : data.created_at,
        updated_at: data.updated_at instanceof Timestamp
          ? data.updated_at.toDate().toISOString()
          : data.updated_at,
      };
    } catch (error: any) {
      console.error('Failed to update bill:', error);
      throw new Error(error.message || '청구서 업데이트에 실패했습니다.');
    }
  },

  payBill: async (billId: string, userId: string, amount: number, paymentMethod?: string): Promise<BillPayment> => {
    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('@/config/firebaseConfig');

      const paymentRef = await addDoc(collection(db, 'bill_payments'), {
        bill_id: billId,
        user_id: userId,
        amount,
        payment_method: paymentMethod,
        paid_at: serverTimestamp(),
      });

      return {
        id: paymentRef.id,
        bill_id: billId,
        user_id: userId,
        amount,
        payment_method: paymentMethod,
        paid_at: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Failed to pay bill:', error);
      throw new Error(error.message || '청구서 결제에 실패했습니다.');
    }
  },
};

// Routines Service
export const routinesService = {
  getTeamRoutines: async (teamId: string): Promise<Routine[]> => {
    try {
      const { collection, query, where, getDocs, orderBy, Timestamp } = await import('firebase/firestore');
      const { db } = await import('@/config/firebaseConfig');

      const routinesRef = collection(db, 'routines');
      const q = query(
        routinesRef,
        where('team_id', '==', teamId),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const routines: Routine[] = querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          team_id: data.team_id,
          title: data.title,
          description: data.description,
          category: data.category,
          frequency: data.frequency,
          frequency_details: data.frequency_details,
          assigned_to: data.assigned_to,
          priority: data.priority,
          is_active: data.is_active !== false, // default true
          created_by: data.created_by,
          created_at: data.created_at instanceof Timestamp
            ? data.created_at.toDate().toISOString()
            : data.created_at,
          updated_at: data.updated_at instanceof Timestamp
            ? data.updated_at.toDate().toISOString()
            : data.updated_at,
          assigned_profile: data.assigned_profile,
        };
      });

      return routines;
    } catch (error: any) {
      console.error('Failed to get team routines:', error);
      throw new Error(error.message || '루틴 조회에 실패했습니다.');
    }
  },

  createRoutine: async (routineData: Omit<Routine, 'id' | 'created_at' | 'updated_at'>): Promise<Routine> => {
    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('@/config/firebaseConfig');

      const routineRef = await addDoc(collection(db, 'routines'), {
        team_id: routineData.team_id,
        title: routineData.title,
        description: routineData.description || '',
        category: routineData.category,
        frequency: routineData.frequency,
        frequency_details: routineData.frequency_details,
        assigned_to: routineData.assigned_to,
        priority: routineData.priority,
        is_active: routineData.is_active !== false, // default true
        created_by: routineData.created_by,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      return {
        id: routineRef.id,
        ...routineData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Failed to create routine:', error);
      throw new Error(error.message || '루틴 생성에 실패했습니다.');
    }
  },

  updateRoutine: async (routineId: string, updates: Partial<Routine>): Promise<Routine> => {
    try {
      const { doc, updateDoc, getDoc, serverTimestamp, Timestamp } = await import('firebase/firestore');
      const { db } = await import('@/config/firebaseConfig');

      const routineRef = doc(db, 'routines', routineId);
      await updateDoc(routineRef, {
        ...updates,
        updated_at: serverTimestamp(),
      });

      const updatedDoc = await getDoc(routineRef);
      const data = updatedDoc.data()!;

      return {
        id: routineId,
        team_id: data.team_id,
        title: data.title,
        description: data.description,
        category: data.category,
        frequency: data.frequency,
        frequency_details: data.frequency_details,
        assigned_to: data.assigned_to,
        priority: data.priority,
        is_active: data.is_active !== false,
        created_by: data.created_by,
        created_at: data.created_at instanceof Timestamp
          ? data.created_at.toDate().toISOString()
          : data.created_at,
        updated_at: data.updated_at instanceof Timestamp
          ? data.updated_at.toDate().toISOString()
          : data.updated_at,
        assigned_profile: data.assigned_profile,
      };
    } catch (error: any) {
      console.error('Failed to update routine:', error);
      throw new Error(error.message || '루틴 업데이트에 실패했습니다.');
    }
  },

  completeRoutine: async (routineId: string, userId: string, notes?: string): Promise<RoutineCompletion> => {
    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('@/config/firebaseConfig');

      const completionRef = await addDoc(collection(db, 'routine_completions'), {
        routine_id: routineId,
        completed_by: userId,
        completed_at: serverTimestamp(),
        notes: notes || '',
      });

      return {
        id: completionRef.id,
        routine_id: routineId,
        completed_by: userId,
        completed_at: new Date().toISOString(),
        notes,
      };
    } catch (error: any) {
      console.error('Failed to complete routine:', error);
      throw new Error(error.message || '루틴 완료 처리에 실패했습니다.');
    }
  },

  deleteRoutine: async (routineId: string): Promise<void> => {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db } = await import('@/config/firebaseConfig');

      await deleteDoc(doc(db, 'routines', routineId));
    } catch (error: any) {
      console.error('Failed to delete routine:', error);
      throw new Error(error.message || '루틴 삭제에 실패했습니다.');
    }
  },
};

// Teams Service
export const teamsService = {
  getTeamMembers: async (teamId: string): Promise<TeamMember[]> => {
    try {
      const { collection, query, where, getDocs, doc, getDoc, Timestamp } = await import('firebase/firestore');
      const { db } = await import('@/config/firebaseConfig');

      // Get team members
      const membersRef = collection(db, 'team_members');
      const q = query(membersRef, where('team_id', '==', teamId));
      const memberSnapshot = await getDocs(q);

      const members: TeamMember[] = [];

      for (const memberDoc of memberSnapshot.docs) {
        const memberData = memberDoc.data();

        // Get user profile for each member
        const userDoc = await getDoc(doc(db, 'users', memberData.user_id));
        const userData = userDoc.exists() ? userDoc.data() : null;

        members.push({
          id: memberDoc.id,
          team_id: memberData.team_id,
          user_id: memberData.user_id,
          role: memberData.role,
          joined_at: memberData.joined_at instanceof Timestamp
            ? memberData.joined_at.toDate().toISOString()
            : memberData.joined_at,
          profile: userData ? {
            id: userDoc.id,
            full_name: userData.full_name || userData.email || 'Unknown',
            email: userData.email,
          } : undefined,
          user: userData ? {
            id: userDoc.id,
            full_name: userData.full_name,
            email: userData.email,
          } : undefined,
        });
      }

      return members;
    } catch (error: any) {
      console.error('Failed to get team members:', error);
      throw new Error(error.message || '팀 멤버 조회에 실패했습니다.');
    }
  },
};

// Items and Purchase Requests Types
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
  item_name?: string;
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

// Items Service
export const itemsService = {
  getTeamItems: async (teamId: string): Promise<Item[]> => {
    try {
      const { getTeamItems } = await import('@/services/itemService');
      return await getTeamItems(teamId);
    } catch (error: any) {
      console.error('Failed to get team items:', error);
      throw new Error(error.message || '아이템 조회에 실패했습니다.');
    }
  },

  createItem: async (itemData: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Promise<Item> => {
    try {
      const { createItem } = await import('@/services/itemService');
      return await createItem({
        team_id: itemData.team_id,
        name: itemData.name,
        description: itemData.description,
        category: itemData.category,
        current_quantity: itemData.current_quantity,
        min_quantity: itemData.min_quantity,
        unit: itemData.unit,
        estimated_price: itemData.estimated_price,
        preferred_store: itemData.preferred_store,
        created_by: itemData.created_by,
      });
    } catch (error: any) {
      console.error('Failed to create item:', error);
      throw new Error(error.message || '아이템 생성에 실패했습니다.');
    }
  },

  updateItem: async (itemId: string, updates: Partial<Item>): Promise<void> => {
    try {
      const { updateItem } = await import('@/services/itemService');
      await updateItem(itemId, updates);
    } catch (error: any) {
      console.error('Failed to update item:', error);
      throw new Error(error.message || '아이템 업데이트에 실패했습니다.');
    }
  },

  deleteItem: async (itemId: string): Promise<void> => {
    try {
      const { deleteItem } = await import('@/services/itemService');
      await deleteItem(itemId);
    } catch (error: any) {
      console.error('Failed to delete item:', error);
      throw new Error(error.message || '아이템 삭제에 실패했습니다.');
    }
  },
};

// Purchase Requests Service
export const purchaseRequestsService = {
  getTeamPurchaseRequests: async (teamId: string): Promise<PurchaseRequest[]> => {
    try {
      const { getTeamPurchaseRequests } = await import('@/services/itemService');
      return await getTeamPurchaseRequests(teamId);
    } catch (error: any) {
      console.error('Failed to get purchase requests:', error);
      throw new Error(error.message || '구매 요청 조회에 실패했습니다.');
    }
  },

  createPurchaseRequest: async (
    requestData: Omit<PurchaseRequest, 'id' | 'status' | 'created_at' | 'updated_at' | 'approved_by' | 'approved_by_name' | 'approved_at' | 'purchased_by' | 'purchased_by_name' | 'purchased_at'>
  ): Promise<PurchaseRequest> => {
    try {
      const { createPurchaseRequest } = await import('@/services/itemService');
      return await createPurchaseRequest({
        team_id: requestData.team_id,
        item_id: requestData.item_id,
        item_name: requestData.item_name,
        requested_by: requestData.requested_by,
        requested_by_name: requestData.requested_by_name,
        quantity: requestData.quantity,
        urgency: requestData.urgency,
        notes: requestData.notes,
        estimated_price: requestData.estimated_price,
        preferred_store: requestData.preferred_store,
      });
    } catch (error: any) {
      console.error('Failed to create purchase request:', error);
      throw new Error(error.message || '구매 요청 생성에 실패했습니다.');
    }
  },

  approvePurchaseRequest: async (
    requestId: string,
    approvedBy: string,
    approvedByName: string
  ): Promise<void> => {
    try {
      const { approvePurchaseRequest } = await import('@/services/itemService');
      await approvePurchaseRequest(requestId, approvedBy, approvedByName);
    } catch (error: any) {
      console.error('Failed to approve purchase request:', error);
      throw new Error(error.message || '구매 요청 승인에 실패했습니다.');
    }
  },

  rejectPurchaseRequest: async (requestId: string): Promise<void> => {
    try {
      const { rejectPurchaseRequest } = await import('@/services/itemService');
      await rejectPurchaseRequest(requestId);
    } catch (error: any) {
      console.error('Failed to reject purchase request:', error);
      throw new Error(error.message || '구매 요청 거절에 실패했습니다.');
    }
  },

  markAsPurchased: async (
    requestId: string,
    purchasedBy: string,
    purchasedByName: string
  ): Promise<void> => {
    try {
      const { markAsPurchased } = await import('@/services/itemService');
      await markAsPurchased(requestId, purchasedBy, purchasedByName);
    } catch (error: any) {
      console.error('Failed to mark as purchased:', error);
      throw new Error(error.message || '구매 완료 처리에 실패했습니다.');
    }
  },

  deletePurchaseRequest: async (requestId: string): Promise<void> => {
    try {
      const { deletePurchaseRequest } = await import('@/services/itemService');
      await deletePurchaseRequest(requestId);
    } catch (error: any) {
      console.error('Failed to delete purchase request:', error);
      throw new Error(error.message || '구매 요청 삭제에 실패했습니다.');
    }
  },
};