/**
 * 공지사항 관련 타입 정의
 */

export type NotificationType = 'NOTICE' | 'UPDATE' | 'EVENT' | 'MAINTENANCE';
export type NotificationStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  content: string;
  status: NotificationStatus;
  isPinned: boolean;
  viewCount: number;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdBy: {
    id: number;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationRequest {
  type: NotificationType;
  title: string;
  content: string;
  status?: NotificationStatus;
  isPinned?: boolean;
  scheduledAt?: string;
}

export interface UpdateNotificationRequest extends Partial<CreateNotificationRequest> {}

export interface NotificationListResponse {
  items: Notification[];
  pageInfo: {
    page: number;
    limit: number;
    totalCount: number;
    hasNext: boolean;
  };
}
