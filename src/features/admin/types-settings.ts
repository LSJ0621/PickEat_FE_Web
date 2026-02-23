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
  email: string;
  role: AdminRole;
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
