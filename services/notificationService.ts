import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationType, Notification, CreateNotificationParams } from '@/types/notification.types';

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

// ============================================
// Firestore 알림 관리
// ============================================

/**
 * Firestore에 알림 생성
 */
export async function createNotification(
  userId: string,
  teamId: string,
  params: CreateNotificationParams
): Promise<string | null> {
  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('@/config/firebaseConfig');

    const notificationData = {
      user_id: userId,
      team_id: teamId,
      title: params.title,
      message: params.message,
      type: params.type,
      related_id: params.relatedId || null,
      action_data: params.actionData || null,
      is_read: false,
      created_at: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'notifications'), notificationData);

    if (__DEV__) {
      console.log('✅ [Notification] Created:', docRef.id);
    }

    return docRef.id;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

/**
 * 사용자의 알림 목록 가져오기
 */
export async function getUserNotifications(
  userId: string,
  teamId?: string
): Promise<Notification[]> {
  try {
    const { collection, query, where, getDocs, Timestamp } = await import('firebase/firestore');
    const { db } = await import('@/config/firebaseConfig');

    // 단순 쿼리 (인덱스 불필요 - 정렬은 클라이언트에서)
    const q = query(
      collection(db, 'notifications'),
      where('user_id', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // 팀 필터링 (클라이언트 사이드)
      if (teamId && data.team_id !== teamId) {
        return;
      }

      notifications.push({
        id: doc.id,
        title: data.title,
        message: data.message,
        type: data.type as NotificationType,
        is_read: data.is_read || false,
        created_at: data.created_at instanceof Timestamp
          ? data.created_at.toDate().toISOString()
          : new Date().toISOString(),
        related_id: data.related_id,
        action_data: data.action_data,
        team_id: data.team_id,
        user_id: data.user_id,
      });
    });

    // 클라이언트 사이드 정렬 (최신순)
    notifications.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (__DEV__) {
      console.log(`✅ [Notification] Loaded ${notifications.length} notifications for user ${userId}`);
    }

    return notifications;
  } catch (error) {
    console.error('Failed to get user notifications:', error);
    return [];
  }
}

/**
 * 알림을 읽음 처리
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('@/config/firebaseConfig');

    await updateDoc(doc(db, 'notifications', notificationId), {
      is_read: true,
    });

    if (__DEV__) {
      console.log('✅ [Notification] Marked as read:', notificationId);
    }

    return true;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return false;
  }
}

/**
 * 모든 알림을 읽음 처리
 */
export async function markAllNotificationsAsRead(
  userId: string,
  teamId?: string
): Promise<boolean> {
  try {
    const { collection, query, where, getDocs, writeBatch } = await import('firebase/firestore');
    const { db } = await import('@/config/firebaseConfig');

    // 단순 쿼리
    const q = query(
      collection(db, 'notifications'),
      where('user_id', '==', userId),
      where('is_read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();

      // 팀 필터링 (클라이언트 사이드)
      if (teamId && data.team_id !== teamId) {
        return;
      }

      batch.update(docSnapshot.ref, { is_read: true });
    });

    await batch.commit();

    if (__DEV__) {
      console.log(`✅ [Notification] Marked ${querySnapshot.size} notifications as read`);
    }

    return true;
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    return false;
  }
}

/**
 * 알림 삭제
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    const { db } = await import('@/config/firebaseConfig');

    await deleteDoc(doc(db, 'notifications', notificationId));

    if (__DEV__) {
      console.log('✅ [Notification] Deleted:', notificationId);
    }

    return true;
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return false;
  }
}

/**
 * 읽은 알림 모두 삭제
 */
export async function deleteReadNotifications(
  userId: string,
  teamId?: string
): Promise<boolean> {
  try {
    const { collection, query, where, getDocs, writeBatch } = await import('firebase/firestore');
    const { db } = await import('@/config/firebaseConfig');

    // 단순 쿼리
    const q = query(
      collection(db, 'notifications'),
      where('user_id', '==', userId),
      where('is_read', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();

      // 팀 필터링 (클라이언트 사이드)
      if (teamId && data.team_id !== teamId) {
        return;
      }

      batch.delete(docSnapshot.ref);
    });

    await batch.commit();

    if (__DEV__) {
      console.log(`✅ [Notification] Deleted ${querySnapshot.size} read notifications`);
    }

    return true;
  } catch (error) {
    console.error('Failed to delete read notifications:', error);
    return false;
  }
}

/**
 * 모든 알림 삭제
 */
export async function deleteAllNotifications(
  userId: string,
  teamId?: string
): Promise<boolean> {
  try {
    const { collection, query, where, getDocs, writeBatch } = await import('firebase/firestore');
    const { db } = await import('@/config/firebaseConfig');

    // 단순 쿼리
    const q = query(
      collection(db, 'notifications'),
      where('user_id', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();

      // 팀 필터링 (클라이언트 사이드)
      if (teamId && data.team_id !== teamId) {
        return;
      }

      batch.delete(docSnapshot.ref);
    });

    await batch.commit();

    if (__DEV__) {
      console.log(`✅ [Notification] Deleted ${querySnapshot.size} notifications`);
    }

    return true;
  } catch (error) {
    console.error('Failed to delete all notifications:', error);
    return false;
  }
}

/**
 * 알림 실시간 구독
 */
export function subscribeToUserNotifications(
  userId: string,
  teamId: string | undefined,
  callback: (notifications: Notification[]) => void
): () => void {
  const setupSubscription = async () => {
    try {
      const { collection, query, where, onSnapshot, Timestamp } = await import('firebase/firestore');
      const { db } = await import('@/config/firebaseConfig');

      // 단순 쿼리 (인덱스 불필요 - 정렬은 클라이언트에서)
      const q = query(
        collection(db, 'notifications'),
        where('user_id', '==', userId)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notifications: Notification[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          // 팀 필터링 (클라이언트 사이드)
          if (teamId && data.team_id !== teamId) {
            return;
          }

          notifications.push({
            id: doc.id,
            title: data.title,
            message: data.message,
            type: data.type as NotificationType,
            is_read: data.is_read || false,
            created_at: data.created_at instanceof Timestamp
              ? data.created_at.toDate().toISOString()
              : new Date().toISOString(),
            related_id: data.related_id,
            action_data: data.action_data,
            team_id: data.team_id,
            user_id: data.user_id,
          });
        });

        // 클라이언트 사이드 정렬 (최신순)
        notifications.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        callback(notifications);

        if (__DEV__) {
          console.log(`🔄 [Notification] Subscription updated: ${notifications.length} notifications`);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('Failed to setup notification subscription:', error);
      return () => {};
    }
  };

  let unsubscribe: (() => void) | null = null;

  setupSubscription().then((unsub) => {
    unsubscribe = unsub;
  });

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}
