/**
 * useRatingHistory Hook
 * 가게 선택 이력 상태와 로직을 관리하는 커스텀 훅
 */

import { useState, useEffect, useCallback } from 'react';
import { ratingService } from '@/api/services/rating';
import type { RatingHistoryItem } from '@/types/rating';
import { useToast } from '@/hooks/common/useToast';
import { useDateFilter } from '@/hooks/common/useDateFilter';
import { extractErrorMessage } from '@/utils/error';

export function useRatingHistory() {
  const { success: showSuccess, error: showError } = useToast();
  const [items, setItems] = useState<RatingHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { selectedDate, handleDateChange, handleClearDate } = useDateFilter({
    onDateChange: () => setPage(1),
  });

  const fetchHistory = useCallback(async (targetPage?: number) => {
    const pageToFetch = targetPage ?? page;
    setIsLoading(true);
    try {
      const result = await ratingService.getRatingHistory({
        page: pageToFetch,
        limit,
        selectedDate: selectedDate || undefined,
      });
      setItems(result.items);
      setTotal(result.total);
      setPage(result.page);
      setTotalPages(result.totalPages);
    } catch (error: unknown) {
      const message = extractErrorMessage(error, '이력을 불러오지 못했습니다.');
      showError(message);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, selectedDate, showError]);

  const handleSubmitRating = useCallback(async (placeRatingId: number, rating: number) => {
    try {
      await ratingService.submitRating({ placeRatingId, rating });
      showSuccess('평점이 등록되었습니다');
      await fetchHistory(page);
    } catch (error: unknown) {
      const message = extractErrorMessage(error, '평점 등록에 실패했습니다.');
      showError(message);
    }
  }, [page, fetchHistory, showSuccess, showError]);

  const handleSkipRating = useCallback(async (placeRatingId: number) => {
    try {
      await ratingService.skipRating({ placeRatingId });
      showSuccess('안 갔어요로 처리되었습니다');
      await fetchHistory(page);
    } catch (error: unknown) {
      const message = extractErrorMessage(error, '처리에 실패했습니다.');
      showError(message);
    }
  }, [page, fetchHistory, showSuccess, showError]);

  useEffect(() => {
    fetchHistory(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
    isLoading,
    fetchHistory,
    handleSubmitRating,
    handleSkipRating,
    selectedDate,
    handleDateChange,
    handleClearDate,
  };
}
