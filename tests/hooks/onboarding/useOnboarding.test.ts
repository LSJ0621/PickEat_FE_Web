/**
 * useOnboarding Hook 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnboarding } from '@/hooks/onboarding/useOnboarding';
import { STORAGE_KEYS } from '@/utils/constants';

describe('useOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('초기 상태', () => {
    it('should initialize with showOnboarding false', () => {
      const { result } = renderHook(() => useOnboarding());

      expect(result.current.showOnboarding).toBe(false);
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useOnboarding());

      expect(typeof result.current.openOnboarding).toBe('function');
      expect(typeof result.current.closeOnboarding).toBe('function');
      expect(typeof result.current.checkNeedsOnboarding).toBe('function');
    });
  });

  describe('openOnboarding', () => {
    it('should set showOnboarding to true', () => {
      const { result } = renderHook(() => useOnboarding());

      expect(result.current.showOnboarding).toBe(false);

      act(() => {
        result.current.openOnboarding();
      });

      expect(result.current.showOnboarding).toBe(true);
    });

    it('should be callable multiple times', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.openOnboarding();
      });

      expect(result.current.showOnboarding).toBe(true);

      act(() => {
        result.current.openOnboarding();
      });

      expect(result.current.showOnboarding).toBe(true);
    });
  });

  describe('closeOnboarding', () => {
    it('should set showOnboarding to false', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.openOnboarding();
      });

      expect(result.current.showOnboarding).toBe(true);

      act(() => {
        result.current.closeOnboarding();
      });

      expect(result.current.showOnboarding).toBe(false);
    });

    it('should remove NEEDS_ONBOARDING from localStorage', () => {
      localStorage.setItem(STORAGE_KEYS.NEEDS_ONBOARDING, 'true');

      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.closeOnboarding();
      });

      expect(localStorage.getItem(STORAGE_KEYS.NEEDS_ONBOARDING)).toBeNull();
    });

    it('should handle localStorage errors silently', () => {
      const { result } = renderHook(() => useOnboarding());

      const originalRemoveItem = Storage.prototype.removeItem;
      Storage.prototype.removeItem = vi.fn(() => {
        throw new Error('localStorage error');
      });

      act(() => {
        result.current.closeOnboarding();
      });

      expect(result.current.showOnboarding).toBe(false);

      Storage.prototype.removeItem = originalRemoveItem;
    });

    it('should be callable when already closed', () => {
      const { result } = renderHook(() => useOnboarding());

      expect(result.current.showOnboarding).toBe(false);

      act(() => {
        result.current.closeOnboarding();
      });

      expect(result.current.showOnboarding).toBe(false);
    });
  });

  describe('checkNeedsOnboarding', () => {
    it('should return true when NEEDS_ONBOARDING is "true"', () => {
      localStorage.setItem(STORAGE_KEYS.NEEDS_ONBOARDING, 'true');

      const { result } = renderHook(() => useOnboarding());

      const needsOnboarding = result.current.checkNeedsOnboarding();

      expect(needsOnboarding).toBe(true);
    });

    it('should return false when NEEDS_ONBOARDING is not set', () => {
      const { result } = renderHook(() => useOnboarding());

      const needsOnboarding = result.current.checkNeedsOnboarding();

      expect(needsOnboarding).toBe(false);
    });

    it('should return false when NEEDS_ONBOARDING is "false"', () => {
      localStorage.setItem(STORAGE_KEYS.NEEDS_ONBOARDING, 'false');

      const { result } = renderHook(() => useOnboarding());

      const needsOnboarding = result.current.checkNeedsOnboarding();

      expect(needsOnboarding).toBe(false);
    });

    it('should return false when NEEDS_ONBOARDING has other value', () => {
      localStorage.setItem(STORAGE_KEYS.NEEDS_ONBOARDING, 'something-else');

      const { result } = renderHook(() => useOnboarding());

      const needsOnboarding = result.current.checkNeedsOnboarding();

      expect(needsOnboarding).toBe(false);
    });

    it('should handle localStorage errors and return false', () => {
      const { result } = renderHook(() => useOnboarding());

      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = vi.fn(() => {
        throw new Error('localStorage error');
      });

      const needsOnboarding = result.current.checkNeedsOnboarding();

      expect(needsOnboarding).toBe(false);

      Storage.prototype.getItem = originalGetItem;
    });
  });

  describe('실제 사용 시나리오', () => {
    it('should handle complete onboarding flow', () => {
      localStorage.setItem(STORAGE_KEYS.NEEDS_ONBOARDING, 'true');

      const { result } = renderHook(() => useOnboarding());

      // Check if onboarding is needed
      const needsOnboarding = result.current.checkNeedsOnboarding();
      expect(needsOnboarding).toBe(true);

      // Open onboarding
      act(() => {
        result.current.openOnboarding();
      });

      expect(result.current.showOnboarding).toBe(true);

      // User completes onboarding, close it
      act(() => {
        result.current.closeOnboarding();
      });

      expect(result.current.showOnboarding).toBe(false);
      expect(localStorage.getItem(STORAGE_KEYS.NEEDS_ONBOARDING)).toBeNull();
    });

    it('should handle user closing and reopening onboarding', () => {
      const { result } = renderHook(() => useOnboarding());

      // Open onboarding
      act(() => {
        result.current.openOnboarding();
      });

      expect(result.current.showOnboarding).toBe(true);

      // User closes it
      act(() => {
        result.current.closeOnboarding();
      });

      expect(result.current.showOnboarding).toBe(false);

      // User opens it again
      act(() => {
        result.current.openOnboarding();
      });

      expect(result.current.showOnboarding).toBe(true);
    });

    it('should handle case when no onboarding is needed', () => {
      const { result } = renderHook(() => useOnboarding());

      const needsOnboarding = result.current.checkNeedsOnboarding();

      expect(needsOnboarding).toBe(false);
      expect(result.current.showOnboarding).toBe(false);
    });
  });

  describe('함수 안정성', () => {
    it('should maintain function references across re-renders', () => {
      const { result, rerender } = renderHook(() => useOnboarding());

      const openOnboardingRef = result.current.openOnboarding;
      const closeOnboardingRef = result.current.closeOnboarding;
      const checkNeedsOnboardingRef = result.current.checkNeedsOnboarding;

      rerender();

      expect(result.current.openOnboarding).toBe(openOnboardingRef);
      expect(result.current.closeOnboarding).toBe(closeOnboardingRef);
      expect(result.current.checkNeedsOnboarding).toBe(checkNeedsOnboardingRef);
    });
  });
});
