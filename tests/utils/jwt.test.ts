/**
 * jwt 유틸리티 테스트
 * JWT 토큰 디코딩 및 만료 확인 동작 검증
 */

import { decodeJwt, getUserRoleFromToken } from '@shared/utils/jwt';
import { STORAGE_KEYS } from '@shared/utils/constants';

/** 테스트용 JWT 토큰 생성 (서명은 무의미한 더미) */
function createMockJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const encodedPayload = btoa(JSON.stringify(payload));
  return `${header}.${encodedPayload}.dummy-signature`;
}

const FUTURE_EXP = Math.floor(Date.now() / 1000) + 3600; // 1시간 후
const PAST_EXP = Math.floor(Date.now() / 1000) - 3600; // 1시간 전 (만료)

describe('decodeJwt', () => {
  it('유효한 JWT → payload 반환', () => {
    const payload = {
      sub: 1,
      email: 'test@example.com',
      role: 'USER',
      exp: FUTURE_EXP,
      iat: 1000000000,
    };
    const token = createMockJwt(payload);
    expect(decodeJwt(token)).toEqual(payload);
  });

  it('null 토큰 → null 반환', () => {
    expect(decodeJwt(null)).toBeNull();
  });

  it('빈 문자열 → null 반환', () => {
    expect(decodeJwt('')).toBeNull();
  });

  it('점(.) 구분자 없는 토큰 → null 반환', () => {
    expect(decodeJwt('not-a-jwt-token')).toBeNull();
  });

  it('payload가 유효하지 않은 Base64 → null 반환', () => {
    expect(decodeJwt('header.!!!invalid!!!.signature')).toBeNull();
  });

  it('만료된 토큰도 디코딩 성공 — exp 값으로 만료 여부 확인 가능', () => {
    const expiredPayload = {
      sub: 1,
      email: 'test@example.com',
      role: 'USER',
      exp: PAST_EXP,
      iat: PAST_EXP - 3600,
    };
    const token = createMockJwt(expiredPayload);
    const decoded = decodeJwt(token);

    expect(decoded).not.toBeNull();
    // exp * 1000(ms)이 현재 시각보다 과거 → 만료 확인 가능
    expect(decoded!.exp * 1000).toBeLessThan(Date.now());
  });

  it('ADMIN 역할 토큰 → role 필드 정상 파싱', () => {
    const token = createMockJwt({
      sub: 2,
      email: 'admin@example.com',
      role: 'ADMIN',
      exp: FUTURE_EXP,
      iat: 1,
    });
    const decoded = decodeJwt(token);
    expect(decoded?.role).toBe('ADMIN');
  });
});

describe('getUserRoleFromToken', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('localStorage에 토큰 없음 → null 반환', () => {
    expect(getUserRoleFromToken()).toBeNull();
  });

  it('USER 역할 토큰 → "USER" 반환', () => {
    const token = createMockJwt({
      sub: 1,
      email: 'user@example.com',
      role: 'USER',
      exp: FUTURE_EXP,
      iat: 1,
    });
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    expect(getUserRoleFromToken()).toBe('USER');
  });

  it('ADMIN 역할 토큰 → "ADMIN" 반환', () => {
    const token = createMockJwt({
      sub: 2,
      email: 'admin@example.com',
      role: 'ADMIN',
      exp: FUTURE_EXP,
      iat: 1,
    });
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    expect(getUserRoleFromToken()).toBe('ADMIN');
  });

  it('잘못된 토큰 형식 → null 반환', () => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, 'not-a-valid-jwt');
    expect(getUserRoleFromToken()).toBeNull();
  });

  it('만료된 토큰도 localStorage에 있으면 role 반환 (만료 판단은 호출자 책임)', () => {
    const token = createMockJwt({
      sub: 1,
      email: 'user@example.com',
      role: 'USER',
      exp: PAST_EXP,
      iat: 1,
    });
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    // decodeJwt는 만료를 거부하지 않으므로 role을 반환
    expect(getUserRoleFromToken()).toBe('USER');
  });
});
