import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { decodeJwt, getUserRoleFromToken } from '@/utils/jwt';
import { STORAGE_KEYS } from '@/utils/constants';

describe('decodeJwt', () => {
  it('should decode a valid JWT token', () => {
    // Valid JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImV4cCI6MTcwNDEwMDgwMCwiaWF0IjoxNzA0MDk3MjAwfQ.signature
    const payload = {
      email: 'test@example.com',
      role: 'user',
      exp: 1704100800,
      iat: 1704097200,
    };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;

    const result = decodeJwt(token);
    expect(result).toEqual(payload);
  });

  it('should return null for null token', () => {
    expect(decodeJwt(null)).toBeNull();
  });

  it('should return null for empty token', () => {
    expect(decodeJwt('')).toBeNull();
  });

  it('should return null for invalid token format', () => {
    expect(decodeJwt('invalid')).toBeNull();
    expect(decodeJwt('invalid.token')).toBeNull();
  });

  it('should handle base64url encoding (- and _)', () => {
    const payload = {
      email: 'test@example.com',
      role: 'admin',
      exp: 1704100800,
      iat: 1704097200,
    };
    const base64 = btoa(JSON.stringify(payload));
    const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_');
    const token = `header.${base64url}.signature`;

    const result = decodeJwt(token);
    expect(result?.email).toBe('test@example.com');
    expect(result?.role).toBe('admin');
  });

  it('should return null for malformed JSON in payload', () => {
    const token = `header.${btoa('invalid json')}.signature`;
    expect(decodeJwt(token)).toBeNull();
  });

  it('should handle UTF-8 characters in payload', () => {
    const payload = {
      email: '테스트@example.com',
      role: 'user',
      exp: 1704100800,
      iat: 1704097200,
    };
    // Use TextEncoder to properly encode UTF-8 to base64
    const payloadString = JSON.stringify(payload);
    const utf8Bytes = new TextEncoder().encode(payloadString);
    const base64 = btoa(String.fromCharCode(...utf8Bytes));
    const token = `header.${base64}.signature`;

    const result = decodeJwt(token);
    expect(result?.email).toBe('테스트@example.com');
  });

  it('should handle token with missing payload section', () => {
    const token = 'header..signature';
    expect(decodeJwt(token)).toBeNull();
  });
});

describe('getUserRoleFromToken', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return role from valid token in localStorage', () => {
    const payload = {
      email: 'test@example.com',
      role: 'admin',
      exp: 1704100800,
      iat: 1704097200,
    };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);

    expect(getUserRoleFromToken()).toBe('admin');
  });

  it('should return null when no token in localStorage', () => {
    expect(getUserRoleFromToken()).toBeNull();
  });

  it('should return null for invalid token in localStorage', () => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, 'invalid.token.format');
    expect(getUserRoleFromToken()).toBeNull();
  });

  it('should return null when token has no role', () => {
    const payload = {
      email: 'test@example.com',
      exp: 1704100800,
      iat: 1704097200,
    };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);

    expect(getUserRoleFromToken()).toBeNull();
  });

  it('should handle different role values', () => {
    const roles = ['user', 'admin', 'moderator', 'guest'];

    roles.forEach((role) => {
      const payload = {
        email: 'test@example.com',
        role,
        exp: 1704100800,
        iat: 1704097200,
      };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);

      expect(getUserRoleFromToken()).toBe(role);
      localStorage.clear();
    });
  });

  it('should return null for empty role', () => {
    const payload = {
      email: 'test@example.com',
      role: '',
      exp: 1704100800,
      iat: 1704097200,
    };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);

    expect(getUserRoleFromToken()).toBeNull();
  });
});
