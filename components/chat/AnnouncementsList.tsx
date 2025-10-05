import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { useAnnouncements, useCreateAnnouncement } from "@/hooks/useAnnouncements";
import { useState } from "react";
import { Announcement } from "@/services/announcementService";

interface AnnouncementsListProps {
  teamId: string;
  userId: string;
  userName: string;
}

export function AnnouncementsList({ teamId, userId, userName }: AnnouncementsListProps) {
  const { data: announcements, isLoading, error } = useAnnouncements(teamId);
  const createMutation = useCreateAnnouncement();
  const [isCreating, setIsCreating] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>📢 공지사항</Text>
          <ActivityIndicator size="small" color={Colors.light.primary} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>공지사항을 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>📢 공지사항</Text>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color={Colors.light.errorColor} />
          <Text style={styles.errorText}>공지사항을 불러오지 못했습니다</Text>
        </View>
      </View>
    );
  }

  const handleCreateTestAnnouncement = async () => {
    setIsCreating(true);
    try {
      await createMutation.mutateAsync({
        team_id: teamId,
        author_id: userId,
        author_name: userName,
        message: `테스트 공지사항 - ${new Date().toLocaleString('ko-KR')}`,
        is_important: Math.random() > 0.5,
      });
    } catch (error) {
      console.error('Failed to create announcement:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>📢 공지사항</Text>
        <TouchableOpacity
          onPress={handleCreateTestAnnouncement}
          disabled={isCreating}
          style={styles.addButton}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color={Colors.light.primary} />
          ) : (
            <Ionicons name="add-circle" size={24} color={Colors.light.primary} />
          )}
        </TouchableOpacity>
      </View>

      {!announcements || announcements.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="megaphone-outline" size={48} color={Colors.light.mutedText} />
          <Text style={styles.emptyText}>아직 공지사항이 없습니다</Text>
          <Text style={styles.emptySubText}>+ 버튼을 눌러 공지사항을 추가해보세요</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {announcements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

interface AnnouncementCardProps {
  announcement: Announcement;
}

function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const createdAt = new Date(announcement.created_at);
  const timeString = createdAt.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <View
      style={[
        styles.announcementCard,
        announcement.is_important && styles.importantCard,
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.authorRow}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={announcement.is_important ? "megaphone" : "megaphone-outline"}
              size={16}
              color={announcement.is_important ? Colors.light.errorColor : Colors.light.primary}
            />
          </View>
          <Text style={styles.authorName}>{announcement.author_name}</Text>
          {announcement.is_important && (
            <View style={styles.importantBadge}>
              <Text style={styles.importantBadgeText}>중요</Text>
            </View>
          )}
        </View>
        <Text style={styles.timeText}>{timeString}</Text>
      </View>
      <Text style={styles.messageText}>{announcement.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  addButton: {
    padding: 4,
  },
  scrollView: {
    maxHeight: 400,
  },
  announcementCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  importantCard: {
    borderColor: Colors.light.errorColor,
    borderWidth: 2,
    backgroundColor: "#FFF5F5",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  authorName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  importantBadge: {
    backgroundColor: Colors.light.errorColor,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  importantBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  timeText: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  messageText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: Colors.light.mutedText,
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.light.errorColor,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.mutedText,
    fontWeight: "600",
  },
  emptySubText: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
});
