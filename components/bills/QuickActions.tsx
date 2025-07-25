import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface QuickActionsProps {
  onAddBill: () => void;
  onShowSettlement: () => void;
  onShowStatistics: () => void;
}

export function QuickActions({
  onAddBill,
  onShowSettlement,
  onShowStatistics,
}: QuickActionsProps) {
  return (
    <View style={styles.quickActions}>
      <TouchableOpacity style={styles.actionCard} onPress={onAddBill}>
        <Ionicons name="add-circle" size={24} color={Colors.light.primary} />
        <Text style={styles.actionText}>새 공과금</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionCard} onPress={onShowSettlement}>
        <Ionicons name="calculator" size={24} color={Colors.light.secondary} />
        <Text style={styles.actionText}>정산하기</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionCard} onPress={onShowStatistics}>
        <Ionicons
          name="stats-chart"
          size={24}
          color={Colors.light.warningColor}
        />
        <Text style={styles.actionText}>통계</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.text,
  },
});
