import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface NewRoutine {
  task: string;
  assignee: string;
  frequency: "daily" | "weekly" | "monthly";
}

interface AddRoutineModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (routine: NewRoutine) => void;
  roommates: string[];
}

export function AddRoutineModal({
  visible,
  onClose,
  onAdd,
  roommates,
}: AddRoutineModalProps) {
  const [newRoutine, setNewRoutine] = useState<NewRoutine>({
    task: "",
    assignee: "",
    frequency: "daily",
  });

  const handleAdd = () => {
    if (!newRoutine.task.trim() || !newRoutine.assignee) {
      Alert.alert("오류", "작업명과 담당자를 입력해주세요.");
      return;
    }

    onAdd(newRoutine);
    setNewRoutine({ task: "", assignee: "", frequency: "daily" });
    onClose();
  };

  const handleCancel = () => {
    setNewRoutine({ task: "", assignee: "", frequency: "daily" });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>새 루틴 추가</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
              <Ionicons name="close" size={24} color={Colors.light.mutedText} />
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>작업명</Text>
            <TextInput
              style={styles.textInput}
              value={newRoutine.task}
              onChangeText={(text) =>
                setNewRoutine({ ...newRoutine, task: text })
              }
              placeholder="예: 설거지, 청소, 쓰레기 버리기..."
              placeholderTextColor={Colors.light.placeholderText}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>담당자</Text>
            <View style={styles.roommateButtons}>
              {roommates.map((roommate) => (
                <TouchableOpacity
                  key={roommate}
                  style={[
                    styles.roommateButton,
                    newRoutine.assignee === roommate &&
                      styles.roommateButtonSelected,
                  ]}
                  onPress={() =>
                    setNewRoutine({ ...newRoutine, assignee: roommate })
                  }
                >
                  <Text
                    style={[
                      styles.roommateButtonText,
                      newRoutine.assignee === roommate &&
                        styles.roommateButtonTextSelected,
                    ]}
                  >
                    {roommate}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>빈도</Text>
            <View style={styles.frequencyButtons}>
              {[
                { key: "daily", label: "매일" },
                { key: "weekly", label: "매주" },
                { key: "monthly", label: "매월" },
              ].map((freq) => (
                <TouchableOpacity
                  key={freq.key}
                  style={[
                    styles.frequencyButton,
                    newRoutine.frequency === freq.key &&
                      styles.frequencyButtonSelected,
                  ]}
                  onPress={() =>
                    setNewRoutine({
                      ...newRoutine,
                      frequency: freq.key as "daily" | "weekly" | "monthly",
                    })
                  }
                >
                  <Text
                    style={[
                      styles.frequencyButtonText,
                      newRoutine.frequency === freq.key &&
                        styles.frequencyButtonTextSelected,
                    ]}
                  >
                    {freq.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Ionicons name="add" size={16} color="white" />
              <Text style={styles.addButtonText}>추가</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
  },
  roommateButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  roommateButton: {
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
  },
  roommateButtonSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  roommateButtonText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "500",
  },
  roommateButtonTextSelected: {
    color: "white",
  },
  frequencyButtons: {
    flexDirection: "row",
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
  },
  frequencyButtonSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  frequencyButtonText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "500",
  },
  frequencyButtonTextSelected: {
    color: "white",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.mutedText,
  },
  addButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
