import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import * as routineService from '@/services/routineService';

/**
 * 팀의 루틴 목록 조회 훅 (실시간 업데이트)
 */
export const useRoutinesQuery = (teamId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['routines', teamId],
    queryFn: () => {
      if (!teamId) throw new Error('Team ID is required');
      return routineService.getTeamRoutines(teamId);
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

    const unsubscribe = routineService.subscribeToTeamRoutines(
      teamId,
      (routines) => {
        // 실시간 업데이트 데이터를 캐시에 저장
        queryClient.setQueryData(['routines', teamId], routines);
      },
      (error) => {
        console.error('Failed to subscribe to routines:', error);
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
 * 루틴 생성 mutation 훅 (Optimistic Update)
 */
export const useCreateRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: routineService.createRoutine,
    onMutate: async (newRoutine) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['routines', newRoutine.team_id] });

      // Snapshot the previous value
      const previousRoutines = queryClient.getQueryData(['routines', newRoutine.team_id]);

      // Optimistically update to the new value
      queryClient.setQueryData(['routines', newRoutine.team_id], (old: any) => {
        if (!old) return old;

        const optimisticRoutine = {
          id: `temp-${Date.now()}`,
          ...newRoutine,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return [optimisticRoutine, ...old];
      });

      // Return context with the snapshot
      return { previousRoutines };
    },
    onError: (err, newRoutine, context: any) => {
      // Rollback on error
      if (context?.previousRoutines) {
        queryClient.setQueryData(
          ['routines', newRoutine.team_id],
          context.previousRoutines
        );
      }
    },
    onSuccess: (data) => {
      // Refetch to get the real data from server
      queryClient.invalidateQueries({ queryKey: ['routines', data.team_id] });
    },
    onSettled: (data) => {
      // Always refetch after error or success
      if (data?.team_id) {
        queryClient.invalidateQueries({ queryKey: ['routines', data.team_id] });
      }
    },
  });
};

/**
 * 루틴 수정 mutation 훅 (Optimistic Update)
 */
export const useUpdateRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ routineId, updates }: {
      routineId: string;
      updates: Partial<Omit<routineService.Routine, 'id' | 'created_at' | 'team_id'>>
    }) => routineService.updateRoutine(routineId, updates),
    onMutate: async ({ routineId, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['routines'] });

      // Snapshot the previous values
      const previousRoutines = queryClient.getQueriesData({ queryKey: ['routines'] });

      // Optimistically update all matching queries
      queryClient.setQueriesData({ queryKey: ['routines'] }, (old: any) => {
        if (!old) return old;
        return old.map((routine: any) =>
          routine.id === routineId
            ? { ...routine, ...updates, updated_at: new Date().toISOString() }
            : routine
        );
      });

      return { previousRoutines };
    },
    onError: (err, variables, context: any) => {
      // Rollback on error
      if (context?.previousRoutines) {
        context.previousRoutines.forEach(([queryKey, data]: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });
};

/**
 * 루틴 삭제 mutation 훅 (Optimistic Update)
 */
export const useDeleteRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: routineService.deleteRoutine,
    onMutate: async (routineId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['routines'] });

      // Snapshot the previous values
      const previousRoutines = queryClient.getQueriesData({ queryKey: ['routines'] });

      // Optimistically remove from all queries
      queryClient.setQueriesData({ queryKey: ['routines'] }, (old: any) => {
        if (!old) return old;
        return old.filter((routine: any) => routine.id !== routineId);
      });

      return { previousRoutines };
    },
    onError: (err, routineId, context: any) => {
      // Rollback on error
      if (context?.previousRoutines) {
        context.previousRoutines.forEach(([queryKey, data]: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });
};

/**
 * 루틴 완료 기록 생성 mutation 훅 (Optimistic Update)
 */
export const useCompleteRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: routineService.createRoutineCompletion,
    onMutate: async (completionData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['routine-completions'] });

      // Snapshot the previous value
      const previousCompletions = queryClient.getQueryData([
        'routine-completions',
        completionData.routine_id,
      ]);

      // Optimistically add the completion
      queryClient.setQueryData(
        ['routine-completions', completionData.routine_id],
        (old: any) => {
          const optimisticCompletion = {
            id: `temp-${Date.now()}`,
            ...completionData,
            completed_at: new Date().toISOString(),
          };
          return old ? [optimisticCompletion, ...old] : [optimisticCompletion];
        }
      );

      return { previousCompletions };
    },
    onError: (err, completionData, context: any) => {
      // Rollback on error
      if (context?.previousCompletions) {
        queryClient.setQueryData(
          ['routine-completions', completionData.routine_id],
          context.previousCompletions
        );
      }
    },
    onSuccess: () => {
      // Refetch to get the real data
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      queryClient.invalidateQueries({ queryKey: ['routine-completions'] });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      queryClient.invalidateQueries({ queryKey: ['routine-completions'] });
    },
  });
};

/**
 * 루틴 완료 기록 조회 훅
 */
export const useRoutineCompletions = (routineId: string | undefined) => {
  return useQuery({
    queryKey: ['routine-completions', routineId],
    queryFn: () => {
      if (!routineId) throw new Error('Routine ID is required');
      return routineService.getRoutineCompletions(routineId);
    },
    enabled: !!routineId,
  });
};

/**
 * 오늘의 완료 기록 조회 훅
 */
export const useTodayCompletion = (routineId: string | undefined, userId: string | undefined) => {
  return useQuery({
    queryKey: ['today-completion', routineId, userId],
    queryFn: () => {
      if (!routineId || !userId) throw new Error('Routine ID and User ID are required');
      return routineService.getTodayCompletion(routineId, userId);
    },
    enabled: !!routineId && !!userId,
    staleTime: 60000, // Cache for 1 minute
  });
};
