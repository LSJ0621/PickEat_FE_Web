/**
 * role 유틸리티 테스트
 * 관리자 역할 체크 동작 검증
 */

import { isAdminRole, isSuperAdmin, canAccessSettings, ADMIN_ROLES } from '@shared/utils/role';

describe('isAdminRole', () => {
  it('ADMIN → true', () => {
    expect(isAdminRole('ADMIN')).toBe(true);
  });

  it('SUPER_ADMIN → true', () => {
    expect(isAdminRole('SUPER_ADMIN')).toBe(true);
  });

  it('USER → false', () => {
    expect(isAdminRole('USER')).toBe(false);
  });

  it('빈 문자열 → false', () => {
    expect(isAdminRole('')).toBe(false);
  });

  it('undefined → false', () => {
    expect(isAdminRole(undefined)).toBe(false);
  });

  it('소문자 admin → false (대소문자 구분)', () => {
    expect(isAdminRole('admin')).toBe(false);
  });
});

describe('isSuperAdmin', () => {
  it('SUPER_ADMIN → true', () => {
    expect(isSuperAdmin('SUPER_ADMIN')).toBe(true);
  });

  it('ADMIN → false', () => {
    expect(isSuperAdmin('ADMIN')).toBe(false);
  });

  it('undefined → false', () => {
    expect(isSuperAdmin(undefined)).toBe(false);
  });
});

describe('canAccessSettings', () => {
  it('SUPER_ADMIN → true', () => {
    expect(canAccessSettings('SUPER_ADMIN')).toBe(true);
  });

  it('ADMIN → false (SUPER_ADMIN만 접근 가능)', () => {
    expect(canAccessSettings('ADMIN')).toBe(false);
  });

  it('undefined → false', () => {
    expect(canAccessSettings(undefined)).toBe(false);
  });
});

describe('ADMIN_ROLES', () => {
  it('ADMIN과 SUPER_ADMIN 포함', () => {
    expect(ADMIN_ROLES).toContain('ADMIN');
    expect(ADMIN_ROLES).toContain('SUPER_ADMIN');
    expect(ADMIN_ROLES).toHaveLength(2);
  });
});
