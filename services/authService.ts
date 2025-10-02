import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  sendPasswordResetEmail,
  AuthError,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebaseConfig';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
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
