import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useTeam } from "@/contexts/TeamContext";

interface Poll {
  id: number;
  question: string;
  options: {
    text: string;
    votes: number;
    voters: string[];
  }[];
  creator: string;
  deadline: string;
  status: "active" | "closed";
}

interface ActivePollsProps {
  onVote?: (pollId: number, optionIndex: number) => void;
  onCreatePoll?: () => void;
}

export function ActivePolls({ onVote, onCreatePoll }: ActivePollsProps) {
  const { currentTeam } = useTeam();

  // Note: Polls feature requires backend implementation
  // This would integrate with a polls table in the backend API
  const activePolls: Poll[] = [];

  if (!currentTeam) {
    return (
      <View style={styles.pollsSection}>
        <Text style={styles.sectionTitle}>진행 중인 투표</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>팀을 먼저 선택해주세요</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.pollsSection}>
      <Text style={styles.sectionTitle}>진행 중인 투표</Text>
      
      {activePolls.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bar-chart-outline" size={48} color={Colors.light.mutedText} />
          <Text style={styles.emptyText}>진행 중인 투표가 없습니다</Text>
          <Text style={styles.emptySubtext}>룸메이트들과 함께 결정할 일이 있다면 투표를 만들어보세요</Text>
        </View>
      ) : (
        // Render active polls here when implemented
        <View />
      )}

      <TouchableOpacity style={styles.createPollButton} onPress={onCreatePoll}>
        <View style={styles.createPollContent}>
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text style={styles.createPollButtonText}>새 투표 만들기</Text>
          <View style={{ width: 4 }} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  pollsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  pollCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pollHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  pollQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    flex: 1,
  },
  pollInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  pollInfoText: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  pollOptions: {
    gap: 12,
    marginBottom: 16,
  },
  pollOption: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 12,
  },
  pollOptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
  },
  voteCount: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.primary,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.light.borderColor,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
  votersText: {
    fontSize: 11,
    color: Colors.light.mutedText,
  },
  voteButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  voteButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  createPollButton: {
    backgroundColor: Colors.light.secondary,
    borderRadius: 16,
    padding: 16,
  },
  createPollContent: {
    backgroundColor: Colors.light.secondary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  createPollButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.mutedText,
    textAlign: "center",
    lineHeight: 20,
  },
});
