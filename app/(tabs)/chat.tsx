import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

export default function ChatScreen() {
  const [message, setMessage] = useState("");

  const polls = [
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

  const messages = [
    {
      id: 1,
      sender: "김철수",
      text: "설거지 완료했습니다!",
      time: "14:30",
      type: "notification",
    },
    {
      id: 2,
      sender: "이영희",
      text: "휴지 떨어져가는데 누가 사올 수 있나요?",
      time: "15:45",
      type: "request",
    },
    {
      id: 3,
      sender: "박민수",
      text: "제가 사올게요",
      time: "15:47",
      type: "message",
    },
    {
      id: 4,
      sender: "시스템",
      text: "공과금 정산이 완료되었습니다.",
      time: "16:00",
      type: "system",
    },
  ];

  const getMessageStyle = (type: string) => {
    switch (type) {
      case "system":
        return {
          backgroundColor: Colors.light.accent,
          borderColor: Colors.light.primary,
        };
      case "notification":
        return {
          backgroundColor: "#F0F9FF",
          borderColor: Colors.light.successColor,
        };
      case "request":
        return {
          backgroundColor: "#FEF7ED",
          borderColor: Colors.light.warningColor,
        };
      default:
        return {
          backgroundColor: Colors.light.cardBackground,
          borderColor: Colors.light.borderColor,
        };
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "system":
        return "settings-outline" as keyof typeof Ionicons.glyphMap;
      case "notification":
        return "checkmark-circle-outline" as keyof typeof Ionicons.glyphMap;
      case "request":
        return "help-circle-outline" as keyof typeof Ionicons.glyphMap;
      default:
        return "chatbubble-outline" as keyof typeof Ionicons.glyphMap;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View
        style={[
          styles.welcomeSection,
          { backgroundColor: Colors.light.accent },
        ]}
      >
        <View style={styles.welcomeContent}>
          <Text style={[styles.greeting, { color: Colors.light.primary }]}>
            소통해요! 💬
          </Text>
          <Text
            style={[styles.welcomeSubtitle, { color: Colors.light.mutedText }]}
          >
            투표와 메시지로 원활한 소통을 시작하세요
          </Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={Colors.light.primary}
          />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pollsSection}>
          <Text style={styles.sectionTitle}>진행 중인 투표</Text>
          {polls
            .filter((poll) => poll.status === "active")
            .map((poll) => (
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
                  {poll.options.map((option, index) => (
                    <TouchableOpacity key={index} style={styles.pollOption}>
                      <View style={styles.pollOptionHeader}>
                        <Text style={styles.optionText}>{option.text}</Text>
                        <Text style={styles.voteCount}>{option.votes}표</Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${
                                (option.votes /
                                  Math.max(
                                    1,
                                    poll.options.reduce(
                                      (sum, opt) => sum + opt.votes,
                                      0
                                    )
                                  )) *
                                100
                              }%`,
                            },
                          ]}
                        />
                      </View>
                      {option.voters.length > 0 && (
                        <Text style={styles.votersText}>
                          투표자: {option.voters.join(", ")}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.voteButton}>
                  <Ionicons name="thumbs-up-outline" size={16} color="white" />
                  <Text style={styles.voteButtonText}>투표하기</Text>
                </TouchableOpacity>
              </View>
            ))}

          <TouchableOpacity style={styles.createPollButton}>
            <LinearGradient
              colors={Colors.light.gradientSecondary as any}
              style={styles.createPollGradient}
            >
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <Text style={styles.createPollButtonText}>새 투표 만들기</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.messagesSection}>
          <Text style={styles.sectionTitle}>최근 메시지</Text>
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[styles.messageCard, getMessageStyle(msg.type)]}
            >
              <View style={styles.messageHeader}>
                <View style={styles.messageInfo}>
                  <View style={styles.messageIconContainer}>
                    <Ionicons
                      name={getMessageIcon(msg.type)}
                      size={16}
                      color={
                        msg.type === "system"
                          ? Colors.light.primary
                          : Colors.light.mutedText
                      }
                    />
                  </View>
                  <Text style={styles.messageSender}>{msg.sender}</Text>
                </View>
                <Text style={styles.messageTime}>{msg.time}</Text>
              </View>
              <Text style={styles.messageText}>{msg.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.messageInput}>
          <Text style={styles.sectionTitle}>메시지 보내기</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              placeholder="룸메이트들에게 메시지를 보내세요..."
              multiline
            />
            <TouchableOpacity style={styles.sendButton}>
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.quickMessages}>
            <Text style={styles.quickMessagesTitle}>빠른 메시지</Text>
            <View style={styles.quickMessageButtons}>
              <TouchableOpacity style={styles.quickMessageButton}>
                <Ionicons
                  name="walk-outline"
                  size={16}
                  color={Colors.light.primary}
                />
                <Text style={styles.quickMessageButtonText}>외출합니다</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickMessageButton}>
                <Ionicons
                  name="home-outline"
                  size={16}
                  color={Colors.light.successColor}
                />
                <Text style={styles.quickMessageButtonText}>귀가했습니다</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickMessageButton}>
                <Ionicons
                  name="basket-outline"
                  size={16}
                  color={Colors.light.warningColor}
                />
                <Text style={styles.quickMessageButtonText}>쇼핑 갔습니다</Text>
              </TouchableOpacity>
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
    paddingBottom: 24,
  },
  headerContent: {
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerLeft: {
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
  },
  headerTextContainer: {
    backgroundColor: "transparent",
    marginLeft: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
  },
  headerActions: {
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  onlineIndicator: {
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.successColor,
  },
  onlineText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
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
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pollOptions: {
    marginBottom: 16,
  },
  pollOption: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
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
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
  votersText: {
    fontSize: 11,
    color: Colors.light.mutedText,
    fontStyle: "italic",
  },
  voteButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  voteButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  createPollButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: Colors.light.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createPollGradient: {
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  createPollButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  messagesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  messageCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  messageInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  messageIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  messageSender: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  messageTime: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  messageText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  messageInput: {
    margin: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.light.cardBackground,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.light.text,
    maxHeight: 100,
    minHeight: 48,
  },
  sendButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  quickMessages: {
    marginTop: 12,
  },
  quickMessagesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 12,
  },
  quickMessageButtons: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  quickMessageButton: {
    backgroundColor: Colors.light.cardBackground,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  quickMessageButtonText: {
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: "500",
  },
  greeting: {
    fontSize: 18,
    color: "white",
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
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
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
