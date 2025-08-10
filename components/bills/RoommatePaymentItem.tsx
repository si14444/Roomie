import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface RoommatePaymentItemProps {
  roommate: string;
  isPaid: boolean;
  amount: number;
  onToggle: () => void;
  canEdit: boolean;
}

export function RoommatePaymentItem({
  roommate,
  isPaid,
  amount,
  onToggle,
  canEdit,
}: RoommatePaymentItemProps) {
  return (
    <TouchableOpacity
      style={[
        styles.roommatePayment, 
        isPaid && styles.roommatePaymentPaid,
        !canEdit && styles.roommatePaymentDisabled
      ]}
      onPress={canEdit ? onToggle : undefined}
      disabled={!canEdit}
    >
      <Ionicons
        name={isPaid ? "checkmark-circle" : "ellipse-outline"}
        size={16}
        color={isPaid ? Colors.light.successColor : !canEdit ? Colors.light.mutedText : Colors.light.mutedText}
      />
      <Text
        style={[
          styles.roommatePaymentText,
          isPaid && styles.roommatePaymentTextPaid,
          !canEdit && styles.roommatePaymentTextDisabled,
        ]}
      >
        {roommate}
      </Text>
      <Text
        style={[
          styles.roommatePaymentAmount,
          isPaid && styles.roommatePaymentAmountPaid,
          !canEdit && styles.roommatePaymentAmountDisabled,
        ]}
      >
        ₩{amount.toLocaleString()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  roommatePayment: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
  },
  roommatePaymentPaid: {
    backgroundColor: Colors.light.accent,
    borderColor: Colors.light.successColor,
  },
  roommatePaymentText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
    marginLeft: 8,
  },
  roommatePaymentTextPaid: {
    color: Colors.light.successColor,
  },
  roommatePaymentAmount: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.mutedText,
  },
  roommatePaymentAmountPaid: {
    color: Colors.light.successColor,
  },
  roommatePaymentDisabled: {
    backgroundColor: Colors.light.surface,
    opacity: 0.6,
  },
  roommatePaymentTextDisabled: {
    color: Colors.light.mutedText,
    opacity: 0.7,
  },
  roommatePaymentAmountDisabled: {
    color: Colors.light.mutedText,
    opacity: 0.7,
  },
});
