/**
 * useInitialDataLoad 테스트
 * StrictMode 이중 실행 방지 / 경로 변경 재로드 / enabled=false 실행 방지 검증
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { useInitialDataLoad } from '@shared/hooks/useInitialDataLoad';

/**
 * MemoryRouter 래퍼 생성 헬퍼
 * 테스트 내에서 navigate 함수를 캡처하여 경로 변경 트리거에 활용
 */
function createRouterWrapper(initialPath: string) {
  let capturedNavigate: ((path: string) => void) | null = null;

  function NavigateCapture() {
    const navigate = useNavigate();
    React.useEffect(() => {
      capturedNavigate = navigate;
    }, [navigate]);
    return null;
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialPath]}>
        <NavigateCapture />
        {children}
      </MemoryRouter>
    );
  }

  return {
    Wrapper,
    getNavigate: () => capturedNavigate,
  };
}

describe('useInitialDataLoad', () => {
  describe('StrictMode 이중 실행 방지', () => {
    it('StrictMode에서도 loadFn은 1번만 호출됨', async () => {
      const loadFn = vi.fn().mockResolvedValue(undefined);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <React.StrictMode>
          <MemoryRouter>{children}</MemoryRouter>
        </React.StrictMode>
      );

      renderHook(() => useInitialDataLoad({ enabled: true, loadFn }), { wrapper });
      await act(async () => {});

      // StrictMode가 effect를 두 번 실행하더라도 hasInitializedRef로 인해 1번만 호출
      expect(loadFn).toHaveBeenCalledTimes(1);
    });

    it('StrictMode 없이도 loadFn은 1번만 호출됨', async () => {
      const loadFn = vi.fn().mockResolvedValue(undefined);
      const { Wrapper } = createRouterWrapper('/');

      renderHook(() => useInitialDataLoad({ enabled: true, loadFn }), { wrapper: Wrapper });
      await act(async () => {});

      expect(loadFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('경로 변경 시 재로드', () => {
    it('다른 경로로 이동 → loadFn 재호출', async () => {
      const loadFn = vi.fn().mockResolvedValue(undefined);
      const { Wrapper, getNavigate } = createRouterWrapper('/page1');

      renderHook(() => useInitialDataLoad({ enabled: true, loadFn }), { wrapper: Wrapper });
      await act(async () => {});

      // 초기 로드 1회 확인
      expect(loadFn).toHaveBeenCalledTimes(1);

      // 다른 경로로 이동
      await act(async () => {
        getNavigate()?.('/page2');
      });

      // 경로 변경 후 재로드
      expect(loadFn).toHaveBeenCalledTimes(2);
    });

    it('같은 경로로 이동 → loadFn 재호출 안 함', async () => {
      const loadFn = vi.fn().mockResolvedValue(undefined);
      const { Wrapper, getNavigate } = createRouterWrapper('/page1');

      renderHook(() => useInitialDataLoad({ enabled: true, loadFn }), { wrapper: Wrapper });
      await act(async () => {});

      expect(loadFn).toHaveBeenCalledTimes(1);

      // 같은 경로로 이동
      await act(async () => {
        getNavigate()?.('/page1');
      });

      // 경로가 변경되지 않았으므로 재호출 없음
      expect(loadFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('enabled false → 실행 안 함', () => {
    it('enabled false → loadFn 호출 안 함', async () => {
      const loadFn = vi.fn().mockResolvedValue(undefined);
      const { Wrapper } = createRouterWrapper('/');

      renderHook(() => useInitialDataLoad({ enabled: false, loadFn }), { wrapper: Wrapper });
      await act(async () => {});

      expect(loadFn).not.toHaveBeenCalled();
    });

    it('enabled false → true 변경 시 loadFn 호출', async () => {
      const loadFn = vi.fn().mockResolvedValue(undefined);
      let enabled = false;
      const { Wrapper } = createRouterWrapper('/');

      const { rerender } = renderHook(
        () => useInitialDataLoad({ enabled, loadFn }),
        { wrapper: Wrapper },
      );
      await act(async () => {});

      expect(loadFn).not.toHaveBeenCalled();

      // enabled를 true로 변경
      enabled = true;
      rerender();
      await act(async () => {});

      expect(loadFn).toHaveBeenCalledTimes(1);
    });
  });
});
