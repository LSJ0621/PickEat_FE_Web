/**
 * useUserLocation 테스트
 * Redux auth.user 기준 위치/주소 반환 및 hasLocation 계산 검증
 */

import React from 'react';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@app/store/slices/authSlice';
import { useUserLocation } from '@features/map/hooks/useUserLocation';

function createStore(user: Record<string, unknown> | null) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: user as never,
        isAuthenticated: !!user,
        loading: false,
        error: null,
        language: 'ko' as const,
      },
    },
  });
}

function wrapper(store: ReturnType<typeof createStore>) {
  return function W({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe('useUserLocation', () => {
  it('Redux에 위치 없음 — latitude/longitude null, hasLocation false', () => {
    const { result } = renderHook(() => useUserLocation(), { wrapper: wrapper(createStore(null)) });
    expect(result.current.latitude).toBeNull();
    expect(result.current.longitude).toBeNull();
    expect(result.current.hasLocation).toBe(false);
  });

  it('Redux에 유효 숫자 위치 — 숫자 반환, hasLocation true', () => {
    const { result } = renderHook(() => useUserLocation(), {
      wrapper: wrapper(createStore({ id: 1, latitude: 37.5, longitude: 127.0, address: '서울' })),
    });
    expect(result.current.latitude).toBe(37.5);
    expect(result.current.longitude).toBe(127.0);
    expect(result.current.hasLocation).toBe(true);
  });

  it('숫자가 아닌 값 — hasLocation false 처리', () => {
    const { result } = renderHook(() => useUserLocation(), {
      wrapper: wrapper(createStore({ id: 1, latitude: null, longitude: null, address: null })),
    });
    expect(result.current.hasLocation).toBe(false);
  });

  it('address 동기 반환 — Redux 주소 그대로 노출', () => {
    const { result } = renderHook(() => useUserLocation(), {
      wrapper: wrapper(createStore({ id: 1, latitude: 1, longitude: 2, address: '강남역' })),
    });
    expect(result.current.address).toBe('강남역');
  });

  it('Redux 위치 업데이트 — 변경된 값 즉시 반영', () => {
    const store = createStore({ id: 1, latitude: 10, longitude: 20, address: 'A' });
    const { result, rerender } = renderHook(() => useUserLocation(), { wrapper: wrapper(store) });
    expect(result.current.latitude).toBe(10);

    store.dispatch({
      type: 'auth/updateUser',
      payload: { latitude: 50, longitude: 60, address: 'B' },
    });
    rerender();
    expect(result.current.latitude).toBe(50);
    expect(result.current.longitude).toBe(60);
    expect(result.current.address).toBe('B');
  });
});
