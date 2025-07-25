import React from "react";
import { StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

export function StatusSummaryCard() {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.cardTitle}>오늘의 현황</Text>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <View style={styles.summaryIcon}>
            <Ionicons name="people" size={20} color={Colors.light.primary} />
          </View>
          <Text style={styles.summaryNumber}>4명</Text>
          <Text style={styles.summaryLabel}>룸메이트</Text>
        </View>
        <View style={styles.summaryItem}>
          <View style={styles.summaryIcon}>
            <Ionicons name="card" size={20} color={Colors.light.successColor} />
          </View>
          <Text style={styles.summaryNumber}>₩245,000</Text>
          <Text style={styles.summaryLabel}>이번 달 공과금</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: Colors.light.cardBackground,
    marginHorizontal: 20,
    marginTop: 30,
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
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    backgroundColor: Colors.light.accent,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.light.mutedText,
    textAlign: "center",
  },
});
