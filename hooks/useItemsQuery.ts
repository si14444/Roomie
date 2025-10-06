import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import * as itemService from '@/services/itemService';

/**
 * 팀 아이템 조회 (실시간 구독)
 */
export const useItemsQuery = (teamId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['items', teamId],
    queryFn: () => {
      if (!teamId) throw new Error('Team ID is required');
      return itemService.getTeamItems(teamId);
    },
    enabled: !!teamId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // Firestore 실시간 리스너
  useEffect(() => {
    if (!teamId) return;

    const unsubscribe = itemService.subscribeToTeamItems(
      teamId,
      (items) => {
        queryClient.setQueryData(['items', teamId], items);
      },
      (error) => {
        console.error('Items subscription error:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [teamId, queryClient]);

  return query;
};

/**
 * 팀 구매 요청 조회 (실시간 구독)
 */
export const usePurchaseRequestsQuery = (teamId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['purchaseRequests', teamId],
    queryFn: () => {
      if (!teamId) throw new Error('Team ID is required');
      return itemService.getTeamPurchaseRequests(teamId);
    },
    enabled: !!teamId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // Firestore 실시간 리스너
  useEffect(() => {
    if (!teamId) return;

    const unsubscribe = itemService.subscribeToTeamPurchaseRequests(
      teamId,
      (requests) => {
        queryClient.setQueryData(['purchaseRequests', teamId], requests);
      },
      (error) => {
        console.error('Purchase requests subscription error:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [teamId, queryClient]);

  return query;
};

/**
 * 아이템 생성 Mutation
 */
export const useCreateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof itemService.createItem>[0]) =>
      itemService.createItem(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['items', variables.team_id] });
    },
  });
};

/**
 * 아이템 수정 Mutation
 */
export const useUpdateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      updates,
      teamId,
    }: {
      itemId: string;
      updates: Parameters<typeof itemService.updateItem>[1];
      teamId: string;
    }) => itemService.updateItem(itemId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['items', variables.teamId] });
    },
  });
};

/**
 * 아이템 삭제 Mutation
 */
export const useDeleteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, teamId }: { itemId: string; teamId: string }) =>
      itemService.deleteItem(itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['items', variables.teamId] });
    },
  });
};

/**
 * 구매 요청 생성 Mutation
 */
export const useCreatePurchaseRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof itemService.createPurchaseRequest>[0]) =>
      itemService.createPurchaseRequest(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests', variables.team_id] });
    },
  });
};

/**
 * 구매 요청 승인 Mutation
 */
export const useApprovePurchaseRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      approvedBy,
      approvedByName,
      teamId,
    }: {
      requestId: string;
      approvedBy: string;
      approvedByName: string;
      teamId: string;
    }) => itemService.approvePurchaseRequest(requestId, approvedBy, approvedByName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests', variables.teamId] });
    },
  });
};

/**
 * 구매 요청 거절 Mutation
 */
export const useRejectPurchaseRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, teamId }: { requestId: string; teamId: string }) =>
      itemService.rejectPurchaseRequest(requestId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests', variables.teamId] });
    },
  });
};

/**
 * 구매 완료 처리 Mutation
 */
export const useMarkAsPurchased = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      purchasedBy,
      purchasedByName,
      teamId,
    }: {
      requestId: string;
      purchasedBy: string;
      purchasedByName: string;
      teamId: string;
    }) => itemService.markAsPurchased(requestId, purchasedBy, purchasedByName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests', variables.teamId] });
    },
  });
};

/**
 * 구매 요청 삭제 Mutation
 */
export const useDeletePurchaseRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, teamId }: { requestId: string; teamId: string }) =>
      itemService.deletePurchaseRequest(requestId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests', variables.teamId] });
    },
  });
};
