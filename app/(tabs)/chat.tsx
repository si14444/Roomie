import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";

// Import chat components
import { ActivePolls } from "@/components/chat/ActivePolls";
import { MessagesList } from "@/components/chat/MessagesList";
import { MessageInput } from "@/components/chat/MessageInput";

export default function ChatScreen() {
  const handleVote = (pollId: number, optionIndex: number) => {
    console.log(`Vote for poll ${pollId}, option ${optionIndex}`);
  };

  const handleCreatePoll = () => {
    console.log("Create new poll");
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
