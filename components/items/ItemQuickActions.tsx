import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface ItemQuickActionsProps {
  onAddItem?: () => void;
  onScanBarcode?: () => void;
  onOpenShoppingList?: () => void;
}

export function ItemQuickActions({
  onAddItem,
  onScanBarcode,
  onOpenShoppingList,
}: ItemQuickActionsProps) {
  return (
    <View style={styles.quickActions}>
      <TouchableOpacity style={styles.actionCard} onPress={onAddItem}>
        <Ionicons name="add-circle" size={24} color={Colors.light.primary} />
        <Text style={styles.actionText}>새 물품</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionCard} onPress={onScanBarcode}>
        <Ionicons
          name="scan-outline"
          size={24}
          color={Colors.light.secondary}
        />
        <Text style={styles.actionText}>바코드 스캔</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionCard} onPress={onOpenShoppingList}>
        <Ionicons
          name="list-outline"
          size={24}
          color={Colors.light.warningColor}
        />
        <Text style={styles.actionText}>쇼핑 리스트</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginVertical: 20,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    textAlign: "center",
  },
});
