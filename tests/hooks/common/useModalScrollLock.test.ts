/**
 * useModalScrollLock Hook 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useModalScrollLock } from '@/hooks/common/useModalScrollLock';

describe('useModalScrollLock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset body overflow before each test
    document.body.style.overflow = '';
  });

  it('should set body overflow to hidden when isOpen is true', () => {
    renderHook(() => useModalScrollLock(true));

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should not set body overflow when isOpen is false', () => {
    renderHook(() => useModalScrollLock(false));

    expect(document.body.style.overflow).toBe('');
  });

  it('should restore body overflow when isOpen changes from true to false', () => {
    const { rerender } = renderHook(
      ({ isOpen }) => useModalScrollLock(isOpen),
      { initialProps: { isOpen: true } }
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender({ isOpen: false });

    expect(document.body.style.overflow).toBe('');
  });

  it('should set body overflow when isOpen changes from false to true', () => {
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

  it('should restore empty string when modal closes (not other values)', () => {
    // 사전에 body overflow를 다른 값으로 설정
    document.body.style.overflow = 'auto';

    const { rerender } = renderHook(
      ({ isOpen }) => useModalScrollLock(isOpen),
      { initialProps: { isOpen: false } }
    );

    // isOpen이 false일 때는 빈 문자열로 설정
    expect(document.body.style.overflow).toBe('');

    rerender({ isOpen: true });
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
