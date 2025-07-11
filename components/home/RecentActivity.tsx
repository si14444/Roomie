import React from "react";
import { StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface Activity {
  id: number;
  text: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

export function RecentActivity() {
  const activities: Activity[] = [
    {
      id: 1,
      text: "김철수가 설거지를 완료했습니다",
      time: "30분 전",
      icon: "checkmark",
      iconColor: Colors.light.successColor,
    },
    {
      id: 2,
      text: "전기요금 청구서가 등록되었습니다",
      time: "2시간 전",
      icon: "card",
      iconColor: Colors.light.primary,
    },
    {
      id: 3,
      text: "이영희가 휴지 구매를 요청했습니다",
      time: "3시간 전",
      icon: "bag",
      iconColor: Colors.light.warningColor,
    },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>최근 활동</Text>
      <View style={styles.activityList}>
        {activities.map((activity, index) => (
          <View
            key={activity.id}
            style={[
              styles.activityItem,
              index === activities.length - 1 && styles.lastActivityItem,
            ]}
          >
            <View
              style={[
                styles.activityIcon,
                { backgroundColor: Colors.light.accent },
              ]}
            >
              <Ionicons
                name={activity.icon}
                size={16}
                color={activity.iconColor}
              />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>{activity.text}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          </View>
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
  activityList: {
    // gap을 marginBottom으로 대체
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  lastActivityItem: {
    marginBottom: 0,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
});
