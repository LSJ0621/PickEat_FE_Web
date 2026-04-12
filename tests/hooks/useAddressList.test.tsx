/**
 * useAddressList 테스트
 * 주소 리스트 CRUD, 기본 주소 변경, 삭제 선택/실행, 편집 모드 검증
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@app/store/slices/authSlice';
import userDataReducer from '@app/store/slices/userDataSlice';
import { useAddressList } from '@shared/hooks/address/useAddressList';
import type { UserAddress } from '@features/user/types';

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

const mockAddresses: UserAddress[] = [
  {
    id: 1,
    roadAddress: '서울시 강남구 테헤란로 123',
    postalCode: '06236',
    latitude: 37.5172,
    longitude: 127.0473,
    isDefault: true,
    isSearchAddress: true,
    alias: '회사',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    roadAddress: '서울시 서초구 서초대로 456',
    postalCode: '06621',
    latitude: 37.4969,
    longitude: 127.0278,
    isDefault: false,
    isSearchAddress: false,
    alias: '집',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 3,
    roadAddress: '서울시 송파구 올림픽로 789',
    postalCode: '05551',
    latitude: 37.5145,
    longitude: 127.1058,
    isDefault: false,
    isSearchAddress: false,
    alias: '카페',
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
  },
];

function createTestStore(addresses: UserAddress[] = mockAddresses) {
  const defaultAddr = addresses.find((a) => a.isDefault) ?? null;
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
          list: addresses,
          defaultAddress: defaultAddr,
          lastFetchedAt: Date.now(),
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

describe('useAddressList', () => {
  beforeEach(() => {
    mockHandleError.mockClear();
    mockHandleSuccess.mockClear();
  });

  it('초기 상태 — Redux에서 주소 리스트 가져오기', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAddressList(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.addresses).toHaveLength(3);
    expect(result.current.defaultAddress?.id).toBe(1);
    expect(result.current.isEditMode).toBe(false);
    expect(result.current.selectedDeleteIds).toEqual([]);
  });

  it('handleAddressClick — 기본주소 클릭 시 무시', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAddressList(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.handleAddressClick(mockAddresses[0]); // isDefault: true
    });

    expect(result.current.confirmDefaultAddress).toBeNull();
  });

  it('handleAddressClick — 비기본주소 클릭 시 확인 대화상자 표시', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAddressList(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.handleAddressClick(mockAddresses[1]); // isDefault: false
    });

    expect(result.current.confirmDefaultAddress).toEqual(mockAddresses[1]);
  });

  it('handleCancelSetDefault — 기본주소 변경 확인 취소', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAddressList(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.handleAddressClick(mockAddresses[1]);
    });
    expect(result.current.confirmDefaultAddress).not.toBeNull();

    act(() => {
      result.current.handleCancelSetDefault();
    });
    expect(result.current.confirmDefaultAddress).toBeNull();
  });

  it('handleToggleDeleteSelection — 삭제 선택 토글', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAddressList(), {
      wrapper: createWrapper(store),
    });

    // 비기본주소 선택
    act(() => {
      result.current.handleToggleDeleteSelection(2);
    });
    expect(result.current.selectedDeleteIds).toEqual([2]);

    // 다시 토글 → 해제
    act(() => {
      result.current.handleToggleDeleteSelection(2);
    });
    expect(result.current.selectedDeleteIds).toEqual([]);
  });

  it('handleToggleDeleteSelection — 기본주소는 선택 불가', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAddressList(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.handleToggleDeleteSelection(1); // isDefault: true
    });

    expect(result.current.selectedDeleteIds).toEqual([]);
    expect(mockHandleError).toHaveBeenCalled();
  });

  it('handleToggleDeleteSelection — 최대 3개 선택 제한', () => {
    const allAddresses: UserAddress[] = [
      ...mockAddresses,
      {
        id: 4,
        roadAddress: '서울시 마포구 월드컵북로 321',
        postalCode: '03920',
        latitude: 37.5565,
        longitude: 126.9068,
        isDefault: false,
        isSearchAddress: false,
        alias: '헬스장',
        createdAt: '2024-01-04T00:00:00.000Z',
        updatedAt: '2024-01-04T00:00:00.000Z',
      },
    ];

    const store = createTestStore(allAddresses);
    const { result } = renderHook(() => useAddressList(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.handleToggleDeleteSelection(2);
    });
    act(() => {
      result.current.handleToggleDeleteSelection(3);
    });
    act(() => {
      result.current.handleToggleDeleteSelection(4);
    });
    expect(result.current.selectedDeleteIds).toHaveLength(3);

    // 4번째 선택 시도 → 에러
    mockHandleError.mockClear();
    act(() => {
      result.current.handleToggleDeleteSelection(99); // 존재하지 않지만 개수 제한 체크
    });
    expect(mockHandleError).toHaveBeenCalled();
  });

  it('handleDeleteAddresses — 빈 배열 시 에러', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAddressList(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.handleDeleteAddresses([]);
    });

    expect(mockHandleError).toHaveBeenCalled();
    expect(result.current.confirmDeleteIds).toBeNull();
  });

  it('handleDeleteAddresses — 기본주소 포함 시 에러', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAddressList(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.handleDeleteAddresses([1, 2]); // id:1은 기본주소
    });

    expect(mockHandleError).toHaveBeenCalled();
    expect(result.current.confirmDeleteIds).toBeNull();
  });

  it('handleDeleteAddresses — 유효한 ID 배열 시 확인 대화상자 표시', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAddressList(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.handleDeleteAddresses([2, 3]);
    });

    expect(result.current.confirmDeleteIds).toEqual([2, 3]);
  });

  it('handleCancelDelete — 삭제 확인 취소', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAddressList(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.handleDeleteAddresses([2]);
    });
    expect(result.current.confirmDeleteIds).not.toBeNull();

    act(() => {
      result.current.handleCancelDelete();
    });
    expect(result.current.confirmDeleteIds).toBeNull();
  });

  it('toggleEditMode — 편집 모드 토글', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAddressList(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.toggleEditMode();
    });
    expect(result.current.isEditMode).toBe(true);

    // 다시 토글 → 편집 모드 해제 + 선택 초기화
    act(() => {
      result.current.toggleEditMode();
    });
    expect(result.current.isEditMode).toBe(false);
    expect(result.current.selectedDeleteIds).toEqual([]);
  });

  it('resetEditState — 편집 상태 전체 초기화', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAddressList(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.toggleEditMode();
      result.current.handleToggleDeleteSelection(2);
    });

    act(() => {
      result.current.resetEditState();
    });

    expect(result.current.isEditMode).toBe(false);
    expect(result.current.selectedDeleteIds).toEqual([]);
    expect(result.current.confirmDefaultAddress).toBeNull();
  });
});
