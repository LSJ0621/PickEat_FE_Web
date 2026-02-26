/**
 * Auth Slice Tests
 * Redux authSlice의 리듀서와 Thunk를 테스트합니다.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import authReducer, {
  setCredentials,
  updateUser,
  logout,
  setLoading,
  setError,
  initializeAuth,
  logoutAsync,
} from '@app/store/slices/authSlice';
import { setupStore } from '@tests/utils/renderWithProviders';
import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';
import { ENDPOINTS } from '@shared/api/endpoints';
import type { User } from '@shared/types/auth';

const BASE_URL = 'http://localhost:3000';

// Mock JWT token with role
const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiVVNFUiIsImV4cCI6OTk5OTk5OTk5OX0.test';
const mockAdminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6IkFETUlOIiwiZXhwIjo5OTk5OTk5OTk5fQ.test';

const mockUser: User = {
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER',
  address: '서울시 강남구',
  latitude: 37.5636,
  longitude: 126.9869,
  preferences: {
    likes: ['한식', '중식'],
    dislikes: ['매운 음식'],
    analysis: '한식과 중식을 선호합니다.',
  },
};

describe('authSlice', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
  });

  describe('initial state', () => {
    it('should have correct initial state when no token exists', () => {
      localStorage.clear();
      const state = authReducer(undefined, { type: '@@INIT' });
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set isAuthenticated to false when no token exists in localStorage', () => {
      localStorage.clear();
      const state = authReducer(undefined, { type: '@@INIT' });
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });

  describe('setCredentials', () => {
    it('should set user credentials and authenticate user', () => {
      const state = authReducer(
        initialState,
        setCredentials({ user: mockUser, token: mockToken })
      );

      expect(state.user).toBeDefined();
      expect(state.user?.email).toBe('test@example.com');
      expect(state.user?.name).toBe('Test User');
      expect(state.user?.role).toBe('USER');
      expect(state.isAuthenticated).toBe(true);
      expect(localStorage.getItem('token')).toBe(mockToken);
    });

    it('should extract role from JWT token', () => {
      const userWithoutRole = { ...mockUser };
      delete userWithoutRole.role;

      const state = authReducer(
        initialState,
        setCredentials({ user: userWithoutRole, token: mockToken })
      );

      expect(state.user?.role).toBe('USER');
    });

    it('should handle admin role from JWT token', () => {
      const state = authReducer(
        initialState,
        setCredentials({ user: mockUser, token: mockAdminToken })
      );

      expect(state.user?.role).toBe('ADMIN');
    });

    it('should normalize coordinates correctly', () => {
      const userWithStringCoords = {
        ...mockUser,
        latitude: '37.5636' as unknown as number,
        longitude: '126.9869' as unknown as number,
      };

      const state = authReducer(
        initialState,
        setCredentials({ user: userWithStringCoords, token: mockToken })
      );

      expect(typeof state.user?.latitude).toBe('number');
      expect(typeof state.user?.longitude).toBe('number');
      expect(state.user?.latitude).toBe(37.5636);
      expect(state.user?.longitude).toBe(126.9869);
    });

    it('should handle null coordinates', () => {
      const userWithNullCoords = {
        ...mockUser,
        latitude: null,
        longitude: null,
      };

      const state = authReducer(
        initialState,
        setCredentials({ user: userWithNullCoords, token: mockToken })
      );

      expect(state.user?.latitude).toBeNull();
      expect(state.user?.longitude).toBeNull();
    });

    it('should handle null address', () => {
      const userWithNullAddress = {
        ...mockUser,
        address: null,
      };

      const state = authReducer(
        initialState,
        setCredentials({ user: userWithNullAddress, token: mockToken })
      );

      expect(state.user?.address).toBeNull();
    });

    it('should handle null preferences', () => {
      const userWithNullPreferences = {
        ...mockUser,
        preferences: null,
      };

      const state = authReducer(
        initialState,
        setCredentials({ user: userWithNullPreferences, token: mockToken })
      );

      expect(state.user?.preferences).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user name', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };

      const state = authReducer(stateWithUser, updateUser({ name: 'Updated Name' }));

      expect(state.user?.name).toBe('Updated Name');
      expect(state.user?.email).toBe(mockUser.email);
    });

    it('should update user address', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };

      const state = authReducer(
        stateWithUser,
        updateUser({ address: '서울시 서초구' })
      );

      expect(state.user?.address).toBe('서울시 서초구');
    });

    it('should update user coordinates', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };

      const state = authReducer(
        stateWithUser,
        updateUser({ latitude: 37.4979, longitude: 127.0276 })
      );

      expect(state.user?.latitude).toBe(37.4979);
      expect(state.user?.longitude).toBe(127.0276);
    });

    it('should update preferences', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };

      const newPreferences = {
        likes: ['일식', '양식'],
        dislikes: ['생선'],
        analysis: '일식과 양식을 선호합니다.',
      };

      const state = authReducer(
        stateWithUser,
        updateUser({ preferences: newPreferences })
      );

      expect(state.user?.preferences).toEqual(newPreferences);
    });

    it('should normalize string coordinates to numbers', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };

      const state = authReducer(
        stateWithUser,
        updateUser({
          latitude: '37.123' as unknown as number,
          longitude: '127.456' as unknown as number,
        })
      );

      expect(typeof state.user?.latitude).toBe('number');
      expect(typeof state.user?.longitude).toBe('number');
      expect(state.user?.latitude).toBe(37.123);
      expect(state.user?.longitude).toBe(127.456);
    });

    it('should handle null address update', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };

      const state = authReducer(stateWithUser, updateUser({ address: null }));

      expect(state.user?.address).toBeNull();
    });

    it('should not update anything if user is null', () => {
      const state = authReducer(
        initialState,
        updateUser({ name: 'New Name' })
      );

      expect(state.user).toBeNull();
    });

    it('should update multiple fields at once', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };

      const state = authReducer(
        stateWithUser,
        updateUser({
          name: 'Updated Name',
          address: '부산시 해운대구',
          latitude: 35.1586,
          longitude: 129.1603,
        })
      );

      expect(state.user?.name).toBe('Updated Name');
      expect(state.user?.address).toBe('부산시 해운대구');
      expect(state.user?.latitude).toBe(35.1586);
      expect(state.user?.longitude).toBe(129.1603);
    });
  });

  describe('logout', () => {
    it('should clear user and authentication state', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };
      localStorage.setItem('token', mockToken);

      const state = authReducer(stateWithUser, logout());

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should handle logout when already logged out', () => {
      const state = authReducer(initialState, logout());

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('should set loading to true', () => {
      const state = authReducer(initialState, setLoading(true));
      expect(state.loading).toBe(true);
    });

    it('should set loading to false', () => {
      const loadingState = { ...initialState, loading: true };
      const state = authReducer(loadingState, setLoading(false));
      expect(state.loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const state = authReducer(initialState, setError('에러가 발생했습니다.'));
      expect(state.error).toBe('에러가 발생했습니다.');
    });

    it('should clear error with null', () => {
      const errorState = { ...initialState, error: '이전 에러' };
      const state = authReducer(errorState, setError(null));
      expect(state.error).toBeNull();
    });
  });

  describe('initializeAuth thunk', () => {
    it('should initialize auth successfully with valid token', async () => {
      localStorage.setItem('token', mockToken);

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.AUTH.ME}`, () => {
          return HttpResponse.json(mockUser);
        }),
        http.get(`${BASE_URL}${ENDPOINTS.USER.PREFERENCES}`, () => {
          return HttpResponse.json({
            preferences: mockUser.preferences,
          });
        })
      );

      const store = setupStore();
      await store.dispatch(initializeAuth());

      const state = store.getState().auth;
      expect(state.user).toBeDefined();
      expect(state.user?.email).toBe('test@example.com');
      expect(state.user?.role).toBe('USER');
      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should initialize auth without preferences when preferences API fails', async () => {
      localStorage.setItem('token', mockToken);

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.AUTH.ME}`, () => {
          return HttpResponse.json(mockUser);
        }),
        http.get(`${BASE_URL}${ENDPOINTS.USER.PREFERENCES}`, () => {
          return HttpResponse.json(
            { message: '취향 정보를 불러올 수 없습니다.' },
            { status: 500 }
          );
        })
      );

      const store = setupStore();
      await store.dispatch(initializeAuth());

      const state = store.getState().auth;
      expect(state.user).toBeDefined();
      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
    });

    it('should return null when no token exists', async () => {
      const store = setupStore();
      const result = await store.dispatch(initializeAuth());

      expect(result.payload).toBeNull();
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should return null and remove token when token is malformed', async () => {
      // Source does not check token expiration client-side; it checks if token can be decoded.
      // A malformed JWT (not decodable) causes initializeAuth to remove token and return null.
      const malformedToken = 'not.a.valid.jwt.token';
      localStorage.setItem('token', malformedToken);

      const store = setupStore();
      const result = await store.dispatch(initializeAuth());

      expect(result.payload).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should reject and remove token when getMe fails', async () => {
      localStorage.setItem('token', mockToken);

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.AUTH.ME}`, () => {
          return HttpResponse.json(
            { message: '인증에 실패했습니다.' },
            { status: 401 }
          );
        })
      );

      const store = setupStore();
      const result = await store.dispatch(initializeAuth());

      expect(result.type).toBe('auth/initialize/rejected');
      expect(localStorage.getItem('token')).toBeNull();
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
    });

    it('should set loading state during initialization', async () => {
      localStorage.setItem('token', mockToken);

      const store = setupStore();
      const promise = store.dispatch(initializeAuth());

      // Check loading state before resolution
      let state = store.getState().auth;
      expect(state.loading).toBe(true);

      await promise;

      // Check loading state after resolution
      state = store.getState().auth;
      expect(state.loading).toBe(false);
    });
  });

  describe('logoutAsync thunk', () => {
    it('should call logout API and clear state', async () => {
      localStorage.setItem('token', mockToken);

      const store = setupStore({
        auth: {
          user: mockUser,
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      });

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.AUTH.LOGOUT}`, () => {
          return HttpResponse.json({ message: '로그아웃 되었습니다.' });
        })
      );

      await store.dispatch(logoutAsync());

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should clear state even when logout API fails', async () => {
      localStorage.setItem('token', mockToken);

      const store = setupStore({
        auth: {
          user: mockUser,
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      });

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.AUTH.LOGOUT}`, () => {
          return HttpResponse.json(
            { message: '로그아웃 실패' },
            { status: 500 }
          );
        })
      );

      await store.dispatch(logoutAsync());

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should clear agent state when logging out', async () => {
      localStorage.setItem('token', mockToken);

      const store = setupStore({
        auth: {
          user: mockUser,
          isAuthenticated: true,
          loading: false,
          error: null,
        },
        agent: {
          menuRecommendations: [
            { condition: '매콤하게', menu: '김치찌개' },
            { condition: '구수하게', menu: '된장찌개' },
          ],
          menuRecommendationHistoryId: 123,
          menuRecommendationPrompt: '',
          menuRecommendationRequestAddress: null,
          menuRecommendationIntro: null,
          menuRecommendationClosing: null,
          isMenuRecommendationLoading: false,
          selectedMenu: '김치찌개',
          menuHistoryId: null,
          menuRequestAddress: null,
          searchAiRecommendationGroups: [],
          isSearchAiLoading: false,
          searchAiLoadingMenu: null,
          searchAiRetrying: false,
          communityAiRecommendationGroups: [],
          isCommunityAiLoading: false,
          communityAiLoadingMenu: null,
          communityAiRetrying: false,
          aiRecommendationGroups: [],
          isAiLoading: false,
          aiLoadingMenu: null,
          selectedPlace: null,
          showConfirmCard: false,
          hasMenuSelectionCompleted: false,
        },
      });

      await store.dispatch(logoutAsync());

      const agentState = store.getState().agent;
      expect(agentState.menuRecommendations).toEqual([]);
      expect(agentState.selectedMenu).toBeNull();
    });
  });

  describe('complex state transitions', () => {
    it('should handle login -> update -> logout flow', () => {
      // Login
      let state = authReducer(
        initialState,
        setCredentials({ user: mockUser, token: mockToken })
      );
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.email).toBe('test@example.com');

      // Update user
      state = authReducer(state, updateUser({ name: 'Updated Name' }));
      expect(state.user?.name).toBe('Updated Name');
      expect(state.isAuthenticated).toBe(true);

      // Logout
      state = authReducer(state, logout());
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should handle multiple user updates', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };

      let state = authReducer(stateWithUser, updateUser({ name: 'Name 1' }));
      expect(state.user?.name).toBe('Name 1');

      state = authReducer(state, updateUser({ address: 'Address 1' }));
      expect(state.user?.address).toBe('Address 1');
      expect(state.user?.name).toBe('Name 1');

      state = authReducer(state, updateUser({ latitude: 35.0, longitude: 125.0 }));
      expect(state.user?.latitude).toBe(35.0);
      expect(state.user?.longitude).toBe(125.0);
      expect(state.user?.address).toBe('Address 1');
      expect(state.user?.name).toBe('Name 1');
    });

    it('should preserve user data when setting loading or error', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };

      let state = authReducer(stateWithUser, setLoading(true));
      expect(state.user).toEqual(mockUser);
      expect(state.loading).toBe(true);

      state = authReducer(state, setError('에러 발생'));
      expect(state.user).toEqual(mockUser);
      expect(state.error).toBe('에러 발생');
      expect(state.loading).toBe(true);
    });
  });
});
