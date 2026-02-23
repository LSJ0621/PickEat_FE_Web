/**
 * 추천 이력 페이지
 */

import { userService } from '@/api/services/user';
import { HistoryItem } from '@/components/features/history/HistoryItem';
import { SkeletonCardList } from '@/components/common/SkeletonCard';
import { DateFilterPanel } from '@/components/common/DateFilterPanel';
import { DataErrorFallback } from '@/components/common/DataErrorFallback';
import { PageContainer } from '@/components/common/PageContainer';
import { PageHeader } from '@/components/common/PageHeader';
import { useInitialDataLoad } from '@/hooks/common/useInitialDataLoad';
import { useDateFilter } from '@/hooks/common/useDateFilter';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppSelector } from '@/store/hooks';
import { extractErrorMessage } from '@/utils/error';
import type { RecommendationHistoryItem } from '@/types/user';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';

export const RecommendationHistory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const { handleError } = useErrorHandler();
  const [history, setHistory] = useState<RecommendationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(1);
  const isLoadingRef = useRef(false);

  // Date filter hook with pagination reset callback
  const {
    selectedDate,
    handleDateChange,
    handleClearDate,
  } = useDateFilter({
    onDateChange: () => {
      // Reset pagination when dates change
      pageRef.current = 1;
      setHasNext(false);
    },
  });

  const loadHistory = useCallback(async (targetPage: number = 1, append: boolean = false) => {
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      // Single date filter: use selectedDate if set, otherwise fetch all
      const dateParam = selectedDate || undefined;
      const result = await userService.getRecommendationHistory({
        date: dateParam,
        page: targetPage,
        limit: 10,
      });

      setError(null);

      if (append) {
        setHistory((prev) => [...prev, ...result.items]);
      } else {
        setHistory(result.items);
      }

      pageRef.current = targetPage;
      setHasNext(result.pageInfo.hasNext);
      setTotalCount(result.pageInfo.totalCount);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, '추천 이력을 불러오지 못했습니다'));
      handleError(err, 'RecommendationHistory');
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedDate, handleError]);

  const handleRetry = useCallback(() => {
    pageRef.current = 1;
    setHasNext(false);
    loadHistory(1, false);
  }, [loadHistory]);

  const handleLoadMore = useCallback(() => {
    if (!hasNext || loadingMore || loading || isLoadingRef.current) {
      return;
    }

    const nextPage = pageRef.current + 1;
    loadHistory(nextPage, true);
  }, [hasNext, loadingMore, loading, loadHistory]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // 데이터 로드 (StrictMode 대응)
  useInitialDataLoad({
    enabled: isAuthenticated,
    loadFn: () => {
      pageRef.current = 1;
      setHasNext(false);
      loadHistory(1, false);
    },
    dependencies: [selectedDate],
  });

  if (!isAuthenticated) {
    return null;
  }

  const menuHistory = history.filter(
    (item) => item.recommendations && item.recommendations.length > 0
  );

  return (
    <PageContainer>
      <PageHeader
        title={t('menu.history')}
        subtitle={t('menu.historyDesc')}
      />

      {/* 날짜 필터 */}
      <div className="mb-8">
        <DateFilterPanel
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          onClearDate={handleClearDate}
        />
      </div>

      {error && !loading ? (
        <DataErrorFallback message={error} onRetry={handleRetry} />
      ) : loading ? (
        <div className="space-y-4">
          <SkeletonCardList count={5} />
        </div>
      ) : menuHistory.length === 0 ? (
        <div className="rounded-2xl border border-border-default bg-bg-surface p-12 text-center shadow-lg">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bg-secondary">
              <ClipboardList className="h-7 w-7 text-text-tertiary" />
            </div>
            <p className="text-text-tertiary">
              {selectedDate ? t('menu.noRecommendationsForDate') : t('menu.noHistory')}
            </p>
            {selectedDate && (
              <button
                onClick={handleClearDate}
                className="mt-1 text-sm font-medium text-brand-primary hover:text-orange-600 transition-colors"
              >
                {t('menu.viewAllHistory')} &rarr;
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {menuHistory.map((item) => (
              <HistoryItem key={item.id} item={item} />
            ))}
          </div>

          {hasNext && (
            <div className="mt-8 flex flex-col items-center gap-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore || loading}
                className="rounded-xl border border-border-default bg-bg-surface px-6 py-3 text-sm font-medium text-text-primary transition-all hover:bg-bg-hover hover:border-border-focus disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-bg-surface"
              >
                {loadingMore ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
                    <span>{t('menu.loadingMore')}</span>
                  </div>
                ) : (
                  t('menu.loadMore')
                )}
              </button>
            </div>
          )}

          {totalCount > 0 && !hasNext && (
            <div className="mt-4 text-center text-sm text-text-tertiary">
              {t('menu.totalCount', { count: totalCount })}
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
};
