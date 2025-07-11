import React, { useState } from "react";
import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

// Import routines components and hook
import { RoutinesSummary } from "@/components/routines/RoutinesSummary";
import { RoutineCard } from "@/components/routines/RoutineCard";
import { AddRoutineModal } from "@/components/routines/AddRoutineModal";
import { useRoutines } from "@/hooks/useRoutines";

export default function RoutinesScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const {
    routines,
    statistics,
    roommates,
    completeRoutine,
    postponeRoutine,
    addNewRoutine,
    showRoutineOptions,
    showAssigneeOptions,
  } = useRoutines();

  const openAddModal = () => {
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const handleAddRoutine = (routine: {
    task: string;
    assignee: string;
    frequency: "daily" | "weekly" | "monthly";
  }) => {
    addNewRoutine(routine);
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <RoutinesSummary
          completed={statistics.completed}
          pending={statistics.pending}
          overdue={statistics.overdue}
          completionRate={statistics.completionRate}
          participationRate={statistics.participationRate}
        />

        <View style={styles.routinesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>루틴 목록</Text>
            <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>새 루틴</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.routinesList}>
            {routines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onComplete={completeRoutine}
                onPostpone={postponeRoutine}
                onOptions={showRoutineOptions}
                onChangeAssignee={showAssigneeOptions}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <AddRoutineModal
        visible={showAddModal}
        onClose={closeAddModal}
        onAdd={handleAddRoutine}
        roommates={roommates}
      />
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
  routinesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  routinesList: {
    gap: 12,
  },
});
