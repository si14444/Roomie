import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as announcementService from '@/services/announcementService';

/**
 * 팀의 공지사항 목록 조회 훅
 */
export const useAnnouncements = (teamId: string | undefined) => {
  return useQuery({
    queryKey: ['announcements', teamId],
    queryFn: () => {
      if (!teamId) throw new Error('Team ID is required');
      return announcementService.getTeamAnnouncements(teamId);
    },
    enabled: !!teamId,
  });
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
