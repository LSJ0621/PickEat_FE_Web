/**
 * API Client 테스트
 * Axios 인터셉터 및 토큰 갱신 로직을 테스트합니다.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { apiClient } from '@shared/api/client';
import { ENDPOINTS } from '@shared/api/endpoints';
import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000';

const ORIGINAL_HREF = 'http://localhost:8080';

describe('API Client', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Reset location href before each test to avoid pollution between tests
    window.location.href = ORIGINAL_HREF;
  });

  afterEach(() => {
    server.resetHandlers();
    // Restore location href after each test
    window.location.href = ORIGINAL_HREF;
  });

  describe('Request Interceptor', () => {
    it('should add Authorization header when token exists in localStorage', async () => {
      const mockToken = 'mock-jwt-token';
      localStorage.setItem('token', mockToken);

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.AUTH.ME}`, ({ request }) => {
          const authHeader = request.headers.get('Authorization');
          expect(authHeader).toBe(`Bearer ${mockToken}`);
          return HttpResponse.json({ email: 'test@example.com', name: 'Test User' });
        })
      );

      await apiClient.get(ENDPOINTS.AUTH.ME);
    });

    it('should not add Authorization header when token does not exist', async () => {
      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.AUTH.LOGIN}`, ({ request }) => {
          const authHeader = request.headers.get('Authorization');
          expect(authHeader).toBeNull();
          return HttpResponse.json({ token: 'new-token' });
        })
      );

      await apiClient.post(ENDPOINTS.AUTH.LOGIN, { email: 'test@example.com', password: 'password' });
    });
  });

  describe('Response Interceptor - Token Refresh', () => {
    it('should refresh token on 401 response for non-auth endpoints', async () => {
      const oldToken = 'old-token';
      const newToken = 'new-refreshed-token';
      localStorage.setItem('token', oldToken);

      let requestCount = 0;

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.AUTH.ME}`, ({ request }) => {
          requestCount++;
          const authHeader = request.headers.get('Authorization');

          // First request with old token returns 401
          if (requestCount === 1) {
            expect(authHeader).toBe(`Bearer ${oldToken}`);
            return HttpResponse.json(
              { message: '인증이 필요합니다.' },
              { status: 401 }
            );
          }

          // Second request (retry) with new token should succeed
          expect(authHeader).toBe(`Bearer ${newToken}`);
          return HttpResponse.json({ email: 'test@example.com', name: 'Test User' });
        }),
        http.post(`${BASE_URL}${ENDPOINTS.AUTH.REFRESH}`, () => {
          return HttpResponse.json({ token: newToken });
        })
      );

      const response = await apiClient.get(ENDPOINTS.AUTH.ME);

      expect(requestCount).toBe(2);
      expect(response.data.email).toBe('test@example.com');
      expect(localStorage.getItem('token')).toBe(newToken);
    });

    it('should redirect to /login when token refresh fails', async () => {
      localStorage.setItem('token', 'invalid-token');

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.AUTH.ME}`, () => {
          return HttpResponse.json(
            { message: '인증이 필요합니다.' },
            { status: 401 }
          );
        }),
        http.post(`${BASE_URL}${ENDPOINTS.AUTH.REFRESH}`, () => {
          return HttpResponse.json(
            { message: '유효하지 않은 토큰입니다.' },
            { status: 401 }
          );
        })
      );

      try {
        await apiClient.get(ENDPOINTS.AUTH.ME);
      } catch {
        // Expected to fail
      }

      // Source clears the token via Redux dispatch(logout()) which requires store injection.
      // Without injected store, only the redirect happens.
      expect(window.location.href).toBe('/login');
    });

    it('should not refresh token for auth endpoints', async () => {
      let refreshCalled = false;

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.AUTH.LOGIN}`, () => {
          return HttpResponse.json(
            { message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
            { status: 401 }
          );
        }),
        http.post(`${BASE_URL}${ENDPOINTS.AUTH.REFRESH}`, () => {
          refreshCalled = true;
          return HttpResponse.json({ token: 'new-token' });
        })
      );

      try {
        await apiClient.post(ENDPOINTS.AUTH.LOGIN, { email: 'wrong@example.com', password: 'wrong' });
      } catch {
        // Expected to fail
      }

      expect(refreshCalled).toBe(false);
    });

    it('should not retry request twice (check _retry flag)', async () => {
      localStorage.setItem('token', 'old-token');
      let requestCount = 0;

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.AUTH.ME}`, () => {
          requestCount++;
          return HttpResponse.json(
            { message: '인증이 필요합니다.' },
            { status: 401 }
          );
        }),
        http.post(`${BASE_URL}${ENDPOINTS.AUTH.REFRESH}`, () => {
          return HttpResponse.json(
            { message: '유효하지 않은 토큰입니다.' },
            { status: 401 }
          );
        })
      );

      try {
        await apiClient.get(ENDPOINTS.AUTH.ME);
      } catch {
        // Expected to fail
      }

      // Should only call ME endpoint once: original request (no retry when refresh fails)
      expect(requestCount).toBe(1);
    });
  });

  describe('Response Interceptor - Single Flight Token Refresh', () => {
    it('should only call refresh endpoint once when multiple requests fail simultaneously', async () => {
      localStorage.setItem('token', 'old-token');
      const newToken = 'new-refreshed-token';
      let refreshCallCount = 0;
      let meRequestCount = 0;
      let preferencesRequestCount = 0;

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.AUTH.ME}`, ({ request }) => {
          meRequestCount++;
          const authHeader = request.headers.get('Authorization');

          if (authHeader === `Bearer old-token`) {
            return HttpResponse.json(
              { message: '인증이 필요합니다.' },
              { status: 401 }
            );
          }

          return HttpResponse.json({ email: 'test@example.com', name: 'Test User' });
        }),
        http.get(`${BASE_URL}${ENDPOINTS.USER.PREFERENCES}`, ({ request }) => {
          preferencesRequestCount++;
          const authHeader = request.headers.get('Authorization');

          if (authHeader === `Bearer old-token`) {
            return HttpResponse.json(
              { message: '인증이 필요합니다.' },
              { status: 401 }
            );
          }

          return HttpResponse.json({ likes: [], dislikes: [] });
        }),
        http.post(`${BASE_URL}${ENDPOINTS.AUTH.REFRESH}`, () => {
          refreshCallCount++;
          return HttpResponse.json({ token: newToken });
        })
      );

      // Make two simultaneous requests that will both fail with 401
      const [response1, response2] = await Promise.all([
        apiClient.get(ENDPOINTS.AUTH.ME),
        apiClient.get(ENDPOINTS.USER.PREFERENCES),
      ]);

      expect(refreshCallCount).toBe(1); // Should only refresh once
      expect(meRequestCount).toBe(2); // Original + retry
      expect(preferencesRequestCount).toBe(2); // Original + retry
      expect(response1.data.email).toBe('test@example.com');
      expect(response2.data.likes).toEqual([]);
      expect(localStorage.getItem('token')).toBe(newToken);
    });
  });

  describe('General Request Handling', () => {
    it('should handle successful GET requests', async () => {
      localStorage.setItem('token', 'valid-token');

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.AUTH.ME}`, () => {
          return HttpResponse.json({ email: 'test@example.com', name: 'Test User' });
        })
      );

      const response = await apiClient.get(ENDPOINTS.AUTH.ME);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('email');
    });

    it('should handle successful POST requests', async () => {
      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.AUTH.LOGIN}`, () => {
          return HttpResponse.json({ token: 'mock-jwt-token' });
        })
      );

      const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, {
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
    });

    it('should handle error responses correctly', async () => {
      await expect(
        apiClient.post(ENDPOINTS.AUTH.LOGIN, {
          email: 'wrong@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toBeDefined();
    });
  });

  describe('Client Configuration', () => {
    it('should have correct baseURL', () => {
      expect(apiClient.defaults.baseURL).toBe(BASE_URL);
    });

    it('should have withCredentials enabled', () => {
      expect(apiClient.defaults.withCredentials).toBe(true);
    });

    it('should have timeout configured', () => {
      expect(apiClient.defaults.timeout).toBe(30000);
    });
  });
});
