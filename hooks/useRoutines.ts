import { useState, useMemo, useEffect } from "react";
import { Alert, AppState } from "react-native";
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
      nextDate: "2025-08-17", // 오늘 날짜로 업데이트
      status: "completed",
      icon: "restaurant-outline",
      frequency: "daily",
      completedAt: "2025-08-16", // 어제 완료 (오늘 리셋되어야 함)
    },
    {
      id: 2,
      task: "청소기",
      assignee: "이영희",
      nextDate: "2024-12-30", // 다음 주 월요일
      status: "completed",
      icon: "home-outline",
      frequency: "weekly",
      completedAt: "2024-12-22", // 지난 주 완료 (리셋되어야 함)
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

          // 다음 예정일 계산
          const today = new Date();
          const nextDate = calculateNextDate(today, routine.frequency);

          return {
            ...routine,
            status: "completed" as const,
            completedAt: today.toISOString().split("T")[0],
            nextDate: nextDate.toISOString().split("T")[0],
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
