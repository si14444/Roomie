import { supabase } from './supabase';

// 타입 정의
export interface Team {
  id: string;
  name: string;
  description?: string;
  invite_code: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  provider?: string;
  provider_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  profile?: Profile;
}

export interface Routine {
  id: string;
  team_id: string;
  title: string;
  description?: string;
  category: 'cleaning' | 'cooking' | 'shopping' | 'maintenance' | 'general';
  frequency: 'daily' | 'weekly' | 'monthly';
  frequency_details?: any;
  assigned_to?: string;
  priority: 'high' | 'medium' | 'low';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  assigned_profile?: Profile;
}

export interface RoutineCompletion {
  id: string;
  routine_id: string;
  completed_by?: string;
  completed_at: string;
  notes?: string;
  due_date: string;
  is_late: boolean;
  completed_profile?: Profile;
}

export interface Bill {
  id: string;
  team_id: string;
  title: string;
  description?: string;
  total_amount: number;
  category: 'utilities' | 'rent' | 'internet' | 'food' | 'other';
  due_date: string;
  is_recurring: boolean;
  recurring_period?: 'monthly' | 'yearly';
  created_at: string;
  updated_at: string;
  created_by?: string;
  payments?: BillPayment[];
}

export interface BillPayment {
  id: string;
  bill_id: string;
  user_id?: string;
  amount: number;
  paid_at: string;
  payment_method?: string;
  notes?: string;
  user_profile?: Profile;
}

export interface Item {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  category: 'food' | 'toiletries' | 'cleaning' | 'maintenance' | 'general';
  current_quantity: number;
  min_quantity: number;
  unit: string;
  estimated_price?: number;
  preferred_store?: string;
  last_purchased_at?: string;
  last_purchased_by?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface PurchaseRequest {
  id: string;
  team_id: string;
  item_id: string;
  requested_by?: string;
  quantity: number;
  urgency: 'urgent' | 'normal' | 'low';
  notes?: string;
  status: 'pending' | 'approved' | 'purchased' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  purchased_by?: string;
  purchased_at?: string;
  created_at: string;
  updated_at: string;
  item?: Item;
  requested_profile?: Profile;
}

export interface Notification {
  id: string;
  team_id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  related_id?: string;
  action_data?: any;
  is_read: boolean;
  created_at: string;
}

export interface Feedback {
  id: string;
  team_id: string;
  user_id: string;
  month: string;
  rating: number;
  comment?: string;
  created_at: string;
}

// =============================================================================
// TEAMS 서비스
// =============================================================================

export const teamsService = {
  // 사용자의 팀 목록 가져오기
  async getUserTeams(userId: string): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_memberships!inner(user_id)
      `)
      .eq('team_memberships.user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // 팀 생성
  async createTeam(teamData: Omit<Team, 'id' | 'created_at' | 'updated_at' | 'invite_code'>): Promise<Team> {
    console.log('🔄 Creating team with data:', teamData);
    
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{
          name: teamData.name,
          description: teamData.description,
          created_by: teamData.created_by
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Team creation failed:', error);
        throw error;
      }

      console.log('✅ Team created successfully:', data);

      // 생성자를 관리자로 팀에 추가
      if (teamData.created_by) {
        console.log('🔄 Adding creator as admin...');
        const { error: memberError } = await supabase
          .from('team_memberships')
          .insert({
            team_id: data.id,
            user_id: teamData.created_by,
            role: 'admin'
          });

        if (memberError) {
          console.error('❌ Failed to add team member:', memberError);
          // 팀은 생성되었지만 멤버 추가 실패 - 에러를 던지지 않고 경고만
          console.warn('Team created but failed to add creator as member');
        } else {
          console.log('✅ Creator added as admin successfully');
        }
      }

      return data;
    } catch (error) {
      console.error('❌ Team creation error:', error);
      throw error;
    }
  },

  // 초대 코드로 팀 찾기
  async findTeamByInviteCode(inviteCode: string): Promise<Team | null> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
      .single();

    if (error) return null;
    return data;
  },

  // 팀에 참여
  async joinTeam(teamId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('team_memberships')
      .insert({
        team_id: teamId,
        user_id: userId,
        role: 'member'
      });

    if (error) throw error;
  },

  // 팀 멤버 목록 가져오기
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_memberships')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('team_id', teamId)
      .order('joined_at');

    if (error) throw error;
    return data || [];
  },

  // 팀 업데이트
  async updateTeam(teamId: string, updates: Partial<Team>): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', teamId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// ROUTINES 서비스
// =============================================================================

export const routinesService = {
  // 팀의 루틴 목록 가져오기
  async getTeamRoutines(teamId: string): Promise<Routine[]> {
    const { data, error } = await supabase
      .from('routines')
      .select(`
        *,
        assigned_profile:profiles(*)
      `)
      .eq('team_id', teamId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // 루틴 생성
  async createRoutine(routineData: Omit<Routine, 'id' | 'created_at' | 'updated_at'>): Promise<Routine> {
    const { data, error } = await supabase
      .from('routines')
      .insert([routineData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 루틴 완료 처리
  async completeRoutine(routineId: string, completedBy: string, notes?: string): Promise<RoutineCompletion> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('routine_completions')
      .insert([{
        routine_id: routineId,
        completed_by: completedBy,
        due_date: today,
        notes,
        is_late: false // TODO: 실제 지연 여부 계산
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 루틴 완료 기록 가져오기
  async getRoutineCompletions(routineId: string, limit = 10): Promise<RoutineCompletion[]> {
    const { data, error } = await supabase
      .from('routine_completions')
      .select(`
        *,
        completed_profile:profiles(*)
      `)
      .eq('routine_id', routineId)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // 팀의 루틴 완료 통계
  async getTeamRoutineStats(teamId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('routine_completions')
      .select(`
        id,
        routine_id,
        completed_at,
        routines!inner(team_id, title)
      `)
      .eq('routines.team_id', teamId)
      .gte('completed_at', startDate)
      .lte('completed_at', endDate);

    if (error) throw error;
    return data || [];
  },

  // 루틴 업데이트
  async updateRoutine(routineId: string, updates: Partial<Routine>): Promise<Routine> {
    const { data, error } = await supabase
      .from('routines')
      .update(updates)
      .eq('id', routineId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 루틴 삭제 (비활성화)
  async deleteRoutine(routineId: string): Promise<void> {
    const { error } = await supabase
      .from('routines')
      .update({ is_active: false })
      .eq('id', routineId);

    if (error) throw error;
  },
};

// =============================================================================
// BILLS 서비스
// =============================================================================

export const billsService = {
  // 팀의 공과금 목록 가져오기
  async getTeamBills(teamId: string): Promise<Bill[]> {
    const { data, error } = await supabase
      .from('bills')
      .select(`
        *,
        payments:bill_payments(
          *,
          user_profile:profiles(*)
        )
      `)
      .eq('team_id', teamId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // 공과금 생성
  async createBill(billData: Omit<Bill, 'id' | 'created_at' | 'updated_at'>): Promise<Bill> {
    const { data, error } = await supabase
      .from('bills')
      .insert([billData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 공과금 납부 기록
  async payBill(billId: string, userId: string, amount: number, paymentMethod?: string): Promise<BillPayment> {
    const { data, error } = await supabase
      .from('bill_payments')
      .insert([{
        bill_id: billId,
        user_id: userId,
        amount,
        payment_method: paymentMethod
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 팀의 월별 공과금 통계
  async getMonthlyBillStats(teamId: string, year: number, month: number) {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${(month + 1).toString().padStart(2, '0')}-01`;

    const { data, error } = await supabase
      .from('bills')
      .select(`
        *,
        payments:bill_payments(amount)
      `)
      .eq('team_id', teamId)
      .gte('due_date', startDate)
      .lt('due_date', endDate);

    if (error) throw error;
    return data || [];
  },

  // 공과금 업데이트
  async updateBill(billId: string, updates: Partial<Bill>): Promise<Bill> {
    const { data, error } = await supabase
      .from('bills')
      .update(updates)
      .eq('id', billId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// ITEMS 서비스
// =============================================================================

export const itemsService = {
  // 팀의 아이템 목록 가져오기
  async getTeamItems(teamId: string): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('team_id', teamId)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // 아이템 생성
  async createItem(itemData: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Promise<Item> {
    const { data, error } = await supabase
      .from('items')
      .insert([itemData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 아이템 수량 업데이트
  async updateItemQuantity(itemId: string, newQuantity: number): Promise<Item> {
    const { data, error } = await supabase
      .from('items')
      .update({ current_quantity: newQuantity })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 구매 요청 목록 가져오기
  async getPurchaseRequests(teamId: string): Promise<PurchaseRequest[]> {
    const { data, error } = await supabase
      .from('purchase_requests')
      .select(`
        *,
        item:items(*),
        requested_profile:profiles(*)
      `)
      .eq('team_id', teamId)
      .in('status', ['pending', 'approved'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // 구매 요청 생성
  async createPurchaseRequest(requestData: Omit<PurchaseRequest, 'id' | 'created_at' | 'updated_at'>): Promise<PurchaseRequest> {
    const { data, error } = await supabase
      .from('purchase_requests')
      .insert([requestData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 구매 요청 승인
  async approvePurchaseRequest(requestId: string, approvedBy: string): Promise<PurchaseRequest> {
    const { data, error } = await supabase
      .from('purchase_requests')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 구매 완료 처리
  async completePurchaseRequest(requestId: string, purchasedBy: string): Promise<PurchaseRequest> {
    const { data, error } = await supabase
      .from('purchase_requests')
      .update({
        status: 'purchased',
        purchased_by: purchasedBy,
        purchased_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 구매 요청 거절
  async rejectPurchaseRequest(requestId: string): Promise<PurchaseRequest> {
    const { data, error } = await supabase
      .from('purchase_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// NOTIFICATIONS 서비스
// =============================================================================

export const notificationsService = {
  // 사용자의 알림 목록 가져오기
  async getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // 알림 생성
  async createNotification(notificationData: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 팀 전체에 알림 생성
  async createTeamNotification(
    teamId: string,
    title: string,
    message: string,
    type: string,
    relatedId?: string,
    actionData?: any
  ): Promise<void> {
    // 팀 멤버들 가져오기
    const { data: teamMembers } = await supabase
      .from('team_memberships')
      .select('user_id')
      .eq('team_id', teamId);

    if (!teamMembers?.length) return;

    // 각 멤버에게 알림 생성
    const notifications = teamMembers.map(member => ({
      team_id: teamId,
      user_id: member.user_id,
      title,
      message,
      type,
      related_id: relatedId,
      action_data: actionData,
      is_read: false
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) throw error;
  },

  // 알림 읽음 처리
  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  // 사용자의 모든 알림 읽음 처리
  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },

  // 읽은 알림 삭제
  async clearReadNotifications(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('is_read', true);

    if (error) throw error;
  },

  // 읽지 않은 알림 개수
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  },
};

// =============================================================================
// FEEDBACK 서비스
// =============================================================================

export const feedbackService = {
  // 팀의 월별 피드백 가져오기
  async getTeamFeedback(teamId: string, year: number, month: number): Promise<Feedback[]> {
    const monthStr = `${year}-${month.toString().padStart(2, '0')}-01`;

    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('team_id', teamId)
      .eq('month', monthStr);

    if (error) throw error;
    return data || [];
  },

  // 피드백 생성 또는 업데이트
  async createOrUpdateFeedback(
    teamId: string,
    userId: string,
    year: number,
    month: number,
    rating: number,
    comment?: string
  ): Promise<Feedback> {
    const monthStr = `${year}-${month.toString().padStart(2, '0')}-01`;

    const { data, error } = await supabase
      .from('feedback')
      .upsert([{
        team_id: teamId,
        user_id: userId,
        month: monthStr,
        rating,
        comment
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 팀의 평균 평점 계산
  async getAverageRating(teamId: string, year: number, month: number): Promise<number> {
    const monthStr = `${year}-${month.toString().padStart(2, '0')}-01`;

    const { data, error } = await supabase
      .from('feedback')
      .select('rating')
      .eq('team_id', teamId)
      .eq('month', monthStr);

    if (error) throw error;
    
    if (!data || data.length === 0) return 0;
    
    const sum = data.reduce((acc, feedback) => acc + feedback.rating, 0);
    return sum / data.length;
  },
};

// =============================================================================
// PROFILES 서비스
// =============================================================================

export const profilesService = {
  // 프로필 가져오기
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data;
  },

  // 프로필 업데이트
  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// 실시간 구독 헬퍼
// =============================================================================

export const realtimeService = {
  // 팀 데이터 실시간 구독
  subscribeToTeamData(
    teamId: string,
    table: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`team-${teamId}-${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `team_id=eq.${teamId}`
        },
        callback
      )
      .subscribe();
  },

  // 사용자 알림 실시간 구독
  subscribeToUserNotifications(
    userId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`user-${userId}-notifications`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },
};

// 기본 내보내기
export default {
  teams: teamsService,
  routines: routinesService,
  bills: billsService,
  items: itemsService,
  notifications: notificationsService,
  feedback: feedbackService,
  profiles: profilesService,
  realtime: realtimeService,
};