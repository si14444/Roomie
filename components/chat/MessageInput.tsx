import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface MessageInputProps {
  onSendMessage?: (message: string) => void;
  onSendImage?: () => void;
  onSendVoice?: () => void;
}

export function MessageInput({
  onSendMessage,
  onSendImage,
  onSendVoice,
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage?.(message.trim());
      setMessage("");
    }
  };

  const isMessageValid = message.trim().length > 0;

  return (
    <View style={styles.messageInputSection}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          value={message}
          onChangeText={setMessage}
          placeholder="메시지를 입력하세요..."
          placeholderTextColor={Colors.light.placeholderText}
          multiline
          maxLength={500}
        />
        <View style={styles.inputActions}>
          <TouchableOpacity style={styles.actionButton} onPress={onSendImage}>
            <Ionicons
              name="image-outline"
              size={20}
              color={Colors.light.mutedText}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onSendVoice}>
            <Ionicons
              name="mic-outline"
              size={20}
              color={Colors.light.mutedText}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sendButton,
              isMessageValid && styles.sendButtonActive,
            ]}
            onPress={handleSend}
            disabled={!isMessageValid}
          >
            <Ionicons
              name="send"
              size={18}
              color={isMessageValid ? "white" : Colors.light.mutedText}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageInputSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderColor,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 8,
    gap: 8,
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    maxHeight: 120,
    paddingVertical: 8,
  },
  inputActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.borderColor,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonActive: {
    backgroundColor: Colors.light.primary,
  },
});
