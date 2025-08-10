import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

interface Announcement {
  id: string;
  message: string;
  author: string;
  timestamp: string;
  isImportant?: boolean;
}

const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    message: "주말에 전체 대청소 하려고 해요! 다들 참여 부탁드려요 🧹",
    author: "김철수",
    timestamp: "2시간 전",
    isImportant: true,
  },
  {
    id: "2",
    message: "냉장고에 우유 떨어져 가는데 사오실 분 있나요?",
    author: "이영희",
    timestamp: "어제",
  },
  {
    id: "3",
    message: "오늘 저녁 집에서 파스타 해먹을 예정입니다! 함께 드실 분? 🍝",
    author: "박민수",
    timestamp: "3일 전",
  },
  {
    id: "4",
    message: "오늘 저녁 집에서 파스타 해먹을 예정입니다! 함께 드실 분? 🍝",
    author: "박민수",
    timestamp: "3일 전",
  },
  {
    id: "5",
    message: "오늘 저녁 집에서 파스타 해먹을 예정입니다! 함께 드실 분? 🍝",
    author: "박민수",
    timestamp: "3일 전",
  },
  {
    id: "6",
    message: "오늘 저녁 집에서 파스타 해먹을 예정입니다! 함께 드실 분? 🍝",
    author: "박민수",
    timestamp: "3일 전",
  },
];

export function RoommateFeedback() {
  const { createNotification } = useNotificationContext();
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(mockAnnouncements);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isImportant, setIsImportant] = useState(false);

  const addAnnouncement = () => {
    if (newMessage.trim().length === 0) {
      Alert.alert("알림", "공지사항을 입력해주세요.");
      return;
    }

    const currentUser = "김철수"; // 현재 사용자

    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      message: newMessage.trim(),
      author: currentUser,
      timestamp: "방금 전",
      isImportant,
    };

    setAnnouncements((prev) => [newAnnouncement, ...prev]);

    // 알림 생성
    createNotification({
      title: "새 공지사항",
      message: `${currentUser}님이 새 공지사항을 등록했습니다`,
      type: "system",
      relatedId: newAnnouncement.id,
    });

    // 모달 닫기 및 초기화
    setNewMessage("");
    setIsImportant(false);
    setModalVisible(false);

    Alert.alert(
      "공지사항 등록 완료! 📢",
      "모든 룸메이트에게 공지사항이 전달되었습니다.",
      [{ text: "확인", style: "default" }]
    );
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>공지사항</Text>
            <Text style={styles.subtitle}>
              룸메이트들과 정보를 공유해보세요
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.addButtonText}>공지 작성</Text>
          </TouchableOpacity>
        </View>

        {/* 공지사항 리스트 */}
        <View style={styles.announcementList}>
          {announcements.slice(0, 4).map((item) => (
            <View key={item.id} style={styles.announcementItem}>
              <View style={styles.announcementHeader}>
                <View style={styles.authorInfo}>
                  <View
                    style={[
                      styles.authorAvatar,
                      item.isImportant && styles.importantAvatar,
                    ]}
                  >
                    <Text style={styles.authorInitial}>
                      {item.author.charAt(0)}
                    </Text>
                    {item.isImportant && (
                      <View style={styles.importantBadge}>
                        <Ionicons name="megaphone" size={8} color="white" />
                      </View>
                    )}
                  </View>
                  <View>
                    <Text style={styles.authorName}>{item.author}</Text>
                    <Text style={styles.timestamp}>{item.timestamp}</Text>
                  </View>
                </View>
                {item.isImportant && (
                  <View style={styles.importantTag}>
                    <Text style={styles.importantTagText}>중요</Text>
                  </View>
                )}
              </View>
              <Text style={styles.announcementMessage}>{item.message}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 공지 작성 모달 */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>공지사항 작성</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={Colors.light.mutedText}
                />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.messageInput}
              placeholder="공지사항을 입력해주세요..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={200}
            />

            <TouchableOpacity
              style={styles.importantToggle}
              onPress={() => setIsImportant(!isImportant)}
            >
              <Ionicons
                name={isImportant ? "checkbox" : "square-outline"}
                size={20}
                color={
                  isImportant ? Colors.light.primary : Colors.light.mutedText
                }
              />
              <Text
                style={[
                  styles.importantToggleText,
                  isImportant && styles.importantToggleTextActive,
                ]}
              >
                중요 공지로 표시
              </Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={addAnnouncement}
              >
                <Text style={styles.submitButtonText}>등록</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.mutedText,
  },
  addButton: {
    backgroundColor: Colors.light.subColor,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  announcementList: {
    gap: 16,
  },
  announcementItem: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.divider,
  },
  announcementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  importantAvatar: {
    backgroundColor: Colors.light.errorColor,
  },
  authorInitial: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  importantBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.light.warningColor,
    alignItems: "center",
    justifyContent: "center",
  },
  authorName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  importantTag: {
    backgroundColor: Colors.light.errorColor,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  importantTagText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  announcementMessage: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.light.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  messageInput: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
    textAlignVertical: "top",
    minHeight: 120,
    marginBottom: 16,
  },
  importantToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  importantToggleText: {
    fontSize: 14,
    color: Colors.light.mutedText,
  },
  importantToggleTextActive: {
    color: Colors.light.primary,
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.light.surface,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.mutedText,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.light.subColor,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
