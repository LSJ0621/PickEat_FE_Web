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
  WebhookSettings,
  UpdateWebhookRequest,
  TestWebhookResponse,
  SystemSettings,
  UpdateSystemSettingsRequest,
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

  // Webhook Settings
  // GET /admin/settings/webhook returns WebhookSettingsDto
  getWebhookSettings: async (): Promise<WebhookSettings> => {
    const response = await apiClient.get<WebhookSettings>(ENDPOINTS.ADMIN.SETTINGS.WEBHOOK);
    return response.data;
  },

  // PATCH /admin/settings/webhook returns WebhookSettingsDto
  updateWebhookSettings: async (data: UpdateWebhookRequest): Promise<WebhookSettings> => {
    const response = await apiClient.patch<WebhookSettings>(
      ENDPOINTS.ADMIN.SETTINGS.WEBHOOK,
      data
    );
    return response.data;
  },

  // POST /admin/settings/webhook/test returns { success: boolean, message: string }
  testWebhook: async (): Promise<TestWebhookResponse> => {
    const response = await apiClient.post<TestWebhookResponse>(
      ENDPOINTS.ADMIN.SETTINGS.WEBHOOK_TEST
    );
    return response.data;
  },

  // System Settings
  // GET /admin/settings/system returns SystemSettingsDto
  getSystemSettings: async (): Promise<SystemSettings> => {
    const response = await apiClient.get<SystemSettings>(ENDPOINTS.ADMIN.SETTINGS.SYSTEM);
    return response.data;
  },

  // PATCH /admin/settings/system returns SystemSettingsDto
  updateSystemSettings: async (data: UpdateSystemSettingsRequest): Promise<SystemSettings> => {
    const response = await apiClient.patch<SystemSettings>(
      ENDPOINTS.ADMIN.SETTINGS.SYSTEM,
      data
    );
    return response.data;
  },
};
