/**
 * useConfirmModal 테스트 (showConfirmCard / menuRequestAddress 범위)
 * 전략 §4.1에 따라 내부 의존성(useModalScrollLock, useEscapeKey) 호출은 검증하지 않는다.
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import agentReducer from '@app/store/slices/agentSlice';
import { useConfirmModal } from '@features/agent/hooks/useConfirmModal';

vi.mock('@shared/hooks/useModalScrollLock', () => ({
  useModalScrollLock: () => {},
}));
vi.mock('@shared/hooks/useEscapeKey', () => ({
  useEscapeKey: () => {},
}));

type AgentPreload = {
  showConfirmCard?: boolean;
  menuRequestAddress?: string | null;
};

function createStore(overrides: AgentPreload = {}) {
  const store = configureStore({
    reducer: { agent: agentReducer },
  });
  if (overrides.showConfirmCard) {
    store.dispatch({ type: 'agent/setShowConfirmCard', payload: true });
  }
  if (overrides.menuRequestAddress !== undefined) {
    store.dispatch({
      type: 'agent/setSelectedMenu',
      payload: {
        menu: 'test',
        historyId: 1,
        requestAddress: overrides.menuRequestAddress,
      },
    });
  }
  return store;
}

function wrapper(store: ReturnType<typeof createStore>) {
  return function W({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe('useConfirmModal', () => {
  it('초기 상태 — showConfirmCard false', () => {
    const store = createStore();
    const { result } = renderHook(() => useConfirmModal({ handleCancel: vi.fn() }), {
      wrapper: wrapper(store),
    });
    expect(result.current.showConfirmCard).toBe(false);
  });

  it('Redux showConfirmCard=true → 반환 showConfirmCard true', () => {
    const store = createStore({ showConfirmCard: true });
    const { result } = renderHook(() => useConfirmModal({ handleCancel: vi.fn() }), {
      wrapper: wrapper(store),
    });
    expect(result.current.showConfirmCard).toBe(true);
  });

  it('Redux showConfirmCard false→true 전환 — 재렌더 후 반환값 true', () => {
    const store = createStore();
    const { result } = renderHook(() => useConfirmModal({ handleCancel: vi.fn() }), {
      wrapper: wrapper(store),
    });
    expect(result.current.showConfirmCard).toBe(false);

    act(() => {
      store.dispatch({ type: 'agent/setShowConfirmCard', payload: true });
    });
    expect(result.current.showConfirmCard).toBe(true);
  });

  it('Redux menuRequestAddress 값 — 반환값에 그대로 노출', () => {
    const store = createStore({ menuRequestAddress: '서울시 강남구' });
    const { result } = renderHook(() => useConfirmModal({ handleCancel: vi.fn() }), {
      wrapper: wrapper(store),
    });
    expect(result.current.menuRequestAddress).toBe('서울시 강남구');
  });

  it('Redux menuRequestAddress 변경 — 변경값 즉시 반영', () => {
    const store = createStore({ menuRequestAddress: '초기' });
    const { result } = renderHook(() => useConfirmModal({ handleCancel: vi.fn() }), {
      wrapper: wrapper(store),
    });
    expect(result.current.menuRequestAddress).toBe('초기');

    act(() => {
      store.dispatch({
        type: 'agent/setSelectedMenu',
        payload: { menu: 'm', historyId: 1, requestAddress: '변경됨' },
      });
    });
    expect(result.current.menuRequestAddress).toBe('변경됨');
  });

  it('handleCancel은 반환값에 포함되지 않음', () => {
    const store = createStore();
    const { result } = renderHook(() => useConfirmModal({ handleCancel: vi.fn() }), {
      wrapper: wrapper(store),
    });
    expect(Object.keys(result.current).sort()).toEqual(['menuRequestAddress', 'showConfirmCard']);
  });
});
