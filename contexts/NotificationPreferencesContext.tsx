import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationType } from '@/types/notification.types';

export interface NotificationPreferences {
  // 전체 알림 on/off
  enabled: boolean;

  // 카테고리별 알림 설정
  routines: boolean;
  bills: boolean;
  items: boolean;
  chat: boolean;
  polls: boolean;
  system: boolean;

  // 개별 알림 타입별 설정
  routine_completed: boolean;
  routine_overdue: boolean;
  bill_added: boolean;
  bill_payment_due: boolean;
  payment_received: boolean;
  item_request: boolean;
  item_purchased: boolean;
  item_update: boolean;
  poll_created: boolean;
  poll_ended: boolean;
  chat_message: boolean;
  announcement: boolean;
}

interface NotificationPreferencesContextType {
  preferences: NotificationPreferences;
  updatePreference: (key: keyof NotificationPreferences, value: boolean) => Promise<void>;
  resetPreferences: () => Promise<void>;
  isNotificationEnabled: (type: NotificationType) => boolean;
}

const STORAGE_KEY = '@notification_preferences';

const defaultPreferences: NotificationPreferences = {
  enabled: true,
  routines: true,
  bills: true,
  items: true,
  chat: true,
  polls: true,
  system: true,
  routine_completed: true,
  routine_overdue: true,
  bill_added: true,
  bill_payment_due: true,
  payment_received: true,
  item_request: true,
  item_purchased: true,
  item_update: true,
  poll_created: true,
  poll_ended: true,
  chat_message: true,
  announcement: true,
};

const NotificationPreferencesContext = createContext<NotificationPreferencesContextType | undefined>(undefined);

export function NotificationPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);

  // 저장된 설정 불러오기
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  };

  const savePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    await savePreferences(newPreferences);
  };

  const resetPreferences = async () => {
    setPreferences(defaultPreferences);
    await savePreferences(defaultPreferences);
  };

  // 특정 알림 타입이 활성화되어 있는지 확인
  const isNotificationEnabled = (type: NotificationType): boolean => {
    // 전체 알림이 꺼져있으면 모두 비활성화
    if (!preferences.enabled) {
      return false;
    }

    // 카테고리 매핑
    const categoryMap: Record<string, keyof NotificationPreferences> = {
      routine_completed: 'routines',
      routine_overdue: 'routines',
      bill_added: 'bills',
      bill_payment_due: 'bills',
      payment_received: 'bills',
      item_request: 'items',
      item_purchased: 'items',
      item_update: 'items',
      poll_created: 'polls',
      poll_ended: 'polls',
      chat_message: 'chat',
      announcement: 'system',
      system: 'system',
    };

    const category = categoryMap[type];

    // 카테고리가 꺼져있으면 비활성화
    if (category && !preferences[category]) {
      return false;
    }

    // 개별 알림 타입 확인
    if (type in preferences) {
      return preferences[type as keyof NotificationPreferences] as boolean;
    }

    return true;
  };

  return (
    <NotificationPreferencesContext.Provider
      value={{
        preferences,
        updatePreference,
        resetPreferences,
        isNotificationEnabled,
      }}
    >
      {children}
    </NotificationPreferencesContext.Provider>
  );
}

export function useNotificationPreferences() {
  const context = useContext(NotificationPreferencesContext);
  if (!context) {
    throw new Error('useNotificationPreferences must be used within NotificationPreferencesProvider');
  }
  return context;
}
