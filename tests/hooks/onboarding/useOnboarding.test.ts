/**
 * useOnboarding Hook 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnboarding } from '@features/onboarding/hooks/useOnboarding';
import { STORAGE_KEYS } from '@shared/utils/constants';

describe('useOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('초기 상태', () => {
    it('should initialize with isOpen false', () => {
      const { result } = renderHook(() => useOnboarding());

      expect(result.current.isOpen).toBe(false);
    });

    it('should initialize with currentStep 0', () => {
      const { result } = renderHook(() => useOnboarding());

      expect(result.current.currentStep).toBe(0);
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useOnboarding());

      expect(typeof result.current.checkOnboarding).toBe('function');
      expect(typeof result.current.nextStep).toBe('function');
      expect(typeof result.current.prevStep).toBe('function');
      expect(typeof result.current.complete).toBe('function');
      expect(typeof result.current.skip).toBe('function');
    });

    it('should have correct totalSteps', () => {
      const { result } = renderHook(() => useOnboarding());

      expect(result.current.totalSteps).toBe(5);
    });
  });

  describe('checkOnboarding', () => {
    it('should open onboarding when ONBOARDING_COMPLETED is not set', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.checkOnboarding();
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.currentStep).toBe(0);
    });

    it('should not open onboarding when ONBOARDING_COMPLETED is set', () => {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');

      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.checkOnboarding();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('nextStep', () => {
    it('should increment currentStep', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.checkOnboarding();
      });

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('should not exceed totalSteps - 1', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.checkOnboarding();
      });

      // Advance to the last step
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.nextStep();
        });
      }

      expect(result.current.currentStep).toBe(result.current.totalSteps - 1);
    });
  });

  describe('prevStep', () => {
    it('should decrement currentStep', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.checkOnboarding();
        result.current.nextStep();
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(2);

      act(() => {
        result.current.prevStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('should not go below 0', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.checkOnboarding();
        result.current.prevStep();
        result.current.prevStep();
      });

      expect(result.current.currentStep).toBe(0);
    });
  });

  describe('complete', () => {
    it('should close onboarding', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.checkOnboarding();
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.complete();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('should set ONBOARDING_COMPLETED in localStorage', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.complete();
      });

      expect(localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED)).toBe('true');
    });

    it('should reset currentStep to 0', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.checkOnboarding();
        result.current.nextStep();
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(2);

      act(() => {
        result.current.complete();
      });

      expect(result.current.currentStep).toBe(0);
    });
  });

  describe('skip', () => {
    it('should close onboarding', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.checkOnboarding();
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.skip();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('should set ONBOARDING_COMPLETED in localStorage', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.skip();
      });

      expect(localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED)).toBe('true');
    });
  });

  describe('실제 사용 시나리오', () => {
    it('should handle complete onboarding flow', () => {
      const { result } = renderHook(() => useOnboarding());

      // Check if onboarding is needed (no completed flag)
      act(() => {
        result.current.checkOnboarding();
      });

      expect(result.current.isOpen).toBe(true);

      // User goes through steps
      act(() => {
        result.current.nextStep();
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(2);

      // User completes onboarding
      act(() => {
        result.current.complete();
      });

      expect(result.current.isOpen).toBe(false);
      expect(localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED)).toBe('true');
    });

    it('should not show onboarding when already completed', () => {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');

      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.checkOnboarding();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('should handle user skipping onboarding', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.checkOnboarding();
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.skip();
      });

      expect(result.current.isOpen).toBe(false);
      expect(localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED)).toBe('true');
    });
  });

  describe('함수 안정성', () => {
    it('should maintain function references across re-renders', () => {
      const { result, rerender } = renderHook(() => useOnboarding());

      const checkOnboardingRef = result.current.checkOnboarding;
      const nextStepRef = result.current.nextStep;
      const prevStepRef = result.current.prevStep;
      const completeRef = result.current.complete;
      const skipRef = result.current.skip;

      rerender();

      expect(result.current.checkOnboarding).toBe(checkOnboardingRef);
      expect(result.current.nextStep).toBe(nextStepRef);
      expect(result.current.prevStep).toBe(prevStepRef);
      expect(result.current.complete).toBe(completeRef);
      expect(result.current.skip).toBe(skipRef);
    });
  });
});
