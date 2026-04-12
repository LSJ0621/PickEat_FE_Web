/**
 * useRatingHistory 테스트 (handleSubmitRating / handleSkipRating 범위)
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useRatingHistory } from '@features/rating/hooks/useRatingHistory';

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('@shared/hooks/useToast', () => ({
  useToast: () => ({
    success: mockToastSuccess,
    error: mockToastError,
    info: vi.fn(),
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
}));

const mockGetRatingHistory = vi.hoisted(() => vi.fn());
const mockSubmitRating = vi.hoisted(() => vi.fn());
const mockSkipRating = vi.hoisted(() => vi.fn());

vi.mock('@features/rating/api', () => ({
  ratingService: {
    getRatingHistory: mockGetRatingHistory,
    submitRating: mockSubmitRating,
    skipRating: mockSkipRating,
  },
}));

const defaultPage = {
  items: [{ id: 1, placeName: 'A', rating: null }],
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
};

describe('useRatingHistory', () => {
  beforeEach(() => {
    mockToastSuccess.mockClear();
    mockToastError.mockClear();
    mockGetRatingHistory.mockReset();
    mockSubmitRating.mockReset();
    mockSkipRating.mockReset();
    mockGetRatingHistory.mockResolvedValue(defaultPage);
  });

  it('handleSubmitRating 성공 — submitRating 호출 후 fetchHistory 재실행, items 갱신', async () => {
    const { result } = renderHook(() => useRatingHistory());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockSubmitRating.mockResolvedValue(undefined);
    const refreshedPage = { ...defaultPage, items: [{ id: 1, placeName: 'A', rating: 5 }] };
    mockGetRatingHistory.mockResolvedValue(refreshedPage);

    await act(async () => {
      await result.current.handleSubmitRating(1, 5);
    });

    expect(mockSubmitRating).toHaveBeenCalledWith({ placeRatingId: 1, rating: 5 });
    expect(mockToastSuccess).toHaveBeenCalled();
    expect(result.current.items[0].rating).toBe(5);
  });

  it('handleSubmitRating 실패 — 기존 items 유지, 에러 토스트', async () => {
    const { result } = renderHook(() => useRatingHistory());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockSubmitRating.mockRejectedValue(new Error('fail'));
    const beforeItems = result.current.items;

    await act(async () => {
      await result.current.handleSubmitRating(1, 3);
    });

    expect(mockToastError).toHaveBeenCalled();
    expect(result.current.items).toEqual(beforeItems);
    expect(result.current.isLoading).toBe(false);
  });

  it('handleSkipRating 성공 — skipRating 호출 후 fetchHistory 재실행', async () => {
    const { result } = renderHook(() => useRatingHistory());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockSkipRating.mockResolvedValue(undefined);
    const refreshedPage = { ...defaultPage, items: [] };
    mockGetRatingHistory.mockResolvedValue(refreshedPage);

    await act(async () => {
      await result.current.handleSkipRating(1);
    });

    expect(mockSkipRating).toHaveBeenCalledWith({ placeRatingId: 1 });
    expect(mockToastSuccess).toHaveBeenCalled();
    expect(result.current.items).toEqual([]);
  });

  it('handleSkipRating 실패 — 기존 items 유지, 에러 토스트', async () => {
    const { result } = renderHook(() => useRatingHistory());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockSkipRating.mockRejectedValue(new Error('fail'));
    const beforeItems = result.current.items;

    await act(async () => {
      await result.current.handleSkipRating(1);
    });

    expect(mockToastError).toHaveBeenCalled();
    expect(result.current.items).toEqual(beforeItems);
    expect(result.current.isLoading).toBe(false);
  });
});
