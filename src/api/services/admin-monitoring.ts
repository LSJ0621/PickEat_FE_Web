/**
 * 관리자 시스템 모니터링 API 서비스
 */

import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { ApiUsageResponse, EmailStats, MonitoringPeriod, StorageStats } from '@/types/admin-monitoring';

export const adminMonitoringService = {
  getApiUsage: async (period: MonitoringPeriod = '7d'): Promise<ApiUsageResponse> => {
    const response = await apiClient.get<ApiUsageResponse>(ENDPOINTS.ADMIN.MONITORING.API_USAGE, {
      params: { period },
    });
    return response.data;
  },

  getEmailStats: async (period: MonitoringPeriod = '7d'): Promise<EmailStats> => {
    const response = await apiClient.get<EmailStats>(ENDPOINTS.ADMIN.MONITORING.EMAIL, {
      params: { period },
    });
    return response.data;
  },

  getStorageStats: async (period: MonitoringPeriod = '7d'): Promise<StorageStats> => {
    const response = await apiClient.get<StorageStats>(ENDPOINTS.ADMIN.MONITORING.STORAGE, {
      params: { period },
    });
    return response.data;
  },
};
