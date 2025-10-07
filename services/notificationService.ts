import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationType } from '@/types/notification.types';

// 알림 표시 방식 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * 알림 권한 요청
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    // Expo Go에서는 expo-notifications가 제한적으로 동작
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      } catch (error) {
        console.log('Running in Expo Go - notification channel setup skipped');
        return null;
      }
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      } catch (error) {
        console.log('Running in Expo Go - notification permissions unavailable');
        return null;
      }
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return null;
    }

    return 'local-notifications-enabled';
  } catch (error) {
    console.log('Notifications not available in Expo Go. Build a development build for full notification support.');
    return null;
  }
}

/**
 * 로컬 알림 전송
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any,
  trigger?: Notifications.NotificationTriggerInput
) {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: trigger || null, // null이면 즉시 전송
    });

    return notificationId;
  } catch (error) {
    console.log('Local notification not sent - Expo Go limitation');
    return null;
  }
}

/**
 * 알림 타입에 따른 제목과 메시지 포맷
 */
export function getNotificationContent(
  type: NotificationType,
  title: string,
  message: string
) {
  const icons: Record<NotificationType, string> = {
    routine_completed: '✅',
    routine_overdue: '⏰',
    bill_added: '💰',
    bill_payment_due: '⚠️',
    payment_received: '✅',
    item_request: '📦',
    item_purchased: '🛒',
    item_update: '📦',
    poll_created: '📊',
    poll_ended: '📊',
    chat_message: '💬',
    announcement: '📢',
    system: 'ℹ️',
  };

  return {
    title: `${icons[type]} ${title}`,
    body: message,
  };
}

/**
 * 모든 예약된 알림 취소
 */
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}

/**
 * 특정 알림 취소
 */
export async function cancelNotification(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

/**
 * 배지 숫자 설정
 */
export async function setBadgeCount(count: number) {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    // Expo Go에서는 badge count 설정이 제한적
    // Development build에서 정상 작동
  }
}

/**
 * 배지 초기화
 */
export async function clearBadge() {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    // Expo Go에서는 badge count 설정이 제한적
    // Development build에서 정상 작동
  }
}
