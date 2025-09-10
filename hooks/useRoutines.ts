import { useState, useMemo, useEffect } from "react";
import { Alert, AppState } from "react-native";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { routinesService, Routine as SupabaseRoutine, RoutineCompletion } from "@/lib/supabase-service";
import { useTeam } from "@/contexts/TeamContext";

interface Routine {
  id: string;
  task: string;
  assignee: string;
  nextDate: string;
  status: "pending" | "completed" | "overdue";
  icon: string;
  frequency: "daily" | "weekly" | "monthly";
  completedAt?: string;
  assigned_profile?: {
    id: string;
    full_name: string;
  };
}

interface NewRoutine {
  task: string;
  assignee: string;
  frequency: "daily" | "weekly" | "monthly";
}

export function useRoutines() {
  const { createNotification } = useNotificationContext();
  const { currentTeam } = useTeam();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [roommates, setRoommates] = useState<string[]>([]);

  // Load routines and team members
  useEffect(() => {
    if (currentTeam?.id) {
      loadRoutines();
      loadTeamMembers();
    }
  }, [currentTeam?.id]);

  const loadRoutines = async () => {
    if (!currentTeam?.id) return;

    try {
      setLoading(true);
      const data = await routinesService.getRoutines(currentTeam.id);
      const routinesWithStatus = data.map(mapSupabaseRoutineToLocal);
      setRoutines(routinesWithStatus);
    } catch (error) {
      console.error('Error loading routines:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMembers = async () => {
    if (!currentTeam?.id) return;

    try {
      const members = await routinesService.getTeamMembers(currentTeam.id);
      setRoommates(members.map(m => m.profile?.full_name || 'Unknown'));
    } catch (error) {
      console.error('Error loading team members:', error);
      setRoommates([]);
    }
  };

  const mapSupabaseRoutineToLocal = (supabaseRoutine: SupabaseRoutine): Routine => {
    // Check for recent completion to determine status
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // Simple status determination - in real app would check recent completions
    const status = "pending"; // Would need completion checking logic
    
    return {
      id: supabaseRoutine.id,
      task: supabaseRoutine.title,
      assignee: supabaseRoutine.assigned_profile?.full_name || 'Unassigned',
      nextDate: todayString, // Would calculate based on frequency
      status: status as "pending" | "completed" | "overdue",
      icon: getIconForTask(supabaseRoutine.title),
      frequency: supabaseRoutine.frequency as "daily" | "weekly" | "monthly",
      assigned_profile: supabaseRoutine.assigned_profile,
    };
  };

  // 루틴 상태 자동 업데이트 함수
  const checkAndUpdateRoutineStatus = () => {
    const today = new Date();
    const currentDate = today.toISOString().split("T")[0];
    
    setRoutines((prev) =>
      prev.map((routine) => {
        // 완료된 루틴만 체크
        if (routine.status !== "completed" || !routine.completedAt) {
          return routine;
        }

        const completedDate = new Date(routine.completedAt);
        const shouldReset = shouldResetRoutine(routine, completedDate, today);

        if (shouldReset) {
          // 루틴 리셋 - 다음 예정일 계산
          const nextDate = calculateNextDate(today, routine.frequency);
          
          return {
            ...routine,
            status: "pending" as const,
            nextDate: nextDate.toISOString().split("T")[0],
            completedAt: undefined,
          };
        }

        return routine;
      })
    );
  };

  // 루틴이 리셋되어야 하는지 확인
  const shouldResetRoutine = (routine: Routine, completedDate: Date, currentDate: Date): boolean => {
    switch (routine.frequency) {
      case "daily":
        // 다음 날이 되면 리셋
        const nextDay = new Date(completedDate);
        nextDay.setDate(completedDate.getDate() + 1);
        return currentDate >= nextDay;

      case "weekly":
        // 다음 주 월요일에 리셋
        const nextMonday = getNextMonday(completedDate);
        return currentDate >= nextMonday;

      case "monthly":
        // 다음 달 1일에 리셋
        const nextMonth = new Date(completedDate);
        nextMonth.setMonth(completedDate.getMonth() + 1);
        nextMonth.setDate(1);
        return currentDate >= nextMonth;

      default:
        return false;
    }
  };

  // 다음 월요일 날짜 계산
  const getNextMonday = (fromDate: Date): Date => {
    const date = new Date(fromDate);
    const dayOfWeek = date.getDay(); // 0 = 일요일, 1 = 월요일, ...
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek); // 다음 월요일까지 남은 일수
    
    date.setDate(date.getDate() + daysUntilMonday);
    return date;
  };

  // 다음 예정일 계산
  const calculateNextDate = (fromDate: Date, frequency: "daily" | "weekly" | "monthly"): Date => {
    const nextDate = new Date(fromDate);
    
    switch (frequency) {
      case "daily":
        nextDate.setDate(fromDate.getDate() + 1);
        break;
      case "weekly":
        // 주간 루틴은 다음 주 월요일이 예정일
        return getNextMonday(fromDate);
      case "monthly":
        // 월간 루틴은 다음 달 1일이 예정일
        nextDate.setMonth(fromDate.getMonth() + 1);
        nextDate.setDate(1);
        break;
    }
    
    return nextDate;
  };

  // 앱 로드시와 주기적으로 루틴 상태 체크
  useEffect(() => {
    checkAndUpdateRoutineStatus();
    
    // 매일 자정에 체크하도록 인터벌 설정
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timeoutId = setTimeout(() => {
      checkAndUpdateRoutineStatus();
      
      // 이후 24시간마다 체크
      const intervalId = setInterval(checkAndUpdateRoutineStatus, 24 * 60 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    }, msUntilMidnight);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // 앱이 포그라운드로 돌아올 때도 체크
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // 앱이 포그라운드로 돌아왔을 때 루틴 상태 체크
        checkAndUpdateRoutineStatus();
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => subscription?.remove();
  }, []);

  // 동적 통계 계산
  const statistics = useMemo(() => {
    const completed = routines.filter((r) => r.status === "completed").length;
    const pending = routines.filter((r) => r.status === "pending").length;
    const overdue = routines.filter((r) => r.status === "overdue").length;
    const total = routines.length;

    return {
      completed,
      pending,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      participationRate: 95, // 예시값
    };
  }, [routines]);

  // 루틴 완료 처리
  const completeRoutine = async (routineId: string) => {
    if (!currentTeam?.id) return;

    try {
      const routine = routines.find(r => r.id === routineId);
      if (!routine) return;

      // Create routine completion record
      await routinesService.completeRoutine({
        routine_id: routineId,
        notes: '',
        due_date: new Date().toISOString().split('T')[0],
        is_late: false,
      });

      // Update local state
      setRoutines((prev) =>
        prev.map((r) => {
          if (r.id === routineId) {
            // 알림 생성
            createNotification({
              title: "루틴 완료",
              message: `${r.assignee}가 "${r.task}"를 완료했습니다`,
              type: "routine_completed",
              relatedId: routineId,
            });

            // 다음 예정일 계산
            const today = new Date();
            const nextDate = calculateNextDate(today, r.frequency);

            return {
              ...r,
              status: "completed" as const,
              completedAt: today.toISOString().split("T")[0],
              nextDate: nextDate.toISOString().split("T")[0],
            };
          }
          return r;
        })
      );
    } catch (error) {
      console.error('Error completing routine:', error);
      Alert.alert('오류', '루틴 완료 처리 중 오류가 발생했습니다.');
    }
  };

  // 루틴 미루기 처리
  const postponeRoutine = async (routineId: string) => {
    setRoutines((prev) =>
      prev.map((routine) => {
        if (routine.id === routineId) {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + 1);
          return {
            ...routine,
            nextDate: nextDate.toISOString().split("T")[0],
            status: "pending" as const,
          };
        }
        return routine;
      })
    );
  };

  // 담당자 변경
  const changeAssignee = async (routineId: string, newAssignee: string) => {
    try {
      // Find the team member ID for the new assignee
      const members = await routinesService.getTeamMembers(currentTeam!.id);
      const newAssigneeProfile = members.find(m => m.profile?.full_name === newAssignee);
      
      if (newAssigneeProfile) {
        await routinesService.updateRoutine(routineId, {
          assigned_to: newAssigneeProfile.user_id,
        });
      }

      setRoutines((prev) =>
        prev.map((routine) =>
          routine.id === routineId
            ? { ...routine, assignee: newAssignee }
            : routine
        )
      );
    } catch (error) {
      console.error('Error changing assignee:', error);
      Alert.alert('오류', '담당자 변경 중 오류가 발생했습니다.');
    }
  };

  // 주기 변경
  const changeFrequency = async (routineId: string, newFrequency: "daily" | "weekly" | "monthly") => {
    try {
      await routinesService.updateRoutine(routineId, {
        frequency: newFrequency,
      });

      setRoutines((prev) =>
        prev.map((routine) => {
          if (routine.id === routineId) {
            // 새로운 주기에 따라 다음 날짜 계산
            const today = new Date();
            const nextDate = new Date(today);
            
            switch (newFrequency) {
              case "daily":
                nextDate.setDate(today.getDate() + 1);
                break;
              case "weekly":
                nextDate.setDate(today.getDate() + 7);
                break;
              case "monthly":
                nextDate.setMonth(today.getMonth() + 1);
                break;
            }

            return {
              ...routine,
              frequency: newFrequency,
              nextDate: nextDate.toISOString().split("T")[0],
            };
          }
          return routine;
        })
      );
    } catch (error) {
      console.error('Error changing frequency:', error);
      Alert.alert('오류', '주기 변경 중 오류가 발생했습니다.');
    }
  };


  // 새 루틴 추가
  const addNewRoutine = async (newRoutine: NewRoutine) => {
    if (!currentTeam?.id) return;

    try {
      // Find the team member ID for the assignee
      const members = await routinesService.getTeamMembers(currentTeam.id);
      const assigneeProfile = members.find(m => m.profile?.full_name === newRoutine.assignee);
      
      if (!assigneeProfile) {
        Alert.alert('오류', '담당자를 찾을 수 없습니다.');
        return;
      }

      const supabaseRoutine = await routinesService.createRoutine({
        team_id: currentTeam.id,
        title: newRoutine.task.trim(),
        description: '',
        category: 'general',
        frequency: newRoutine.frequency,
        frequency_details: {},
        assigned_to: assigneeProfile.user_id,
        priority: 'medium',
      });

      const routine: Routine = {
        id: supabaseRoutine.id,
        task: newRoutine.task.trim(),
        assignee: newRoutine.assignee,
        nextDate: new Date().toISOString().split("T")[0],
        status: "pending",
        icon: getIconForTask(newRoutine.task),
        frequency: newRoutine.frequency,
      };

      setRoutines((prev) => [...prev, routine]);
    } catch (error) {
      console.error('Error adding routine:', error);
      Alert.alert('오류', '루틴 추가 중 오류가 발생했습니다.');
    }
  };

  // 루틴 삭제 (모달에서 확인 후 호출됨)
  const deleteRoutine = async (routineId: string) => {
    try {
      await routinesService.deleteRoutine(routineId);
      setRoutines((prev) => prev.filter((r) => r.id !== routineId));
    } catch (error) {
      console.error('Error deleting routine:', error);
      Alert.alert('오류', '루틴 삭제 중 오류가 발생했습니다.');
    }
  };

  // 담당자 옵션 표시
  const showAssigneeOptions = (routine: Routine) => {
    const buttons = [
      ...roommates.map((roommate) => ({
        text: roommate,
        onPress: () => changeAssignee(routine.id, roommate),
      })),
      { text: "취소", style: "cancel" as const },
    ];

    Alert.alert("담당자 변경", "새 담당자를 선택해주세요.", buttons);
  };

  // 작업명에 따라 적절한 아이콘 자동 선택
  const getIconForTask = (task: string) => {
    const taskLower = task.toLowerCase();
    if (
      taskLower.includes("설거지") ||
      taskLower.includes("음식") ||
      taskLower.includes("요리")
    ) {
      return "restaurant-outline";
    } else if (taskLower.includes("청소") || taskLower.includes("닦기")) {
      return "home-outline";
    } else if (taskLower.includes("화장실") || taskLower.includes("세면")) {
      return "water-outline";
    } else if (
      taskLower.includes("쓰레기") ||
      taskLower.includes("분리수거")
    ) {
      return "trash-outline";
    } else if (taskLower.includes("빨래") || taskLower.includes("세탁")) {
      return "shirt-outline";
    } else if (taskLower.includes("침대") || taskLower.includes("정리")) {
      return "bed-outline";
    } else {
      return "home-outline";
    }
  };

  return {
    routines,
    statistics,
    roommates,
    loading,
    completeRoutine,
    postponeRoutine,
    addNewRoutine,
    changeAssignee,
    changeFrequency,
    deleteRoutine,
    loadRoutines,
    showAssigneeOptions: (routine: Routine) => showAssigneeOptions(routine),
  };
}
