/**
 * 장소 리뷰 섹션 컴포넌트
 * 리뷰 표시 및 확장/축소 UI를 제공합니다.
 */

import type { PlaceReview } from '@features/agent/types';
import { formatDateTime } from '@shared/utils/format';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PlaceReviewsSectionProps {
  reviews: PlaceReview[];
}

export const PlaceReviewsSection = ({ reviews }: PlaceReviewsSectionProps) => {
  const { t } = useTranslation();
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());

  const toggleReviewExpanded = (index: number) => {
    setExpandedReviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-text-primary">{t('place.reviewsTitle')}</h4>
        <p className="mt-1 text-xs text-text-tertiary">{t('place.reviewsFetched')}</p>
      </div>

      <div className="flex gap-3 overflow-x-auto custom-scroll pb-2">
        {reviews.map((review: PlaceReview, index: number) => {
          const isExpanded = expandedReviews.has(index);
          const shouldShowExpand = review.text && review.text.length > 150;
          const displayText =
            isExpanded || !shouldShowExpand ? review.text : review.text?.substring(0, 150) + '...';

          return (
            <div
              key={index}
              className="flex w-64 flex-shrink-0 flex-col gap-2 rounded-xl border border-border-default bg-bg-surface p-4 text-left text-sm text-text-primary transition-all duration-150 hover:border-border-focus/30 hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                {review.authorName && (
                  <span className="text-xs font-semibold text-text-secondary truncate">{review.authorName}</span>
                )}
                {review.rating != null && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <svg className="h-3 w-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-medium text-amber-300">{review.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              {review.publishTime && (
                <p className="text-[11px] text-text-placeholder">{formatDateTime(review.publishTime)}</p>
              )}
              {review.text && (
                <>
                  <p className="text-xs text-text-primary whitespace-pre-line leading-relaxed">{displayText}</p>
                  {shouldShowExpand && (
                    <button
                      onClick={() => toggleReviewExpanded(index)}
                      className="self-start text-xs font-medium text-orange-400 hover:text-orange-300 transition-colors duration-150"
                    >
                      {isExpanded ? t('place.collapse') : t('place.expand')}
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
