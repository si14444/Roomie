import { ConfirmModal } from "@/components/ConfirmModal";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface Routine {
  id: string;
  task: string;
  assignee: string;
  nextDate: string;
  status: "pending" | "completed" | "overdue";
  icon: string;
  frequency: "daily" | "weekly" | "monthly";
  completedAt?: string;
}

interface RoutineCardProps {
  routine: Routine;
  onComplete?: (routineId: string) => void;
  onPostpone?: (routineId: string) => void;
  onOptions?: (routine: Routine) => void;
  onChangeAssignee?: (routine: Routine) => void;
}

export function RoutineCard({
  routine,
  onComplete,
  onPostpone,
  onOptions,
  onChangeAssignee,
}: RoutineCardProps) {
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
        return "대기";
      case "overdue":
        return "지연";
      default:
        return "";
    }
  };

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "매일";
      case "weekly":
        return "매주";
      case "monthly":
        return "매월";
      default:
        return "";
    }
  };

  const formatCompletionTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) {
      return "방금 전";
    } else if (diffMins < 60) {
      return `${diffMins}분 전`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `오늘 ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    }
  };

  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const handleComplete = () => {
    setShowCompleteModal(true);
  };

  return (
    <View style={styles.routineCard}>
      <View style={styles.routineHeader}>
        <View style={styles.routineIconContainer}>
          <Ionicons
            name={routine.icon as keyof typeof Ionicons.glyphMap}
            size={24}
            color={Colors.light.primary}
          />
        </View>
        <View style={styles.routineInfo}>
          <Text style={styles.routineTask}>{routine.task}</Text>
          <TouchableOpacity onPress={() => onChangeAssignee?.(routine)}>
            <Text style={styles.routineAssignee}>담당: {routine.assignee}</Text>
          </TouchableOpacity>
          <Text style={styles.routineFrequency}>
            {getFrequencyText(routine.frequency)} • {routine.nextDate}
          </Text>
          {routine.completedAt && (
            <Text style={styles.completedAt}>
              ✓ {formatCompletionTime(routine.completedAt)}
            </Text>
          )}
        </View>
        <View style={styles.routineStatus}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(routine.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(routine.status)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.optionsButton}
            onPress={() => onOptions?.(routine)}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={Colors.light.mutedText}
            />
          </TouchableOpacity>
        </View>
      </View>

      {routine.status !== "completed" && (
        <View style={styles.routineActions}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleComplete}
          >
            <Ionicons name="checkmark" size={16} color="white" />
            <Text style={styles.completeButtonText}>완료</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.postponeButton}
            onPress={() => onPostpone?.(routine.id)}
          >
            <Ionicons name="time-outline" size={16} color={Colors.light.mutedText} />
            <Text style={styles.postponeButtonText}>미루기</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* 완료 모달 */}
      <ConfirmModal
        visible={showCompleteModal}
        title="루틴 완료"
        message="이 루틴을 완료로 표시하시겠습니까?"
        confirmText="완료"
        cancelText="취소"
        onConfirm={() => {
          setShowCompleteModal(false);
          onComplete?.(routine.id);
        }}
        onCancel={() => setShowCompleteModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  routineCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  routineHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  routineIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  routineInfo: {
    flex: 1,
  },
  routineTask: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  routineAssignee: {
    fontSize: 14,
    color: Colors.light.primary,
    marginBottom: 2,
  },
  routineFrequency: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  completedAt: {
    fontSize: 12,
    color: Colors.light.successColor,
    marginTop: 2,
  },
  routineStatus: {
    alignItems: "flex-end",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  optionsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  routineActions: {
    flexDirection: "row",
    gap: 8,
  },
  completeButton: {
    flex: 1,
    backgroundColor: Colors.light.successColor,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  completeButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  postponeButton: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
  },
  postponeButtonText: {
    color: Colors.light.mutedText,
    fontSize: 14,
    fontWeight: "600",
  },
});
