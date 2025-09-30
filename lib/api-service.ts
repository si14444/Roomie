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
    // TODO: Implement actual API call
    console.log('billsService.getTeamBills - Not implemented yet');
    return [];
  },

  createBill: async (billData: Omit<Bill, 'id' | 'created_at' | 'updated_at'>): Promise<Bill> => {
    // TODO: Implement actual API call
    console.log('billsService.createBill - Not implemented yet');
    const newBill: Bill = {
      ...billData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return newBill;
  },

  updateBill: async (billId: string, updates: Partial<Bill>): Promise<Bill> => {
    // TODO: Implement actual API call
    console.log('billsService.updateBill - Not implemented yet');
    throw new Error('Not implemented');
  },

  payBill: async (billId: string, userId: string, amount: number, paymentMethod?: string): Promise<BillPayment> => {
    // TODO: Implement actual API call
    console.log('billsService.payBill - Not implemented yet');
    const payment: BillPayment = {
      id: Date.now().toString(),
      bill_id: billId,
      user_id: userId,
      amount,
      payment_method: paymentMethod,
      paid_at: new Date().toISOString(),
    };
    return payment;
  },
};

// Routines Service
export const routinesService = {
  getTeamRoutines: async (teamId: string): Promise<Routine[]> => {
    // TODO: Implement actual API call
    console.log('routinesService.getTeamRoutines - Not implemented yet');
    return [];
  },

  createRoutine: async (routineData: Omit<Routine, 'id' | 'created_at' | 'updated_at'>): Promise<Routine> => {
    // TODO: Implement actual API call
    console.log('routinesService.createRoutine - Not implemented yet');
    const newRoutine: Routine = {
      ...routineData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return newRoutine;
  },

  updateRoutine: async (routineId: string, updates: Partial<Routine>): Promise<Routine> => {
    // TODO: Implement actual API call
    console.log('routinesService.updateRoutine - Not implemented yet');
    throw new Error('Not implemented');
  },

  completeRoutine: async (routineId: string, userId: string, notes?: string): Promise<RoutineCompletion> => {
    // TODO: Implement actual API call
    console.log('routinesService.completeRoutine - Not implemented yet');
    const completion: RoutineCompletion = {
      id: Date.now().toString(),
      routine_id: routineId,
      completed_by: userId,
      completed_at: new Date().toISOString(),
      notes,
    };
    return completion;
  },

  deleteRoutine: async (routineId: string): Promise<void> => {
    // TODO: Implement actual API call
    console.log('routinesService.deleteRoutine - Not implemented yet');
  },
};

// Teams Service
export const teamsService = {
  getTeamMembers: async (teamId: string): Promise<TeamMember[]> => {
    // TODO: Implement actual API call
    console.log('teamsService.getTeamMembers - Not implemented yet');
    return [];
  },
};