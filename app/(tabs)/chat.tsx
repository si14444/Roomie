import { View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import chat components
import { MessageInput } from "@/components/chat/MessageInput";
import { MessagesList } from "@/components/chat/MessagesList";

export default function ChatScreen() {
  const { createNotification } = useNotificationContext();

  // 투표 관련 핸들러 제거

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
          {/* <ActivePolls onVote={handleVote} onCreatePoll={handleCreatePoll} /> */}
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
