import React from "react";
import { StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface SummaryCardProps {
  totalAmount: number;
  perPersonAmount: number;
}

export function SummaryCard({
  totalAmount,
  perPersonAmount,
}: SummaryCardProps) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryContent}>
        <Ionicons name="card-outline" size={32} color="white" />
        <Text style={styles.summaryTitle}>이번 달 총 공과금</Text>
        <Text style={styles.summaryAmount}>
          ₩{totalAmount.toLocaleString()}
        </Text>
        <Text style={styles.summaryPerPerson}>
          1인당 ₩{perPersonAmount.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  summaryContent: {
    padding: 24,
    alignItems: "center",
    backgroundColor: Colors.light.primary,
  },
  summaryTitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginTop: 12,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  summaryPerPerson: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
  },
});
