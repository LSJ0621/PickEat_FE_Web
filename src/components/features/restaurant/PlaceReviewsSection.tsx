/**
 * 장소 리뷰 섹션 컴포넌트
 * 리뷰 표시 및 확장/축소 UI를 제공합니다.
 */

import type { PlaceReview } from '@/types/menu';
import { formatDateTime } from '@/utils/format';
import { useState } from 'react';

interface PlaceReviewsSectionProps {
  reviews: PlaceReview[];
}

export const PlaceReviewsSection = ({ reviews }: PlaceReviewsSectionProps) => {
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());

  // 리뷰 펼치기/접기 토글
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

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-100">리뷰</h4>
      <p className="mb-4 text-xs text-slate-400">
        일부 리뷰를 가져왔어요.
      </p>

      <div className="flex gap-3 overflow-x-auto custom-scroll pb-2">
        {reviews.map((review: PlaceReview, index: number) => {
          const isExpanded = expandedReviews.has(index);
          const shouldShowExpand = review.text && review.text.length > 150;
          const displayText = isExpanded || !shouldShowExpand 
            ? review.text 
            : review.text?.substring(0, 150) + '...';

          return (
            <div
              key={index}
              className="flex w-64 flex-shrink-0 flex-col gap-2 rounded-xl border border-white/10 bg-slate-900/80 p-3 text-left text-sm text-slate-100"
            >
              <div className="flex items-center justify-between text-xs text-slate-300">
                {review.authorName && <span className="font-medium">{review.authorName}</span>}
                {review.rating != null && (
                  <span className="ml-2 text-amber-300">★ {review.rating.toFixed(1)}</span>
                )}
              </div>
              {review.publishTime && (
                <p className="text-[11px] text-slate-500">
                  {formatDateTime(review.publishTime)}
                </p>
              )}
              {review.text && (
                <>
                  <p className="mt-1 text-xs text-slate-200 whitespace-pre-line">
                    {displayText}
                  </p>
                  {shouldShowExpand && (
                    <button
                      onClick={() => toggleReviewExpanded(index)}
                      className="mt-1 self-start text-xs font-medium text-orange-400 hover:text-orange-300 transition"
                    >
                      {isExpanded ? '접기' : '펼쳐보기'}
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

