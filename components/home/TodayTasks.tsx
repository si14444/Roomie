import React, { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useTeam } from "@/contexts/TeamContext";
import { routinesService, Routine } from "@/lib/supabase-service";

interface Task {
  id: string;
  task: string;
  assignee: string;
  status: "pending" | "completed" | "overdue";
  time: string;
  originalRoutine?: Routine;
}

interface TodayTasksProps {
  onAddTask?: () => void;
  onTaskPress?: (taskId: string) => void;
}

export function TodayTasks({ onAddTask, onTaskPress }: TodayTasksProps) {
  const { currentTeam } = useTeam();
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load today's routines from Supabase
  const loadTodayTasks = async () => {
    if (!currentTeam?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const routines = await routinesService.getTeamRoutines(currentTeam.id);
      
      // Get today's date
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Filter and transform routines for today
      const todayRoutines = routines.filter(routine => {
        // Check if routine is active and should show today
        if (!routine.is_active) return false;
        
        // For recurring routines, check if today matches the schedule
        if (routine.frequency === 'daily') {
          return true; // Daily routines show every day
        } else if (routine.frequency === 'weekly') {
          // Weekly routines show on assigned days
          const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
          const assignedDay = routine.assigned_day;
          if (assignedDay === 'sunday' && dayOfWeek === 0) return true;
          if (assignedDay === 'monday' && dayOfWeek === 1) return true;
          if (assignedDay === 'tuesday' && dayOfWeek === 2) return true;
          if (assignedDay === 'wednesday' && dayOfWeek === 3) return true;
          if (assignedDay === 'thursday' && dayOfWeek === 4) return true;
          if (assignedDay === 'friday' && dayOfWeek === 5) return true;
          if (assignedDay === 'saturday' && dayOfWeek === 6) return true;
        }
        
        return false;
      });
      
      // Transform routines to tasks
      const transformedTasks: Task[] = todayRoutines.map(routine => {
        // Check if this routine was completed today
        const completedToday = routine.completions?.some(completion => {
          const completionDate = new Date(completion.completed_at).toISOString().split('T')[0];
          return completionDate === todayStr;
        }) || false;
        
        // Determine status
        let status: "pending" | "completed" | "overdue" = "pending";
        if (completedToday) {
          status = "completed";
        } else {
          // Check if it's overdue (past assigned time)
          const now = new Date();
          if (routine.assigned_time) {
            const [hour, minute] = routine.assigned_time.split(':').map(Number);
            const assignedTime = new Date(today);
            assignedTime.setHours(hour, minute, 0, 0);
            
            if (now > assignedTime) {
              status = "overdue";
            }
          }
        }
        
        // Format time
        let timeText = "시간 미정";
        if (routine.assigned_time) {
          const [hour, minute] = routine.assigned_time.split(':').map(Number);
          const period = hour >= 12 ? "오후" : "오전";
          const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
          timeText = `${period} ${displayHour}시${minute > 0 ? ` ${minute}분` : ''}`;
        }
        
        return {
          id: routine.id,
          task: routine.title,
          assignee: routine.assigned_user_name || "미배정",
          status,
          time: timeText,
          originalRoutine: routine
        };
      });
      
      setTodayTasks(transformedTasks);
    } catch (err) {
      console.error('Error loading today tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load today tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTodayTasks();
  }, [currentTeam?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return Colors.light.successColor;
      case "pending":
        return Colors.light.warningColor;
      case "overdue":
        return Colors.light.errorColor;
      default:
        return Colors.light.mutedText;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "완료";
      case "pending":
        return "대기중";
      case "overdue":
        return "지연";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>오늘 할 일</Text>
          <ActivityIndicator size="small" color={Colors.light.primary} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>오늘 할 일을 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>오늘 할 일</Text>
          <TouchableOpacity onPress={loadTodayTasks}>
            <Ionicons name="refresh" size={20} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>데이터를 불러올 수 없습니다</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!currentTeam) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>오늘 할 일</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>팀을 먼저 선택해주세요</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>오늘 할 일</Text>
        <TouchableOpacity onPress={onAddTask}>
          <Ionicons name="add" size={24} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>
      
      {todayTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>오늘 할 일이 없습니다</Text>
        </View>
      ) : (
        <View style={styles.tasksList}>
        {todayTasks.map((task, index) => (
          <TouchableOpacity
            key={task.id}
            style={[
              styles.taskItem,
              index === todayTasks.length - 1 && styles.lastTaskItem,
            ]}
            onPress={() => onTaskPress?.(task.id)}
          >
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>{task.task}</Text>
              <Text style={styles.taskAssignee}>
                {task.assignee} • {task.time}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(task.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusText(task.status)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.cardBackground,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  tasksList: {
    // gap을 marginBottom으로 대체
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  lastTaskItem: {
    marginBottom: 0,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  taskAssignee: {
    fontSize: 14,
    color: Colors.light.mutedText,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: Colors.light.mutedText,
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    color: Colors.light.errorColor,
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 12,
    color: Colors.light.mutedText,
    textAlign: "center",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.mutedText,
  },
});
