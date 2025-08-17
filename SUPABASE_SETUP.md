# Supabase 연동 가이드

Roomie 앱을 Supabase와 연동하여 실시간 데이터베이스 기능을 구현하는 가이드입니다.

## 📋 목차
1. [Supabase 프로젝트 설정](#supabase-프로젝트-설정)
2. [환경 설정](#환경-설정)
3. [패키지 설치](#패키지-설치)
4. [데이터베이스 스키마](#데이터베이스-스키마)
5. [Supabase 클라이언트 설정](#supabase-클라이언트-설정)
6. [인증 구현](#인증-구현)
7. [실시간 구독 설정](#실시간-구독-설정)
8. [마이그레이션 가이드](#마이그레이션-가이드)

## 🚀 Supabase 프로젝트 설정

### 1. Supabase 계정 생성 및 프로젝트 생성
1. [Supabase](https://supabase.com) 방문
2. 계정 생성 후 로그인
3. "New Project" 클릭
4. 프로젝트 이름: `roomie-app`
5. 데이터베이스 비밀번호 설정
6. Region: `Northeast Asia (Seoul)` 선택

### 2. API 키 및 URL 확인
- 프로젝트 대시보드 > Settings > API
- `Project URL`과 `anon public` 키 복사

## ⚙️ 환경 설정

### 1. 환경 변수 파일 생성
```bash
# .env 파일 생성
touch .env
```

### 2. 환경 변수 설정
```env
# .env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. .gitignore 업데이트
```gitignore
# 환경 변수 파일
.env
.env.local
.env.production
```

## 📦 패키지 설치

```bash
# Supabase 클라이언트
npm install @supabase/supabase-js

# React Native 특화 패키지들
npm install @react-native-async-storage/async-storage
npm install react-native-url-polyfill

# Expo 관련 (이미 설치되어 있을 수 있음)
npx expo install expo-secure-store
npx expo install expo-crypto
```

## 🗄️ 데이터베이스 스키마

Supabase SQL Editor에서 다음 SQL 문을 실행하세요:

### 기본 테이블 생성
```sql
-- SQL 파일 참조
-- 자세한 SQL 문은 SUPABASE_SQL.md 파일을 확인하세요
```

## 🔧 Supabase 클라이언트 설정

### 1. Supabase 클라이언트 파일 생성
```typescript
// lib/supabase.ts
import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

### 2. TypeScript 타입 정의
```typescript
// types/supabase.ts
export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          created_by?: string
        }
      }
      // 다른 테이블들...
    }
  }
}
```

## 🔐 인증 구현

### 1. AuthContext 업데이트
```typescript
// contexts/AuthContext.tsx 수정
import { supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return (
    <AuthContext.Provider value={{
      session,
      user,
      loading,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### 2. 로그인 화면 구현
```typescript
// components/auth/LoginScreen.tsx
import { supabase } from '@/lib/supabase'

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      Alert.alert('로그인 실패', error.message)
    }
    setLoading(false)
  }

  const handleSignUp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      Alert.alert('회원가입 실패', error.message)
    } else {
      Alert.alert('성공', '회원가입이 완료되었습니다. 이메일을 확인해주세요.')
    }
    setLoading(false)
  }

  // UI 구현...
}
```

## 📊 데이터 훅 업데이트

### 1. Bills Hook 업데이트
```typescript
// hooks/useBills.ts
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useBills() {
  const { user } = useAuth()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)

  // 공과금 불러오기
  const fetchBills = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('bills')
      .select(`
        *,
        team:teams(name),
        payments:bill_payments(*)
      `)
      .eq('team_id', user.team_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bills:', error)
    } else {
      setBills(data || [])
    }
    setLoading(false)
  }

  // 공과금 추가
  const addNewBill = async (newBill: NewBill) => {
    if (!user) return

    const { data, error } = await supabase
      .from('bills')
      .insert({
        name: newBill.name,
        amount: parseInt(newBill.amount),
        account_number: newBill.accountNumber,
        bank: newBill.bank,
        split_type: newBill.splitType,
        custom_split: newBill.customSplit,
        due_date: newBill.dueDate,
        category: newBill.category,
        team_id: user.team_id,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding bill:', error)
      Alert.alert('오류', '공과금 추가에 실패했습니다.')
      return false
    }

    // 실시간 업데이트로 자동 반영됨
    return true
  }

  // 실시간 구독
  useEffect(() => {
    if (!user) return

    fetchBills()

    // 실시간 구독 설정
    const subscription = supabase
      .channel('bills-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bills',
          filter: `team_id=eq.${user.team_id}`,
        },
        (payload) => {
          console.log('Bill change received:', payload)
          fetchBills() // 변경 시 다시 가져오기
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  return {
    bills,
    loading,
    addNewBill,
    // 다른 함수들...
  }
}
```

### 2. Routines Hook 업데이트
```typescript
// hooks/useRoutines.ts (Supabase 연동 버전)
import { supabase } from '@/lib/supabase'

export function useRoutines() {
  const { user } = useAuth()
  const [routines, setRoutines] = useState<Routine[]>([])

  const fetchRoutines = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('team_id', user.team_id)
      .order('next_date', { ascending: true })

    if (error) {
      console.error('Error fetching routines:', error)
    } else {
      setRoutines(data || [])
    }
  }

  const completeRoutine = async (routineId: string) => {
    const { error } = await supabase
      .from('routines')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        last_completed_by: user?.id,
      })
      .eq('id', routineId)

    if (error) {
      console.error('Error completing routine:', error)
      Alert.alert('오류', '루틴 완료 처리에 실패했습니다.')
    }
  }

  // 실시간 구독
  useEffect(() => {
    if (!user) return

    fetchRoutines()

    const subscription = supabase
      .channel('routines-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'routines',
          filter: `team_id=eq.${user.team_id}`,
        },
        () => fetchRoutines()
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [user])

  return {
    routines,
    fetchRoutines,
    completeRoutine,
    // 다른 함수들...
  }
}
```

## 🔄 실시간 구독 설정

### 1. 알림 시스템 업데이트
```typescript
// contexts/NotificationContext.tsx
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // 실시간 알림 구독
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `team_id=eq.${user.team_id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications(prev => [newNotification, ...prev])
          
          // 푸시 알림 표시
          showPushNotification(newNotification)
        }
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [user])

  // 구현...
}
```

## 🔧 마이그레이션 가이드

### 1. 기존 데이터 백업
```typescript
// utils/migrationHelper.ts
export const exportCurrentData = () => {
  const data = {
    bills: localStorage.getItem('bills'),
    routines: localStorage.getItem('routines'),
    notifications: localStorage.getItem('notifications'),
  }
  
  console.log('Current data:', data)
  return data
}
```

### 2. 단계별 마이그레이션

#### Phase 1: 인증 시스템
1. Supabase 인증 구현
2. 기존 사용자 데이터 마이그레이션
3. 팀 생성 및 초대 시스템

#### Phase 2: 데이터 연동
1. Bills 데이터 Supabase 연동
2. Routines 데이터 Supabase 연동
3. 실시간 동기화 테스트

#### Phase 3: 고급 기능
1. 실시간 알림 시스템
2. 오프라인 지원
3. 성능 최적화

### 3. 개발 환경 설정
```bash
# 개발용 Supabase 로컬 실행 (선택사항)
npx supabase start

# 마이그레이션 실행
npx supabase db push

# 타입 생성
npx supabase gen types typescript --local > types/supabase.ts
```

## 🔍 디버깅 팁

### 1. 네트워크 오류 확인
```typescript
const { data, error } = await supabase.from('bills').select('*')
if (error) {
  console.error('Supabase error:', error)
  console.error('Error details:', error.details)
  console.error('Error hint:', error.hint)
}
```

### 2. 실시간 연결 상태 확인
```typescript
const subscription = supabase
  .channel('test')
  .on('presence', { event: 'sync' }, () => {
    console.log('Realtime connected')
  })
  .subscribe((status) => {
    console.log('Subscription status:', status)
  })
```

### 3. 인증 상태 디버깅
```typescript
const { data: { session } } = await supabase.auth.getSession()
console.log('Current session:', session)
console.log('User:', session?.user)
```

## 📚 추가 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [React Native 가이드](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [실시간 기능](https://supabase.com/docs/guides/realtime)
- [인증 가이드](https://supabase.com/docs/guides/auth)

## 🚨 주의사항

1. **환경 변수 보안**: `.env` 파일을 절대 커밋하지 마세요
2. **API 키 관리**: anon 키만 클라이언트에서 사용하세요
3. **RLS 정책**: Row Level Security를 반드시 설정하세요
4. **데이터 백업**: 마이그레이션 전 데이터를 백업하세요
5. **테스트**: 프로덕션 배포 전 충분한 테스트를 진행하세요

---

이 가이드를 참고하여 단계별로 Supabase 연동을 진행해주세요. 각 단계에서 문제가 발생하면 디버깅 팁을 참고하거나 Supabase 문서를 확인해보세요.