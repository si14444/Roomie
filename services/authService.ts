import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  sendPasswordResetEmail,
  AuthError,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { auth, db } from '@/config/firebaseConfig';

export interface NotificationPreferences {
  enabled: boolean;
  routines: boolean;
  bills: boolean;
  items: boolean;
  chat: boolean;
  polls: boolean;
  system: boolean;
  routine_completed: boolean;
  routine_overdue: boolean;
  bill_added: boolean;
  bill_payment_due: boolean;
  payment_received: boolean;
  item_request: boolean;
  item_purchased: boolean;
  item_update: boolean;
  poll_created: boolean;
  poll_ended: boolean;
  chat_message: boolean;
  announcement: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  pushToken?: string; // Expo 푸시 토큰
  notificationPreferences?: NotificationPreferences;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Firestore에서 사용자 정보 가져오기
 */
export const getUserFromFirestore = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        id: uid,
        email: data.email,
        name: data.name,
        avatar: data.avatar,
        pushToken: data.pushToken,
        notificationPreferences: data.notificationPreferences,
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to get user from Firestore:', error);
    return null;
  }
};

/**
 * Firebase User를 앱의 User 타입으로 변환
 */
const mapFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  // Firestore에서 사용자 정보 가져오기
  const firestoreUser = await getUserFromFirestore(firebaseUser.uid);

  if (firestoreUser) {
    return firestoreUser;
  }

  // Firestore에 정보가 없으면 Firebase Auth 정보 사용
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || '',
    avatar: firebaseUser.photoURL || undefined,
  };
};

/**
 * Firebase Auth 에러를 사용자 친화적인 메시지로 변환
 */
const getAuthErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return '이미 사용 중인 이메일입니다.';
    case 'auth/invalid-email':
      return '유효하지 않은 이메일 주소입니다.';
    case 'auth/operation-not-allowed':
      return '이메일/비밀번호 계정이 비활성화되어 있습니다.';
    case 'auth/weak-password':
      return '비밀번호가 너무 약합니다. 최소 6자 이상 입력해주세요.';
    case 'auth/user-disabled':
      return '비활성화된 계정입니다.';
    case 'auth/user-not-found':
      return '존재하지 않는 계정입니다.';
    case 'auth/wrong-password':
      return '잘못된 비밀번호입니다.';
    case 'auth/invalid-credential':
      return '이메일 또는 비밀번호가 올바르지 않습니다.';
    case 'auth/too-many-requests':
      return '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
    case 'auth/network-request-failed':
      return '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
    default:
      return '인증 중 오류가 발생했습니다. 다시 시도해주세요.';
  }
};

/**
 * 회원가입
 */
export const signup = async (data: SignupData): Promise<User> => {
  try {
    // Firebase Authentication에 사용자 생성
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    const uid = userCredential.user.uid;

    // Firestore에 사용자 정보 저장
    await setDoc(doc(db, 'users', uid), {
      name: data.name,
      email: data.email,
      avatar: null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    // Firebase Auth 프로필도 업데이트 (선택사항)
    await updateProfile(userCredential.user, {
      displayName: data.name,
    });

    const user: User = {
      id: uid,
      email: data.email,
      name: data.name,
      avatar: undefined,
    };

    return user;
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getAuthErrorMessage(authError));
  }
};

/**
 * 로그인
 */
export const login = async (data: LoginData): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    return await mapFirebaseUser(userCredential.user);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getAuthErrorMessage(authError));
  }
};

/**
 * 로그아웃
 */
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getAuthErrorMessage(authError));
  }
};

/**
 * 비밀번호 재설정 이메일 발송
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getAuthErrorMessage(authError));
  }
};

/**
 * 현재 로그인한 사용자 가져오기
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser;
  return firebaseUser ? await mapFirebaseUser(firebaseUser) : null;
};

/**
 * 인증 상태 변경 리스너
 */
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged(async (firebaseUser) => {
    const user = firebaseUser ? await mapFirebaseUser(firebaseUser) : null;
    callback(user);
  });
};

/**
 * 사용자의 푸시 토큰 저장
 */
export const savePushToken = async (userId: string, pushToken: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      pushToken,
      updated_at: serverTimestamp(),
    });

    if (__DEV__) {
      console.log('✅ [Auth] Push token saved to Firestore:', pushToken);
    }
  } catch (error) {
    console.error('Failed to save push token:', error);
    throw new Error('푸시 토큰 저장에 실패했습니다.');
  }
};

/**
 * 사용자의 푸시 토큰 삭제 (로그아웃 시)
 */
export const removePushToken = async (userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      pushToken: null,
      updated_at: serverTimestamp(),
    });

    if (__DEV__) {
      console.log('✅ [Auth] Push token removed from Firestore');
    }
  } catch (error) {
    console.error('Failed to remove push token:', error);
  }
};

/**
 * 사용자의 알림 설정 저장
 */
export const saveNotificationPreferences = async (
  userId: string,
  preferences: NotificationPreferences
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      notificationPreferences: preferences,
      updated_at: serverTimestamp(),
    });

    if (__DEV__) {
      console.log('✅ [Auth] Notification preferences saved to Firestore');
    }
  } catch (error) {
    console.error('Failed to save notification preferences:', error);
    throw new Error('알림 설정 저장에 실패했습니다.');
  }
};

/**
 * 계정 삭제 - Firebase Auth 및 Firestore 데이터 모두 삭제
 */
export const deleteAccount = async (password: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error('로그인이 필요합니다.');
    }

    const userId = currentUser.uid;

    if (__DEV__) {
      console.log('🗑️ [Auth] Starting account deletion for user:', userId);
    }

    // 1. 재인증 (보안을 위해 필수)
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);

    if (__DEV__) {
      console.log('✅ [Auth] Reauthentication successful');
    }

    // 2. Firestore 데이터 삭제 (배치 작업 사용)
    const batch = writeBatch(db);

    // 2-1. 사용자가 속한 팀에서 team_members 삭제
    const teamMembersQuery = query(
      collection(db, 'team_members'),
      where('user_id', '==', userId)
    );
    const teamMembersSnapshot = await getDocs(teamMembersQuery);

    const teamIds: string[] = [];
    teamMembersSnapshot.forEach((doc) => {
      teamIds.push(doc.data().team_id);
      batch.delete(doc.ref);
    });

    if (__DEV__) {
      console.log(`🗑️ [Auth] Deleting ${teamMembersSnapshot.size} team memberships`);
    }

    // 2-2. 사용자가 생성한 팀 삭제 (created_by가 userId인 팀)
    const teamsQuery = query(
      collection(db, 'teams'),
      where('created_by', '==', userId)
    );
    const teamsSnapshot = await getDocs(teamsQuery);

    for (const teamDoc of teamsSnapshot.docs) {
      const teamId = teamDoc.id;

      // 팀의 모든 멤버 삭제
      const membersQuery = query(
        collection(db, 'team_members'),
        where('team_id', '==', teamId)
      );
      const membersSnapshot = await getDocs(membersQuery);
      membersSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // 팀 삭제
      batch.delete(teamDoc.ref);
    }

    if (__DEV__) {
      console.log(`🗑️ [Auth] Deleting ${teamsSnapshot.size} teams created by user`);
    }

    // 2-3. 사용자가 생성한 Bills, Routines, Items, Purchase Requests 삭제
    const collectionsToDelete = [
      'bills',
      'bill_payments',
      'routines',
      'routine_completions',
      'items',
      'purchase_requests'
    ];

    for (const collectionName of collectionsToDelete) {
      const q = query(
        collection(db, collectionName),
        where('created_by', '==', userId)
      );
      const snapshot = await getDocs(q);

      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      if (__DEV__ && snapshot.size > 0) {
        console.log(`🗑️ [Auth] Deleting ${snapshot.size} documents from ${collectionName}`);
      }
    }

    // 2-4. 사용자 문서 삭제
    batch.delete(doc(db, 'users', userId));

    if (__DEV__) {
      console.log('🗑️ [Auth] Deleting user document');
    }

    // 배치 커밋
    await batch.commit();

    if (__DEV__) {
      console.log('✅ [Auth] All Firestore data deleted');
    }

    // 3. Firebase Auth 계정 삭제
    await deleteUser(currentUser);

    if (__DEV__) {
      console.log('✅ [Auth] Firebase Auth account deleted');
    }
  } catch (error: any) {
    console.error('Failed to delete account:', error);

    // 에러 메시지 한글화
    if (error.code === 'auth/wrong-password') {
      throw new Error('비밀번호가 올바르지 않습니다.');
    } else if (error.code === 'auth/requires-recent-login') {
      throw new Error('보안을 위해 다시 로그인한 후 시도해주세요.');
    } else if (error.code === 'auth/user-mismatch') {
      throw new Error('사용자 정보가 일치하지 않습니다.');
    } else {
      throw new Error(error.message || '계정 삭제에 실패했습니다.');
    }
  }
};
