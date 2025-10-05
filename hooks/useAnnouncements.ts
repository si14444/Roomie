import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import * as announcementService from '@/services/announcementService';

/**
 * 팀의 공지사항 목록 조회 훅 (실시간 업데이트)
 */
export const useAnnouncements = (teamId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['announcements', teamId],
    queryFn: () => {
      if (!teamId) throw new Error('Team ID is required');
      return announcementService.getTeamAnnouncements(teamId);
    },
    enabled: !!teamId,
    staleTime: 0, // 항상 최신 데이터 유지
    refetchOnWindowFocus: true, // 윈도우 포커스 시 리패치
    refetchOnMount: true, // 마운트 시 리패치
  });

  // Firestore 실시간 리스너 설정
  useEffect(() => {
    if (!teamId) return;

    const unsubscribe = announcementService.subscribeToTeamAnnouncements(
      teamId,
      (announcements) => {
        // 실시간 업데이트 데이터를 캐시에 저장
        queryClient.setQueryData(['announcements', teamId], announcements);
      },
      (error) => {
        console.error('Failed to subscribe to announcements:', error);
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
 * 공지사항 생성 mutation 훅
 */
export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: announcementService.createAnnouncement,
    onSuccess: (data) => {
      // 해당 팀의 공지사항 목록 refetch
      queryClient.invalidateQueries({ queryKey: ['announcements', data.team_id] });
    },
  });
};
