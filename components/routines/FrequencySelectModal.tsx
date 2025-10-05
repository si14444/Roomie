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

interface FrequencyOption {
  value: "daily" | "weekly" | "monthly";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

interface FrequencySelectModalProps {
  visible: boolean;
  routine: Routine | null;
  onClose: () => void;
  onSelectFrequency: (routineId: string, frequency: "daily" | "weekly" | "monthly") => void;
}

export function FrequencySelectModal({
  visible,
  routine,
  onClose,
  onSelectFrequency,
}: FrequencySelectModalProps) {
  if (!routine) return null;

  const frequencies: FrequencyOption[] = [
    {
      value: "daily",
      label: "매일",
      icon: "today",
      description: "매일 반복되는 루틴",
    },
    {
      value: "weekly",
      label: "매주",
      icon: "calendar",
      description: "일주일마다 반복되는 루틴",
    },
    {
      value: "monthly",
      label: "매월",
      icon: "calendar-outline",
      description: "한 달마다 반복되는 루틴",
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>반복 주기 변경</Text>
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
              <Text style={styles.currentFrequency}>
                현재 주기: {getFrequencyText(routine.frequency)}
              </Text>
            </View>
          </View>

          <View style={styles.frequencyContainer}>
            <Text style={styles.sectionTitle}>새 반복 주기를 선택하세요</Text>
            <View style={styles.frequencyList}>
              {frequencies.map((frequency) => (
                <TouchableOpacity
                  key={frequency.value}
                  style={[
                    styles.frequencyButton,
                    routine.frequency === frequency.value && styles.currentFrequencyButton,
                  ]}
                  onPress={() => {
                    onSelectFrequency(routine.id, frequency.value);
                    onClose();
                  }}
                >
                  <View style={styles.frequencyIcon}>
                    <Ionicons
                      name={frequency.icon}
                      size={24}
                      color={
                        routine.frequency === frequency.value
                          ? Colors.light.primary
                          : Colors.light.mutedText
                      }
                    />
                  </View>
                  <View style={styles.frequencyTextContainer}>
                    <Text
                      style={[
                        styles.frequencyLabel,
                        routine.frequency === frequency.value && styles.currentFrequencyLabel,
                      ]}
                    >
                      {frequency.label}
                    </Text>
                    <Text style={styles.frequencyDescription}>
                      {frequency.description}
                    </Text>
                  </View>
                  {routine.frequency === frequency.value && (
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
  currentFrequency: {
    fontSize: 14,
    color: Colors.light.primary,
  },
  frequencyContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 16,
  },
  frequencyList: {
    gap: 8,
  },
  frequencyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    gap: 16,
  },
  currentFrequencyButton: {
    backgroundColor: Colors.light.accent,
    borderColor: Colors.light.primary,
  },
  frequencyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    justifyContent: "center",
    alignItems: "center",
  },
  frequencyTextContainer: {
    flex: 1,
  },
  frequencyLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 2,
  },
  currentFrequencyLabel: {
    color: Colors.light.primary,
  },
  frequencyDescription: {
    fontSize: 14,
    color: Colors.light.mutedText,
  },
});