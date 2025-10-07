import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
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

console.log('🔧 [Firebase Config] 초기화 시작');
console.log('🔧 [Firebase Config] Project ID:', firebaseConfig.projectId);
console.log('🔧 [Firebase Config] API Key 존재:', !!firebaseConfig.apiKey);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('✅ [Firebase Config] Firebase 앱 초기화 완료');

// Initialize Firebase Auth
export const auth = initializeAuth(app);
console.log('✅ [Firebase Config] Firebase Auth 초기화 완료');

export const db = getFirestore(app);
console.log('✅ [Firebase Config] Firestore 초기화 완료');

export const storage = getStorage(app);
console.log('✅ [Firebase Config] Storage 초기화 완료');

export default app;
