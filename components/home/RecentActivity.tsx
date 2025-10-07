import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { NotificationType } from "@/types/notification.types";

interface Activity {
  id: string;
  text: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

// 알림 타입별 아이콘 매핑 함수를 컴포넌트 외부로 이동
const getNotificationTypeIcon = (
  type: NotificationType
): { icon: keyof typeof Ionicons.glyphMap; color: string } => {
  switch (type) {
    case "routine_completed":
      return { icon: "checkmark", color: Colors.light.successColor };
    case "routine_overdue":
      return { icon: "alert-circle", color: Colors.light.errorColor };
    case "bill_added":
    case "bill_payment_due":
      return { icon: "card", color: Colors.light.primary };
    case "payment_received":
      return { icon: "wallet", color: Colors.light.successColor };
    case "item_request":
      return { icon: "bag", color: Colors.light.warningColor };
    case "item_purchased":
      return { icon: "bag-check", color: Colors.light.successColor };
    case "poll_created":
      return { icon: "bar-chart", color: Colors.light.secondary };
    case "poll_ended":
      return { icon: "checkmark-done", color: Colors.light.primary };
    case "chat_message":
      return { icon: "chatbubble", color: Colors.light.primary };
    case "system":
      return { icon: "settings", color: Colors.light.mutedText };
    default:
      return { icon: "information-circle", color: Colors.light.mutedText };
  }
};

export function RecentActivity() {
  const { notifications, getRelativeTime } = useNotificationContext();

  // 알림을 RecentActivity 형태로 변환
  const activities: Activity[] = useMemo(() => {
    // 최신 4개 알림만 가져오기
    const recentNotifications = notifications
      .slice(0, 4)
      .map((notification) => {
        const iconInfo = getNotificationTypeIcon(notification.type);

        return {
          id: notification.id,
          text: notification.message,
          time: getRelativeTime(notification.created_at || notification.createdAt || ''),
          icon: iconInfo.icon,
          iconColor: iconInfo.color,
        };
      });

    return recentNotifications;
  }, [notifications, getRelativeTime]);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>최근 활동</Text>
      <View style={styles.activityList}>
        {activities.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="time-outline"
              size={32}
              color={Colors.light.mutedText}
            />
            <Text style={styles.emptyStateText}>아직 활동이 없습니다</Text>
          </View>
        ) : (
          activities.map((activity, index) => (
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
                  { backgroundColor: `${activity.iconColor}20` },
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
          ))
        )}
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
    lineHeight: 18,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.light.mutedText,
    marginTop: 8,
    textAlign: "center",
  },
});
