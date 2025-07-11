import { useState, useMemo } from "react";
import {
  Notification,
  NotificationType,
  CreateNotificationParams,
  NotificationIcon,
} from "@/types/notification.types";
import Colors from "@/constants/Colors";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    // 샘플 데이터
    {
      id: "1",
      title: "루틴 완료",
      message: "김철수가 설거지를 완료했습니다",
      type: "routine_completed",
      isRead: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30분 전
      relatedId: "routine_1",
    },
    {
      id: "2",
      title: "공과금 추가",
      message: "전기요금 청구서가 등록되었습니다 (₩85,000)",
      type: "bill_added",
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
      relatedId: "bill_1",
    },
    {
      id: "3",
      title: "물품 요청",
      message: "이영희가 휴지 구매를 요청했습니다",
      type: "item_request",
      isRead: true,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3시간 전
      relatedId: "item_1",
    },
    {
      id: "4",
      title: "투표 생성",
      message: "새로운 투표가 생성되었습니다: 오늘 저녁 뭐 시켜먹을까요?",
      type: "poll_created",
      isRead: true,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5시간 전
      relatedId: "poll_1",
    },
    {
      id: "5",
      title: "루틴 지연",
      message: "쓰레기 버리기 루틴이 지연되었습니다",
      type: "routine_overdue",
      isRead: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1일 전
      relatedId: "routine_2",
    },
  ]);

  // 읽지 않은 알림 개수
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

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
          backgroundColor: "#F5F3FF",
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

  // 알림 생성
  const createNotification = (params: CreateNotificationParams): void => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: params.title,
      message: params.message,
      type: params.type,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedId: params.relatedId,
      actionData: params.actionData,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  // 알림 읽음 처리
  const markAsRead = (notificationId: string): void => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = (): void => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  // 알림 삭제
  const deleteNotification = (notificationId: string): void => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  // 모든 알림 삭제
  const clearAllNotifications = (): void => {
    setNotifications([]);
  };

  // 읽은 알림만 삭제
  const clearReadNotifications = (): void => {
    setNotifications((prev) =>
      prev.filter((notification) => !notification.isRead)
    );
  };

  // 알림 클릭 처리 (각 알림 타입에 따른 액션)
  const handleNotificationClick = (notification: Notification): void => {
    // 읽음 처리
    markAsRead(notification.id);

    // 타입별 액션 처리 (필요에 따라 라우팅 등)
    switch (notification.type) {
      case "routine_completed":
      case "routine_overdue":
        console.log("Navigate to routines tab", notification.relatedId);
        break;
      case "bill_added":
      case "bill_payment_due":
      case "payment_received":
        console.log("Navigate to bills tab", notification.relatedId);
        break;
      case "item_request":
      case "item_purchased":
        console.log("Navigate to items tab", notification.relatedId);
        break;
      case "poll_created":
      case "poll_ended":
      case "chat_message":
        console.log("Navigate to chat tab", notification.relatedId);
        break;
      default:
        console.log("Handle notification:", notification.id);
    }
  };

  return {
    notifications,
    unreadCount,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    clearReadNotifications,
    handleNotificationClick,
    getNotificationIcon,
    getRelativeTime,
  };
}
