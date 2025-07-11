import React from "react";
import { StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface Roommate {
  name: string;
  totalDebt: number;
  paidAmount: number;
}

interface RoommateStatsProps {
  roommateStats: Roommate[];
}

export function RoommateStats({ roommateStats }: RoommateStatsProps) {
  return (
    <View style={styles.statistics}>
      <Text style={styles.sectionTitle}>정산 현황</Text>
      <View style={styles.roommateStats}>
        {roommateStats.map((roommate, index) => {
          const remainingDebt = roommate.totalDebt - roommate.paidAmount;
          const isCompleted = remainingDebt === 0;

          return (
            <View key={index} style={styles.roommateCard}>
              <View style={styles.roommateInfo}>
                <View style={styles.avatarContainer}>
                  <Ionicons
                    name="person"
                    size={20}
                    color={Colors.light.primary}
                  />
                </View>
                <View style={styles.roommateDetails}>
                  <Text style={styles.roommateName}>{roommate.name}</Text>
                  <Text style={styles.roommateDebt}>
                    {isCompleted
                      ? "완납"
                      : `미납액: ₩${remainingDebt.toLocaleString()}`}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.completionStatus,
                  {
                    backgroundColor: isCompleted
                      ? Colors.light.successColor
                      : Colors.light.errorColor,
                  },
                ]}
              >
                <Ionicons
                  name={isCompleted ? "checkmark" : "close"}
                  size={16}
                  color="white"
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statistics: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  roommateStats: {
    gap: 12,
  },
  roommateCard: {
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roommateInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    backgroundColor: Colors.light.accent,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  roommateDetails: {
    flex: 1,
  },
  roommateName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 2,
  },
  roommateDebt: {
    fontSize: 14,
    color: Colors.light.mutedText,
  },
  completionStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
