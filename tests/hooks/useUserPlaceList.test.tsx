/**
 * useUserPlaceList 테스트
 * User Place 목록 로드/필터/검색/페이지네이션/에러 처리 검증
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useUserPlaceList } from '@features/user-place/hooks/useUserPlaceList';

const mockHandleError = vi.fn();
vi.mock('@shared/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
    handleSuccess: vi.fn(),
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
}));

const mockGetUserPlaces = vi.hoisted(() => vi.fn());
vi.mock('@features/user-place/api', () => ({
  userPlaceService: {
    getUserPlaces: mockGetUserPlaces,
  },
}));

function buildPage(overrides: Partial<{ items: unknown[]; total: number; totalPages: number; page: number }> = {}) {
  return {
    items: overrides.items ?? [{ id: 1, name: 'Test' }],
    total: overrides.total ?? 1,
    page: overrides.page ?? 1,
    limit: 10,
    totalPages: overrides.totalPages ?? 1,
  };
}

describe('useUserPlaceList', () => {
  beforeEach(() => {
    mockHandleError.mockClear();
    mockGetUserPlaces.mockReset();
  });

  it('초기 상태 — page=1, places 빈 배열, error null', async () => {
    mockGetUserPlaces.mockResolvedValue(buildPage({ items: [] }));
    const { result } = renderHook(() => useUserPlaceList());
    expect(result.current.page).toBe(1);
    expect(result.current.places).toEqual([]);
    expect(result.current.error).toBeNull();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('마운트 시 getUserPlaces 호출 → places/total/totalPages 반영', async () => {
    mockGetUserPlaces.mockResolvedValue(
      buildPage({ items: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }], total: 2, totalPages: 1 }),
    );
    const { result } = renderHook(() => useUserPlaceList());
    await waitFor(() => expect(result.current.places).toHaveLength(2));
    expect(result.current.total).toBe(2);
    expect(result.current.totalPages).toBe(1);
  });

  it('로딩 중 isLoading true → 완료 후 false', async () => {
    let resolveFn: ((v: unknown) => void) | null = null;
    mockGetUserPlaces.mockImplementation(
      () => new Promise((resolve) => { resolveFn = resolve; }),
    );
    const { result } = renderHook(() => useUserPlaceList());
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    act(() => {
      resolveFn!(buildPage({ items: [] }));
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('API 실패 시 error 설정 + places 빈 배열 유지', async () => {
    mockGetUserPlaces.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useUserPlaceList());
    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.places).toEqual([]);
    expect(mockHandleError).toHaveBeenCalled();
  });

  it('handlePageChange 호출 → 새로운 페이지로 목록 재로드', async () => {
    mockGetUserPlaces.mockResolvedValue(buildPage({ items: [] }));
    const { result } = renderHook(() => useUserPlaceList());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    mockGetUserPlaces.mockClear();
    act(() => { result.current.handlePageChange(3); });
    await waitFor(() => {
      expect(mockGetUserPlaces).toHaveBeenCalledWith(expect.objectContaining({ page: 3 }));
    });
    expect(result.current.page).toBe(3);
  });

  it('handleStatusFilter 호출 → status 필터 변경 + page 1로 초기화', async () => {
    mockGetUserPlaces.mockResolvedValue(buildPage({ items: [] }));
    const { result } = renderHook(() => useUserPlaceList());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.handlePageChange(3); });
    await waitFor(() => expect(result.current.page).toBe(3));

    mockGetUserPlaces.mockClear();
    act(() => { result.current.handleStatusFilter('APPROVED' as unknown as never); });
    await waitFor(() => {
      expect(mockGetUserPlaces).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, status: 'APPROVED' }),
      );
    });
    expect(result.current.page).toBe(1);
  });

  it('handleSearch 호출 → search 값 변경 + page 1로 초기화', async () => {
    mockGetUserPlaces.mockResolvedValue(buildPage({ items: [] }));
    const { result } = renderHook(() => useUserPlaceList());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.handlePageChange(2); });
    await waitFor(() => expect(result.current.page).toBe(2));

    mockGetUserPlaces.mockClear();
    act(() => { result.current.handleSearch('강남'); });
    await waitFor(() => {
      expect(mockGetUserPlaces).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, search: '강남' }),
      );
    });
  });

  it('refreshList 호출 → 현재 필터/페이지로 재조회', async () => {
    mockGetUserPlaces.mockResolvedValue(buildPage({ items: [] }));
    const { result } = renderHook(() => useUserPlaceList());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    mockGetUserPlaces.mockClear();
    act(() => { result.current.refreshList(); });
    await waitFor(() => expect(mockGetUserPlaces).toHaveBeenCalledTimes(1));
  });
});
