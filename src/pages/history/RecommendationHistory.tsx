/**
 * 추천 이력 페이지
 */

import { userService } from '@/api/services/user';
import { HistoryItem } from '@/components/features/history/HistoryItem';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppSelector } from '@/store/hooks';
import type { RecommendationHistoryItem } from '@/types/user';
import { formatDateTimeKorean } from '@/utils/format';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const RecommendationHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const { handleError } = useErrorHandler();
  const [history, setHistory] = useState<RecommendationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [hasNext, setHasNext] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const hasInitializedRef = useRef(false);
  const prevSelectedDateRef = useRef<string>('');
  const currentPathnameRef = useRef<string>(location.pathname);
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

  useEffect(() => {
    if (currentPathnameRef.current !== location.pathname) {
      hasInitializedRef.current = false;
      prevSelectedDateRef.current = '';
      currentPathnameRef.current = location.pathname;
      pageRef.current = 1;
      setHasNext(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      pageRef.current = 1;
      setHasNext(false);
      loadHistory(1, false);
      return;
    }

    if (prevSelectedDateRef.current !== selectedDate) {
      prevSelectedDateRef.current = selectedDate;
      pageRef.current = 1;
      loadHistory(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, selectedDate]);
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
            <h1 className="text-3xl font-bold text-white">추천 이력</h1>
            <p className="mt-2 text-slate-300">과거에 받은 메뉴 추천을 확인할 수 있습니다.</p>
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
                  title="필터 초기화"
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
                  의 추천만 표시
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
            <div className="flex items-center justify-center py-20">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500"></div>
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
                        {selectedDate ? '선택한 날짜에 받은 추천이 없습니다.' : '추천 이력이 없습니다.'}
                      </p>
                      {selectedDate && (
                        <button
                          onClick={handleClearDate}
                          className="mt-2 text-sm text-orange-400 hover:text-orange-300 transition"
                        >
                          전체 이력 보기 →
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
                      <HistoryItem key={item.id} item={item} formatDate={formatDateTimeKorean} />
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
                            <span>불러오는 중...</span>
                          </div>
                        ) : (
                          '더 보기'
                        )}
                      </button>
                    </div>
                  )}
                  
                  {totalCount > 0 && !hasNext && (
                    <div className="mt-4 text-center text-sm text-slate-400">
                      총 {totalCount}개의 추천 이력 (모두 불러왔습니다)
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
