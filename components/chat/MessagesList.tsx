import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { useState, useEffect } from "react";
import { Notification } from "@/types/notification.types";

interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  type: "notification" | "request" | "message" | "system";
  originalNotification?: Notification;
}

export function MessagesList() {
  const { notifications } = useNotificationContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Transform notifications to messages
  useEffect(() => {
    try {
      setIsLoading(true);
      
      // Get recent notifications (last 20)
      const recentNotifications = notifications
        .slice()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20);
      
      const transformedMessages: Message[] = recentNotifications.map(notification => {
        // Format time
        const createdAt = new Date(notification.created_at);
        const timeString = createdAt.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        
        // Determine message type and sender based on notification type
        let messageType: "notification" | "request" | "message" | "system" = "notification";
        let sender = "시스템";
        
        switch (notification.type) {
          case 'routine_completed':
          case 'routine_overdue':
            messageType = "notification";
            sender = "작업 알림";
            break;
          case 'bill_added':
          case 'bill_payment_due':
          case 'payment_received':
            messageType = "system";
            sender = "결제 시스템";
            break;
          case 'item_request':
          case 'item_purchased':
          case 'item_update':
            messageType = "request";
            sender = "재고 관리";
            break;
          case 'announcement':
            messageType = "message";
            sender = "팀 공지";
            break;
          case 'poll_created':
          case 'poll_ended':
            messageType = "request";
            sender = "투표";
            break;
          case 'chat_message':
            messageType = "message";
            sender = "채팅";
            break;
          default:
            messageType = "notification";
            sender = "알림";
        }
        
        return {
          id: notification.id,
          sender,
          text: notification.message,
          time: timeString,
          type: messageType,
          originalNotification: notification
        };
      });
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error transforming notifications to messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [notifications]);

  if (isLoading) {
    return (
      <View style={styles.messagesSection}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>최근 메시지</Text>
          <ActivityIndicator size="small" color={Colors.light.primary} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>메시지를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (messages.length === 0) {
    return (
      <View style={styles.messagesSection}>
        <Text style={styles.sectionTitle}>최근 메시지</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>아직 메시지가 없습니다</Text>
        </View>
      </View>
    );
  }

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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: Colors.light.mutedText,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.mutedText,
  },
});
