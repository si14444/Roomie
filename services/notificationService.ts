import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationType } from '@/types/notification.types';

// 알림 표시 방식 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * 푸시 알림 권한 요청 및 토큰 받기
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    // Android 알림 채널 설정
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      } catch (error) {
        if (__DEV__) console.log('Running in Expo Go - notification channel setup skipped');
        return null;
      }
    }

    // 알림 권한 요청
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      } catch (error) {
        if (__DEV__) console.log('Running in Expo Go - notification permissions unavailable');
        return null;
      }
    }

    if (finalStatus !== 'granted') {
      if (__DEV__) console.log('Notification permissions not granted');
      return null;
    }

    // Expo 푸시 토큰 받기 (서버에서 푸시 알림 보낼 때 필요)
    try {
      const projectId = '8ce75df6-3bc3-47ac-98f8-09ad9e96cb54'; // app.json의 extra.eas.projectId
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      if (__DEV__) {
        console.log('✅ [Push Token] Expo Push Token:', tokenData.data);
      }

      return tokenData.data;
    } catch (error) {
      // Expo Go에서는 실제 푸시 토큰을 받을 수 없음
      // Development Build나 Production Build에서만 작동
      if (__DEV__) {
        console.log('⚠️ [Push Token] Expo Go에서는 푸시 알림이 제한됩니다.');
        console.log('⚠️ [Push Token] Development Build를 사용하세요: npx expo run:ios 또는 npx expo run:android');
      }
      return 'local-notifications-enabled'; // 로컬 알림은 사용 가능
    }
  } catch (error) {
    if (__DEV__) {
      console.log('Notifications not available in Expo Go. Build a development build for full notification support.');
    }
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

/**
 * Expo Push API를 통해 푸시 알림 전송
 */
export async function sendPushNotification(
  pushToken: string,
  title: string,
  body: string,
  data?: any
): Promise<boolean> {
  try {
    const message = {
      to: pushToken,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
      channelId: 'default',
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();

    if (__DEV__) {
      console.log('✅ [Push Notification] Sent:', result);
    }

    return result.data?.status === 'ok';
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return false;
  }
}

/**
 * 여러 사용자에게 푸시 알림 전송
 */
export async function sendPushNotifications(
  pushTokens: string[],
  title: string,
  body: string,
  data?: any
): Promise<void> {
  try {
    // Expo Push Token 형식인 것만 필터링
    const validTokens = pushTokens.filter(
      (token) => token && token.startsWith('ExponentPushToken[')
    );

    if (validTokens.length === 0) {
      if (__DEV__) {
        console.log('⚠️ [Push Notification] No valid push tokens found');
      }
      return;
    }

    const messages = validTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
      channelId: 'default',
    }));

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();

    if (__DEV__) {
      console.log(`✅ [Push Notification] Sent to ${validTokens.length} users:`, result);
    }
  } catch (error) {
    console.error('Failed to send push notifications:', error);
  }
}
