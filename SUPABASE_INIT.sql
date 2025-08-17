-- ============================================================================
-- Roomie 앱 Supabase 초기화 SQL
-- 이 파일을 Supabase SQL Editor에 복사 붙여넣기 하여 실행하세요
-- ============================================================================

-- 1. 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "realtime";

-- 2. 업데이트 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 사용자 프로필 테이블
-- ============================================================================
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

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 팀 관리 테이블들
-- ============================================================================
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

CREATE TABLE public.team_memberships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    nickname TEXT,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

CREATE TABLE public.team_invitations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 공과금 관리 테이블들
-- ============================================================================
CREATE TABLE public.bills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    account_number TEXT,
    bank TEXT,
    split_type TEXT DEFAULT 'equal' CHECK (split_type IN ('equal', 'custom')),
    custom_split JSONB,
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

-- ============================================================================
-- 루틴 관리 테이블들
-- ============================================================================
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
    estimated_duration INTEGER,
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_routines_updated_at 
    BEFORE UPDATE ON routines 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE public.routine_completions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
    completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_minutes INTEGER,
    notes TEXT,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 알림 시스템 테이블들
-- ============================================================================
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'bill_added', 'bill_due_soon', 'bill_overdue', 'payment_received',
        'routine_assigned', 'routine_completed', 'routine_overdue',
        'item_requested', 'item_purchased', 'item_delivered',
        'team_invitation', 'member_joined', 'member_left'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    related_id UUID,
    related_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.notification_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    bill_added BOOLEAN DEFAULT TRUE,
    bill_due_reminder BOOLEAN DEFAULT TRUE,
    bill_due_days_before INTEGER DEFAULT 3,
    bill_overdue BOOLEAN DEFAULT TRUE,
    payment_received BOOLEAN DEFAULT TRUE,
    routine_assigned BOOLEAN DEFAULT TRUE,
    routine_due_reminder BOOLEAN DEFAULT TRUE,
    routine_completed BOOLEAN DEFAULT TRUE,
    routine_overdue BOOLEAN DEFAULT TRUE,
    item_requested BOOLEAN DEFAULT TRUE,
    item_purchased BOOLEAN DEFAULT TRUE,
    item_delivered BOOLEAN DEFAULT TRUE,
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

-- ============================================================================
-- 공용물품 관리 테이블들
-- ============================================================================
CREATE TABLE public.items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general' CHECK (category IN (
        'cleaning', 'kitchen', 'bathroom', 'living', 'general', 'food', 'electronics'
    )),
    quantity INTEGER DEFAULT 1,
    unit TEXT DEFAULT 'ea',
    low_stock_threshold INTEGER DEFAULT 1,
    current_stock INTEGER DEFAULT 0,
    average_price DECIMAL(10,2),
    preferred_brand TEXT,
    purchase_url TEXT,
    barcode TEXT,
    image_url TEXT,
    location TEXT,
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

CREATE TABLE public.stock_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    change_type TEXT NOT NULL CHECK (change_type IN (
        'purchase', 'usage', 'waste', 'adjustment', 'initial'
    )),
    quantity_before INTEGER NOT NULL,
    quantity_change INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    notes TEXT,
    related_request_id UUID REFERENCES purchase_requests(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 인덱스 생성
-- ============================================================================
CREATE INDEX idx_team_memberships_team_id ON team_memberships(team_id);
CREATE INDEX idx_team_memberships_user_id ON team_memberships(user_id);
CREATE INDEX idx_bills_team_id ON bills(team_id);
CREATE INDEX idx_bills_due_date ON bills(due_date);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_created_at ON bills(created_at DESC);
CREATE INDEX idx_bill_payments_bill_id ON bill_payments(bill_id);
CREATE INDEX idx_bill_payments_user_id ON bill_payments(user_id);
CREATE INDEX idx_routines_team_id ON routines(team_id);
CREATE INDEX idx_routines_assignee_id ON routines(assignee_id);
CREATE INDEX idx_routines_next_date ON routines(next_date);
CREATE INDEX idx_routines_status ON routines(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_team_id ON notifications(team_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_items_team_id ON items(team_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_purchase_requests_team_id ON purchase_requests(team_id);
CREATE INDEX idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX idx_purchase_requests_requested_by ON purchase_requests(requested_by);

-- ============================================================================
-- RLS (Row Level Security) 활성화
-- ============================================================================
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

-- ============================================================================
-- RLS 정책 생성
-- ============================================================================

-- 프로필 정책
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 팀 정책
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
CREATE POLICY "Users can create teams" ON teams
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- 팀 멤버십 정책
CREATE POLICY "Team members can view memberships" ON team_memberships
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM team_memberships 
            WHERE user_id = auth.uid()
        )
    );
CREATE POLICY "Team admins can manage memberships" ON team_memberships
    FOR ALL USING (
        team_id IN (
            SELECT team_id FROM team_memberships 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 공과금 정책
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
CREATE POLICY "Team members can manage payments" ON bill_payments
    FOR ALL USING (
        bill_id IN (
            SELECT id FROM bills 
            WHERE team_id IN (
                SELECT team_id FROM team_memberships 
                WHERE user_id = auth.uid()
            )
        )
    );

-- 루틴 정책
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

-- 알림 정책
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

-- 물품 정책
CREATE POLICY "Team members can view items" ON items
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM team_memberships 
            WHERE user_id = auth.uid()
        )
    );
CREATE POLICY "Team members can manage items" ON items
    FOR ALL USING (
        team_id IN (
            SELECT team_id FROM team_memberships 
            WHERE user_id = auth.uid()
        )
    );

-- 구매 요청 정책
CREATE POLICY "Team members can view purchase requests" ON purchase_requests
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM team_memberships 
            WHERE user_id = auth.uid()
        )
    );
CREATE POLICY "Team members can manage purchase requests" ON purchase_requests
    FOR ALL USING (
        team_id IN (
            SELECT team_id FROM team_memberships 
            WHERE user_id = auth.uid()
        )
    );

-- ============================================================================
-- 자동화 함수들
-- ============================================================================

-- 새 사용자 프로필 자동 생성
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

-- 팀 초대 코드 생성
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

-- 공과금 상태 자동 업데이트
CREATE OR REPLACE FUNCTION update_bill_status()
RETURNS VOID AS $$
BEGIN
    UPDATE bills 
    SET status = 'overdue'
    WHERE due_date < CURRENT_DATE 
    AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- 루틴 상태 자동 리셋
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
    AND EXTRACT(DOW FROM CURRENT_DATE) = 1
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
            COALESCE((SELECT full_name FROM profiles WHERE id = NEW.last_completed_by), '익명') || 
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

-- ============================================================================
-- 실시간 기능 활성화
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE bills;
ALTER PUBLICATION supabase_realtime ADD TABLE routines;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE items;
ALTER PUBLICATION supabase_realtime ADD TABLE purchase_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE team_memberships;

-- ============================================================================
-- 완료!
-- ============================================================================
-- 이제 Supabase 데이터베이스가 Roomie 앱을 위해 완전히 설정되었습니다.
-- 다음 단계: SUPABASE_SETUP.md 파일을 참고하여 React Native 앱에서 연동하세요.