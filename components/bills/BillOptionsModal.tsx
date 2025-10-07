import Colors from "@/constants/Colors";
import type { Bill } from "@/hooks/useBillsFirebase";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BillOptionsModalProps {
  visible: boolean;
  bill: Bill | null;
  onClose: () => void;
  onMarkAsPaid: (billId: string) => void;
  onExtendDueDate: (billId: string) => void;
  onDelete: (billId: string) => void;
  canDelete?: boolean; // 삭제 권한 여부
}

export function BillOptionsModal({
  visible,
  bill,
  onClose,
  onMarkAsPaid,
  onExtendDueDate,
  onDelete,
  canDelete = true, // 기본값 true
}: BillOptionsModalProps) {
  if (!bill) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{bill.name} 관리</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.light.mutedText} />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                onMarkAsPaid(bill.id);
                onClose();
              }}
            >
              <View style={styles.optionIcon}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={Colors.light.successColor}
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>지불 완료 처리</Text>
                <Text style={styles.optionDescription}>
                  모든 인원을 완료로 표시
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
                onExtendDueDate(bill.id);
                onClose();
              }}
            >
              <View style={styles.optionIcon}>
                <Ionicons
                  name="calendar"
                  size={24}
                  color={Colors.light.primary}
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>마감일 연장</Text>
                <Text style={styles.optionDescription}>
                  마감일을 1주일 연장
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.light.mutedText}
              />
            </TouchableOpacity>

            {canDelete && (
              <TouchableOpacity
                style={[styles.optionButton, styles.dangerButton]}
                onPress={() => {
                  onDelete(bill.id);
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
                    공과금 삭제
                  </Text>
                  <Text style={styles.optionDescription}>
                    이 공과금을 영구 삭제 (작성자/방장만 가능)
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.light.mutedText}
                />
              </TouchableOpacity>
            )}
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
    maxHeight: "50%",
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