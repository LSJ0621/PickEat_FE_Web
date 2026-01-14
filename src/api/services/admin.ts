/**
 * 관리자 API 서비스
 */

import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  DashboardSummary,
  RecentActivities,
  TrendData,
  TrendPeriod,
  TrendType,
  AdminUserListQuery,
  AdminUserListResponse,
  AdminUserDetail,
} from '@/types/admin';

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
};
