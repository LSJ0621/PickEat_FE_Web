/**
 * 관리자 API 서비스
 */

import apiClient from '@shared/api/client';
import { ENDPOINTS } from '@shared/api/endpoints';
import type {
  DashboardSummary,
  RecentActivities,
  TrendData,
  TrendPeriod,
  TrendType,
  AdminUserListQuery,
  AdminUserListResponse,
  AdminUserDetail,
  AdminUserPlaceListQuery,
  AdminUserPlaceListResponse,
  AdminUserPlaceListItem,
  UpdateUserPlaceByAdminRequest,
} from '@features/admin/types';

export const adminService = {
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const response = await apiClient.get<DashboardSummary>(ENDPOINTS.ADMIN.DASHBOARD.SUMMARY);
    return response.data;
  },

  getRecentActivities: async (): Promise<RecentActivities> => {
    const response = await apiClient.get<RecentActivities>(
      ENDPOINTS.ADMIN.DASHBOARD.RECENT_ACTIVITIES
    );
    return response.data;
  },

  getTrends: async (period: TrendPeriod = '7d', type: TrendType = 'all'): Promise<TrendData> => {
    const response = await apiClient.get<TrendData>(ENDPOINTS.ADMIN.DASHBOARD.TRENDS, {
      params: { period, type },
    });
    return response.data;
  },

  // User Management
  getUsers: async (query: AdminUserListQuery): Promise<AdminUserListResponse> => {
    const response = await apiClient.get<AdminUserListResponse>(ENDPOINTS.ADMIN.USERS, {
      params: query,
    });
    return response.data;
  },

  getUserDetail: async (id: number): Promise<AdminUserDetail> => {
    const response = await apiClient.get<AdminUserDetail>(ENDPOINTS.ADMIN.USER_DETAIL(id));
    return response.data;
  },

  deactivateUser: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.patch<{ success: boolean; message: string }>(
      ENDPOINTS.ADMIN.USER_DEACTIVATE(id)
    );
    return response.data;
  },

  activateUser: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.patch<{ success: boolean; message: string }>(
      ENDPOINTS.ADMIN.USER_ACTIVATE(id)
    );
    return response.data;
  },

  // User Place Management
  getUserPlaces: async (query: AdminUserPlaceListQuery): Promise<AdminUserPlaceListResponse> => {
    const response = await apiClient.get<AdminUserPlaceListResponse>(ENDPOINTS.ADMIN.USER_PLACES, {
      params: query,
    });
    return response.data;
  },

  getUserPlaceDetail: async (id: number): Promise<AdminUserPlaceListItem> => {
    const response = await apiClient.get<AdminUserPlaceListItem>(
      ENDPOINTS.ADMIN.USER_PLACE_DETAIL(id)
    );
    return response.data;
  },

  approveUserPlace: async (id: number): Promise<{ id: number; status: string }> => {
    const response = await apiClient.patch<{ id: number; status: string }>(
      ENDPOINTS.ADMIN.USER_PLACE_APPROVE(id)
    );
    return response.data;
  },

  rejectUserPlace: async (
    id: number,
    reason: string
  ): Promise<{ id: number; status: string }> => {
    const response = await apiClient.patch<{ id: number; status: string }>(
      ENDPOINTS.ADMIN.USER_PLACE_REJECT(id),
      { reason }
    );
    return response.data;
  },

  updateUserPlace: async (id: number, data: UpdateUserPlaceByAdminRequest): Promise<AdminUserPlaceListItem> => {
    const formData = new FormData();

    if (data.version !== undefined) {
      formData.append('version', data.version.toString());
    }
    if (data.name) {
      formData.append('name', data.name);
    }
    if (data.address) {
      formData.append('address', data.address);
    }
    if (data.latitude !== undefined) {
      formData.append('latitude', data.latitude.toString());
    }
    if (data.longitude !== undefined) {
      formData.append('longitude', data.longitude.toString());
    }
    if (data.phoneNumber) {
      formData.append('phoneNumber', data.phoneNumber);
    }
    if (data.category) {
      formData.append('category', data.category);
    }
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.openingHours) {
      formData.append('openingHours', data.openingHours);
    }

    // menuTypes 배열 추가
    if (data.menuTypes) {
      data.menuTypes.forEach((menuType) => {
        formData.append('menuTypes', menuType);
      });
    }

    // 유지할 기존 사진 URL
    if (data.existingPhotos) {
      data.existingPhotos.forEach((url) => {
        formData.append('existingPhotos', url);
      });
    }

    // 새로 업로드할 이미지 파일
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await apiClient.patch<AdminUserPlaceListItem>(ENDPOINTS.ADMIN.USER_PLACE_UPDATE(id), formData);
    return response.data;
  },
};
