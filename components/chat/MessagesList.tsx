import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  type: "notification" | "request" | "message" | "system";
}

export function MessagesList() {
  const messages: Message[] = [
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

  const getIconColor = (type: string) => {
    switch (type) {
      case "system":
        return Colors.light.primary;
      case "notification":
        return Colors.light.successColor;
      case "request":
        return Colors.light.warningColor;
      default:
        return Colors.light.mutedText;
    }
  };

  return (
    <View style={styles.messagesSection}>
      <Text style={styles.sectionTitle}>최근 메시지</Text>
      {messages.map((msg) => (
        <View
          key={msg.id}
          style={[
            styles.messageCard,
            getMessageStyle(msg.type),
            { borderWidth: 1 },
          ]}
        >
          <View style={styles.messageHeader}>
            <View style={styles.messageIconContainer}>
              <Ionicons
                name={getMessageIcon(msg.type)}
                size={18}
                color={getIconColor(msg.type)}
              />
            </View>
            <View style={styles.messageSender}>
              <Text style={styles.senderName}>{msg.sender}</Text>
              <Text style={styles.messageTime}>{msg.time}</Text>
            </View>
          </View>
          <Text style={styles.messageText}>{msg.text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  messagesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 24, // 위쪽 여백 추가
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  messageCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  messageIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  messageSender: {
    flex: 1,
  },
  senderName: {
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
});
