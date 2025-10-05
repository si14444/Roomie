import { useState, useMemo, useEffect } from "react";
import { Alert, AppState } from "react-native";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { useTeam } from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";
import * as teamService from "@/services/teamService";
import {
  useRoutinesQuery,
  useCreateRoutine,
  useUpdateRoutine,
  useDeleteRoutine,
  useCompleteRoutine,
} from "./useRoutinesQuery";
import type { Routine as FirebaseRoutine } from "@/services/routineService";
import * as routineService from "@/services/routineService";

interface Routine {
  id: string;
  task: string;
  assignee: string;
  nextDate: string;
  status: "pending" | "completed" | "overdue";
  icon: string;
  frequency: "daily" | "weekly" | "monthly";
  completedAt?: string;
  assigned_to?: string;
  assigned_name?: string;
}

interface NewRoutine {
  task: string;
  assignee: string;
  frequency: "daily" | "weekly" | "monthly";
}

export function useRoutinesFirebase() {
  const { createNotification } = useNotificationContext();
  const { currentTeam } = useTeam();
  const { user } = useAuth();
  const [roommates, setRoommates] = useState<string[]>([]);
  const [completionMap, setCompletionMap] = useState<Record<string, routineService.RoutineCompletion>>({});

  // TanStack Query hooks for Firebase
  const { data: firebaseRoutines = [], isLoading } = useRoutinesQuery(currentTeam?.id);
  const createRoutineMutation = useCreateRoutine();
  const updateRoutineMutation = useUpdateRoutine();
  const deleteRoutineMutation = useDeleteRoutine();
  const completeRoutineMutation = useCompleteRoutine();

  // Load team members
  useEffect(() => {
    const loadTeamMembers = async () => {
      if (!currentTeam?.id) return;

      try {
        const members = await teamService.getTeamMembers(currentTeam.id);

        // Fetch user information for each member
        const memberNames = await Promise.all(
          members.map(async (member) => {
            // authService에서 사용자 정보 가져오기
            const { getUserFromFirestore } = await import("@/services/authService");
            const userData = await getUserFromFirestore(member.user_id);
            return userData?.name || userData?.email || "Unknown";
          })
        );

        setRoommates(memberNames);
      } catch (error) {
        console.error("Error loading team members:", error);
        setRoommates([]);
      }
    };

    if (currentTeam?.id) {
      loadTeamMembers();
    }
  }, [currentTeam?.id]);

  // Load completion status for all routines
  useEffect(() => {
    const loadCompletions = async () => {
      if (firebaseRoutines.length === 0) return;

      const completions: Record<string, routineService.RoutineCompletion> = {};

      await Promise.all(
        firebaseRoutines.map(async (routine) => {
          try {
            const completion = await routineService.checkTodayCompletion(routine.id);
            if (completion) {
              completions[routine.id] = completion;
            }
          } catch (error) {
            console.error(`Error checking completion for routine ${routine.id}:`, error);
          }
        })
      );

      setCompletionMap(completions);
    };

    loadCompletions();
  }, [firebaseRoutines]);

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

  // Helper function to transform Firebase routine to local format
  const mapFirebaseToLocal = (fbRoutine: FirebaseRoutine): Routine => {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];

    // Check completion status
    const completion = completionMap[fbRoutine.id];
    const isCompleted = !!completion;

    // Check if postponed
    const postponeDate = fbRoutine.postpone_until ? new Date(fbRoutine.postpone_until) : null;
    const isPostponed = postponeDate ? postponeDate > today : false;

    // Determine status
    let status: "pending" | "completed" | "overdue" = "pending";
    if (isCompleted) {
      status = "completed";
    } else if (!isPostponed) {
      // Could check if overdue based on frequency, but for now just pending
      status = "pending";
    }

    return {
      id: fbRoutine.id,
      task: fbRoutine.title,
      assignee: fbRoutine.assigned_name,
      nextDate: isPostponed && postponeDate ? postponeDate.toISOString().split("T")[0] : todayString,
      status,
      icon: getIconForTask(fbRoutine.title),
      frequency: fbRoutine.frequency,
      completedAt: completion?.completed_at,
      assigned_to: fbRoutine.assigned_to,
      assigned_name: fbRoutine.assigned_name,
    };
  };

  // Transform Firebase routines to local format
  const routines: Routine[] = useMemo(() => {
    return firebaseRoutines.map((fbRoutine) => mapFirebaseToLocal(fbRoutine));
  }, [firebaseRoutines, completionMap]);

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
    };
  }, [routines]);

  // 루틴 완료 처리
  const completeRoutine = async (routineId: string) => {
    if (!currentTeam?.id || !user) return;

    try {
      const routine = routines.find((r) => r.id === routineId);
      if (!routine) return;

      // Create completion record in Firebase
      await completeRoutineMutation.mutateAsync({
        routine_id: routineId,
        completed_by: user.id,
        completed_by_name: user.name || user.email || "사용자",
        notes: "",
      });

      // 알림 생성
      await createNotification({
        title: "루틴 완료",
        message: `${routine.assignee}가 "${routine.task}"를 완료했습니다`,
        type: "routine_completed",
        relatedId: routineId,
      });

      Alert.alert("완료", "루틴을 완료했습니다.");

      // Reload completion status
      const completion = await routineService.checkTodayCompletion(routineId);
      if (completion) {
        setCompletionMap((prev) => ({ ...prev, [routineId]: completion }));
      }
    } catch (error) {
      console.error("Error completing routine:", error);
      Alert.alert("오류", "루틴 완료 처리 중 오류가 발생했습니다.");
    }
  };

  // 루틴 미루기 처리
  const postponeRoutine = async (routineId: string) => {
    try {
      // Calculate tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      // Update routine with postpone_until date
      await updateRoutineMutation.mutateAsync({
        routineId,
        updates: {
          postpone_until: tomorrow.toISOString(),
        },
      });

      Alert.alert("완료", "루틴을 내일로 미뤘습니다.");
    } catch (error) {
      console.error("Error postponing routine:", error);
      Alert.alert("오류", "루틴 미루기 중 오류가 발생했습니다.");
    }
  };

  // 담당자 변경
  const changeAssignee = async (routineId: string, newAssignee: string) => {
    try {
      if (!currentTeam?.id) return;

      // Find the team member ID for the new assignee
      const members = await teamService.getTeamMembers(currentTeam.id);

      // authService에서 사용자 정보 가져오기
      const { getUserFromFirestore } = await import("@/services/authService");

      let newAssigneeMember = null;
      for (const member of members) {
        const userData = await getUserFromFirestore(member.user_id);
        const userName = userData?.name || userData?.email || "Unknown";
        if (userName === newAssignee) {
          newAssigneeMember = member;
          break;
        }
      }

      if (!newAssigneeMember) {
        Alert.alert("오류", "담당자를 찾을 수 없습니다.");
        return;
      }

      await updateRoutineMutation.mutateAsync({
        routineId,
        updates: {
          assigned_to: newAssigneeMember.user_id,
          assigned_name: newAssignee,
        },
      });

      Alert.alert("완료", "담당자가 변경되었습니다.");
    } catch (error) {
      console.error("Error changing assignee:", error);
      Alert.alert("오류", "담당자 변경 중 오류가 발생했습니다.");
    }
  };

  // 주기 변경
  const changeFrequency = async (
    routineId: string,
    newFrequency: "daily" | "weekly" | "monthly"
  ) => {
    try {
      await updateRoutineMutation.mutateAsync({
        routineId,
        updates: {
          frequency: newFrequency,
        },
      });

      Alert.alert("완료", "주기가 변경되었습니다.");
    } catch (error) {
      console.error("Error changing frequency:", error);
      Alert.alert("오류", "주기 변경 중 오류가 발생했습니다.");
    }
  };

  // 새 루틴 추가
  const addNewRoutine = async (newRoutine: NewRoutine) => {
    if (!currentTeam?.id || !user) return;

    try {
      // Find the team member for the assignee
      const members = await teamService.getTeamMembers(currentTeam.id);

      // authService에서 사용자 정보 가져오기
      const { getUserFromFirestore } = await import("@/services/authService");

      let assigneeMember = null;
      for (const member of members) {
        const userData = await getUserFromFirestore(member.user_id);
        const userName = userData?.name || userData?.email || "Unknown";
        if (userName === newRoutine.assignee) {
          assigneeMember = member;
          break;
        }
      }

      if (!assigneeMember) {
        Alert.alert("오류", "담당자를 찾을 수 없습니다.");
        return;
      }

      await createRoutineMutation.mutateAsync({
        team_id: currentTeam.id,
        title: newRoutine.task.trim(),
        description: "",
        category: "general",
        frequency: newRoutine.frequency,
        frequency_details: {},
        assigned_to: assigneeMember.user_id,
        assigned_name: newRoutine.assignee,
        priority: "medium",
        created_by: user.id,
      });

      Alert.alert("완료", "새 루틴이 추가되었습니다.");
    } catch (error) {
      console.error("Error adding routine:", error);
      Alert.alert("오류", "루틴 추가 중 오류가 발생했습니다.");
    }
  };

  // 루틴 삭제
  const deleteRoutine = async (routineId: string) => {
    try {
      await deleteRoutineMutation.mutateAsync(routineId);
      Alert.alert("완료", "루틴이 삭제되었습니다.");
    } catch (error) {
      console.error("Error deleting routine:", error);
      Alert.alert("오류", "루틴 삭제 중 오류가 발생했습니다.");
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

  // Reload function for compatibility
  const loadRoutines = async () => {
    // Firebase real-time updates handle this automatically
    // This function is kept for compatibility
  };

  return {
    routines,
    statistics,
    roommates,
    loading: isLoading,
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
