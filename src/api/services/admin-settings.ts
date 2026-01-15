/**
 * 관리자 설정 API 서비스
 * Backend: pick-eat_be/src/admin/settings/admin-settings.controller.ts
 */

import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  AdminListResponse,
  PromoteAdminRequest,
  PromoteAdminResponse,
  DemoteAdminResponse,
} from '@/types/admin-settings';

export const adminSettingsService = {
  // Admin Management
  // GET /admin/settings/admins returns AdminListItemDto[] directly
  getAdminList: async (): Promise<AdminListResponse> => {
    const response = await apiClient.get<AdminListResponse>(ENDPOINTS.ADMIN.SETTINGS.ADMINS);
    return response.data;
  },

  // POST /admin/settings/admins returns { message: string }
  promoteAdmin: async (data: PromoteAdminRequest): Promise<PromoteAdminResponse> => {
    const response = await apiClient.post<PromoteAdminResponse>(
      ENDPOINTS.ADMIN.SETTINGS.ADMINS,
      data
    );
    return response.data;
  },

  // DELETE /admin/settings/admins/:id returns { message: string }
  demoteAdmin: async (id: number): Promise<DemoteAdminResponse> => {
    const response = await apiClient.delete<DemoteAdminResponse>(
      ENDPOINTS.ADMIN.SETTINGS.ADMIN_DETAIL(id)
    );
    return response.data;
  },
};
