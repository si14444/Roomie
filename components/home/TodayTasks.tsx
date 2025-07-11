import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface Task {
  id: number;
  task: string;
  assignee: string;
  status: "pending" | "completed" | "overdue";
  time: string;
}

interface TodayTasksProps {
  onAddTask?: () => void;
  onTaskPress?: (taskId: number) => void;
}

export function TodayTasks({ onAddTask, onTaskPress }: TodayTasksProps) {
  const todayTasks: Task[] = [
    {
      id: 1,
      task: "설거지",
      assignee: "김철수",
      status: "pending",
      time: "오후 2시",
    },
    {
      id: 2,
      task: "거실 청소",
      assignee: "이영희",
      status: "completed",
      time: "오전 10시",
    },
    {
      id: 3,
      task: "화장실 청소",
      assignee: "박민수",
      status: "overdue",
      time: "어제",
    },
  ];

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

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>오늘 할 일</Text>
        <TouchableOpacity onPress={onAddTask}>
          <Ionicons name="add" size={24} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.tasksList}>
        {todayTasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskItem}
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
    gap: 12,
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    padding: 16,
    borderRadius: 12,
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
});
