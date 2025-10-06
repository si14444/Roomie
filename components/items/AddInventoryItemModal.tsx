import React, { useState } from "react";
import {
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { InventoryItem, ItemCategory, InventoryStatus } from "@/types/item.types";

interface NewInventoryItemInput {
  name: string;
  category: ItemCategory;
  status: InventoryStatus;
  icon: string;
  notes: string;
}

interface AddInventoryItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAddItem: (item: InventoryItem) => void;
}

const CATEGORY_OPTIONS: { value: ItemCategory; label: string; color: string }[] = [
  { value: "food", label: "음식", color: Colors.light.secondary },
  { value: "household", label: "생필품", color: Colors.light.primary },
  { value: "cleaning", label: "청소용품", color: Colors.light.successColor },
  { value: "toiletries", label: "세면용품", color: "#9333EA" },
  { value: "other", label: "기타", color: Colors.light.mutedText },
];

const ICON_OPTIONS = [
  { name: "nutrition-outline", label: "음식" },
  { name: "water-outline", label: "세제" },
  { name: "flower-outline", label: "화장지" },
  { name: "sparkles-outline", label: "샴푸" },
  { name: "medical-outline", label: "의료용품" },
  { name: "shirt-outline", label: "의류" },
  { name: "library-outline", label: "책/문구" },
  { name: "hardware-chip-outline", label: "전자제품" },
  { name: "home-outline", label: "가정용품" },
  { name: "leaf-outline", label: "식물" },
  { name: "car-outline", label: "자동차" },
  { name: "fitness-outline", label: "운동" },
];

const STATUS_OPTIONS: { value: InventoryStatus; label: string; color: string }[] = [
  { value: "충분", label: "충분", color: Colors.light.successColor },
  { value: "보통", label: "보통", color: Colors.light.warningColor },
  { value: "부족", label: "부족", color: Colors.light.errorColor },
];

export function AddInventoryItemModal({
  visible,
  onClose,
  onAddItem,
}: AddInventoryItemModalProps) {
  const [formData, setFormData] = useState<NewInventoryItemInput>({
    name: "",
    category: "household",
    status: "보통",
    icon: "home-outline",
    notes: "",
  });

  const [showIconPicker, setShowIconPicker] = useState(false);

  const resetForm = () => {
    setFormData({
      name: "",
      category: "household",
      status: "보통",
      icon: "home-outline",
      notes: "",
    });
    setShowIconPicker(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return "물품명을 입력해주세요.";
    return null;
  };

  const handleSubmit = () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert("입력 오류", validationError);
      return;
    }

    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      category: formData.category,
      status: formData.status,
      lastUpdated: new Date(),
      lastUpdatedBy: "현재사용자", // 실제로는 인증된 사용자명
      icon: formData.icon,
      notes: formData.notes.trim(),
    };

    onAddItem(newItem);
    handleClose();
  };

  const getCategoryColor = (category: ItemCategory) => {
    const option = CATEGORY_OPTIONS.find(opt => opt.value === category);
    return option?.color || Colors.light.mutedText;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.title}>새 물품 추가</Text>
          <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>저장</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 물품명 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>기본 정보</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>물품명 *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="예: 화장지, 세제 등"
                placeholderTextColor={Colors.light.mutedText}
              />
            </View>
          </View>

          {/* 카테고리 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>카테고리</Text>
            <View style={styles.categoryGrid}>
              {CATEGORY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.categoryButton,
                    formData.category === option.value && {
                      backgroundColor: option.color + "20",
                      borderColor: option.color,
                    },
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, category: option.value }))}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      formData.category === option.value && { color: option.color },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 아이콘 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>아이콘</Text>
            <TouchableOpacity
              style={styles.iconSelector}
              onPress={() => setShowIconPicker(!showIconPicker)}
            >
              <View style={[styles.iconPreview, { backgroundColor: getCategoryColor(formData.category) + "20" }]}>
                <Ionicons
                  name={formData.icon as any}
                  size={24}
                  color={getCategoryColor(formData.category)}
                />
              </View>
              <Text style={styles.iconSelectorText}>아이콘 선택</Text>
              <Ionicons
                name={showIconPicker ? "chevron-up" : "chevron-down"}
                size={20}
                color={Colors.light.mutedText}
              />
            </TouchableOpacity>
            
            {showIconPicker && (
              <View style={styles.iconGrid}>
                {ICON_OPTIONS.map((icon) => (
                  <TouchableOpacity
                    key={icon.name}
                    style={[
                      styles.iconOption,
                      formData.icon === icon.name && styles.iconOptionSelected,
                    ]}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, icon: icon.name }));
                      setShowIconPicker(false);
                    }}
                  >
                    <Ionicons
                      name={icon.name as any}
                      size={20}
                      color={formData.icon === icon.name ? getCategoryColor(formData.category) : Colors.light.mutedText}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* 상태 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>현재 상태</Text>
            <View style={styles.statusGrid}>
              {STATUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusButton,
                    formData.status === option.value && {
                      backgroundColor: option.color + "20",
                      borderColor: option.color,
                    },
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, status: option.value }))}
                >
                  <View style={[styles.statusIndicator, { backgroundColor: option.color }]} />
                  <Text
                    style={[
                      styles.statusButtonText,
                      formData.status === option.value && { color: option.color, fontWeight: "600" },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 메모 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>메모</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                placeholder="추가 정보나 특이사항을 적어주세요"
                placeholderTextColor={Colors.light.mutedText}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderColor,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderColor,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
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
    borderColor: Colors.light.surface,
  },
  textArea: {
    height: 80,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.surface,
    backgroundColor: Colors.light.surface,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.mutedText,
  },
  iconSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  iconPreview: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  iconSelectorText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  iconOptionSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + "20",
  },
  unitSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.light.surface,
  },
  unitText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  unitButton: {
    padding: 4,
  },
  statusGrid: {
    gap: 12,
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  statusButtonText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
});