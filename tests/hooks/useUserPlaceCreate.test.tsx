/**
 * useUserPlaceCreate 테스트
 * 등록 전 확인(checkRegistration), 실제 등록(createPlace), resetCheck 검증
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useUserPlaceCreate } from '@features/user-place/hooks/useUserPlaceCreate';

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

const mockCheckRegistration = vi.hoisted(() => vi.fn());
const mockCreateUserPlace = vi.hoisted(() => vi.fn());
vi.mock('@features/user-place/api', () => ({
  userPlaceService: {
    checkRegistration: mockCheckRegistration,
    createUserPlace: mockCreateUserPlace,
  },
}));

describe('useUserPlaceCreate', () => {
  beforeEach(() => {
    mockHandleError.mockClear();
    mockHandleSuccess.mockClear();
    mockCheckRegistration.mockReset();
    mockCreateUserPlace.mockReset();
  });

  it('초기 상태 — checkResult null, 로딩 false', () => {
    const { result } = renderHook(() => useUserPlaceCreate());
    expect(result.current.checkResult).toBeNull();
    expect(result.current.isCheckLoading).toBe(false);
    expect(result.current.isCreateLoading).toBe(false);
  });

  it('checkRegistration 호출 → checkResult 설정', async () => {
    mockCheckRegistration.mockResolvedValue({ canRegister: true });
    const { result } = renderHook(() => useUserPlaceCreate());

    await act(async () => {
      await result.current.checkRegistration({ name: 'A', address: 'B' } as never);
    });

    expect(result.current.checkResult).toEqual({ canRegister: true });
    expect(result.current.isCheckLoading).toBe(false);
  });

  it('checkRegistration 실패 — 에러 핸들링 + checkResult null 유지', async () => {
    mockCheckRegistration.mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useUserPlaceCreate());

    await act(async () => {
      await result.current.checkRegistration({ name: 'A' } as never);
    });

    expect(mockHandleError).toHaveBeenCalled();
    expect(result.current.checkResult).toBeNull();
  });

  it('createPlace 호출 → 성공 응답 반환', async () => {
    mockCreateUserPlace.mockResolvedValue({ id: 99, name: 'New' });
    const { result } = renderHook(() => useUserPlaceCreate());

    let created: unknown;
    await act(async () => {
      created = await result.current.createPlace({ name: 'New' } as never);
    });

    expect(created).toEqual({ id: 99, name: 'New' });
    expect(mockHandleSuccess).toHaveBeenCalled();
    expect(result.current.isCreateLoading).toBe(false);
  });

  it('createPlace 실패 — 에러 핸들링 후 재발생', async () => {
    mockCreateUserPlace.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useUserPlaceCreate());

    await expect(
      act(async () => {
        await result.current.createPlace({ name: 'N' } as never);
      }),
    ).rejects.toThrow('boom');

    expect(mockHandleError).toHaveBeenCalled();
    expect(result.current.isCreateLoading).toBe(false);
  });

  it('resetCheck 호출 → checkResult null로 초기화', async () => {
    mockCheckRegistration.mockResolvedValue({ canRegister: true });
    const { result } = renderHook(() => useUserPlaceCreate());

    await act(async () => {
      await result.current.checkRegistration({ name: 'A' } as never);
    });
    expect(result.current.checkResult).not.toBeNull();

    act(() => { result.current.resetCheck(); });
    expect(result.current.checkResult).toBeNull();
  });
});
