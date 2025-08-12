import React from "react";
import { StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { NewItemInput, ItemCategory, ItemPriority } from "@/types/item.types";

interface AddItemModalProps {
  visible: boolean;
  newItem: NewItemInput;
  setNewItem: React.Dispatch<React.SetStateAction<NewItemInput>>;
  onClose: () => void;
  onAddItem: () => void;
}

export function AddItemModal({
  visible,
  newItem,
  setNewItem,
  onClose,
  onAddItem,
}: AddItemModalProps) {
  const isFormValid = newItem.name.trim();

  const categories: Array<{ key: ItemCategory; label: string; icon: string }> = [
    { key: "food", label: "식품", icon: "restaurant" },
    { key: "household", label: "생활용품", icon: "home" },
    { key: "personal", label: "개인용품", icon: "person" },
    { key: "electronics", label: "전자제품", icon: "phone-portrait" },
    { key: "other", label: "기타", icon: "ellipsis-horizontal" },
  ];

  const priorities: Array<{ key: ItemPriority; label: string; color: string }> = [
    { key: "low", label: "낮음", color: Colors.light.successColor },
    { key: "medium", label: "보통", color: Colors.light.warningColor },
    { key: "high", label: "높음", color: Colors.light.errorColor },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalHeader, { backgroundColor: Colors.light.cardBackground }]}>
            <Text style={styles.modalTitle}>새 물품 추가</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.light.mutedText} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>물품명*</Text>
              <TextInput
                style={styles.textInput}
                value={newItem.name}
                onChangeText={(text) =>
                  setNewItem((prev) => ({ ...prev, name: text }))
                }
                placeholder="예: 세제, 쌀, 화장지"
                placeholderTextColor={Colors.light.placeholderText}
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>설명</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={newItem.description}
                onChangeText={(text) =>
                  setNewItem((prev) => ({ ...prev, description: text }))
                }
                placeholder="필요한 이유나 특정 브랜드 등을 입력하세요"
                placeholderTextColor={Colors.light.placeholderText}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>카테고리</Text>
              <View style={styles.categoryOptions}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.key}
                    style={[
                      styles.categoryButton,
                      newItem.category === category.key &&
                        styles.categoryButtonSelected,
                    ]}
                    onPress={() =>
                      setNewItem((prev) => ({
                        ...prev,
                        category: category.key as any,
                      }))
                    }
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={18}
                      color={
                        newItem.category === category.key
                          ? "white"
                          : Colors.light.subColor
                      }
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        newItem.category === category.key &&
                          styles.categoryTextSelected,
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>우선순위</Text>
              <View style={styles.priorityOptions}>
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority.key}
                    style={[
                      styles.priorityButton,
                      newItem.priority === priority.key && {
                        backgroundColor: priority.color,
                        borderColor: priority.color,
                      },
                    ]}
                    onPress={() =>
                      setNewItem((prev) => ({
                        ...prev,
                        priority: priority.key as any,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        newItem.priority === priority.key &&
                          styles.priorityTextSelected,
                      ]}
                    >
                      {priority.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.rowGroup}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>예상 가격</Text>
                <TextInput
                  style={styles.textInput}
                  value={newItem.estimatedPrice}
                  onChangeText={(text) =>
                    setNewItem((prev) => ({ ...prev, estimatedPrice: text }))
                  }
                  placeholder="원"
                  placeholderTextColor={Colors.light.placeholderText}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>구매처</Text>
                <TextInput
                  style={styles.textInput}
                  value={newItem.store}
                  onChangeText={(text) =>
                    setNewItem((prev) => ({ ...prev, store: text }))
                  }
                  placeholder="예: 마트, 온라인몰"
                  placeholderTextColor={Colors.light.placeholderText}
                />
              </View>
            </View>
          </ScrollView>

          <View style={[styles.modalActions, { backgroundColor: Colors.light.cardBackground }]}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !isFormValid && styles.confirmButtonDisabled,
              ]}
              onPress={onAddItem}
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
      </KeyboardAvoidingView>
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
    maxHeight: "90%",
    marginVertical: 50,
    overflow: "hidden",
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  modalContent: {
    padding: 20,
    paddingBottom: 0,
  },
  inputGroup: {
    marginBottom: 24,
  },
  rowGroup: {
    flexDirection: "row",
    gap: 12,
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
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  priorityOptions: {
    flexDirection: "row",
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  priorityText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
  },
  priorityTextSelected: {
    color: "white",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderColor,
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