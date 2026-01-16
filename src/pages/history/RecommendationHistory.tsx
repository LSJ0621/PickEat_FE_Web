/**
 * 추천 이력 페이지
 */

import { userService } from '@/api/services/user';
import { HistoryItem } from '@/components/features/history/HistoryItem';
import { SkeletonCardList } from '@/components/common/SkeletonCard';
import { useInitialDataLoad } from '@/hooks/common/useInitialDataLoad';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppSelector } from '@/store/hooks';
import type { RecommendationHistoryItem } from '@/types/user';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const RecommendationHistory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const { handleError } = useErrorHandler();
  const [history, setHistory] = useState<RecommendationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [hasNext, setHasNext] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const pageRef = useRef(1);
  const isLoadingRef = useRef(false);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    pageRef.current = 1;
    setHasNext(false);
  };

  const handleClearDate = () => {
    setSelectedDate('');
    pageRef.current = 1;
    setHasNext(false);
  };

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
      const result = await userService.getRecommendationHistory({
        date: selectedDate || undefined,
        page: targetPage,
        limit: 10,
      });
      
      if (append) {
        setHistory((prev) => [...prev, ...result.items]);
      } else {
        setHistory(result.items);
      }
      
      pageRef.current = targetPage;
      setHasNext(result.pageInfo.hasNext);
      setTotalCount(result.pageInfo.totalCount);
    } catch (error: unknown) {
      handleError(error, 'RecommendationHistory');
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedDate, handleError]);

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

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-orange-400/40 via-rose-400/30 to-purple-500/30 blur-3xl animate-gradient" />
        <div className="absolute -bottom-52 left-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-sky-500/30 via-emerald-500/20 to-transparent blur-3xl animate-gradient" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 sm:px-6 lg:px-8">
        <div className="flex-1 py-10 pb-24">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">{t('menu.history')}</h1>
            <p className="mt-2 text-slate-300">{t('menu.historyDesc')}</p>
          </div>

          {/* 날짜 필터 */}
          {selectedDate && (
            <div className="mb-8">
              <div className="flex items-center gap-2">
                <div className="relative rounded-xl border border-orange-500/50 bg-orange-500/10 transition-all">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-[150px] cursor-pointer bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:hover:bg-white/10 [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
                
                <button
                  onClick={handleClearDate}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
                  title={t('menu.filterReset')}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>
                  <span className="text-orange-400 font-medium">
                    {new Date(selectedDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  {t('menu.showingDateOnly')}
                </span>
              </div>
            </div>
          )}

          {!selectedDate && (
            <div className="mb-8">
              <div className="flex items-center gap-2">
                <div className="relative rounded-xl border border-white/10 bg-white/5 transition-all hover:border-white/20">
                  <input
                    type="date"
                    value=""
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-[150px] cursor-pointer bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:hover:bg-white/10 [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              <SkeletonCardList count={5} />
            </div>
          ) : (() => {
              const menuHistory = history.filter(
                (item) => item.recommendations && item.recommendations.length > 0
              );

              if (menuHistory.length === 0) {
                return (
                  <div className="rounded-[32px] border border-white/10 bg-white/5 p-12 text-center shadow-2xl shadow-black/40 backdrop-blur">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-slate-400">
                        {selectedDate ? t('menu.noRecommendationsForDate') : t('menu.noHistory')}
                      </p>
                      {selectedDate && (
                        <button
                          onClick={handleClearDate}
                          className="mt-2 text-sm text-orange-400 hover:text-orange-300 transition"
                        >
                          {t('menu.viewAllHistory')} →
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              return (
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
                        className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white/5"
                      >
                        {loadingMore ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                            <span>{t('menu.loadingMore')}</span>
                          </div>
                        ) : (
                          t('menu.loadMore')
                        )}
                      </button>
                    </div>
                  )}

                  {totalCount > 0 && !hasNext && (
                    <div className="mt-4 text-center text-sm text-slate-400">
                      {t('menu.totalCount', { count: totalCount })}
                    </div>
                  )}
                </>
              );
            })()
          }
        </div>
      </div>
    </div>
  );
};
