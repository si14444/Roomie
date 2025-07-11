import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface QuickAction {
  id: number;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface HomeQuickActionsProps {
  onActionPress?: (actionId: number) => void;
}

export function HomeQuickActions({ onActionPress }: HomeQuickActionsProps) {
  const quickActions: QuickAction[] = [
    {
      id: 1,
      title: "설거지 완료",
      icon: "checkmark-circle",
      color: Colors.light.successColor,
    },
    {
      id: 2,
      title: "청소 완료",
      icon: "brush",
      color: Colors.light.primary,
    },
    {
      id: 3,
      title: "공과금 추가",
      icon: "add-circle",
      color: Colors.light.warningColor,
    },
    {
      id: 4,
      title: "물품 요청",
      icon: "bag-add",
      color: Colors.light.secondary,
    },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>빠른 작업</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickActionItem}
            activeOpacity={0.7}
            onPress={() => onActionPress?.(action.id)}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name={action.icon} size={24} color={action.color} />
            </View>
            <Text style={styles.quickActionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.cardBackground,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionItem: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "48%",
    gap: 8,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    backgroundColor: Colors.light.accent,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.text,
    textAlign: "center",
  },
});
