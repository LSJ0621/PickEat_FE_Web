/**
 * 관리자 설정 관련 타입 정의
 * Backend DTO와 동기화됨: pick-eat_be/src/admin/settings/dto/
 */

export type AdminRole = 'ADMIN' | 'SUPER_ADMIN';

export interface AdminUser {
  id: number;
  email: string;
  name: string | null;
  role: AdminRole;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface PromoteAdminRequest {
  userId: number;
  role: AdminRole;
}

export interface WebhookThresholds {
  newBugReportEnabled: boolean;
  criticalBugAlertEnabled: boolean;
  dailySummaryEnabled: boolean;
}

export interface WebhookSettings {
  enabled: boolean;
  webhookUrl: string; // masked
  thresholds: WebhookThresholds;
}

export interface UpdateWebhookRequest {
  enabled?: boolean;
  webhookUrl?: string;
  thresholds?: Partial<WebhookThresholds>;
}

export interface MenuRecommendationSettings {
  maxRecommendationsPerDay: number;
  defaultCuisineTypes: string[];
  aiModelVersion: string;
}

export interface SecuritySettings {
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
}

export interface DataRetentionSettings {
  userDataRetentionDays: number;
  auditLogRetentionDays: number;
  deletedAccountRetentionDays: number;
}

export interface SystemSettings {
  menuRecommendation: MenuRecommendationSettings;
  security: SecuritySettings;
  dataRetention: DataRetentionSettings;
}

export interface UpdateSystemSettingsRequest {
  menuRecommendation?: Partial<MenuRecommendationSettings>;
  security?: Partial<SecuritySettings>;
  dataRetention?: Partial<DataRetentionSettings>;
}

// API Response types
// Note: Backend returns AdminListItemDto[] directly (array, not wrapped object)
export type AdminListResponse = AdminUser[];

export interface PromoteAdminResponse {
  message: string;
}

export interface DemoteAdminResponse {
  message: string;
}

export interface TestWebhookResponse {
  success: boolean;
  message: string;
}
