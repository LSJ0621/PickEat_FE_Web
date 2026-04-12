/**
 * useHistoryMenuActions 테스트
 * 메뉴 선택/취소 상태 전이 검증
 */

import { renderHook, act } from '@testing-library/react';
import { useHistoryMenuActions } from '@features/history/hooks/useHistoryMenuActions';

describe('useHistoryMenuActions', () => {
  it('초기 상태 — selectedMenu null, showConfirmCard false', () => {
    const { result } = renderHook(() => useHistoryMenuActions());
    expect(result.current.selectedMenu).toBeNull();
    expect(result.current.showConfirmCard).toBe(false);
  });

  it('handleMenuClick — 메뉴 선택 + showConfirmCard true', () => {
    const { result } = renderHook(() => useHistoryMenuActions());
    act(() => { result.current.handleMenuClick('김치찌개'); });
    expect(result.current.selectedMenu).toBe('김치찌개');
    expect(result.current.showConfirmCard).toBe(true);
  });

  it('handleMenuClick — 다른 메뉴 재선택 시 selectedMenu 업데이트', () => {
    const { result } = renderHook(() => useHistoryMenuActions());
    act(() => { result.current.handleMenuClick('김치찌개'); });
    act(() => { result.current.handleMenuClick('된장찌개'); });
    expect(result.current.selectedMenu).toBe('된장찌개');
    expect(result.current.showConfirmCard).toBe(true);
  });

  it('handleCancel — showConfirmCard false', () => {
    const { result } = renderHook(() => useHistoryMenuActions());
    act(() => { result.current.handleMenuClick('김치찌개'); });
    act(() => { result.current.handleCancel(); });
    expect(result.current.showConfirmCard).toBe(false);
  });

  it('handleCancel — selectedMenu와 showConfirmCard 모두 초기화', () => {
    const { result } = renderHook(() => useHistoryMenuActions());
    act(() => { result.current.handleMenuClick('김치찌개'); });
    expect(result.current.selectedMenu).toBe('김치찌개');
    expect(result.current.showConfirmCard).toBe(true);
    act(() => { result.current.handleCancel(); });
    expect(result.current.showConfirmCard).toBe(false);
    expect(result.current.selectedMenu).toBeNull();
  });
});
