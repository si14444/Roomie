import React, { createContext, useContext, ReactNode } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import {
  CreateNotificationParams,
  Notification,
} from "@/types/notification.types";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  createNotification: (params: CreateNotificationParams) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  clearReadNotifications: () => void;
  handleNotificationClick: (notification: Notification) => void;
  getNotificationIcon: (type: any) => {
    name: string;
    color: string;
    backgroundColor: string;
  };
  getRelativeTime: (dateString: string) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const notificationHook = useNotifications();

  return (
    <NotificationContext.Provider value={notificationHook}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
}
