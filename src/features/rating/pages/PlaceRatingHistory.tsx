/**
 * 가게 선택 이력 페이지
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '@shared/components/PageContainer';
import { PageHeader } from '@shared/components/PageHeader';
import { Button } from '@shared/components/Button';
import { DateFilterPanel } from '@shared/components/DateFilterPanel';
import { StarRatingInput } from '@features/rating/components/StarRatingInput';
import { useRatingHistory } from '@features/rating/hooks/useRatingHistory';
import type { RatingHistoryItem } from '@features/rating/types';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

function ReadOnlyStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating}점`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={star <= rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-5 w-5 ${star <= rating ? 'text-yellow-400' : 'text-text-tertiary'}`}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

interface PendingCardActionsProps {
  item: RatingHistoryItem;
  onSubmit: (id: number, rating: number) => void;
  onSkip: (id: number) => void;
}

function PendingCardActions({ item, onSubmit, onSkip }: PendingCardActionsProps) {
  const { t } = useTranslation();
  const [selectedRating, setSelectedRating] = useState(0);

  return (
    <div className="mt-3 space-y-3">
      <StarRatingInput rating={selectedRating} onRatingChange={setSelectedRating} size="sm" />
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSkip(item.id)}
          className="flex-1 text-xs"
        >
          {t('rating.didNotVisit')}
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            if (selectedRating > 0) onSubmit(item.id, selectedRating);
          }}
          disabled={selectedRating === 0}
          className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 text-xs text-white"
        >
          {t('rating.submit')}
        </Button>
      </div>
    </div>
  );
}

export function PlaceRatingHistory() {
  const { t } = useTranslation();
  const {
    items,
    page,
    totalPages,
    isLoading,
    fetchHistory,
    handleSubmitRating,
    handleSkipRating,
    selectedDate,
    handleDateChange,
    handleClearDate,
  } = useRatingHistory();

  return (
    <PageContainer>
      <PageHeader title={t('rating.placeRatingHistory')} />

      <div className="mb-6">
        <DateFilterPanel
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          onClearDate={handleClearDate}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border-default bg-bg-surface p-10 text-center shadow-lg">
          <p className="text-text-tertiary">{t('rating.noHistory')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-text-primary">{item.placeName}</p>
                <span className="shrink-0 text-xs text-text-tertiary">{formatDate(item.createdAt)}</span>
              </div>

              <div className="mt-2">
                {item.rating !== null ? (
                  <div className="flex items-center gap-2">
                    <ReadOnlyStars rating={item.rating} />
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {t('rating.statusRated')}
                    </span>
                  </div>
                ) : item.skipped ? (
                  <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                    {t('rating.statusSkipped')}
                  </span>
                ) : (
                  <PendingCardActions
                    item={item}
                    onSubmit={handleSubmitRating}
                    onSkip={handleSkipRating}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchHistory(page - 1)}
            disabled={page <= 1 || isLoading}
          >
            {t('rating.previous')}
          </Button>
          <span className="text-sm text-text-secondary">
            {t('rating.page')} {page} {t('rating.of')} {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchHistory(page + 1)}
            disabled={page >= totalPages || isLoading}
          >
            {t('rating.next')}
          </Button>
        </div>
      )}
    </PageContainer>
  );
}
