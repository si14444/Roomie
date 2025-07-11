import React from "react";
import { ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";
import { useNotificationContext } from "@/contexts/NotificationContext";

// Import home components
import { StatusSummaryCard } from "@/components/home/StatusSummaryCard";
import { HomeQuickActions } from "@/components/home/HomeQuickActions";
import { TodayTasks } from "@/components/home/TodayTasks";
import { RecentActivity } from "@/components/home/RecentActivity";

export default function HomeScreen() {
  const { createNotification } = useNotificationContext();

  const handleQuickAction = (actionId: number) => {
    const actions = [
      { id: 1, title: "설거지 완료", type: "routine_completed" },
      { id: 2, title: "청소 완료", type: "routine_completed" },
      { id: 3, title: "공과금 추가", type: "bill_added" },
      { id: 4, title: "물품 요청", type: "item_request" },
    ];

    const action = actions.find((a) => a.id === actionId);
    if (action) {
      if (actionId === 1 || actionId === 2) {
        // 루틴 완료
        createNotification({
          title: "루틴 완료",
          message: `${action.title}를 완료했습니다`,
          type: "routine_completed",
          relatedId: actionId.toString(),
        });
        Alert.alert("완료", `${action.title}가 처리되었습니다!`);
      } else if (actionId === 3) {
        // 공과금 추가로 이동
        Alert.alert("안내", "공과금 탭으로 이동하여 새 공과금을 추가해주세요.");
      } else if (actionId === 4) {
        // 물품 요청
        Alert.prompt(
          "물품 요청",
          "어떤 물품이 필요한지 입력해주세요:",
          [
            { text: "취소", style: "cancel" },
            {
              text: "요청",
              onPress: (itemName) => {
                if (itemName && itemName.trim()) {
                  createNotification({
                    title: "물품 요청",
                    message: `${itemName.trim()} 구매 요청이 등록되었습니다`,
                    type: "item_request",
                    relatedId: Date.now().toString(),
                  });
                  Alert.alert("완료", "물품 요청이 등록되었습니다!");
                }
              },
            },
          ],
          "plain-text"
        );
      }
    }
  };

  const handleAddTask = () => {
    // Handle add task press
    console.log("Add task pressed");
  };

  const handleTaskPress = (taskId: number) => {
    // Handle task press
    console.log("Task pressed:", taskId);
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <StatusSummaryCard />
        <HomeQuickActions onActionPress={handleQuickAction} />
        <TodayTasks onAddTask={handleAddTask} onTaskPress={handleTaskPress} />
        <RecentActivity />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
  },
});
