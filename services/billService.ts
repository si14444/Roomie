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
import { db } from '@/config/firebaseConfig';

export interface Bill {
  id: string;
  team_id: string;
  title: string;
  total_amount: number;
  category: 'utilities' | 'rent' | 'internet' | 'food' | 'other';
  due_date: string;
  is_recurring: boolean;
  account_number?: string;
  bank_name?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface BillPayment {
  id: string;
  bill_id: string;
  paid_by: string;
  paid_by_name: string;
  amount: number;
  paid_at: string;
  payment_method?: string;
}

interface CreateBillData {
  team_id: string;
  title: string;
  total_amount: number;
  category: 'utilities' | 'rent' | 'internet' | 'food' | 'other';
  due_date: string;
  is_recurring?: boolean;
  account_number?: string;
  bank_name?: string;
  created_by: string;
}

interface CreatePaymentData {
  bill_id: string;
  paid_by: string;
  paid_by_name: string;
  amount: number;
  payment_method?: string;
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
 * 공과금 생성
 */
export const createBill = async (data: CreateBillData): Promise<Bill> => {
  try {
    const billData = {
      team_id: data.team_id,
      title: data.title,
      total_amount: data.total_amount,
      category: data.category,
      due_date: data.due_date,
      is_recurring: data.is_recurring || false,
      account_number: data.account_number || '',
      bank_name: data.bank_name || '',
      created_by: data.created_by,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'bills'), billData);

    return {
      id: docRef.id,
      team_id: data.team_id,
      title: data.title,
      total_amount: data.total_amount,
      category: data.category,
      due_date: data.due_date,
      is_recurring: data.is_recurring || false,
      account_number: data.account_number,
      bank_name: data.bank_name,
      created_by: data.created_by,
      created_at: new Date().toISOString(),
    };
  } catch (error: any) {
    throw new Error(error.message || '공과금 생성에 실패했습니다.');
  }
};

/**
 * 팀의 공과금 목록 조회
 */
export const getTeamBills = async (teamId: string): Promise<Bill[]> => {
  try {
    const q = query(
      collection(db, 'bills'),
      where('team_id', '==', teamId),
      orderBy('due_date', 'desc')
    );

    const querySnapshot = await getDocs(q);

    const bills: Bill[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        team_id: data.team_id,
        title: data.title,
        total_amount: data.total_amount,
        category: data.category,
        due_date: data.due_date,
        is_recurring: data.is_recurring,
        account_number: data.account_number,
        bank_name: data.bank_name,
        created_by: data.created_by,
        created_at: timestampToDate(data.created_at).toISOString(),
        updated_at: data.updated_at ? timestampToDate(data.updated_at).toISOString() : undefined,
      };
    });

    return bills;
  } catch (error: any) {
    throw new Error(error.message || '공과금 조회에 실패했습니다.');
  }
};

/**
 * 팀의 공과금 실시간 리스너 구독
 */
export const subscribeToTeamBills = (
  teamId: string,
  onUpdate: (bills: Bill[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(db, 'bills'),
    where('team_id', '==', teamId),
    orderBy('due_date', 'desc')
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const bills: Bill[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          team_id: data.team_id,
          title: data.title,
          total_amount: data.total_amount,
          category: data.category,
          due_date: data.due_date,
          is_recurring: data.is_recurring,
          account_number: data.account_number,
          bank_name: data.bank_name,
          created_by: data.created_by,
          created_at: timestampToDate(data.created_at).toISOString(),
          updated_at: data.updated_at ? timestampToDate(data.updated_at).toISOString() : undefined,
        };
      });
      onUpdate(bills);
    },
    (error) => {
      console.error('Bill subscription error:', error);
      if (onError) {
        onError(new Error(error.message || '공과금 실시간 업데이트에 실패했습니다.'));
      }
    }
  );

  return unsubscribe;
};

/**
 * 공과금 수정
 */
export const updateBill = async (
  billId: string,
  updates: Partial<Omit<Bill, 'id' | 'created_at' | 'team_id'>>
): Promise<void> => {
  try {
    const billRef = doc(db, 'bills', billId);
    await updateDoc(billRef, {
      ...updates,
      updated_at: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || '공과금 수정에 실패했습니다.');
  }
};

/**
 * 공과금 삭제
 */
export const deleteBill = async (billId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'bills', billId));
  } catch (error: any) {
    throw new Error(error.message || '공과금 삭제에 실패했습니다.');
  }
};

/**
 * 공과금 지불 기록 생성
 */
export const createBillPayment = async (
  data: CreatePaymentData
): Promise<BillPayment> => {
  try {
    const paymentData = {
      bill_id: data.bill_id,
      paid_by: data.paid_by,
      paid_by_name: data.paid_by_name,
      amount: data.amount,
      payment_method: data.payment_method || '',
      paid_at: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'bill_payments'), paymentData);

    return {
      id: docRef.id,
      bill_id: data.bill_id,
      paid_by: data.paid_by,
      paid_by_name: data.paid_by_name,
      amount: data.amount,
      payment_method: data.payment_method,
      paid_at: new Date().toISOString(),
    };
  } catch (error: any) {
    throw new Error(error.message || '지불 기록 생성에 실패했습니다.');
  }
};

/**
 * 공과금의 지불 기록 조회
 */
export const getBillPayments = async (billId: string): Promise<BillPayment[]> => {
  try {
    const q = query(
      collection(db, 'bill_payments'),
      where('bill_id', '==', billId),
      orderBy('paid_at', 'desc')
    );

    const querySnapshot = await getDocs(q);

    const payments: BillPayment[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        bill_id: data.bill_id,
        paid_by: data.paid_by,
        paid_by_name: data.paid_by_name,
        amount: data.amount,
        payment_method: data.payment_method,
        paid_at: timestampToDate(data.paid_at).toISOString(),
      };
    });

    return payments;
  } catch (error: any) {
    throw new Error(error.message || '지불 기록 조회에 실패했습니다.');
  }
};

/**
 * 특정 사용자의 공과금 지불 여부 확인
 */
export const checkUserPayment = async (
  billId: string,
  userId: string
): Promise<BillPayment | null> => {
  try {
    const q = query(
      collection(db, 'bill_payments'),
      where('bill_id', '==', billId),
      where('paid_by', '==', userId)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      bill_id: data.bill_id,
      paid_by: data.paid_by,
      paid_by_name: data.paid_by_name,
      amount: data.amount,
      payment_method: data.payment_method,
      paid_at: timestampToDate(data.paid_at).toISOString(),
    };
  } catch (error: any) {
    throw new Error(error.message || '지불 확인에 실패했습니다.');
  }
};
