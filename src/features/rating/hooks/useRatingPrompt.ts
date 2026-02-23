/**
 * useRatingPrompt Hook
 * 평점 프롬프트 상태와 로직을 관리하는 커스텀 훅
 */

import { useState, useCallback } from 'react';
import type { PendingRating } from '@features/rating/types';
import { ratingService } from '@features/rating/api';
import { STORAGE_KEYS } from '@shared/utils/constants';

export function useRatingPrompt() {
  const [pendingRating, setPendingRating] = useState<PendingRating | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 대기 중인 평점 체크 (앱 로드 시 호출)
  const checkPendingRating = useCallback(async () => {
    // 1. localStorage에서 neverShow 플래그 확인
    const neverShow = localStorage.getItem(STORAGE_KEYS.RATING_PROMPT_NEVER_SHOW);
    if (neverShow) return;

    // 2. GET /ratings/pending
    try {
      const result = await ratingService.getPendingRating();
      if (result) {
        setPendingRating(result);
        setIsModalOpen(true);
      }
    } catch {
      // 평점 체크 실패는 조용히 처리 (사용자 경험 방해하지 않음)
    }
  }, []);

  // 가게 방문하지 않음
  const skipPlace = useCallback(async () => {
    if (!pendingRating) return;

    try {
      await ratingService.skipRating({
        placeRatingId: pendingRating.id,
      });
    } catch {
      // 실패해도 조용히 처리
    }

    setIsModalOpen(false);
    setPendingRating(null);
  }, [pendingRating]);

  // 이번 프롬프트 무시 (API 호출)
  const dismissRating = useCallback(async () => {
    if (!pendingRating) return;
    try {
      setIsSubmitting(true);
      await ratingService.dismissRating({ placeRatingId: pendingRating.id });
      setIsModalOpen(false);
      setPendingRating(null);
    } catch {
      // 실패해도 조용히 처리
    } finally {
      setIsSubmitting(false);
    }
  }, [pendingRating]);

  // 영구적으로 다시 보지 않기
  const dismissPermanently = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.RATING_PROMPT_NEVER_SHOW, 'true');
    setIsModalOpen(false);
    setPendingRating(null);
  }, []);

  // 이력 페이지로 이동 (모달만 닫기)
  const goToHistory = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return {
    pendingRating,
    isModalOpen,
    isSubmitting,
    checkPendingRating,
    skipPlace,
    dismissRating,
    dismissPermanently,
    goToHistory,
  };
}
