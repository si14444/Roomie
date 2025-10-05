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

interface AssigneeSelectModalProps {
  visible: boolean;
  routine: Routine | null;
  roommates: string[];
  onClose: () => void;
  onSelectAssignee: (routineId: string, assignee: string) => void;
}

export function AssigneeSelectModal({
  visible,
  routine,
  roommates,
  onClose,
  onSelectAssignee,
}: AssigneeSelectModalProps) {
  if (!routine) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>담당자 변경</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.light.mutedText} />
            </TouchableOpacity>
          </View>

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
              <Text style={styles.currentAssignee}>
                현재 담당: {routine.assignee}
              </Text>
            </View>
          </View>

          <View style={styles.assigneeContainer}>
            <Text style={styles.sectionTitle}>새 담당자를 선택하세요</Text>
            <View style={styles.assigneeList}>
              {roommates.map((roommate) => (
                <TouchableOpacity
                  key={roommate}
                  style={[
                    styles.assigneeButton,
                    routine.assignee === roommate && styles.currentAssigneeButton,
                  ]}
                  onPress={() => {
                    onSelectAssignee(routine.id, roommate);
                    onClose();
                  }}
                >
                  <View style={styles.assigneeIcon}>
                    <Ionicons
                      name="person"
                      size={20}
                      color={
                        routine.assignee === roommate
                          ? Colors.light.primary
                          : Colors.light.mutedText
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.assigneeName,
                      routine.assignee === roommate && styles.currentAssigneeName,
                    ]}
                  >
                    {roommate}
                  </Text>
                  {routine.assignee === roommate && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.light.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
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
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderColor,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  routineInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  routineDetails: {
    flex: 1,
  },
  routineTask: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  currentAssignee: {
    fontSize: 14,
    color: Colors.light.primary,
  },
  assigneeContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 16,
  },
  assigneeList: {
    gap: 8,
  },
  assigneeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    gap: 12,
  },
  currentAssigneeButton: {
    backgroundColor: Colors.light.accent,
    borderColor: Colors.light.primary,
  },
  assigneeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    justifyContent: "center",
    alignItems: "center",
  },
  assigneeName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
  },
  currentAssigneeName: {
    fontWeight: "600",
    color: Colors.light.primary,
  },
});