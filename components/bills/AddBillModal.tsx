import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView } from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { CalendarModal } from "./CalendarModal";

export interface CustomSplit {
  [roommateId: string]: number;
}

export interface NewBill {
  name: string;
  amount: string;
  accountNumber: string;
  bank: string;
  splitType: "equal" | "custom";
  customSplit?: CustomSplit;
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const roommates = ["김철수", "이영희", "박민수", "정지수"];
  const banks = [
    "KB국민은행", "신한은행", "우리은행", "하나은행", 
    "IBK기업은행", "NH농협은행", "카카오뱅크", "토스뱅크"
  ];

  const isFormValid = newBill.name.trim() && newBill.amount.trim();

  const handleDateSelect = (date: string) => {
    setNewBill((prev) => ({ ...prev, dueDate: date }));
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  const handleSplitTypeChange = (type: "equal" | "custom") => {
    const updatedBill: Partial<NewBill> = { splitType: type };
    
    if (type === "equal") {
      updatedBill.customSplit = undefined;
    } else {
      // Initialize custom split with equal amounts
      const totalAmount = parseInt(newBill.amount) || 0;
      const amountPerPerson = Math.floor(totalAmount / roommates.length);
      const customSplit: CustomSplit = {};
      roommates.forEach(roommate => {
        customSplit[roommate] = amountPerPerson;
      });
      updatedBill.customSplit = customSplit;
    }
    
    setNewBill((prev) => ({ ...prev, ...updatedBill }));
  };

  const handleCustomSplitChange = (roommate: string, amount: string) => {
    const numericAmount = parseInt(amount) || 0;
    setNewBill((prev) => ({
      ...prev,
      customSplit: {
        ...prev.customSplit,
        [roommate]: numericAmount,
      },
    }));
  };

  const getTotalCustomSplit = () => {
    if (!newBill.customSplit) return 0;
    return Object.values(newBill.customSplit).reduce((sum, amount) => sum + amount, 0);
  };

  const getCustomSplitDifference = () => {
    const totalAmount = parseInt(newBill.amount) || 0;
    const customTotal = getTotalCustomSplit();
    return totalAmount - customTotal;
  };

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

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* 공과금 이름 */}
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

            {/* 금액 */}
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

            {/* 은행 선택 */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>은행</Text>
              <View style={styles.bankOptions}>
                {banks.map((bank) => (
                  <TouchableOpacity
                    key={bank}
                    style={[
                      styles.bankButton,
                      newBill.bank === bank && styles.bankButtonSelected,
                    ]}
                    onPress={() =>
                      setNewBill((prev) => ({ ...prev, bank }))
                    }
                  >
                    <Text
                      style={[
                        styles.bankText,
                        newBill.bank === bank && styles.bankTextSelected,
                      ]}
                    >
                      {bank}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 계좌번호 */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>계좌번호</Text>
              <TextInput
                style={styles.textInput}
                value={newBill.accountNumber}
                onChangeText={(text) =>
                  setNewBill((prev) => ({ ...prev, accountNumber: text }))
                }
                placeholder="예: 123-456-789012"
                placeholderTextColor={Colors.light.placeholderText}
                keyboardType="numeric"
              />
            </View>

            {/* 마감일 */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>마감일</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[
                  styles.datePickerText,
                  !newBill.dueDate && styles.datePickerPlaceholder
                ]}>
                  {newBill.dueDate ? formatDisplayDate(newBill.dueDate) : "날짜를 선택하세요"}
                </Text>
                <Ionicons name="calendar" size={20} color={Colors.light.primary} />
              </TouchableOpacity>
            </View>

            {/* 분할 방식 */}
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
                    onPress={() => handleSplitTypeChange(split.key as "equal" | "custom")}
                  >
                    <Ionicons
                      name={split.icon as any}
                      size={20}
                      color={
                        newBill.splitType === split.key
                          ? "white"
                          : Colors.light.primary
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

            {/* 커스텀 분할 설정 */}
            {newBill.splitType === "custom" && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  개별 금액 설정
                  <Text style={styles.splitHelperText}>
                    {" "}(총 {getTotalCustomSplit().toLocaleString()}원 / 
                    {getCustomSplitDifference() !== 0 && (
                      <Text style={[
                        styles.splitDifference,
                        getCustomSplitDifference() > 0 ? styles.splitPositive : styles.splitNegative
                      ]}>
                        {getCustomSplitDifference() > 0 ? "+" : ""}{getCustomSplitDifference().toLocaleString()}원
                      </Text>
                    )}
                    )
                  </Text>
                </Text>
                <View style={styles.customSplitContainer}>
                  {roommates.map((roommate) => (
                    <View key={roommate} style={styles.customSplitRow}>
                      <Text style={styles.roommateLabel}>{roommate}</Text>
                      <TextInput
                        style={styles.customSplitInput}
                        value={newBill.customSplit?.[roommate]?.toString() || "0"}
                        onChangeText={(text) => handleCustomSplitChange(roommate, text)}
                        placeholder="0"
                        keyboardType="numeric"
                        placeholderTextColor={Colors.light.placeholderText}
                      />
                      <Text style={styles.currencyLabel}>원</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 카테고리 */}
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
          </ScrollView>

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

      <CalendarModal
        visible={showDatePicker}
        selectedDate={newBill.dueDate}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={handleDateSelect}
      />
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
    paddingHorizontal: 20,
    paddingTop: 20,
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
  bankOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  bankButton: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    minWidth: 80,
  },
  bankButtonSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  bankText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.light.text,
  },
  bankTextSelected: {
    color: "white",
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
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  splitText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
  },
  splitTextSelected: {
    color: "white",
  },
  splitHelperText: {
    fontSize: 12,
    fontWeight: "400",
    color: Colors.light.mutedText,
  },
  splitDifference: {
    fontWeight: "600",
  },
  splitPositive: {
    color: "#FF6B6B",
  },
  splitNegative: {
    color: "#4DABF7",
  },
  customSplitContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  customSplitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  roommateLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
    width: 60,
  },
  customSplitInput: {
    flex: 1,
    backgroundColor: Colors.light.cardBackground,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.light.text,
    textAlign: "right",
  },
  currencyLabel: {
    fontSize: 14,
    color: Colors.light.mutedText,
    width: 20,
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
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
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
    paddingVertical: 20,
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
    backgroundColor: Colors.light.primary,
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
  datePickerButton: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  datePickerText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  datePickerPlaceholder: {
    color: Colors.light.placeholderText,
  },
});