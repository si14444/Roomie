# Supabase SQL Schema

Roomie 앱을 위한 PostgreSQL 데이터베이스 스키마 및 SQL 문입니다.

## 📋 목차
1. [기본 테이블 구조](#기본-테이블-구조)
2. [인증 및 사용자 관리](#인증-및-사용자-관리)
3. [팀 관리](#팀-관리)
4. [공과금 관리](#공과금-관리)
5. [루틴 관리](#루틴-관리)
6. [알림 시스템](#알림-시스템)
7. [공용물품 관리](#공용물품-관리)
8. [인덱스 및 최적화](#인덱스-및-최적화)
9. [RLS (Row Level Security)](#rls-row-level-security)
10. [함수 및 트리거](#함수-및-트리거)

---

## 🗄️ 기본 테이블 구조

### 1. 확장 기능 활성화
```sql
-- UUID 생성을 위한 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 실시간 기능을 위한 확장
CREATE EXTENSION IF NOT EXISTS "realtime";
```

---

## 👥 인증 및 사용자 관리

### 1. 사용자 프로필 테이블
```sql
-- 사용자 프로필 테이블 (auth.users 확장)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    date_of_birth DATE,
    current_team_id UUID,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 프로필 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 🏠 팀 관리

### 1. 팀 테이블
```sql
-- 팀 (룸메이트 그룹) 테이블
CREATE TABLE public.teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    invite_code TEXT UNIQUE,
    max_members INTEGER DEFAULT 10,
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_teams_updated_at 
    BEFORE UPDATE ON teams 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 2. 팀 멤버십 테이블
```sql
-- 팀 멤버십 테이블 (다대다 관계)
CREATE TABLE public.team_memberships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    nickname TEXT, -- 팀 내에서 사용할 별명
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(team_id, user_id)
);

-- 팀 초대 테이블
CREATE TABLE public.team_invitations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 💰 공과금 관리

### 1. 공과금 테이블
```sql
-- 공과금 테이블
CREATE TABLE public.bills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    account_number TEXT,
    bank TEXT,
    split_type TEXT DEFAULT 'equal' CHECK (split_type IN ('equal', 'custom')),
    custom_split JSONB, -- {user_id: amount} 형태
    due_date DATE,
    category TEXT DEFAULT 'utility' CHECK (category IN ('utility', 'subscription', 'maintenance', 'other')),
    icon TEXT DEFAULT 'flash-outline',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_bills_updated_at 
    BEFORE UPDATE ON bills 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 2. 공과금 지불 기록 테이블
```sql
-- 공과금 지불 기록 테이블
CREATE TABLE public.bill_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(bill_id, user_id)
);
```

---

## 📅 루틴 관리

### 1. 루틴 테이블
```sql
-- 루틴 테이블
CREATE TABLE public.routines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    task TEXT NOT NULL,
    description TEXT,
    assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    icon TEXT DEFAULT 'home-outline',
    next_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue', 'skipped')),
    completed_at TIMESTAMP WITH TIME ZONE,
    last_completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    estimated_duration INTEGER, -- 예상 소요 시간 (분)
    settings JSONB DEFAULT '{}', -- 추가 설정 (알림, 반복 규칙 등)
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_routines_updated_at 
    BEFORE UPDATE ON routines 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 2. 루틴 히스토리 테이블
```sql
-- 루틴 완료 히스토리 테이블
CREATE TABLE public.routine_completions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
    completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_minutes INTEGER, -- 실제 소요 시간
    notes TEXT,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5), -- 완료도/만족도 평가
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔔 알림 시스템

### 1. 알림 테이블
```sql
-- 알림 테이블
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- 받을 사용자
    type TEXT NOT NULL CHECK (type IN (
        'bill_added', 'bill_due_soon', 'bill_overdue', 'payment_received',
        'routine_assigned', 'routine_completed', 'routine_overdue',
        'item_requested', 'item_purchased', 'item_delivered',
        'team_invitation', 'member_joined', 'member_left'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- 추가 데이터 (관련 ID 등)
    is_read BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    related_id UUID, -- 관련된 엔티티의 ID
    related_type TEXT, -- 관련된 엔티티의 타입 (bill, routine, item 등)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. 알림 설정 테이블
```sql
-- 사용자별 알림 설정 테이블
CREATE TABLE public.notification_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    
    -- 공과금 알림 설정
    bill_added BOOLEAN DEFAULT TRUE,
    bill_due_reminder BOOLEAN DEFAULT TRUE,
    bill_due_days_before INTEGER DEFAULT 3,
    bill_overdue BOOLEAN DEFAULT TRUE,
    payment_received BOOLEAN DEFAULT TRUE,
    
    -- 루틴 알림 설정
    routine_assigned BOOLEAN DEFAULT TRUE,
    routine_due_reminder BOOLEAN DEFAULT TRUE,
    routine_completed BOOLEAN DEFAULT TRUE,
    routine_overdue BOOLEAN DEFAULT TRUE,
    
    -- 물품 알림 설정
    item_requested BOOLEAN DEFAULT TRUE,
    item_purchased BOOLEAN DEFAULT TRUE,
    item_delivered BOOLEAN DEFAULT TRUE,
    
    -- 팀 알림 설정
    team_activities BOOLEAN DEFAULT TRUE,
    member_activities BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, team_id)
);

CREATE TRIGGER update_notification_settings_updated_at 
    BEFORE UPDATE ON notification_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 📦 공용물품 관리

### 1. 공용물품 테이블
```sql
-- 공용물품 테이블
CREATE TABLE public.items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general' CHECK (category IN (
        'cleaning', 'kitchen', 'bathroom', 'living', 'general', 'food', 'electronics'
    )),
    quantity INTEGER DEFAULT 1,
    unit TEXT DEFAULT 'ea', -- 개, 병, 팩, kg 등
    low_stock_threshold INTEGER DEFAULT 1,
    current_stock INTEGER DEFAULT 0,
    average_price DECIMAL(10,2),
    preferred_brand TEXT,
    purchase_url TEXT,
    barcode TEXT,
    image_url TEXT,
    location TEXT, -- 보관 위치
    status TEXT DEFAULT 'available' CHECK (status IN (
        'available', 'low_stock', 'out_of_stock', 'discontinued'
    )),
    
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 2. 구매 요청 테이블
```sql
-- 구매 요청 테이블
CREATE TABLE public.purchase_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'purchased', 'delivered', 'cancelled'
    )),
    
    -- 구매 정보
    purchased_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    purchase_date TIMESTAMP WITH TIME ZONE,
    purchase_price DECIMAL(10,2),
    purchase_location TEXT,
    delivery_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_purchase_requests_updated_at 
    BEFORE UPDATE ON purchase_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 3. 재고 히스토리 테이블
```sql
-- 재고 변동 히스토리 테이블
CREATE TABLE public.stock_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    change_type TEXT NOT NULL CHECK (change_type IN (
        'purchase', 'usage', 'waste', 'adjustment', 'initial'
    )),
    quantity_before INTEGER NOT NULL,
    quantity_change INTEGER NOT NULL, -- +/- 값
    quantity_after INTEGER NOT NULL,
    notes TEXT,
    related_request_id UUID REFERENCES purchase_requests(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔍 인덱스 및 최적화

### 1. 성능 최적화 인덱스
```sql
-- 팀 관련 인덱스
CREATE INDEX idx_team_memberships_team_id ON team_memberships(team_id);
CREATE INDEX idx_team_memberships_user_id ON team_memberships(user_id);

-- 공과금 관련 인덱스
CREATE INDEX idx_bills_team_id ON bills(team_id);
CREATE INDEX idx_bills_due_date ON bills(due_date);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_created_at ON bills(created_at DESC);

CREATE INDEX idx_bill_payments_bill_id ON bill_payments(bill_id);
CREATE INDEX idx_bill_payments_user_id ON bill_payments(user_id);

-- 루틴 관련 인덱스
CREATE INDEX idx_routines_team_id ON routines(team_id);
CREATE INDEX idx_routines_assignee_id ON routines(assignee_id);
CREATE INDEX idx_routines_next_date ON routines(next_date);
CREATE INDEX idx_routines_status ON routines(status);

-- 알림 관련 인덱스
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_team_id ON notifications(team_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- 물품 관련 인덱스
CREATE INDEX idx_items_team_id ON items(team_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_category ON items(category);

CREATE INDEX idx_purchase_requests_team_id ON purchase_requests(team_id);
CREATE INDEX idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX idx_purchase_requests_requested_by ON purchase_requests(requested_by);
```

---

## 🔒 RLS (Row Level Security)

### 1. RLS 활성화
```sql
-- 모든 테이블에 대해 RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;
```

### 2. 프로필 RLS 정책
```sql
-- 프로필 정책: 본인만 조회/수정 가능
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
```

### 3. 팀 RLS 정책
```sql
-- 팀 정책: 팀 멤버만 접근 가능
CREATE POLICY "Team members can view team" ON teams
    FOR SELECT USING (
        id IN (
            SELECT team_id FROM team_memberships 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Team admins can update team" ON teams
    FOR UPDATE USING (
        id IN (
            SELECT team_id FROM team_memberships 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 팀 멤버십 정책
CREATE POLICY "Team members can view memberships" ON team_memberships
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM team_memberships 
            WHERE user_id = auth.uid()
        )
    );
```

### 4. 공과금 RLS 정책
```sql
-- 공과금 정책: 같은 팀 멤버만 접근
CREATE POLICY "Team members can view bills" ON bills
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM team_memberships 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Team members can create bills" ON bills
    FOR INSERT WITH CHECK (
        team_id IN (
            SELECT team_id FROM team_memberships 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Team members can update bills" ON bills
    FOR UPDATE USING (
        team_id IN (
            SELECT team_id FROM team_memberships 
            WHERE user_id = auth.uid()
        )
    );

-- 공과금 지불 정책
CREATE POLICY "Team members can view payments" ON bill_payments
    FOR SELECT USING (
        bill_id IN (
            SELECT id FROM bills 
            WHERE team_id IN (
                SELECT team_id FROM team_memberships 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update own payments" ON bill_payments
    FOR UPDATE USING (user_id = auth.uid());
```

### 5. 루틴 RLS 정책
```sql
-- 루틴 정책: 같은 팀 멤버만 접근
CREATE POLICY "Team members can view routines" ON routines
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM team_memberships 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Team members can create routines" ON routines
    FOR INSERT WITH CHECK (
        team_id IN (
            SELECT team_id FROM team_memberships 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Team members can update routines" ON routines
    FOR UPDATE USING (
        team_id IN (
            SELECT team_id FROM team_memberships 
            WHERE user_id = auth.uid()
        )
    );
```

### 6. 알림 RLS 정책
```sql
-- 알림 정책: 본인의 알림만 조회 가능
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Team members can create notifications" ON notifications
    FOR INSERT WITH CHECK (
        team_id IN (
            SELECT team_id FROM team_memberships 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());
```

---

## ⚙️ 함수 및 트리거

### 1. 사용자 프로필 자동 생성
```sql
-- 새 사용자 등록 시 프로필 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. 팀 초대 코드 생성
```sql
-- 팀 생성 시 초대 코드 자동 생성
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
BEGIN
    RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_invite_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invite_code IS NULL THEN
        NEW.invite_code = generate_invite_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_team_invite_code
    BEFORE INSERT ON teams
    FOR EACH ROW EXECUTE FUNCTION set_invite_code();
```

### 3. 공과금 상태 자동 업데이트
```sql
-- 공과금 상태 자동 업데이트 (연체 확인)
CREATE OR REPLACE FUNCTION update_bill_status()
RETURNS VOID AS $$
BEGIN
    UPDATE bills 
    SET status = 'overdue'
    WHERE due_date < CURRENT_DATE 
    AND status = 'pending';
    
    UPDATE bills 
    SET status = 'paid'
    WHERE id IN (
        SELECT bill_id FROM bill_payments 
        WHERE is_paid = true
        GROUP BY bill_id
        HAVING COUNT(*) = (
            SELECT COUNT(*) FROM team_memberships 
            WHERE team_id = bills.team_id
        )
    ) AND status != 'paid';
END;
$$ LANGUAGE plpgsql;

-- 매일 실행되는 cron job (Supabase에서 설정)
SELECT cron.schedule('update-bill-status', '0 0 * * *', 'SELECT update_bill_status();');
```

### 4. 루틴 상태 자동 리셋
```sql
-- 루틴 상태 자동 리셋 함수
CREATE OR REPLACE FUNCTION reset_completed_routines()
RETURNS VOID AS $$
BEGIN
    -- 일일 루틴 리셋 (다음 날)
    UPDATE routines 
    SET status = 'pending', 
        completed_at = NULL,
        next_date = CURRENT_DATE
    WHERE frequency = 'daily' 
    AND status = 'completed'
    AND completed_at::date < CURRENT_DATE;
    
    -- 주간 루틴 리셋 (월요일)
    UPDATE routines 
    SET status = 'pending',
        completed_at = NULL,
        next_date = CURRENT_DATE + (1 - EXTRACT(DOW FROM CURRENT_DATE))::integer
    WHERE frequency = 'weekly'
    AND status = 'completed'
    AND EXTRACT(DOW FROM CURRENT_DATE) = 1 -- 월요일
    AND completed_at::date < CURRENT_DATE - 7;
    
    -- 월간 루틴 리셋 (1일)
    UPDATE routines 
    SET status = 'pending',
        completed_at = NULL,
        next_date = DATE_TRUNC('month', CURRENT_DATE)
    WHERE frequency = 'monthly'
    AND status = 'completed'
    AND EXTRACT(DAY FROM CURRENT_DATE) = 1
    AND completed_at::date < DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- 매일 실행
SELECT cron.schedule('reset-routines', '0 1 * * *', 'SELECT reset_completed_routines();');
```

### 5. 알림 자동 생성
```sql
-- 공과금 추가 시 알림 생성
CREATE OR REPLACE FUNCTION notify_bill_added()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (team_id, user_id, type, title, message, related_id, related_type)
    SELECT 
        NEW.team_id,
        tm.user_id,
        'bill_added',
        '새 공과금 등록',
        NEW.name || ' 공과금이 등록되었습니다. (₩' || NEW.amount::text || ')',
        NEW.id,
        'bill'
    FROM team_memberships tm
    WHERE tm.team_id = NEW.team_id
    AND tm.user_id != NEW.created_by;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_bill_created
    AFTER INSERT ON bills
    FOR EACH ROW EXECUTE FUNCTION notify_bill_added();

-- 루틴 완료 시 알림 생성
CREATE OR REPLACE FUNCTION notify_routine_completed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        INSERT INTO notifications (team_id, user_id, type, title, message, related_id, related_type)
        SELECT 
            NEW.team_id,
            tm.user_id,
            'routine_completed',
            '루틴 완료',
            (SELECT full_name FROM profiles WHERE id = NEW.last_completed_by) || 
            '님이 "' || NEW.task || '" 루틴을 완료했습니다.',
            NEW.id,
            'routine'
        FROM team_memberships tm
        WHERE tm.team_id = NEW.team_id
        AND tm.user_id != NEW.last_completed_by;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_routine_completed
    AFTER UPDATE ON routines
    FOR EACH ROW EXECUTE FUNCTION notify_routine_completed();
```

---

## 🔄 실시간 기능 활성화

### 1. 실시간 구독 활성화
```sql
-- 실시간 기능을 위한 publication 생성
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;

-- 특정 테이블만 실시간 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE bills;
ALTER PUBLICATION supabase_realtime ADD TABLE routines;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE items;
ALTER PUBLICATION supabase_realtime ADD TABLE purchase_requests;
```

---

## 🧪 테스트 데이터

### 1. 샘플 데이터 삽입
```sql
-- 테스트용 팀 생성
INSERT INTO teams (id, name, description, created_by) VALUES
('00000000-0000-0000-0000-000000000001', '우리집 룸메이트', '테스트용 팀입니다', auth.uid());

-- 테스트용 공과금 데이터
INSERT INTO bills (team_id, name, amount, due_date, category, created_by) VALUES
('00000000-0000-0000-0000-000000000001', '전기요금', 120000, CURRENT_DATE + 7, 'utility', auth.uid()),
('00000000-0000-0000-0000-000000000001', '가스요금', 85000, CURRENT_DATE + 10, 'utility', auth.uid()),
('00000000-0000-0000-0000-000000000001', '넷플릭스', 17000, CURRENT_DATE + 1, 'subscription', auth.uid());

-- 테스트용 루틴 데이터
INSERT INTO routines (team_id, task, assignee_id, frequency, next_date, created_by) VALUES
('00000000-0000-0000-0000-000000000001', '설거지', auth.uid(), 'daily', CURRENT_DATE, auth.uid()),
('00000000-0000-0000-0000-000000000001', '청소기 돌리기', auth.uid(), 'weekly', CURRENT_DATE + 1, auth.uid()),
('00000000-0000-0000-0000-000000000001', '화장실 청소', auth.uid(), 'weekly', CURRENT_DATE + 2, auth.uid());
```

---

## 🚀 실행 순서

### 1. 기본 설정
```sql
-- 1. 확장 기능 활성화
-- 2. 사용자 프로필 테이블 생성
-- 3. 팀 관련 테이블 생성
```

### 2. 핵심 기능
```sql
-- 4. 공과금 관련 테이블 생성
-- 5. 루틴 관련 테이블 생성
-- 6. 알림 시스템 테이블 생성
-- 7. 물품 관리 테이블 생성
```

### 3. 최적화 및 보안
```sql
-- 8. 인덱스 생성
-- 9. RLS 정책 설정
-- 10. 함수 및 트리거 생성
-- 11. 실시간 기능 활성화
```

---

이 SQL 스키마를 Supabase SQL Editor에서 순서대로 실행하면 Roomie 앱의 완전한 데이터베이스 구조가 생성됩니다. 각 단계별로 실행하시고, 오류가 발생하면 해당 부분을 확인해주세요.