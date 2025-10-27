import { useState, useMemo, useEffect } from "react";
import {
  Notification,
  NotificationType,
  CreateNotificationParams,
  NotificationIcon,
} from "@/types/notification.types";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/contexts/TeamContext";
import { useNotificationPreferences } from "@/contexts/NotificationPreferencesContext";
import * as NotificationService from "@/services/notificationService";
import Colors from "@/constants/Colors";

export function useNotifications() {
  const { user } = useAuth();
  const { currentTeam } = useTeam();
  const { isNotificationEnabled } = useNotificationPreferences();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 컴포넌트 마운트 시 알림 실시간 구독 및 권한 요청
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    // 알림 권한 요청
    NotificationService.registerForPushNotifications();

    // Firestore 실시간 구독 설정
    const unsubscribe = NotificationService.subscribeToUserNotifications(
      user.id,
      currentTeam?.id,
      (updatedNotifications) => {
        setNotifications(updatedNotifications);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.id, currentTeam?.id]);

  // 알림 로드 함수 (레거시 - 이제 구독으로 대체됨)
  const loadNotifications = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userNotifications = await NotificationService.getUserNotifications(
        user.id,
        currentTeam?.id
      );
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 읽지 않은 알림 개수
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  // 배지 업데이트
  useEffect(() => {
    NotificationService.setBadgeCount(unreadCount);
  }, [unreadCount]);

  // 알림 타입별 아이콘 정보
  const getNotificationIcon = (type: NotificationType): NotificationIcon => {
    switch (type) {
      case "routine_completed":
        return {
          name: "checkmark-circle",
          color: Colors.light.successColor,
          backgroundColor: "#F0F9FF",
        };
      case "routine_overdue":
        return {
          name: "alert-circle",
          color: Colors.light.errorColor,
          backgroundColor: "#FEF2F2",
        };
      case "bill_added":
      case "bill_payment_due":
        return {
          name: "card",
          color: Colors.light.primary,
          backgroundColor: "#F8FAFC",
        };
      case "payment_received":
        return {
          name: "wallet",
          color: Colors.light.successColor,
          backgroundColor: "#F0F9FF",
        };
      case "item_request":
        return {
          name: "bag-handle",
          color: Colors.light.warningColor,
          backgroundColor: "#FEF7ED",
        };
      case "item_purchased":
        return {
          name: "bag-check",
          color: Colors.light.successColor,
          backgroundColor: "#F0F9FF",
        };
      case "poll_created":
        return {
          name: "bar-chart",
          color: Colors.light.secondary,
          backgroundColor: "#FFF4F3",
        };
      case "poll_ended":
        return {
          name: "checkmark-done",
          color: Colors.light.primary,
          backgroundColor: "#F8FAFC",
        };
      case "chat_message":
        return {
          name: "chatbubble",
          color: Colors.light.primary,
          backgroundColor: "#F8FAFC",
        };
      case "announcement":
        return {
          name: "megaphone",
          color: Colors.light.warningColor,
          backgroundColor: "#FEF7ED",
        };
      case "system":
        return {
          name: "settings",
          color: Colors.light.mutedText,
          backgroundColor: "#F1F5F9",
        };
      default:
        return {
          name: "information-circle",
          color: Colors.light.mutedText,
          backgroundColor: "#F1F5F9",
        };
    }
  };

  // 상대적 시간 계산
  const getRelativeTime = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "방금 전";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}분 전`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}시간 전`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}일 전`;
    }
  };

  // 새 알림 생성
  const createNotification = async (params: CreateNotificationParams) => {
    if (!user || !currentTeam) {
      console.warn('Cannot create notification: user or team not available');
      return;
    }

    // 알림 설정 확인 - 비활성화된 알림은 생성하지 않음
    if (!isNotificationEnabled(params.type)) {
      console.log(`Notification type ${params.type} is disabled by user preferences`);
      return;
    }

    try {
      // Firestore에 알림 저장
      const notificationId = await NotificationService.createNotification(
        user.id,
        currentTeam.id,
        params
      );

      if (!notificationId) {
        throw new Error('Failed to create notification in Firestore');
      }

      // 로컬 푸시 알림 전송
      const { title, body } = NotificationService.getNotificationContent(
        params.type,
        params.title,
        params.message
      );
      await NotificationService.scheduleLocalNotification(title, body, {
        notificationId,
        type: params.type,
        ...params.actionData,
      });

      // 실시간 구독으로 자동 업데이트되므로 별도 setState 불필요
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  };

  // 알림을 읽음으로 표시
  const markAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markNotificationAsRead(notificationId);
      // 실시간 구독으로 자동 업데이트됨
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // 모든 알림을 읽음으로 표시
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await NotificationService.markAllNotificationsAsRead(user.id, currentTeam?.id);
      // 실시간 구독으로 자동 업데이트됨
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // 알림 삭제
  const deleteNotification = async (notificationId: string) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      // 실시간 구독으로 자동 업데이트됨
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // 모든 알림 삭제
  const clearAllNotifications = async () => {
    if (!user) return;

    try {
      await NotificationService.deleteAllNotifications(user.id, currentTeam?.id);
      // 실시간 구독으로 자동 업데이트됨
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  };

  // 읽은 알림만 삭제
  const clearReadNotifications = async () => {
    if (!user) return;

    try {
      await NotificationService.deleteReadNotifications(user.id, currentTeam?.id);
      // 실시간 구독으로 자동 업데이트됨
    } catch (error) {
      console.error('Failed to clear read notifications:', error);
    }
  };

  // 알림 클릭 핸들러 (네비게이션 로직)
  const handleNotificationClick = (notification: Notification) => {
    // 알림을 읽음으로 표시
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // 알림 타입에 따른 네비게이션 처리
    switch (notification.type) {
      case "routine_completed":
      case "routine_overdue":
        // 루틴 탭으로 이동
        break;
      case "bill_added":
      case "bill_payment_due":
      case "payment_received":
        // 공과금 탭으로 이동
        break;
      case "item_request":
      case "item_purchased":
        // 물품 탭으로 이동
        break;
      case "poll_created":
      case "poll_ended":
      case "chat_message":
        // 채팅 탭으로 이동
        break;
      case "announcement":
        // 홈 탭으로 이동 (공지사항은 홈에 표시)
        break;
      default:
        // 기본적으로 홈으로 이동
        break;
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    clearReadNotifications,
    handleNotificationClick,
    getNotificationIcon,
    getRelativeTime,
    loadNotifications,
  };
}