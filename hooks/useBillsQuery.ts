import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import * as billService from '@/services/billService';

/**
 * 팀의 공과금 목록 조회 훅 (실시간 업데이트)
 */
export const useBillsQuery = (teamId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['bills', teamId],
    queryFn: () => {
      if (!teamId) throw new Error('Team ID is required');
      return billService.getTeamBills(teamId);
    },
    enabled: !!teamId,
    staleTime: 0, // 항상 최신 데이터 유지
    gcTime: 5 * 60 * 1000, // 5분간 캐시 유지
    refetchOnWindowFocus: true, // 윈도우 포커스 시 리패치
    refetchOnMount: true, // 마운트 시 리패치
    refetchOnReconnect: true, // 네트워크 재연결 시 리패치
  });

  // Firestore 실시간 리스너 설정
  useEffect(() => {
    if (!teamId) return;

    const unsubscribe = billService.subscribeToTeamBills(
      teamId,
      (bills) => {
        // 실시간 업데이트 데이터를 캐시에 저장
        queryClient.setQueryData(['bills', teamId], bills);
      },
      (error) => {
        console.error('Failed to subscribe to bills:', error);
      }
    );

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      unsubscribe();
    };
  }, [teamId, queryClient]);

  return query;
};

/**
 * 공과금 생성 mutation 훅 (Optimistic Update)
 */
export const useCreateBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: billService.createBill,
    onMutate: async (newBill) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['bills', newBill.team_id] });

      // Snapshot the previous value
      const previousBills = queryClient.getQueryData(['bills', newBill.team_id]);

      // Optimistically update to the new value
      queryClient.setQueryData(['bills', newBill.team_id], (old: any) => {
        if (!old) return old;

        const optimisticBill = {
          id: `temp-${Date.now()}`,
          ...newBill,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return [optimisticBill, ...old];
      });

      // Return context with the snapshot
      return { previousBills };
    },
    onError: (err, newBill, context: any) => {
      // Rollback on error
      if (context?.previousBills) {
        queryClient.setQueryData(
          ['bills', newBill.team_id],
          context.previousBills
        );
      }
    },
    onSuccess: (data) => {
      // Refetch to get the real data from server
      queryClient.invalidateQueries({ queryKey: ['bills', data.team_id] });
      queryClient.invalidateQueries({ queryKey: ['bill-payments'] });
    },
    onSettled: (data) => {
      // Always refetch after error or success
      if (data?.team_id) {
        queryClient.invalidateQueries({ queryKey: ['bills', data.team_id] });
      }
    },
  });
};

/**
 * 공과금 수정 mutation 훅 (Optimistic Update)
 */
export const useUpdateBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ billId, updates }: {
      billId: string;
      updates: Partial<Omit<billService.Bill, 'id' | 'created_at' | 'team_id'>>
    }) => billService.updateBill(billId, updates),
    onMutate: async ({ billId, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['bills'] });

      // Snapshot the previous values
      const previousBills = queryClient.getQueriesData({ queryKey: ['bills'] });

      // Optimistically update all matching queries
      queryClient.setQueriesData({ queryKey: ['bills'] }, (old: any) => {
        if (!old) return old;
        return old.map((bill: any) =>
          bill.id === billId
            ? { ...bill, ...updates, updated_at: new Date().toISOString() }
            : bill
        );
      });

      return { previousBills };
    },
    onError: (err, variables, context: any) => {
      // Rollback on error
      if (context?.previousBills) {
        context.previousBills.forEach(([queryKey, data]: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
};

/**
 * 공과금 삭제 mutation 훅 (Optimistic Update)
 */
export const useDeleteBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: billService.deleteBill,
    onMutate: async (billId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['bills'] });

      // Snapshot the previous values
      const previousBills = queryClient.getQueriesData({ queryKey: ['bills'] });

      // Optimistically remove from all queries
      queryClient.setQueriesData({ queryKey: ['bills'] }, (old: any) => {
        if (!old) return old;
        return old.filter((bill: any) => bill.id !== billId);
      });

      return { previousBills };
    },
    onError: (err, billId, context: any) => {
      // Rollback on error
      if (context?.previousBills) {
        context.previousBills.forEach(([queryKey, data]: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bill-payments'] });
    },
  });
};

/**
 * 공과금 지불 기록 생성 mutation 훅 (Optimistic Update)
 */
export const useCreateBillPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: billService.createBillPayment,
    onMutate: async (paymentData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['bill-payments', paymentData.bill_id] });

      // Snapshot the previous value
      const previousPayments = queryClient.getQueryData([
        'bill-payments',
        paymentData.bill_id,
      ]);

      // Optimistically add the payment
      queryClient.setQueryData(
        ['bill-payments', paymentData.bill_id],
        (old: any) => {
          const optimisticPayment = {
            id: `temp-${Date.now()}`,
            ...paymentData,
            paid_at: new Date().toISOString(),
          };
          return old ? [optimisticPayment, ...old] : [optimisticPayment];
        }
      );

      return { previousPayments };
    },
    onError: (err, paymentData, context: any) => {
      // Rollback on error
      if (context?.previousPayments) {
        queryClient.setQueryData(
          ['bill-payments', paymentData.bill_id],
          context.previousPayments
        );
      }
    },
    onSuccess: (data) => {
      // Refetch to get the real data
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bill-payments', data.bill_id] });
    },
    onSettled: (data) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      if (data?.bill_id) {
        queryClient.invalidateQueries({ queryKey: ['bill-payments', data.bill_id] });
      }
    },
  });
};

/**
 * 공과금 지불 기록 조회 훅
 */
export const useBillPayments = (billId: string | undefined) => {
  return useQuery({
    queryKey: ['bill-payments', billId],
    queryFn: () => {
      if (!billId) throw new Error('Bill ID is required');
      return billService.getBillPayments(billId);
    },
    enabled: !!billId,
    staleTime: 60000, // Cache for 1 minute
  });
};

/**
 * 사용자의 지불 여부 확인 훅
 */
export const useUserBillPayment = (billId: string | undefined, userId: string | undefined) => {
  return useQuery({
    queryKey: ['bill-payment-check', billId, userId],
    queryFn: () => {
      if (!billId || !userId) throw new Error('Bill ID and User ID are required');
      return billService.checkUserPayment(billId, userId);
    },
    enabled: !!billId && !!userId,
    staleTime: 60000, // Cache for 1 minute
  });
};
