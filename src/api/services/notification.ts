/**
 * 공지사항 관련 API 서비스
 */

import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  Notification,
  NotificationListResponse,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  NotificationStatus,
  NotificationType,
} from '@/types/notification';

export const notificationService = {
  /**
   * 공지사항 목록 조회 (관리자용)
   * @param params - 조회 파라미터
   * @returns 공지사항 목록 및 페이지 정보
   */
  getNotificationList: async (params: {
    page?: number;
    limit?: number;
    status?: NotificationStatus;
    type?: NotificationType;
  }): Promise<NotificationListResponse> => {
    const response = await apiClient.get<NotificationListResponse>(
      ENDPOINTS.ADMIN.NOTIFICATIONS,
      { params }
    );
    return response.data;
  },

  /**
   * 공지사항 상세 조회 (관리자용)
   * @param id - 공지사항 ID
   * @returns 공지사항 상세 정보
   */
  getNotificationDetail: async (id: number | string): Promise<Notification> => {
    const response = await apiClient.get<Notification>(
      ENDPOINTS.ADMIN.NOTIFICATION_DETAIL(id)
    );
    return response.data;
  },

  /**
   * 공지사항 생성
   * @param data - 공지사항 데이터
   * @returns 생성된 공지사항
   */
  createNotification: async (
    data: CreateNotificationRequest
  ): Promise<Notification> => {
    const response = await apiClient.post<Notification>(
      ENDPOINTS.ADMIN.NOTIFICATIONS,
      data
    );
    return response.data;
  },

  /**
   * 공지사항 수정
   * @param id - 공지사항 ID
   * @param data - 수정할 데이터
   * @returns 수정된 공지사항
   */
  updateNotification: async (
    id: number | string,
    data: UpdateNotificationRequest
  ): Promise<Notification> => {
    const response = await apiClient.patch<Notification>(
      ENDPOINTS.ADMIN.NOTIFICATION_DETAIL(id),
      data
    );
    return response.data;
  },

  /**
   * 공지사항 삭제
   * @param id - 공지사항 ID
   */
  deleteNotification: async (id: number | string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.ADMIN.NOTIFICATION_DETAIL(id));
  },
};
