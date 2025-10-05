import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

interface RoutineDeleteModalProps {
  visible: boolean;
  routine: Routine | null;
  onClose: () => void;
  onConfirmDelete: (routineId: string) => void;
}

export function RoutineDeleteModal({
  visible,
  routine,
  onClose,
  onConfirmDelete,
}: RoutineDeleteModalProps) {
  if (!routine) return null;

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

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="warning"
              size={48}
              color={Colors.light.errorColor}
            />
          </View>

          <Text style={styles.title}>루틴 삭제</Text>
          
          <View style={styles.routineInfo}>
            <View style={styles.routineIconContainer}>
              <Ionicons
                name={routine.icon as keyof typeof Ionicons.glyphMap}
                size={24}
                color={Colors.light.primary}
              />
            </View>
            <View style={styles.routineDetails}>
              <Text style={styles.routineTask}>{routine.task}</Text>
              <Text style={styles.routineSubInfo}>
                담당: {routine.assignee} • {getFrequencyText(routine.frequency)}
              </Text>
            </View>
          </View>

          <Text style={styles.message}>
            이 루틴을 삭제하시겠습니까?{"\n"}
            삭제된 루틴은 복구할 수 없습니다.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                onConfirmDelete(routine.id);
                onClose();
              }}
            >
              <Ionicons name="trash" size={16} color="white" />
              <Text style={styles.deleteButtonText}>삭제</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: 24,
    minWidth: 300,
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.light.errorColor}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  routineInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: "100%",
    gap: 12,
  },
  routineIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  routineDetails: {
    flex: 1,
  },
  routineTask: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  routineSubInfo: {
    fontSize: 14,
    color: Colors.light.mutedText,
  },
  message: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.light.surfaceVariant,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.mutedText,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: Colors.light.errorColor,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});