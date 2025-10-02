import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { useTeam } from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useState, useMemo } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useAnnouncements, useCreateAnnouncement } from "@/hooks/useAnnouncements";

interface Announcement {
  id: string;
  message: string;
  author: string;
  timestamp: string;
  isImportant?: boolean;
}

export function RoommateFeedback() {
  const { createNotification } = useNotificationContext();
  const { currentTeam } = useTeam();
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isImportant, setIsImportant] = useState(false);

  // TanStack Query hooks
  const { data: announcementsData, isLoading } = useAnnouncements(currentTeam?.id);
  const createAnnouncementMutation = useCreateAnnouncement();

  // Transform announcements data for display
  const announcements = useMemo(() => {
    if (!announcementsData) return [];

    return announcementsData.map(item => ({
      id: item.id,
      message: item.message,
      author: item.author_name,
      timestamp: getRelativeTime(item.created_at),
      isImportant: item.is_important,
    }));
  }, [announcementsData]);

  // 상대 시간 계산 함수
  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;

    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const addAnnouncement = async () => {
    if (newMessage.trim().length === 0) {
      Alert.alert("알림", "공지사항을 입력해주세요.");
      return;
    }

    if (!user || !currentTeam) {
      Alert.alert("오류", "로그인이 필요합니다.");
      return;
    }

    try {
      // TanStack Query mutation으로 공지사항 생성 (자동으로 refetch됨)
      const announcement = await createAnnouncementMutation.mutateAsync({
        team_id: currentTeam.id,
        author_id: user.id,
        author_name: user.name || user.email || '사용자',
        message: newMessage.trim(),
        is_important: isImportant,
      });

      // 팀 전체에 알림 생성
      await createNotification({
        title: "새 공지사항",
        message: `${announcement.author_name}님이 새 공지사항을 등록했습니다: ${newMessage.trim().substring(0, 50)}${newMessage.trim().length > 50 ? '...' : ''}`,
        type: "announcement",
        relatedId: announcement.id,
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
    } catch (error) {
      Alert.alert("오류", "공지사항 등록에 실패했습니다.");
    }
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
          {isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>공지사항을 불러오는 중...</Text>
            </View>
          ) : announcements.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="megaphone-outline" size={48} color={Colors.light.mutedText} />
              <Text style={styles.emptyStateText}>아직 공지사항이 없어요</Text>
              <Text style={styles.emptyStateSubtext}>첫 공지사항을 작성해보세요!</Text>
            </View>
          ) : (
            announcements.slice(0, 4).map((item) => (
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
            ))
          )}
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
    backgroundColor: Colors.light.primary,
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.mutedText,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.mutedText,
    textAlign: "center",
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
    backgroundColor: Colors.light.primary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
