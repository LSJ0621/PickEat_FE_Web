/**
 * useUserPlaceDetail 테스트
 * id 기반 상세 조회, 로딩/에러 핸들링, refetch 검증
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useUserPlaceDetail } from '@features/user-place/hooks/useUserPlaceDetail';

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

const mockGetUserPlace = vi.hoisted(() => vi.fn());
vi.mock('@features/user-place/api', () => ({
  userPlaceService: {
    getUserPlace: mockGetUserPlace,
  },
}));

describe('useUserPlaceDetail', () => {
  beforeEach(() => {
    mockHandleError.mockClear();
    mockGetUserPlace.mockReset();
  });

  it('id null — place null 유지, API 호출 안 함', async () => {
    const { result } = renderHook(() => useUserPlaceDetail(null));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.place).toBeNull();
    expect(mockGetUserPlace).not.toHaveBeenCalled();
  });

  it('유효한 id — getUserPlace 호출 후 place 설정', async () => {
    mockGetUserPlace.mockResolvedValue({ id: 5, name: 'My Place' });
    const { result } = renderHook(() => useUserPlaceDetail(5));
    await waitFor(() => expect(result.current.place).toEqual({ id: 5, name: 'My Place' }));
    expect(mockGetUserPlace).toHaveBeenCalledWith(5);
  });

  it('id 변경 시 자동 재로드', async () => {
    mockGetUserPlace.mockImplementation((id: number) => Promise.resolve({ id, name: `Place-${id}` }));
    const { result, rerender } = renderHook(({ id }: { id: number | null }) => useUserPlaceDetail(id), {
      initialProps: { id: 1 },
    });
    await waitFor(() => expect(result.current.place).toEqual({ id: 1, name: 'Place-1' }));

    rerender({ id: 2 });
    await waitFor(() => expect(result.current.place).toEqual({ id: 2, name: 'Place-2' }));
  });

  it('API 실패 시 place null + 에러 핸들링', async () => {
    mockGetUserPlace.mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useUserPlaceDetail(9));
    await waitFor(() => expect(mockHandleError).toHaveBeenCalled());
    expect(result.current.place).toBeNull();
  });

  it('refetch 호출 — 동일 id로 재조회', async () => {
    mockGetUserPlace.mockResolvedValue({ id: 3, name: 'X' });
    const { result } = renderHook(() => useUserPlaceDetail(3));
    await waitFor(() => expect(result.current.place).not.toBeNull());
    mockGetUserPlace.mockClear();

    act(() => { result.current.refetch(); });
    await waitFor(() => expect(mockGetUserPlace).toHaveBeenCalledWith(3));
  });
});
