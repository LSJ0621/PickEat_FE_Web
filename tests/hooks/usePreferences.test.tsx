/**
 * usePreferences 테스트
 * 취향 정보 CRUD, Redux 동기화, 저장/로드 API, 에러 처리 검증
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@app/store/slices/authSlice';
import userDataReducer from '@app/store/slices/userDataSlice';
import { usePreferences } from '@features/user/hooks/usePreferences';
import { http, HttpResponse } from 'msw';
import { server } from '@tests/mocks/server';

// useErrorHandler 모킹
const mockHandleError = vi.fn();
const mockHandleSuccess = vi.fn();

vi.mock('@shared/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
    handleSuccess: mockHandleSuccess,
  }),
}));

const BASE_URL = 'http://localhost:3000';

function createTestStore(preferencesData?: { likes?: string[]; dislikes?: string[]; analysis?: string | null } | null) {
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
          data: preferencesData ?? null,
          lastFetchedAt: null,
          isLoading: false,
          isDirty: true, // fetchPreferences가 API를 호출하도록 dirty 설정
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

describe('usePreferences', () => {
  beforeEach(() => {
    mockHandleError.mockClear();
    mockHandleSuccess.mockClear();
  });

  it('초기 상태 — options 없으면 빈 배열', () => {
    const store = createTestStore();
    const { result } = renderHook(() => usePreferences(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.likes).toEqual([]);
    expect(result.current.dislikes).toEqual([]);
    expect(result.current.analysis).toBeNull();
    expect(result.current.newLike).toBe('');
    expect(result.current.newDislike).toBe('');
  });

  it('초기 상태 — options로 초기값 제공', () => {
    const store = createTestStore();
    const { result } = renderHook(
      () =>
        usePreferences({
          initialLikes: ['한식', '양식'],
          initialDislikes: ['매운 음식'],
          initialAnalysis: '한식을 선호합니다.',
        }),
      { wrapper: createWrapper(store) }
    );

    expect(result.current.likes).toEqual(['한식', '양식']);
    expect(result.current.dislikes).toEqual(['매운 음식']);
    expect(result.current.analysis).toBe('한식을 선호합니다.');
  });

  it('초기 상태 — Redux에서 취향 정보 가져오기', () => {
    const store = createTestStore({
      likes: ['중식'],
      dislikes: ['생선'],
      analysis: 'Redux 분석',
    });
    const { result } = renderHook(() => usePreferences(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.likes).toEqual(['중식']);
    expect(result.current.dislikes).toEqual(['생선']);
    expect(result.current.analysis).toBe('Redux 분석');
  });

  it('handleAddLike — 좋아하는 것 추가', () => {
    const store = createTestStore();
    const { result } = renderHook(() => usePreferences(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.setNewLike('일식');
    });

    act(() => {
      result.current.handleAddLike();
    });

    expect(result.current.likes).toContain('일식');
    expect(result.current.newLike).toBe('');
  });

  it('handleAddLike — 중복 항목은 추가되지 않음', () => {
    const store = createTestStore();
    const { result } = renderHook(
      () => usePreferences({ initialLikes: ['한식'] }),
      { wrapper: createWrapper(store) }
    );

    act(() => {
      result.current.setNewLike('한식');
    });

    act(() => {
      result.current.handleAddLike();
    });

    expect(result.current.likes).toEqual(['한식']); // 중복 추가 안 됨
  });

  it('handleAddLike — 빈 문자열은 추가되지 않음', () => {
    const store = createTestStore();
    const { result } = renderHook(() => usePreferences(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.setNewLike('   ');
    });

    act(() => {
      result.current.handleAddLike();
    });

    expect(result.current.likes).toEqual([]);
  });

  it('handleRemoveLike — 좋아하는 것 제거', () => {
    const store = createTestStore();
    const { result } = renderHook(
      () => usePreferences({ initialLikes: ['한식', '양식', '일식'] }),
      { wrapper: createWrapper(store) }
    );

    act(() => {
      result.current.handleRemoveLike('양식');
    });

    expect(result.current.likes).toEqual(['한식', '일식']);
  });

  it('handleAddDislike / handleRemoveDislike — 싫어하는 것 추가/제거', () => {
    const store = createTestStore();
    const { result } = renderHook(() => usePreferences(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.setNewDislike('고수');
    });
    act(() => {
      result.current.handleAddDislike();
    });

    expect(result.current.dislikes).toContain('고수');
    expect(result.current.newDislike).toBe('');

    act(() => {
      result.current.handleRemoveDislike('고수');
    });

    expect(result.current.dislikes).not.toContain('고수');
  });

  it('handleSavePreferences — 성공 시 true 반환 + Redux 업데이트', async () => {
    const store = createTestStore();
    const { result } = renderHook(
      () => usePreferences({ initialLikes: ['한식'], initialDislikes: ['매운 것'] }),
      { wrapper: createWrapper(store) }
    );

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.handleSavePreferences();
    });

    expect(success).toBe(true);
    expect(mockHandleSuccess).toHaveBeenCalledWith('toast.preferences.saved');
    expect(result.current.isSavingPreferences).toBe(false);
  });

  it('handleSavePreferences — API 실패 시 false 반환 + 에러 처리', async () => {
    server.use(
      http.post(`${BASE_URL}/user/preferences`, () => {
        return HttpResponse.json(
          { message: '서버 오류' },
          { status: 500 }
        );
      })
    );

    const store = createTestStore();
    const { result } = renderHook(
      () => usePreferences({ initialLikes: ['한식'] }),
      { wrapper: createWrapper(store) }
    );

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.handleSavePreferences();
    });

    expect(success).toBe(false);
    expect(mockHandleError).toHaveBeenCalled();
    expect(result.current.isSavingPreferences).toBe(false);
  });

  it('loadPreferences — API에서 취향 정보 로드', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => usePreferences(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.loadPreferences();
    });

    // MSW 핸들러가 mockPreferences 반환
    expect(result.current.likes).toEqual(['한식', '중식', '일식']);
    expect(result.current.dislikes).toEqual(['매운 음식', '생선']);
  });

  it('resetPreferencesModal — newLike/newDislike 초기화', () => {
    const store = createTestStore();
    const { result } = renderHook(() => usePreferences(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.setNewLike('테스트');
      result.current.setNewDislike('테스트2');
    });

    expect(result.current.newLike).toBe('테스트');
    expect(result.current.newDislike).toBe('테스트2');

    act(() => {
      result.current.resetPreferencesModal();
    });

    expect(result.current.newLike).toBe('');
    expect(result.current.newDislike).toBe('');
  });
});
