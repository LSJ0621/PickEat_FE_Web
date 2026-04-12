/**
 * useOnboarding 테스트
 * 온보딩 상태 관리, 스텝 이동, 완료/스킵, localStorage, CustomEvent 검증
 */

import { renderHook, act } from '@testing-library/react';
import { useOnboarding } from '@features/onboarding/hooks/useOnboarding';
import { STORAGE_KEYS } from '@shared/utils/constants';

// Redux dispatch 모킹
const mockDispatch = vi.fn(() => ({ unwrap: () => Promise.resolve() }));

vi.mock('@app/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: vi.fn((selector) => selector({ userData: { addresses: { isDirty: false }, preferences: { isDirty: false } } })),
}));

describe('useOnboarding', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    localStorage.clear();
  });

  it('초기 상태 — isOpen false, currentStep 0', () => {
    const { result } = renderHook(() => useOnboarding());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.currentStep).toBe(0);
    expect(result.current.totalSteps).toBe(5);
  });

  it('checkOnboarding — localStorage에 완료 키 없으면 온보딩 열기', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.checkOnboarding();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.currentStep).toBe(0);
  });

  it('checkOnboarding — localStorage에 완료 키 있으면 온보딩 열지 않음', () => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.checkOnboarding();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('nextStep — 다음 스텝으로 이동 (최대값 초과 방지)', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.checkOnboarding();
    });

    act(() => {
      result.current.nextStep();
    });
    expect(result.current.currentStep).toBe(1);

    act(() => {
      result.current.nextStep();
    });
    expect(result.current.currentStep).toBe(2);

    // 최대 4까지 (totalSteps - 1)
    act(() => {
      result.current.nextStep();
      result.current.nextStep();
      result.current.nextStep();
      result.current.nextStep(); // 이미 4이므로 4 유지
    });
    expect(result.current.currentStep).toBe(4);
  });

  it('prevStep — 이전 스텝으로 이동 (0 미만 방지)', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.checkOnboarding();
    });

    // 먼저 2로 이동
    act(() => {
      result.current.nextStep();
      result.current.nextStep();
    });
    expect(result.current.currentStep).toBe(2);

    act(() => {
      result.current.prevStep();
    });
    expect(result.current.currentStep).toBe(1);

    act(() => {
      result.current.prevStep();
    });
    expect(result.current.currentStep).toBe(0);

    // 0 미만 방지
    act(() => {
      result.current.prevStep();
    });
    expect(result.current.currentStep).toBe(0);
  });

  it('complete — localStorage에 완료 저장 + 모달 닫기 + Redux 무효화', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.checkOnboarding();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.complete();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.currentStep).toBe(0);
    expect(localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED)).toBe('true');
    // invalidateAddresses + invalidatePreferences dispatch 호출
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });

  it('skip — localStorage에 완료 저장 + 모달 닫기 (Redux 무효화 없음)', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.checkOnboarding();
    });

    act(() => {
      result.current.skip();
    });

    expect(result.current.isOpen).toBe(false);
    expect(localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED)).toBe('true');
    // skip에서는 dispatch 호출 없음
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('openOnboarding CustomEvent — 이벤트 발생 시 온보딩 열기', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      window.dispatchEvent(new Event('openOnboarding'));
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.currentStep).toBe(0);
  });
});
