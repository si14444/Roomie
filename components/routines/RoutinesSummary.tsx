import React from "react";
import { StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface RoutinesSummaryProps {
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
}

export function RoutinesSummary({
  completed,
  pending,
  overdue,
  completionRate,
}: RoutinesSummaryProps) {
  return (
    <View style={styles.summarySection}>
      <Text style={styles.sectionTitle}>루틴 현황</Text>
      <View style={styles.summaryCards}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconContainer}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={Colors.light.successColor}
            />
          </View>
          <Text style={styles.summaryNumber}>{completed}</Text>
          <Text style={styles.summaryLabel}>완료</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIconContainer}>
            <Ionicons
              name="time-outline"
              size={24}
              color={Colors.light.warningColor}
            />
          </View>
          <Text style={styles.summaryNumber}>{pending}</Text>
          <Text style={styles.summaryLabel}>대기</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIconContainer}>
            <Ionicons
              name="alert-circle"
              size={24}
              color={Colors.light.errorColor}
            />
          </View>
          <Text style={styles.summaryNumber}>{overdue}</Text>
          <Text style={styles.summaryLabel}>지연</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressItem}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>완료율</Text>
            <Text style={styles.progressValue}>{completionRate}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${completionRate}%`,
                  backgroundColor: Colors.light.successColor,
                },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summarySection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  summaryCards: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 8,
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.light.mutedText,
    textAlign: "center",
  },
  progressSection: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 16,
  },
  progressItem: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.light.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.borderColor,
    borderRadius: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
});
