import React from "react";
import {
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";
import { Notification } from "@/types/notification.types";

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
  unreadCount: number;
  onNotificationPress: (notification: Notification) => void;
  onMarkAllAsRead: () => void;
  onClearReadNotifications: () => void;
  onDeleteNotification: (notificationId: string) => void;
  getNotificationIcon: (type: any) => {
    name: string;
    color: string;
    backgroundColor: string;
  };
  getRelativeTime: (dateString: string) => string;
}

export function NotificationsModal({
  visible,
  onClose,
  notifications,
  unreadCount,
  onNotificationPress,
  onMarkAllAsRead,
  onClearReadNotifications,
  onDeleteNotification,
  getNotificationIcon,
  getRelativeTime,
}: NotificationsModalProps) {
  const handleDeleteNotification = (notificationId: string, title: string) => {
    Alert.alert("알림 삭제", `"${title}" 알림을 삭제하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => onDeleteNotification(notificationId),
      },
    ]);
  };

  const handleClearReadNotifications = () => {
    Alert.alert("읽은 알림 삭제", "읽은 알림을 모두 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: onClearReadNotifications,
      },
    ]);
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      onMarkAllAsRead();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>알림</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        {notifications.length > 0 && (
          <View style={styles.actionBar}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                unreadCount === 0 && styles.actionButtonDisabled,
              ]}
              onPress={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <Ionicons
                name="checkmark-done"
                size={16}
                color={
                  unreadCount > 0
                    ? Colors.light.primary
                    : Colors.light.mutedText
                }
              />
              <Text
                style={[
                  styles.actionButtonText,
                  unreadCount === 0 && styles.actionButtonTextDisabled,
                ]}
              >
                모두 읽음
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleClearReadNotifications}
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color={Colors.light.mutedText}
              />
              <Text style={styles.actionButtonText}>읽은 알림 삭제</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notifications List */}
        <ScrollView
          style={styles.notificationsList}
          showsVerticalScrollIndicator={false}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="notifications-outline"
                size={64}
                color={Colors.light.mutedText}
              />
              <Text style={styles.emptyStateTitle}>알림이 없습니다</Text>
              <Text style={styles.emptyStateMessage}>
                새로운 알림이 있으면 여기에 표시됩니다
              </Text>
            </View>
          ) : (
            notifications.map((notification) => {
              const iconInfo = getNotificationIcon(notification.type);
              return (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    !notification.isRead && styles.notificationItemUnread,
                  ]}
                  onPress={() => onNotificationPress(notification)}
                  activeOpacity={0.7}
                >
                  <View style={styles.notificationContent}>
                    <View
                      style={[
                        styles.notificationIcon,
                        { backgroundColor: iconInfo.backgroundColor },
                      ]}
                    >
                      <Ionicons
                        name={iconInfo.name as any}
                        size={20}
                        color={iconInfo.color}
                      />
                    </View>

                    <View style={styles.notificationText}>
                      <View style={styles.notificationHeader}>
                        <Text
                          style={[
                            styles.notificationTitle,
                            !notification.isRead &&
                              styles.notificationTitleUnread,
                          ]}
                        >
                          {notification.title}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {getRelativeTime(notification.created_at || notification.createdAt || '')}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.notificationMessage,
                          !notification.isRead &&
                            styles.notificationMessageUnread,
                        ]}
                        numberOfLines={2}
                      >
                        {notification.message}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() =>
                        handleDeleteNotification(
                          notification.id,
                          notification.title
                        )
                      }
                    >
                      <Ionicons
                        name="close"
                        size={16}
                        color={Colors.light.mutedText}
                      />
                    </TouchableOpacity>
                  </View>

                  {!notification.isRead && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderColor,
    backgroundColor: Colors.light.cardBackground,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  unreadBadge: {
    backgroundColor: Colors.light.errorColor,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  unreadBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderColor,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "500",
  },
  actionButtonTextDisabled: {
    color: Colors.light.mutedText,
  },
  notificationsList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: Colors.light.mutedText,
    textAlign: "center",
    lineHeight: 20,
  },
  notificationItem: {
    backgroundColor: Colors.light.cardBackground,
    marginHorizontal: 20,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  notificationItemUnread: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    gap: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.light.text,
    flex: 1,
    marginRight: 8,
  },
  notificationTitleUnread: {
    fontWeight: "700",
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.light.mutedText,
    lineHeight: 18,
  },
  notificationMessageUnread: {
    color: Colors.light.text,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
  },
});
