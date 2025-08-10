import { useState, useMemo } from "react";
import { Alert } from "react-native";
import { useNotificationContext } from "@/contexts/NotificationContext";

interface Routine {
  id: number;
  task: string;
  assignee: string;
  nextDate: string;
  status: "pending" | "completed" | "overdue";
  icon: string;
  frequency: "daily" | "weekly" | "monthly";
  completedAt?: string;
}

interface NewRoutine {
  task: string;
  assignee: string;
  frequency: "daily" | "weekly" | "monthly";
}

export function useRoutines() {
  const { createNotification } = useNotificationContext();
  const [routines, setRoutines] = useState<Routine[]>([
    {
      id: 1,
      task: "설거지",
      assignee: "김철수",
      nextDate: "2024-12-28",
      status: "pending",
      icon: "restaurant-outline",
      frequency: "daily",
    },
    {
      id: 2,
      task: "청소기",
      assignee: "이영희",
      nextDate: "2024-12-29",
      status: "completed",
      icon: "home-outline",
      frequency: "weekly",
      completedAt: "2024-12-28",
    },
    {
      id: 3,
      task: "화장실 청소",
      assignee: "박민수",
      nextDate: "2024-12-30",
      status: "pending",
      icon: "water-outline",
      frequency: "weekly",
    },
    {
      id: 4,
      task: "쓰레기 버리기",
      assignee: "김철수",
      nextDate: "2024-12-31",
      status: "overdue",
      icon: "trash-outline",
      frequency: "daily",
    },
  ]);

  const roommates = ["김철수", "이영희", "박민수", "정지수"];

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
  const completeRoutine = (routineId: number) => {
    setRoutines((prev) =>
      prev.map((routine) => {
        if (routine.id === routineId) {
          // 알림 생성
          createNotification({
            title: "루틴 완료",
            message: `${routine.assignee}가 "${routine.task}"를 완료했습니다`,
            type: "routine_completed",
            relatedId: routineId.toString(),
          });

          return {
            ...routine,
            status: "completed" as const,
            completedAt: new Date().toISOString().split("T")[0],
          };
        }
        return routine;
      })
    );
  };

  // 루틴 미루기 처리
  const postponeRoutine = (routineId: number) => {
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
  const changeAssignee = (routineId: number, newAssignee: string) => {
    setRoutines((prev) =>
      prev.map((routine) =>
        routine.id === routineId
          ? { ...routine, assignee: newAssignee }
          : routine
      )
    );
  };

  // 주기 변경
  const changeFrequency = (routineId: number, newFrequency: "daily" | "weekly" | "monthly") => {
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
  };


  // 새 루틴 추가
  const addNewRoutine = (newRoutine: NewRoutine) => {
    const today = new Date();
    const nextDate = new Date(today);

    // 빈도에 따라 다음 날짜 계산
    switch (newRoutine.frequency) {
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

    const routine: Routine = {
      id: Date.now(), // 임시 ID 생성
      task: newRoutine.task.trim(),
      assignee: newRoutine.assignee,
      nextDate: nextDate.toISOString().split("T")[0],
      status: "pending",
      icon: getIconForTask(newRoutine.task),
      frequency: newRoutine.frequency,
    };

    setRoutines((prev) => [...prev, routine]);
  };

  // 루틴 삭제 (모달에서 확인 후 호출됨)
  const deleteRoutine = (routineId: number) => {
    setRoutines((prev) => prev.filter((r) => r.id !== routineId));
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

  return {
    routines,
    statistics,
    roommates,
    completeRoutine,
    postponeRoutine,
    addNewRoutine,
    changeAssignee,
    changeFrequency,
    deleteRoutine,
    showAssigneeOptions: (routine: Routine) => showAssigneeOptions(routine),
  };
}
