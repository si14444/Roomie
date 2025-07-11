import { StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useMemo } from "react";
import Colors from "@/constants/Colors";

interface Routine {
  id: number;
  task: string;
  assignee: string;
  nextDate: string;
  status: "pending" | "completed" | "overdue";
  icon: keyof typeof Ionicons.glyphMap;
  frequency: "daily" | "weekly" | "monthly";
  completedAt?: string;
}

export default function RoutinesScreen() {
  const [routines, setRoutines] = useState<Routine[]>([
    {
      id: 1,
      task: "설거지",
      assignee: "김철수",
      nextDate: "2024-12-28",
      status: "pending",
      icon: "restaurant-outline" as keyof typeof Ionicons.glyphMap,
      frequency: "daily",
    },
    {
      id: 2,
      task: "청소기",
      assignee: "이영희",
      nextDate: "2024-12-29",
      status: "completed",
      icon: "home-outline" as keyof typeof Ionicons.glyphMap,
      frequency: "weekly",
      completedAt: "2024-12-28",
    },
    {
      id: 3,
      task: "화장실 청소",
      assignee: "박민수",
      nextDate: "2024-12-30",
      status: "pending",
      icon: "water-outline" as keyof typeof Ionicons.glyphMap,
      frequency: "weekly",
    },
    {
      id: 4,
      task: "쓰레기 버리기",
      assignee: "김철수",
      nextDate: "2024-12-31",
      status: "overdue",
      icon: "trash-outline" as keyof typeof Ionicons.glyphMap,
      frequency: "daily",
    },
  ]);

  // 동적 통계 계산
  const statistics = useMemo(() => {
    const completed = routines.filter((r) => r.status === "completed").length;
    const pending = routines.filter((r) => r.status === "pending").length;
    const overdue = routines.filter((r) => r.status === "overdue").length;
    const total = routines.length;

    return {
      completed,
      pending,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      participationRate: 95, // 예시값, 실제로는 복잡한 로직으로 계산
    };
  }, [routines]);

  // 루틴 완료 처리
  const completeRoutine = (routineId: number) => {
    Alert.alert("루틴 완료", "이 루틴을 완료로 표시하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "완료",
        onPress: () => {
          setRoutines((prev) =>
            prev.map((routine) =>
              routine.id === routineId
                ? {
                    ...routine,
                    status: "completed" as const,
                    completedAt: new Date().toISOString().split("T")[0],
                  }
                : routine
            )
          );
        },
      },
    ]);
  };

  // 루틴 미루기 처리
  const postponeRoutine = (routineId: number) => {
    Alert.alert("루틴 미루기", "이 루틴을 내일로 미루시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "미루기",
        onPress: () => {
          setRoutines((prev) =>
            prev.map((routine) => {
              if (routine.id === routineId) {
                const nextDate = new Date();
                nextDate.setDate(nextDate.getDate() + 1);
                return {
                  ...routine,
                  nextDate: nextDate.toISOString().split("T")[0],
                  status: "pending" as const,
                };
              }
              return routine;
            })
          );
        },
      },
    ]);
  };

  // 새 루틴 추가 (모달/페이지는 나중에 구현)
  const addNewRoutine = () => {
    Alert.alert("새 루틴 추가", "새 루틴 추가 기능을 구현 예정입니다.", [
      { text: "확인" },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return Colors.light.successColor;
      case "overdue":
        return Colors.light.errorColor;
      default:
        return Colors.light.warningColor;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "완료";
      case "overdue":
        return "지연";
      default:
        return "대기";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.addButton} onPress={addNewRoutine}>
          <View style={styles.addButtonContent}>
            <Ionicons name="add-circle-outline" size={24} color="white" />
            <Text style={styles.addButtonText}>새 루틴 추가</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.quickStats}>
          <View style={styles.statCard}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={Colors.light.successColor}
            />
            <Text style={styles.statNumber}>{statistics.completed}</Text>
            <Text style={styles.statLabel}>완료</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons
              name="time-outline"
              size={24}
              color={Colors.light.warningColor}
            />
            <Text style={styles.statNumber}>{statistics.pending}</Text>
            <Text style={styles.statLabel}>대기</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons
              name="alert-circle"
              size={24}
              color={Colors.light.errorColor}
            />
            <Text style={styles.statNumber}>{statistics.overdue}</Text>
            <Text style={styles.statLabel}>지연</Text>
          </View>
        </View>

        <View style={styles.routinesList}>
          <Text style={styles.sectionTitle}>오늘의 루틴</Text>
          {routines.map((routine) => (
            <View key={routine.id} style={styles.routineCard}>
              <View style={styles.routineCardHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={routine.icon}
                    size={24}
                    color={Colors.light.primary}
                  />
                </View>
                <View style={styles.routineInfo}>
                  <Text style={styles.taskName}>{routine.task}</Text>
                  <Text style={styles.assigneeText}>
                    담당: {routine.assignee}
                  </Text>
                  <Text style={styles.dateText}>
                    예정일: {routine.nextDate}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(routine.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(routine.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.routineActions}>
                {routine.status !== "completed" && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => completeRoutine(routine.id)}
                  >
                    <Ionicons name="checkmark" size={18} color="white" />
                    <Text style={styles.actionButtonText}>완료</Text>
                  </TouchableOpacity>
                )}
                {routine.status === "completed" && (
                  <View style={[styles.actionButton, styles.completedButton]}>
                    <Ionicons name="checkmark-circle" size={18} color="white" />
                    <Text style={styles.actionButtonText}>완료됨</Text>
                  </View>
                )}
                {routine.status !== "completed" && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.skipButton]}
                    onPress={() => postponeRoutine(routine.id)}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color={Colors.light.mutedText}
                    />
                    <Text style={styles.skipButtonText}>미루기</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.weeklyStats}>
          <Text style={styles.sectionTitle}>이번 주 통계</Text>
          <View style={styles.statsCard}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Ionicons
                  name="trophy"
                  size={32}
                  color={Colors.light.warningColor}
                />
                <Text style={styles.mvpNumber}>김철수</Text>
                <Text style={styles.mvpLabel}>이번 주 MVP</Text>
              </View>
              <View style={styles.statsDivider} />
              <View style={styles.statProgressContainer}>
                <View style={styles.progressItem}>
                  <Text style={styles.progressLabel}>완료율</Text>
                  <Text style={styles.progressValue}>
                    {statistics.completionRate}%
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${statistics.completionRate}%` },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressLabel}>참여도</Text>
                  <Text style={styles.progressValue}>
                    {statistics.participationRate}%
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${statistics.participationRate}%` },
                      ]}
                    />
                  </View>
                </View>
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
    backgroundColor: Colors.light.background,
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
  },
  addButton: {
    margin: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
    backgroundColor: Colors.light.primary,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  quickStats: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.mutedText,
    marginTop: 4,
  },
  routinesList: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  routineCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
  },
  routineCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: Colors.light.accent,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  taskName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  routineInfo: {
    flex: 1,
  },
  assigneeText: {
    fontSize: 14,
    color: Colors.light.mutedText,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    color: Colors.light.mutedText,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  routineActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  skipButton: {
    backgroundColor: Colors.light.surfaceVariant,
  },
  skipButtonText: {
    color: Colors.light.mutedText,
    fontSize: 14,
    fontWeight: "600",
  },
  completedButton: {
    backgroundColor: Colors.light.successColor,
  },
  weeklyStats: {
    margin: 20,
  },
  statsCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
  },
  statsGrid: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statsDivider: {
    width: 1,
    height: 60,
    backgroundColor: Colors.light.borderColor,
    marginHorizontal: 20,
  },
  statProgressContainer: {
    flex: 2,
    gap: 16,
  },
  progressItem: {
    gap: 4,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.light.mutedText,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.light.borderColor,
    borderRadius: 3,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.primary,
    borderRadius: 3,
  },
  mvpNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.light.text,
    marginTop: 8,
  },
  mvpLabel: {
    fontSize: 12,
    color: Colors.light.mutedText,
    marginTop: 4,
    textAlign: "center",
  },
  greeting: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  notificationButton: {
    position: "relative",
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
});
