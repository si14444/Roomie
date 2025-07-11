import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";

// Import home components
import { StatusSummaryCard } from "@/components/home/StatusSummaryCard";
import { HomeQuickActions } from "@/components/home/HomeQuickActions";
import { TodayTasks } from "@/components/home/TodayTasks";
import { RecentActivity } from "@/components/home/RecentActivity";

export default function HomeScreen() {
  const handleQuickAction = (actionId: number) => {
    // Handle quick action press
    console.log("Quick action pressed:", actionId);
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
