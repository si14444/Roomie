export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  relatedId?: string; // 관련된 엔티티 ID (bill, routine, item 등)
  actionData?: Record<string, any>; // 알림 클릭 시 필요한 데이터
}

export type NotificationType =
  | "routine_completed" // 루틴 완료
  | "routine_overdue" // 루틴 지연
  | "bill_added" // 새 공과금 추가
  | "bill_payment_due" // 공과금 지불 마감
  | "payment_received" // 지불 완료
  | "item_request" // 물품 요청
  | "item_purchased" // 물품 구매 완료
  | "item_update" // 물품 수량 업데이트
  | "poll_created" // 새 투표 생성
  | "poll_ended" // 투표 종료
  | "chat_message" // 채팅 메시지
  | "system"; // 시스템 알림

export interface NotificationIcon {
  name: string;
  color: string;
  backgroundColor: string;
}

export interface CreateNotificationParams {
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: string;
  actionData?: Record<string, any>;
}
