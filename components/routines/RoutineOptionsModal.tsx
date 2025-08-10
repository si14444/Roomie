import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

interface RoutineOptionsModalProps {
  visible: boolean;
  routine: Routine | null;
  onClose: () => void;
  onChangeAssignee: (routine: Routine) => void;
  onChangeFrequency: (routine: Routine) => void;
  onDeleteRoutine: (routine: Routine) => void;
}

export function RoutineOptionsModal({
  visible,
  routine,
  onClose,
  onChangeAssignee,
  onChangeFrequency,
  onDeleteRoutine,
}: RoutineOptionsModalProps) {
  if (!routine) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{routine.task} 관리</Text>
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
              <Text style={styles.routineAssignee}>담당: {routine.assignee}</Text>
              <Text style={styles.routineFrequency}>
                {getFrequencyText(routine.frequency)} • {routine.nextDate}
              </Text>
            </View>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                onChangeAssignee(routine);
                onClose();
              }}
            >
              <View style={styles.optionIcon}>
                <Ionicons
                  name="person-circle"
                  size={24}
                  color={Colors.light.primary}
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>담당자 변경</Text>
                <Text style={styles.optionDescription}>
                  다른 룸메이트로 담당자 변경
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.light.mutedText}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                onChangeFrequency(routine);
                onClose();
              }}
            >
              <View style={styles.optionIcon}>
                <Ionicons
                  name="time"
                  size={24}
                  color={Colors.light.warningColor}
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>반복 주기 변경</Text>
                <Text style={styles.optionDescription}>
                  매일, 매주, 매월 주기 변경
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.light.mutedText}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, styles.dangerButton]}
              onPress={() => {
                onDeleteRoutine(routine);
                onClose();
              }}
            >
              <View style={styles.optionIcon}>
                <Ionicons
                  name="trash"
                  size={24}
                  color={Colors.light.errorColor}
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, styles.dangerText]}>
                  루틴 삭제
                </Text>
                <Text style={styles.optionDescription}>
                  이 루틴을 영구 삭제
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.light.mutedText}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Helper function for frequency text
function getFrequencyText(frequency: string) {
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
    maxHeight: "60%",
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
  routineAssignee: {
    fontSize: 14,
    color: Colors.light.primary,
    marginBottom: 2,
  },
  routineFrequency: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  optionsContainer: {
    paddingTop: 8,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderColor,
  },
  optionIcon: {
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.light.mutedText,
  },
  dangerButton: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: Colors.light.errorColor,
  },
});