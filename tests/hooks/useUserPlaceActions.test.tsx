/**
 * useUserPlaceActions 테스트
 * updatePlace/deletePlace 성공/실패/로딩 상태 검증
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useUserPlaceActions } from '@features/user-place/hooks/useUserPlaceActions';

const mockHandleError = vi.fn();
const mockHandleSuccess = vi.fn();
vi.mock('@shared/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
    handleSuccess: mockHandleSuccess,
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
}));

const mockUpdateUserPlace = vi.hoisted(() => vi.fn());
const mockDeleteUserPlace = vi.hoisted(() => vi.fn());
vi.mock('@features/user-place/api', () => ({
  userPlaceService: {
    updateUserPlace: mockUpdateUserPlace,
    deleteUserPlace: mockDeleteUserPlace,
  },
}));

describe('useUserPlaceActions', () => {
  beforeEach(() => {
    mockHandleError.mockClear();
    mockHandleSuccess.mockClear();
    mockUpdateUserPlace.mockReset();
    mockDeleteUserPlace.mockReset();
  });

  it('초기 상태 — isUpdateLoading/isDeleteLoading false', () => {
    const { result } = renderHook(() => useUserPlaceActions());
    expect(result.current.isUpdateLoading).toBe(false);
    expect(result.current.isDeleteLoading).toBe(false);
  });

  it('updatePlace 성공 → 성공 토스트', async () => {
    mockUpdateUserPlace.mockResolvedValue(undefined);
    const { result } = renderHook(() => useUserPlaceActions());

    await act(async () => {
      await result.current.updatePlace(1, { name: 'X' } as never);
    });

    expect(mockUpdateUserPlace).toHaveBeenCalledWith(1, { name: 'X' });
    expect(mockHandleSuccess).toHaveBeenCalled();
    expect(result.current.isUpdateLoading).toBe(false);
  });

  it('updatePlace 실패 → 에러 핸들링 후 재발생', async () => {
    mockUpdateUserPlace.mockRejectedValue(new Error('err'));
    const { result } = renderHook(() => useUserPlaceActions());

    await expect(
      act(async () => {
        await result.current.updatePlace(1, {} as never);
      }),
    ).rejects.toThrow('err');

    expect(mockHandleError).toHaveBeenCalled();
    expect(result.current.isUpdateLoading).toBe(false);
  });

  it('deletePlace 성공 → 성공 토스트', async () => {
    mockDeleteUserPlace.mockResolvedValue(undefined);
    const { result } = renderHook(() => useUserPlaceActions());

    await act(async () => {
      await result.current.deletePlace(7);
    });

    expect(mockDeleteUserPlace).toHaveBeenCalledWith(7);
    expect(mockHandleSuccess).toHaveBeenCalled();
    expect(result.current.isDeleteLoading).toBe(false);
  });

  it('deletePlace 실패 → 에러 핸들링 후 재발생', async () => {
    mockDeleteUserPlace.mockRejectedValue(new Error('del-err'));
    const { result } = renderHook(() => useUserPlaceActions());

    await expect(
      act(async () => {
        await result.current.deletePlace(7);
      }),
    ).rejects.toThrow('del-err');

    expect(mockHandleError).toHaveBeenCalled();
    expect(result.current.isDeleteLoading).toBe(false);
  });
});
