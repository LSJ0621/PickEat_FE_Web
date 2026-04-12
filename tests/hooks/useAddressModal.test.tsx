/**
 * useAddressModal 테스트
 * 주소 검색, 선택, 추가, 최대 주소 제한, 초기화 검증
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@app/store/slices/authSlice';
import userDataReducer from '@app/store/slices/userDataSlice';
import { useAddressModal } from '@shared/hooks/address/useAddressModal';
import type { User } from '@features/auth/types';
import { http, HttpResponse } from 'msw';
import { server } from '@tests/mocks/server';
import { ENDPOINTS } from '@shared/api/endpoints';

// useErrorHandler 모킹
const mockHandleError = vi.fn();
const mockHandleSuccess = vi.fn();

vi.mock('@shared/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
    handleSuccess: mockHandleSuccess,
  }),
}));

// i18next 모킹
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
}));

const BASE_URL = 'http://localhost:3000';

function createTestStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      userData: userDataReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        language: 'ko' as const,
      },
      userData: {
        addresses: {
          list: [],
          defaultAddress: null,
          lastFetchedAt: null,
          isLoading: false,
          isDirty: false,
          error: null,
        },
        preferences: {
          data: null,
          lastFetchedAt: null,
          isLoading: false,
          isDirty: false,
          error: null,
        },
      },
    },
  });
}

function createWrapper(store: ReturnType<typeof createTestStore>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe('useAddressModal', () => {
  beforeEach(() => {
    mockHandleError.mockClear();
    mockHandleSuccess.mockClear();
  });

  it('초기 상태 — 모든 필드 초기값', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAddressModal({ addressesCount: 0 }), {
      wrapper: createWrapper(store),
    });

    expect(result.current.addressQuery).toBe('');
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.selectedAddress).toBeNull();
    expect(result.current.addressAlias).toBe('');
    expect(result.current.isSaving).toBe(false);
    expect(result.current.hasSearchedAddress).toBe(false);
  });

  it('handleSearch — 주소 검색 성공', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAddressModal({ addressesCount: 0 }), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.setAddressQuery('강남');
    });

    await act(async () => {
      await result.current.handleSearch();
    });

    expect(result.current.searchResults).toHaveLength(2);
    expect(result.current.hasSearchedAddress).toBe(true);
    expect(result.current.isSearching).toBe(false);
  });

  it('handleSearch — 빈 쿼리는 무시', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAddressModal({ addressesCount: 0 }), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.handleSearch();
    });

    expect(result.current.searchResults).toEqual([]);
    expect(result.current.hasSearchedAddress).toBe(false);
  });

  it('handleSearch — API 실패 시 에러 처리', async () => {
    server.use(
      http.get(`${BASE_URL}${ENDPOINTS.USER.ADDRESS_SEARCH}`, () => {
        return HttpResponse.json(
          { message: '검색 서비스 오류' },
          { status: 500 }
        );
      })
    );

    const store = createTestStore();
    const { result } = renderHook(() => useAddressModal({ addressesCount: 0 }), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.setAddressQuery('테스트 주소');
    });

    await act(async () => {
      await result.current.handleSearch();
    });

    expect(mockHandleError).toHaveBeenCalled();
    expect(result.current.isSearching).toBe(false);
  });

  it('handleSelectAddress — 주소 선택 시 상태 업데이트', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAddressModal({ addressesCount: 0 }), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.handleSelectAddress({
        address: '서울시 강남구 테헤란로 123',
        roadAddress: '서울특별시 강남구 테헤란로 123',
        postalCode: '06236',
        latitude: '37.5172',
        longitude: '127.0473',
      });
    });

    expect(result.current.selectedAddress).not.toBeNull();
    expect(result.current.selectedAddress?.address).toBe('서울시 강남구 테헤란로 123');
    // 선택 후 검색어/결과 초기화
    expect(result.current.addressQuery).toBe('');
    expect(result.current.searchResults).toEqual([]);
  });

  it('handleAddAddress — 주소 미선택 시 에러', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAddressModal({ addressesCount: 0 }), {
      wrapper: createWrapper(store),
    });

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.handleAddAddress();
    });

    expect(success).toBe(false);
    expect(mockHandleError).toHaveBeenCalled();
  });

  it('handleAddAddress — 최대 4개 초과 시 에러', async () => {
    const store = createTestStore();
    const { result } = renderHook(
      () => useAddressModal({ addressesCount: 4 }),
      { wrapper: createWrapper(store) }
    );

    // 먼저 주소 선택
    act(() => {
      result.current.handleSelectAddress({
        address: '서울시 강남구',
        roadAddress: '서울특별시 강남구',
        postalCode: '06236',
        latitude: '37.5172',
        longitude: '127.0473',
      });
    });

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.handleAddAddress();
    });

    expect(success).toBe(false);
    expect(mockHandleError).toHaveBeenCalled();
  });

  it('handleAddAddress — 주소 추가 성공', async () => {
    const store = createTestStore();
    const { result } = renderHook(
      () => useAddressModal({ addressesCount: 1 }),
      { wrapper: createWrapper(store) }
    );

    // 주소 선택
    act(() => {
      result.current.handleSelectAddress({
        address: '서울시 강남구 테헤란로 123',
        roadAddress: '서울특별시 강남구 테헤란로 123',
        postalCode: '06236',
        latitude: '37.5172',
        longitude: '127.0473',
      });
    });

    act(() => {
      result.current.setAddressAlias('회사');
    });

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.handleAddAddress();
    });

    expect(success).toBe(true);
    expect(mockHandleSuccess).toHaveBeenCalledWith('toast.address.added');
    // 성공 후 초기화
    expect(result.current.selectedAddress).toBeNull();
    expect(result.current.addressAlias).toBe('');
    expect(result.current.addressQuery).toBe('');
  });

  it('handleAddAddress — API 실패 시 에러 처리', async () => {
    server.use(
      http.post(`${BASE_URL}${ENDPOINTS.USER.ADDRESSES}`, () => {
        return HttpResponse.json(
          { message: '주소 등록 실패' },
          { status: 500 }
        );
      })
    );

    const store = createTestStore();
    const { result } = renderHook(
      () => useAddressModal({ addressesCount: 0 }),
      { wrapper: createWrapper(store) }
    );

    act(() => {
      result.current.handleSelectAddress({
        address: '서울시 강남구',
        roadAddress: '서울특별시 강남구',
        postalCode: '06236',
        latitude: '37.5172',
        longitude: '127.0473',
      });
    });

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.handleAddAddress();
    });

    expect(success).toBe(false);
    expect(mockHandleError).toHaveBeenCalled();
  });

  it('resetAddressModal — 모든 상태 초기화', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAddressModal({ addressesCount: 0 }), {
      wrapper: createWrapper(store),
    });

    // 상태 변경
    act(() => {
      result.current.setAddressQuery('테스트');
      result.current.setAddressAlias('별칭');
      result.current.handleSelectAddress({
        address: '서울시 강남구',
        roadAddress: '서울특별시 강남구',
        postalCode: '06236',
        latitude: '37.5172',
        longitude: '127.0473',
      });
    });

    // 초기화
    act(() => {
      result.current.resetAddressModal();
    });

    expect(result.current.addressQuery).toBe('');
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.selectedAddress).toBeNull();
    expect(result.current.addressAlias).toBe('');
    expect(result.current.hasSearchedAddress).toBe(false);
  });

  it('handleAddAddress — 첫 번째 주소(기본주소) 등록 시 Redux 업데이트', async () => {
    // 첫 번째 주소는 isDefault: true로 반환되어야 함
    server.use(
      http.post(`${BASE_URL}${ENDPOINTS.USER.ADDRESSES}`, async () => {
        return HttpResponse.json(
          {
            id: 1,
            roadAddress: '서울특별시 강남구 테헤란로 123',
            postalCode: '06236',
            latitude: 37.5172,
            longitude: 127.0473,
            isDefault: true,
            isSearchAddress: false,
            alias: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { status: 201 }
        );
      })
    );

    // user가 존재해야 updateUser가 동작함
    const store = configureStore({
      reducer: {
        auth: authReducer,
        userData: userDataReducer,
      },
      preloadedState: {
        auth: {
          user: {
            email: 'test@example.com',
            name: '테스트',
            address: null,
            latitude: null,
            longitude: null,
            preferences: null,
            role: 'user',
            preferredLanguage: 'ko',
          } satisfies User,
          isAuthenticated: true,
          loading: false,
          error: null,
          language: 'ko' as const,
        },
        userData: {
          addresses: {
            list: [],
            defaultAddress: null,
            lastFetchedAt: null,
            isLoading: false,
            isDirty: false,
            error: null,
          },
          preferences: {
            data: null,
            lastFetchedAt: null,
            isLoading: false,
            isDirty: false,
            error: null,
          },
        },
      },
    });

    const { result } = renderHook(
      () => useAddressModal({ addressesCount: 0 }),
      { wrapper: createWrapper(store) }
    );

    act(() => {
      result.current.handleSelectAddress({
        address: '서울시 강남구 테헤란로 123',
        roadAddress: '서울특별시 강남구 테헤란로 123',
        postalCode: '06236',
        latitude: '37.5172',
        longitude: '127.0473',
      });
    });

    await act(async () => {
      await result.current.handleAddAddress();
    });

    // Redux auth state가 업데이트되어야 함
    const authState = store.getState().auth;
    expect(authState.user?.address).toBe('서울특별시 강남구 테헤란로 123');
  });
});
