/**
 * 관리자 역할 체크 유틸리티
 */

export const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

/**
 * 사용자 역할이 관리자 권한을 가지는지 확인
 */
export const isAdminRole = (role: string | undefined): role is AdminRole => {
  return ADMIN_ROLES.includes(role as AdminRole);
};

/**
 * 사용자 역할이 슈퍼 관리자인지 확인
 */
export const isSuperAdmin = (role?: string): boolean => role === 'SUPER_ADMIN';

/**
 * 설정 메뉴 접근 권한 확인 (SUPER_ADMIN만 접근 가능)
 */
export const canAccessSettings = (role?: string): boolean => isSuperAdmin(role);
