import React from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function HomeScreen() {
  // 직접 Colors.light 사용으로 타입 오류 해결
  const backgroundColor = Colors.light.background;
  const textColor = Colors.light.text;
  const cardBackground = Colors.light.cardBackground;
  const primaryColor = Colors.light.primary;
  const surfaceBackground = Colors.light.surface;
  const mutedText = Colors.light.mutedText;
  const successColor = Colors.light.successColor;
  const warningColor = Colors.light.warningColor;
  const shadowColor = Colors.light.shadow;

  const quickActions = [
    {
      id: 1,
      title: "설거지 완료",
      icon: "checkmark-circle" as keyof typeof Ionicons.glyphMap,
      color: Colors.light.successColor,
    },
    {
      id: 2,
      title: "청소 완료",
      icon: "brush" as keyof typeof Ionicons.glyphMap,
      color: Colors.light.primary,
    },
    {
      id: 3,
      title: "공과금 추가",
      icon: "add-circle" as keyof typeof Ionicons.glyphMap,
      color: Colors.light.warningColor,
    },
    {
      id: 4,
      title: "물품 요청",
      icon: "bag-add" as keyof typeof Ionicons.glyphMap,
      color: Colors.light.secondary,
    },
  ];

  const todayTasks = [
    {
      id: 1,
      task: "설거지",
      assignee: "김철수",
      status: "pending",
      time: "오후 2시",
    },
    {
      id: 2,
      task: "거실 청소",
      assignee: "이영희",
      status: "completed",
      time: "오전 10시",
    },
    {
      id: 3,
      task: "화장실 청소",
      assignee: "박민수",
      status: "overdue",
      time: "어제",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return Colors.light.successColor;
      case "pending":
        return Colors.light.warningColor;
      case "overdue":
        return Colors.light.errorColor;
      default:
        return Colors.light.mutedText;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "완료";
      case "pending":
        return "대기중";
      case "overdue":
        return "지연";
      default:
        return "";
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={[]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 상태 요약 카드 */}
        <View style={[styles.summaryCard, { backgroundColor: cardBackground }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>
            오늘의 현황
          </Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <View
                style={[
                  styles.summaryIcon,
                  { backgroundColor: Colors.light.accent },
                ]}
              >
                <Ionicons
                  name="people"
                  size={20}
                  color={Colors.light.primary}
                />
              </View>
              <Text style={[styles.summaryNumber, { color: textColor }]}>
                4명
              </Text>
              <Text style={[styles.summaryLabel, { color: mutedText }]}>
                룸메이트
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <View
                style={[
                  styles.summaryIcon,
                  { backgroundColor: Colors.light.accent },
                ]}
              >
                <Ionicons
                  name="card"
                  size={20}
                  color={Colors.light.successColor}
                />
              </View>
              <Text style={[styles.summaryNumber, { color: textColor }]}>
                ₩245,000
              </Text>
              <Text style={[styles.summaryLabel, { color: mutedText }]}>
                이번 달 공과금
              </Text>
            </View>
          </View>
        </View>

        {/* 빠른 작업 */}
        <View style={[styles.card, { backgroundColor: cardBackground }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>
            빠른 작업
          </Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.quickActionItem,
                  { backgroundColor: surfaceBackground },
                ]}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: Colors.light.accent },
                  ]}
                >
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={[styles.quickActionText, { color: textColor }]}>
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 오늘 할 일 */}
        <View style={[styles.card, { backgroundColor: cardBackground }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: textColor }]}>
              오늘 할 일
            </Text>
            <TouchableOpacity>
              <Ionicons name="add" size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.tasksList}>
            {todayTasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskTitle, { color: textColor }]}>
                    {task.task}
                  </Text>
                  <Text style={[styles.taskAssignee, { color: mutedText }]}>
                    {task.assignee} • {task.time}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(task.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(task.status)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 최근 활동 */}
        <View style={[styles.card, { backgroundColor: cardBackground }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>
            최근 활동
          </Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: Colors.light.accent },
                ]}
              >
                <Ionicons
                  name="checkmark"
                  size={16}
                  color={Colors.light.successColor}
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityText, { color: textColor }]}>
                  김철수가 설거지를 완료했습니다
                </Text>
                <Text style={[styles.activityTime, { color: mutedText }]}>
                  30분 전
                </Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: Colors.light.accent },
                ]}
              >
                <Ionicons name="card" size={16} color={Colors.light.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityText, { color: textColor }]}>
                  전기요금 청구서가 등록되었습니다
                </Text>
                <Text style={[styles.activityTime, { color: mutedText }]}>
                  2시간 전
                </Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: Colors.light.accent },
                ]}
              >
                <Ionicons
                  name="bag"
                  size={16}
                  color={Colors.light.warningColor}
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityText, { color: textColor }]}>
                  이영희가 휴지 구매를 요청했습니다
                </Text>
                <Text style={[styles.activityTime, { color: mutedText }]}>
                  3시간 전
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  welcomeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 16,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeSubtitle: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  content: {
    flex: 1,
    paddingTop: 10,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "600",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionItem: {
    width: "48%",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  tasksList: {
    gap: 12,
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  taskAssignee: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    lineHeight: 20,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
  },
});
