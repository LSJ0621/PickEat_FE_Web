/**
 * 주소 Hook 테스트
 * useAddressSearch(3개): 검색, 선택, 초기화
 * useAddressList(4개): 목록 로드, 기본 주소 변경, 삭제, 최대 선택 제약
 */

import { renderHook, act } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import { server } from '@tests/mocks/server';
import { useAddressSearch } from '@shared/hooks/address/useAddressSearch';
import { useAddressList } from '@shared/hooks/address/useAddressList';
import { createMockAddressSearchResult, createMockUserAddresses } from '@tests/factories/address';
import { createMockUser } from '@tests/factories/user';
import { mockAddresses } from '@tests/mocks/handlers/user';
import { ToastProvider } from '@shared/components/ToastProvider';
import authReducer from '@app/store/slices/authSlice';
import agentReducer from '@app/store/slices/agentSlice';
import userDataReducer from '@app/store/slices/userDataSlice';
import { injectStore } from '@shared/api/client';

const BASE_URL = 'http://localhost:3000';

// ────────────────────────────────────────────────────────────────────────────
// 공통 헬퍼
// ────────────────────────────────────────────────────────────────────────────

/** useAddressSearch 전용 래퍼 — ToastProvider만 필요 */
function toastWrapper({ children }: { children: ReactNode }) {
  return createElement(ToastProvider, null, children);
}

/** useAddressList 전용 래퍼 — Redux Provider + ToastProvider */
function createReduxWrapper(store: ReturnType<typeof createTestStore>) {
  return function ReduxWrapper({ children }: { children: ReactNode }) {
    return createElement(
      Provider,
      { store },
      createElement(ToastProvider, null, children)
    );
  };
}

/** 격리된 Redux 스토어 생성 (각 테스트마다 독립적인 스토어 사용) */
function createTestStore(preloadedAuth?: ReturnType<typeof createMockUser>) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      agent: agentReducer,
      userData: userDataReducer,
    },
    preloadedState: preloadedAuth
      ? {
          auth: {
            user: preloadedAuth,
            isAuthenticated: true,
            loading: false,
            error: null,
            language: 'ko' as const,
          },
        }
      : undefined,
  });
  // apiClient의 store 주입 (401 처리를 위해 필요)
  injectStore(store);
  return store;
}

// ────────────────────────────────────────────────────────────────────────────
// useAddressSearch
// ────────────────────────────────────────────────────────────────────────────

describe('useAddressSearch', () => {
  describe('handleSearch', () => {
    it('검색어 입력 → API 호출 → 결과 반환', async () => {
      const { result } = renderHook(() => useAddressSearch(), {
        wrapper: toastWrapper,
      });

      act(() => {
        result.current.setAddressQuery('서울시 강남구');
      });

      await act(async () => {
        await result.current.handleSearch();
      });

      expect(result.current.searchResults.length).toBeGreaterThan(0);
      expect(result.current.hasSearchedAddress).toBe(true);
      expect(result.current.isSearching).toBe(false);
    });
  });

  describe('handleSelectAddress', () => {
    it('주소 선택 → selectedAddress 설정 + 검색결과·쿼리 초기화', async () => {
      const { result } = renderHook(() => useAddressSearch(), {
        wrapper: toastWrapper,
      });

      // 먼저 검색 실행
      act(() => {
        result.current.setAddressQuery('서울시 강남구');
      });
      await act(async () => {
        await result.current.handleSearch();
      });
      expect(result.current.searchResults.length).toBeGreaterThan(0);

      const target = createMockAddressSearchResult({
        address: '서울시 강남구 역삼동 100',
        roadAddress: '서울특별시 강남구 테헤란로 100',
        latitude: '37.5010',
        longitude: '127.0390',
      });

      act(() => {
        result.current.handleSelectAddress(target);
      });

      expect(result.current.selectedAddress).toMatchObject({
        address: target.address,
        roadAddress: target.roadAddress,
        latitude: target.latitude,
        longitude: target.longitude,
      });
      expect(result.current.searchResults).toHaveLength(0);
      expect(result.current.addressQuery).toBe('');
    });
  });

  describe('clearSearch', () => {
    it('clearSearch — 쿼리·검색결과·검색완료 플래그 초기화', async () => {
      const { result } = renderHook(() => useAddressSearch(), {
        wrapper: toastWrapper,
      });

      // 검색 실행하여 상태 채우기
      act(() => {
        result.current.setAddressQuery('서울');
      });
      await act(async () => {
        await result.current.handleSearch();
      });
      expect(result.current.hasSearchedAddress).toBe(true);

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.addressQuery).toBe('');
      expect(result.current.searchResults).toHaveLength(0);
      expect(result.current.hasSearchedAddress).toBe(false);
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// useAddressList
// ────────────────────────────────────────────────────────────────────────────

describe('useAddressList', () => {
  describe('loadAddresses', () => {
    it('loadAddresses — 주소 목록 로드', async () => {
      const store = createTestStore();
      const { result } = renderHook(() => useAddressList(), {
        wrapper: createReduxWrapper(store),
      });

      await act(async () => {
        await result.current.loadAddresses();
      });

      // user handler의 mockAddresses(2개) 반환 확인
      expect(result.current.addresses).toHaveLength(mockAddresses.length);
      expect(result.current.addresses[0].roadAddress).toBe(mockAddresses[0].roadAddress);
    });
  });

  describe('handleSetDefaultAddress', () => {
    it('기본 주소 변경 → Redux auth address 동시 업데이트', async () => {
      const user = createMockUser({ address: '기존 주소', latitude: 0, longitude: 0 });
      const store = createTestStore(user);

      const { result } = renderHook(() => useAddressList(), {
        wrapper: createReduxWrapper(store),
      });

      // 주소 목록 먼저 로드
      await act(async () => {
        await result.current.loadAddresses();
      });

      // id:2(비기본) 주소를 기본으로 설정
      const targetAddress = mockAddresses.find((a) => !a.isDefault)!;
      await act(async () => {
        await result.current.handleSetDefaultAddress(targetAddress.id);
      });

      // Redux auth의 address가 업데이트되었는지 확인
      const authState = store.getState().auth;
      expect(authState.user?.address).toBe(targetAddress.roadAddress);
      expect(authState.user?.latitude).toBe(targetAddress.latitude);
      expect(authState.user?.longitude).toBe(targetAddress.longitude);
    });
  });

  describe('handleDeleteAddresses', () => {
    it('삭제 확인 다이얼로그 표시 후 실제 삭제 → 목록 갱신', async () => {
      const store = createTestStore();
      const { result } = renderHook(() => useAddressList(), {
        wrapper: createReduxWrapper(store),
      });

      // 주소 목록 먼저 로드
      await act(async () => {
        await result.current.loadAddresses();
      });

      // 비기본 주소 id 선택
      const nonDefaultIds = mockAddresses
        .filter((a) => !a.isDefault)
        .map((a) => a.id);

      // handleDeleteAddresses 호출 → confirmDeleteIds 설정
      act(() => {
        result.current.handleDeleteAddresses(nonDefaultIds);
      });
      expect(result.current.confirmDeleteIds).toEqual(nonDefaultIds);

      // handleConfirmDelete 호출 → 실제 삭제 수행 후 목록 갱신
      await act(async () => {
        await result.current.handleConfirmDelete();
      });

      // confirmDeleteIds 초기화 및 selectedDeleteIds 초기화 확인
      expect(result.current.confirmDeleteIds).toBeNull();
      expect(result.current.selectedDeleteIds).toHaveLength(0);
    });
  });

  describe('최대 주소 선택 제약', () => {
    it('삭제 선택 시 최대 3개 초과 → 4번째 선택 거부', async () => {
      const store = createTestStore();

      // 5개 주소 (index 0이 기본주소 → 비기본 4개)
      const fiveAddresses = createMockUserAddresses(5);
      server.use(
        http.get(`${BASE_URL}/user/addresses`, () => {
          return HttpResponse.json({ addresses: fiveAddresses });
        })
      );

      const { result } = renderHook(() => useAddressList(), {
        wrapper: createReduxWrapper(store),
      });

      await act(async () => {
        await result.current.loadAddresses();
      });

      const nonDefaultAddresses = result.current.addresses.filter((a) => !a.isDefault);
      expect(nonDefaultAddresses.length).toBeGreaterThanOrEqual(4);

      // 비기본 주소 3개 선택
      act(() => { result.current.handleToggleDeleteSelection(nonDefaultAddresses[0].id); });
      act(() => { result.current.handleToggleDeleteSelection(nonDefaultAddresses[1].id); });
      act(() => { result.current.handleToggleDeleteSelection(nonDefaultAddresses[2].id); });
      expect(result.current.selectedDeleteIds).toHaveLength(3);

      // 4번째 선택 시도 → maxDeleteLimit 에러로 인해 거부 (여전히 3개)
      act(() => {
        result.current.handleToggleDeleteSelection(nonDefaultAddresses[3].id);
      });
      expect(result.current.selectedDeleteIds).toHaveLength(3);
    });
  });
});
