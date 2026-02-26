/**
 * useModalScrollLock Hook 테스트
 * Source uses position:fixed approach when isOpen=true.
 * When isOpen=false the effect returns early without touching body styles.
 * Cleanup restores all styles to '' when the effect re-runs or unmounts.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useModalScrollLock } from '@shared/hooks/useModalScrollLock';

describe('useModalScrollLock', () => {
  beforeEach(() => {
    // Reset body styles before each test
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
  });

  it('should set body overflow to hidden when isOpen is true', () => {
    renderHook(() => useModalScrollLock(true));

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should set body position to fixed when isOpen is true', () => {
    renderHook(() => useModalScrollLock(true));

    expect(document.body.style.position).toBe('fixed');
  });

  it('should not modify body styles when isOpen is false', () => {
    renderHook(() => useModalScrollLock(false));

    // When false the effect returns early without changing styles
    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.position).toBe('');
  });

  it('should restore body overflow to empty string when isOpen changes from true to false', () => {
    const { rerender } = renderHook(
      ({ isOpen }) => useModalScrollLock(isOpen),
      { initialProps: { isOpen: true } }
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender({ isOpen: false });

    expect(document.body.style.overflow).toBe('');
  });

  it('should restore body position to empty string when isOpen changes from true to false', () => {
    const { rerender } = renderHook(
      ({ isOpen }) => useModalScrollLock(isOpen),
      { initialProps: { isOpen: true } }
    );

    expect(document.body.style.position).toBe('fixed');

    rerender({ isOpen: false });

    expect(document.body.style.position).toBe('');
  });

  it('should set body overflow to hidden when isOpen changes from false to true', () => {
    const { rerender } = renderHook(
      ({ isOpen }) => useModalScrollLock(isOpen),
      { initialProps: { isOpen: false } }
    );

    expect(document.body.style.overflow).toBe('');

    rerender({ isOpen: true });

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should toggle body overflow correctly multiple times', () => {
    const { rerender } = renderHook(
      ({ isOpen }) => useModalScrollLock(isOpen),
      { initialProps: { isOpen: false } }
    );

    // 첫 번째 토글: false -> true
    rerender({ isOpen: true });
    expect(document.body.style.overflow).toBe('hidden');

    // 두 번째 토글: true -> false
    rerender({ isOpen: false });
    expect(document.body.style.overflow).toBe('');

    // 세 번째 토글: false -> true
    rerender({ isOpen: true });
    expect(document.body.style.overflow).toBe('hidden');

    // 네 번째 토글: true -> false
    rerender({ isOpen: false });
    expect(document.body.style.overflow).toBe('');
  });

  it('should restore body overflow on unmount when modal was open', () => {
    const { unmount } = renderHook(() => useModalScrollLock(true));

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('');
  });

  it('should not change body overflow on unmount when modal was closed', () => {
    const { unmount } = renderHook(() => useModalScrollLock(false));

    expect(document.body.style.overflow).toBe('');

    unmount();

    expect(document.body.style.overflow).toBe('');
  });

  it('should handle rapid state changes', () => {
    const { rerender } = renderHook(
      ({ isOpen }) => useModalScrollLock(isOpen),
      { initialProps: { isOpen: false } }
    );

    // 빠른 상태 변경
    rerender({ isOpen: true });
    rerender({ isOpen: false });
    rerender({ isOpen: true });
    rerender({ isOpen: false });
    rerender({ isOpen: true });

    // 마지막 상태가 true이므로 hidden이어야 함
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should work correctly with multiple hook instances (last one wins)', () => {
    // 첫 번째 모달
    const { rerender: rerender1 } = renderHook(
      ({ isOpen }) => useModalScrollLock(isOpen),
      { initialProps: { isOpen: false } }
    );

    // 두 번째 모달
    const { rerender: rerender2 } = renderHook(
      ({ isOpen }) => useModalScrollLock(isOpen),
      { initialProps: { isOpen: false } }
    );

    // 첫 번째 모달 열기
    rerender1({ isOpen: true });
    expect(document.body.style.overflow).toBe('hidden');

    // 두 번째 모달 열기
    rerender2({ isOpen: true });
    expect(document.body.style.overflow).toBe('hidden');

    // 첫 번째 모달 닫기 (두 번째가 아직 열려있음)
    rerender1({ isOpen: false });
    // Note: 이 훅은 여러 모달을 관리하지 않으므로 마지막 실행된 훅의 상태를 따름
    expect(document.body.style.overflow).toBe('');

    // 두 번째 모달 닫기
    rerender2({ isOpen: false });
    expect(document.body.style.overflow).toBe('');
  });

  it('should preserve body overflow value when same state is set multiple times', () => {
    const { rerender } = renderHook(
      ({ isOpen }) => useModalScrollLock(isOpen),
      { initialProps: { isOpen: true } }
    );

    expect(document.body.style.overflow).toBe('hidden');

    // 같은 상태로 여러 번 리렌더
    rerender({ isOpen: true });
    rerender({ isOpen: true });
    rerender({ isOpen: true });

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should restore empty string when modal closes', () => {
    const { rerender } = renderHook(
      ({ isOpen }) => useModalScrollLock(isOpen),
      { initialProps: { isOpen: true } }
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender({ isOpen: false });
    expect(document.body.style.overflow).toBe('');
  });

  it('should handle initial isOpen true state', () => {
    renderHook(() => useModalScrollLock(true));

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should cleanup properly after unmount in various states', () => {
    // 상태 true로 시작
    const { unmount: unmount1 } = renderHook(() => useModalScrollLock(true));
    unmount1();
    expect(document.body.style.overflow).toBe('');

    // 상태 false로 시작
    const { unmount: unmount2 } = renderHook(() => useModalScrollLock(false));
    unmount2();
    expect(document.body.style.overflow).toBe('');
  });
});
