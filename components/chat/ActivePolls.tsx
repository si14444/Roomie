import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity } from "react-native";

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
  const polls: Poll[] = [
    {
      id: 1,
      question: "오늘 저녁 뭐 시켜먹을까요?",
      options: [
        { text: "치킨", votes: 2, voters: ["김철수", "이영희"] },
        { text: "피자", votes: 1, voters: ["박민수"] },
        { text: "중국집", votes: 0, voters: [] },
      ],
      creator: "김철수",
      deadline: "2024-12-27 18:00",
      status: "active",
    },
    {
      id: 2,
      question: "이번 주말 대청소 어떠세요?",
      options: [
        { text: "찬성", votes: 3, voters: ["김철수", "이영희", "박민수"] },
        { text: "반대", votes: 0, voters: [] },
      ],
      creator: "이영희",
      deadline: "2024-12-28 12:00",
      status: "closed",
    },
  ];

  const activePolls = polls.filter((poll) => poll.status === "active");

  return (
    <View style={styles.pollsSection}>
      <Text style={styles.sectionTitle}>진행 중인 투표</Text>
      {activePolls.map((poll) => (
        <View key={poll.id} style={styles.pollCard}>
          <View style={styles.pollHeader}>
            <Ionicons
              name="bar-chart-outline"
              size={20}
              color={Colors.light.primary}
            />
            <Text style={styles.pollQuestion}>{poll.question}</Text>
          </View>
          <View style={styles.pollInfo}>
            <Text style={styles.pollInfoText}>
              <Ionicons
                name="person-outline"
                size={14}
                color={Colors.light.mutedText}
              />{" "}
              {poll.creator}
            </Text>
            <Text style={styles.pollInfoText}>
              <Ionicons
                name="time-outline"
                size={14}
                color={Colors.light.mutedText}
              />{" "}
              {poll.deadline}
            </Text>
          </View>

          <View style={styles.pollOptions}>
            {poll.options.map((option, index) => {
              const totalVotes = poll.options.reduce(
                (sum, opt) => sum + opt.votes,
                0
              );
              const percentage =
                totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.pollOption}
                  onPress={() => onVote?.(poll.id, index)}
                >
                  <View style={styles.pollOptionHeader}>
                    <Text style={styles.optionText}>{option.text}</Text>
                    <Text style={styles.voteCount}>{option.votes}표</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[styles.progressFill, { width: `${percentage}%` }]}
                    />
                  </View>
                  {option.voters.length > 0 && (
                    <Text style={styles.votersText}>
                      투표자: {option.voters.join(", ")}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.voteButton}>
            <Ionicons name="thumbs-up-outline" size={16} color="white" />
            <Text style={styles.voteButtonText}>투표하기</Text>
          </TouchableOpacity>
        </View>
      ))}

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
});
