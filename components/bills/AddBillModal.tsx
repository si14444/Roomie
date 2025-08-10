import React from "react";
import { StyleSheet, TouchableOpacity, Modal, TextInput } from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface NewBill {
  name: string;
  amount: string;
  splitType: "equal" | "custom";
  dueDate: string;
  category: "utility" | "subscription" | "maintenance";
  icon: keyof typeof Ionicons.glyphMap;
}

interface AddBillModalProps {
  visible: boolean;
  newBill: NewBill;
  setNewBill: React.Dispatch<React.SetStateAction<NewBill>>;
  onClose: () => void;
  onAddBill: () => void;
}

export function AddBillModal({
  visible,
  newBill,
  setNewBill,
  onClose,
  onAddBill,
}: AddBillModalProps) {
  const isFormValid = newBill.name.trim() && newBill.amount.trim();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>새 공과금 추가</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.light.mutedText} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>공과금 이름</Text>
              <TextInput
                style={styles.textInput}
                value={newBill.name}
                onChangeText={(text) =>
                  setNewBill((prev) => ({ ...prev, name: text }))
                }
                placeholder="예: 전기요금, 가스요금, 넷플릭스"
                placeholderTextColor={Colors.light.placeholderText}
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>금액</Text>
              <TextInput
                style={styles.textInput}
                value={newBill.amount}
                onChangeText={(text) =>
                  setNewBill((prev) => ({ ...prev, amount: text }))
                }
                placeholder="예: 120000"
                placeholderTextColor={Colors.light.placeholderText}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>마감일</Text>
              <TextInput
                style={styles.textInput}
                value={newBill.dueDate}
                onChangeText={(text) =>
                  setNewBill((prev) => ({ ...prev, dueDate: text }))
                }
                placeholder="예: 2024-12-31"
                placeholderTextColor={Colors.light.placeholderText}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>분할 방식</Text>
              <View style={styles.splitOptions}>
                {[
                  { key: "equal", label: "균등분할", icon: "people" },
                  { key: "custom", label: "커스텀", icon: "settings" },
                ].map((split) => (
                  <TouchableOpacity
                    key={split.key}
                    style={[
                      styles.splitButton,
                      newBill.splitType === split.key &&
                        styles.splitButtonSelected,
                    ]}
                    onPress={() =>
                      setNewBill((prev) => ({
                        ...prev,
                        splitType: split.key as any,
                      }))
                    }
                  >
                    <Ionicons
                      name={split.icon as any}
                      size={20}
                      color={
                        newBill.splitType === split.key
                          ? "white"
                          : Colors.light.subColor
                      }
                    />
                    <Text
                      style={[
                        styles.splitText,
                        newBill.splitType === split.key &&
                          styles.splitTextSelected,
                      ]}
                    >
                      {split.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>카테고리</Text>
              <View style={styles.categoryOptions}>
                {[
                  { key: "utility", label: "공공요금" },
                  { key: "subscription", label: "구독서비스" },
                  { key: "maintenance", label: "관리비" },
                ].map((category) => (
                  <TouchableOpacity
                    key={category.key}
                    style={[
                      styles.categoryButton,
                      newBill.category === category.key &&
                        styles.categoryButtonSelected,
                    ]}
                    onPress={() =>
                      setNewBill((prev) => ({
                        ...prev,
                        category: category.key as any,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        newBill.category === category.key &&
                          styles.categoryTextSelected,
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !isFormValid && styles.confirmButtonDisabled,
              ]}
              onPress={onAddBill}
              disabled={!isFormValid}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  !isFormValid && styles.confirmButtonTextDisabled,
                ]}
              >
                추가하기
              </Text>
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
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 24,
    flex: 1,
    maxHeight: "90%",
    paddingBottom: 20,
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderColor,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 0,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  splitOptions: {
    flexDirection: "row",
    gap: 8,
  },
  splitButton: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  splitButtonSelected: {
    backgroundColor: Colors.light.subColor,
    borderColor: Colors.light.subColor,
  },
  splitText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
  },
  splitTextSelected: {
    color: "white",
  },
  categoryOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  categoryButtonSelected: {
    backgroundColor: Colors.light.subColor,
    borderColor: Colors.light.subColor,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
  },
  categoryTextSelected: {
    color: "white",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderColor,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
  confirmButton: {
    flex: 1,
    backgroundColor: Colors.light.subColor,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.light.surfaceVariant,
    borderRadius: 12,
    opacity: 0.7,
  },
  confirmButtonTextDisabled: {
    color: Colors.light.mutedText,
  },
});
