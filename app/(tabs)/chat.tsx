import { View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import chat components
import { ActivePolls } from "@/components/chat/ActivePolls";
import { MessageInput } from "@/components/chat/MessageInput";
import { MessagesList } from "@/components/chat/MessagesList";

export default function ChatScreen() {
  const { createNotification } = useNotificationContext();

  const handleVote = (pollId: number, optionIndex: number) => {
    console.log(`Vote for poll ${pollId}, option ${optionIndex}`);
  };

  const handleCreatePoll = () => {
    Alert.prompt(
      "새 투표 만들기",
      "투표 주제를 입력해주세요:",
      [
        { text: "취소", style: "cancel" },
        {
          text: "생성",
          onPress: (pollTitle) => {
            if (pollTitle && pollTitle.trim()) {
              createNotification({
                title: "투표 생성",
                message: `새로운 투표가 생성되었습니다: ${pollTitle.trim()}`,
                type: "poll_created",
                relatedId: Date.now().toString(),
              });
              Alert.alert("완료", "투표가 생성되었습니다!");
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const handleSendMessage = (message: string) => {
    console.log("Send message:", message);
  };

  const handleSendImage = () => {
    console.log("Send image");
  };

  const handleSendVoice = () => {
    console.log("Send voice message");
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <ActivePolls onVote={handleVote} onCreatePoll={handleCreatePoll} />
          <MessagesList />
        </ScrollView>
        <MessageInput
          onSendMessage={handleSendMessage}
          onSendImage={handleSendImage}
          onSendVoice={handleSendVoice}
        />
      </View>
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
  scrollView: {
    flex: 1,
  },
});
