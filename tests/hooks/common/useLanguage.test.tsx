/**
 * useLanguage Hook Unit Tests
 *
 * Tests for useLanguage hook functionality including language switching,
 * authenticated/unauthenticated behavior, and API error handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useLanguage } from '@/hooks/common/useLanguage';
import { userService } from '@/api/services/user';
import authReducer, { setCredentials } from '@/store/slices/authSlice';
import agentReducer from '@/store/slices/agentSlice';
import i18n from '@/i18n/config';
import type { Language } from '@/types/common';

// Mock dependencies
vi.mock('@/api/services/user', () => ({
  userService: {
    updateUserLanguage: vi.fn(),
  },
}));

const mockErrorToast = vi.fn();
const mockSuccessToast = vi.fn();

vi.mock('@/hooks/common/useToast', () => ({
  useToast: () => ({
    error: mockErrorToast,
    success: mockSuccessToast,
  }),
}));

describe('useLanguage', () => {
  const createMockStore = (isAuthenticated = false) => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
        agent: agentReducer,
      },
      preloadedState: {
        auth: {
          user: isAuthenticated
            ? {
                id: 1,
                email: 'test@example.com',
                name: 'Test User',
                role: 'USER',
                address: null,
                latitude: null,
                longitude: null,
                preferences: null,
              }
            : null,
          isAuthenticated,
          loading: false,
          error: null,
          language: 'ko',
        },
        agent: {
          messages: [],
          isTyping: false,
          error: null,
        },
      },
    });
    return store;
  };

  const wrapper = (store: ReturnType<typeof createMockStore>) =>
    function TestWrapper({ children }: { children: React.ReactNode }) {
      return <Provider store={store}>{children}</Provider>;
    };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset i18n to Korean
    i18n.changeLanguage('ko');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should initialize with default language "ko"', () => {
      const store = createMockStore(false);
      const { result } = renderHook(() => useLanguage(), {
        wrapper: wrapper(store),
      });

      expect(result.current.currentLanguage).toBe('ko');
      expect(result.current.isKorean).toBe(true);
      expect(result.current.isEnglish).toBe(false);
    });

    it('should load language from localStorage if available', async () => {
      localStorage.setItem('i18nextLng', 'en');
      await i18n.changeLanguage('en');

      const store = createMockStore(false);
      const { result } = renderHook(() => useLanguage(), {
        wrapper: wrapper(store),
      });

      expect(result.current.currentLanguage).toBe('en');
      expect(result.current.isKorean).toBe(false);
      expect(result.current.isEnglish).toBe(true);
    });
  });

  describe('Language Change - Unauthenticated User', () => {
    it('should change language to English without API call', async () => {
      const store = createMockStore(false);
      const { result } = renderHook(() => useLanguage(), {
        wrapper: wrapper(store),
      });

      expect(result.current.currentLanguage).toBe('ko');

      await result.current.changeLanguage('en');

      await waitFor(() => {
        expect(result.current.currentLanguage).toBe('en');
      });

      expect(i18n.language).toBe('en');
      expect(userService.updateUserLanguage).not.toHaveBeenCalled();
    });

    it('should change language to Korean without API call', async () => {
      await i18n.changeLanguage('en');
      const store = createMockStore(false);
      const { result } = renderHook(() => useLanguage(), {
        wrapper: wrapper(store),
      });

      expect(result.current.currentLanguage).toBe('en');

      await result.current.changeLanguage('ko');

      await waitFor(() => {
        expect(result.current.currentLanguage).toBe('ko');
      });

      expect(i18n.language).toBe('ko');
      expect(userService.updateUserLanguage).not.toHaveBeenCalled();
    });

    it('should update Redux state when language changes', async () => {
      const store = createMockStore(false);
      const { result } = renderHook(() => useLanguage(), {
        wrapper: wrapper(store),
      });

      await result.current.changeLanguage('en');

      await waitFor(() => {
        expect(store.getState().auth.language).toBe('en');
      });
    });
  });

  describe('Language Change - Authenticated User', () => {
    it('should change language and call API successfully', async () => {
      vi.mocked(userService.updateUserLanguage).mockResolvedValueOnce(undefined);

      const store = createMockStore(true);
      const { result } = renderHook(() => useLanguage(), {
        wrapper: wrapper(store),
      });

      expect(result.current.currentLanguage).toBe('ko');

      await result.current.changeLanguage('en');

      await waitFor(() => {
        expect(result.current.currentLanguage).toBe('en');
      });

      expect(i18n.language).toBe('en');
      expect(userService.updateUserLanguage).toHaveBeenCalledWith('en');
      expect(userService.updateUserLanguage).toHaveBeenCalledTimes(1);
    });

    it('should still change UI language even if API fails (UX priority)', async () => {
      const apiError = new Error('API Error');
      vi.mocked(userService.updateUserLanguage).mockRejectedValueOnce(apiError);

      const store = createMockStore(true);
      const { result } = renderHook(() => useLanguage(), {
        wrapper: wrapper(store),
      });

      expect(result.current.currentLanguage).toBe('ko');

      await result.current.changeLanguage('en');

      await waitFor(() => {
        expect(result.current.currentLanguage).toBe('en');
      });

      // UI language should change regardless of API failure
      expect(i18n.language).toBe('en');
      expect(userService.updateUserLanguage).toHaveBeenCalledWith('en');
    });

    it('should show error toast when API fails but UI language changes', async () => {
      vi.mocked(userService.updateUserLanguage).mockRejectedValueOnce(
        new Error('Network error')
      );

      const store = createMockStore(true);
      const { result } = renderHook(() => useLanguage(), {
        wrapper: wrapper(store),
      });

      await result.current.changeLanguage('en');

      await waitFor(() => {
        expect(result.current.currentLanguage).toBe('en');
      });

      // UI should still work
      expect(i18n.language).toBe('en');
      // Error toast should have been called due to API failure
      expect(mockErrorToast).toHaveBeenCalled();
    });
  });

  describe('Helper Functions', () => {
    it('should correctly identify Korean language', () => {
      const store = createMockStore(false);
      const { result } = renderHook(() => useLanguage(), {
        wrapper: wrapper(store),
      });

      expect(result.current.isKorean).toBe(true);
      expect(result.current.isEnglish).toBe(false);
    });

    it('should correctly identify English language after change', async () => {
      const store = createMockStore(false);
      const { result } = renderHook(() => useLanguage(), {
        wrapper: wrapper(store),
      });

      await result.current.changeLanguage('en');

      await waitFor(() => {
        expect(result.current.isKorean).toBe(false);
        expect(result.current.isEnglish).toBe(true);
      });
    });
  });

  describe('Language Persistence', () => {
    it('should persist language change to localStorage', async () => {
      const store = createMockStore(false);
      const { result } = renderHook(() => useLanguage(), {
        wrapper: wrapper(store),
      });

      await result.current.changeLanguage('en');

      await waitFor(() => {
        const storedLang = localStorage.getItem('i18nextLng');
        expect(storedLang).toBe('en');
      });
    });

    it('should load persisted language on re-render', async () => {
      const store1 = createMockStore(false);
      const { result: result1 } = renderHook(() => useLanguage(), {
        wrapper: wrapper(store1),
      });

      await result1.current.changeLanguage('en');

      await waitFor(() => {
        expect(result1.current.currentLanguage).toBe('en');
      });

      // Simulate new page load with persisted language
      await i18n.changeLanguage('en');
      const store2 = createMockStore(false);
      const { result: result2 } = renderHook(() => useLanguage(), {
        wrapper: wrapper(store2),
      });

      expect(result2.current.currentLanguage).toBe('en');
      expect(result2.current.isEnglish).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid language changes', async () => {
      vi.mocked(userService.updateUserLanguage).mockResolvedValue(undefined);

      const store = createMockStore(true);
      const { result } = renderHook(() => useLanguage(), {
        wrapper: wrapper(store),
      });

      // Rapidly change languages
      await result.current.changeLanguage('en');
      await result.current.changeLanguage('ko');
      await result.current.changeLanguage('en');

      await waitFor(() => {
        expect(result.current.currentLanguage).toBe('en');
      });
    });

    it('should handle same language selection gracefully', async () => {
      const store = createMockStore(false);
      const { result } = renderHook(() => useLanguage(), {
        wrapper: wrapper(store),
      });

      const initialLang = result.current.currentLanguage;
      await result.current.changeLanguage(initialLang as Language);

      await waitFor(() => {
        expect(result.current.currentLanguage).toBe(initialLang);
      });
    });
  });
});
