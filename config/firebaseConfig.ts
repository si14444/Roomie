import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

if (__DEV__) {
  console.log('🔧 [Firebase Config] 초기화 시작');
  console.log('🔧 [Firebase Config] Project ID:', firebaseConfig.projectId);
}

// Initialize Firebase (재사용 가능하도록)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  if (__DEV__) console.log('✅ [Firebase Config] Firebase 앱 초기화 완료');
} else {
  app = getApps()[0];
  if (__DEV__) console.log('✅ [Firebase Config] 기존 Firebase 앱 재사용');
}

// Initialize Firebase Auth
// Firebase는 자체적으로 세션을 관리하여 앱 재시작 시에도 로그인 상태가 유지됩니다
let auth: Auth;
try {
  // 첫 번째 초기화 시도
  auth = initializeAuth(app);
  if (__DEV__) {
    console.log('✅ [Firebase Config] Firebase Auth 초기화 완료');
  }
} catch (error: any) {
  // 이미 초기화되어 있으면 기존 인스턴스 사용
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
    if (__DEV__) {
      console.log('✅ [Firebase Config] Firebase Auth 기존 인스턴스 재사용');
    }
  } else {
    throw error;
  }
}

export { auth };

export const db = getFirestore(app);
export const storage = getStorage(app);

if (__DEV__) {
  console.log('✅ [Firebase Config] Firestore, Storage 초기화 완료');
}

export default app;
