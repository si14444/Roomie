import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import routines components and hook
import { AddRoutineModal } from "@/components/routines/AddRoutineModal";
import { AssigneeSelectModal } from "@/components/routines/AssigneeSelectModal";
import { FrequencySelectModal } from "@/components/routines/FrequencySelectModal";
import { RoutineCard } from "@/components/routines/RoutineCard";
import { RoutineDeleteModal } from "@/components/routines/RoutineDeleteModal";
import { RoutineOptionsModal } from "@/components/routines/RoutineOptionsModal";
import { RoutinesSummary } from "@/components/routines/RoutinesSummary";
import { useRoutinesFirebase as useRoutines } from "@/hooks/useRoutinesFirebase";

interface Routine {
  id: string;
  task: string;
  assignee: string;
  nextDate: string;
  status: "pending" | "completed" | "overdue";
  icon: string;
  frequency: "daily" | "weekly" | "monthly";
  completedAt?: string;
}

export default function RoutinesScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [showRoutineOptionsModal, setShowRoutineOptionsModal] = useState(false);
  const [showAssigneeSelectModal, setShowAssigneeSelectModal] = useState(false);
  const [showFrequencySelectModal, setShowFrequencySelectModal] =
    useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    routines,
    statistics,
    roommates,
    completeRoutine,
    postponeRoutine,
    addNewRoutine,
    changeAssignee,
    changeFrequency,
    deleteRoutine,
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

  const handleShowRoutineOptions = (routine: Routine) => {
    setSelectedRoutine(routine);
    setShowRoutineOptionsModal(true);
  };

  const handleChangeAssignee = (routine: Routine) => {
    setSelectedRoutine(routine);
    setShowAssigneeSelectModal(true);
  };

  const handleChangeFrequency = (routine: Routine) => {
    setSelectedRoutine(routine);
    setShowFrequencySelectModal(true);
  };

  const handleDeleteRoutine = (routine: Routine) => {
    setSelectedRoutine(routine);
    setShowDeleteModal(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <RoutinesSummary
          completed={statistics.completed}
          pending={statistics.pending}
          overdue={statistics.overdue}
          completionRate={statistics.completionRate}
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
            {routines.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="calendar-outline"
                  size={64}
                  color={Colors.light.mutedText}
                />
                <Text style={styles.emptyStateText}>
                  아직 등록된 루틴이 없습니다
                </Text>
                <Text style={styles.emptyStateSubText}>
                  새 루틴 버튼을 눌러 첫 루틴을 만들어보세요
                </Text>
              </View>
            ) : (
              routines.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  onComplete={completeRoutine}
                  onPostpone={postponeRoutine}
                  onOptions={handleShowRoutineOptions}
                  onChangeAssignee={showAssigneeOptions}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <AddRoutineModal
        visible={showAddModal}
        onClose={closeAddModal}
        onAdd={handleAddRoutine}
        roommates={roommates}
      />

      <RoutineOptionsModal
        visible={showRoutineOptionsModal}
        routine={selectedRoutine}
        onClose={() => setShowRoutineOptionsModal(false)}
        onChangeAssignee={handleChangeAssignee}
        onChangeFrequency={handleChangeFrequency}
        onDeleteRoutine={handleDeleteRoutine}
      />

      <AssigneeSelectModal
        visible={showAssigneeSelectModal}
        routine={selectedRoutine}
        roommates={roommates}
        onClose={() => setShowAssigneeSelectModal(false)}
        onSelectAssignee={(routineId, assignee) => {
          changeAssignee(routineId, assignee);
        }}
      />

      <FrequencySelectModal
        visible={showFrequencySelectModal}
        routine={selectedRoutine}
        onClose={() => setShowFrequencySelectModal(false)}
        onSelectFrequency={(routineId, frequency) => {
          changeFrequency(routineId, frequency);
        }}
      />

      <RoutineDeleteModal
        visible={showDeleteModal}
        routine={selectedRoutine}
        onClose={() => setShowDeleteModal(false)}
        onConfirmDelete={(routineId) => {
          deleteRoutine(routineId);
        }}
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginTop: 16,
    textAlign: "center",
  },
  emptyStateSubText: {
    fontSize: 14,
    color: Colors.light.mutedText,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
});
