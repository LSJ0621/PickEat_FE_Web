/**
 * 추천 이력 페이지
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userService } from '@/api/services/user';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppSelector } from '@/store/hooks';
import { HistoryItem } from '@/components/features/history/HistoryItem';
import { formatDateTimeKorean } from '@/utils/format';
import type { RecommendationHistoryItem } from '@/types/user';

type FilterType = 'all' | 'today' | 'week' | 'custom';

export const RecommendationHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const { handleError } = useErrorHandler();
  const [history, setHistory] = useState<RecommendationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const hasInitializedRef = useRef(false);
  const prevSelectedDateRef = useRef<string>('');
  const currentPathnameRef = useRef<string>(location.pathname);

  // 오늘 날짜 (YYYY-MM-DD)
  const getToday = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleFilterChange = (type: FilterType) => {
    setFilterType(type);
    if (type === 'all') {
      setSelectedDate('');
    } else if (type === 'today') {
      setSelectedDate(getToday());
    } else if (type === 'week') {
      // week는 특별 처리 - 서버가 범위 검색을 지원하지 않으면 클라이언트에서 필터링
      setSelectedDate('');
    }
  };

  const handleCustomDateChange = (date: string) => {
    setSelectedDate(date);
    setFilterType('custom');
  };

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const result = await userService.getRecommendationHistory(selectedDate || undefined);
      setHistory(result.history);
    } catch (error: unknown) {
      handleError(error, 'RecommendationHistory');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // 인증 확인 및 리다이렉트
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // 경로 변경 감지 및 초기화 리셋 (컴포넌트 재사용 시 대비)
  useEffect(() => {
    if (currentPathnameRef.current !== location.pathname) {
      hasInitializedRef.current = false;
      prevSelectedDateRef.current = '';
      currentPathnameRef.current = location.pathname;
    }
  }, [location.pathname]);

  // 데이터 로드 (StrictMode 대응)
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // StrictMode 대응: 초기 마운트 시 중복 호출 방지
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      loadHistory();
      return;
    }

    // selectedDate가 변경된 경우에만 호출
    if (prevSelectedDateRef.current !== selectedDate) {
      prevSelectedDateRef.current = selectedDate;
      loadHistory();
    }
    // loadHistory는 selectedDate를 dependency로 가지므로 selectedDate 변경 시 재생성됨
    // dependency에서 제외하고 selectedDate만 사용하여 무한 루프 방지
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
          <div className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* 빠른 필터 버튼들 */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-900/50 p-1 backdrop-blur">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    filterType === 'all'
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => handleFilterChange('today')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    filterType === 'today'
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  오늘
                </button>
                <button
                  onClick={() => handleFilterChange('week')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    filterType === 'week'
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  최근 7일
                </button>
              </div>

              {/* 날짜 직접 선택 */}
              <div className="flex items-center gap-2">
                <div className={`relative rounded-xl border transition-all ${
                  filterType === 'custom' 
                    ? 'border-orange-500/50 bg-orange-500/10' 
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}>
                  <input
                    type="date"
                    value={filterType === 'custom' ? selectedDate : ''}
                    onChange={(e) => handleCustomDateChange(e.target.value)}
                    className="w-[150px] cursor-pointer bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:hover:bg-white/10 [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
                
                {filterType === 'custom' && selectedDate && (
                  <button
                    onClick={() => handleFilterChange('all')}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
                    title="필터 초기화"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* 현재 필터 상태 표시 */}
            {(filterType !== 'all' || selectedDate) && (
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>
                  {filterType === 'today' && '오늘의 추천만 표시'}
                  {filterType === 'week' && '최근 7일간의 추천만 표시'}
                  {filterType === 'custom' && selectedDate && (
                    <>
                      <span className="text-orange-400 font-medium">
                        {new Date(selectedDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      의 추천만 표시
                    </>
                  )}
                </span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500"></div>
            </div>
          ) : (() => {
              // 메뉴 추천이 있는 이력만 표시 (recommendations 배열이 존재하고 비어있지 않은 항목)
              let menuHistory = history.filter(
                (item) => item.recommendations && item.recommendations.length > 0
              );

              // "최근 7일" 필터인 경우 클라이언트에서 추가 필터링
              if (filterType === 'week') {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                weekAgo.setHours(0, 0, 0, 0);
                
                menuHistory = menuHistory.filter((item) => {
                  const itemDate = new Date(item.recommendedAt);
                  return itemDate >= weekAgo;
                });
              }

              if (menuHistory.length === 0) {
                return (
                  <div className="rounded-[32px] border border-white/10 bg-white/5 p-12 text-center shadow-2xl shadow-black/40 backdrop-blur">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-slate-400">
                        {filterType === 'all' && '추천 이력이 없습니다.'}
                        {filterType === 'today' && '오늘 받은 추천이 없습니다.'}
                        {filterType === 'week' && '최근 7일간 받은 추천이 없습니다.'}
                        {filterType === 'custom' && '선택한 날짜에 받은 추천이 없습니다.'}
                      </p>
                      {filterType !== 'all' && (
                        <button
                          onClick={() => handleFilterChange('all')}
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
                <div className="space-y-4">
                  {menuHistory.map((item) => (
                    <HistoryItem key={item.id} item={item} formatDate={formatDateTimeKorean} />
                  ))}
                </div>
              );
            })()
          }
        </div>
      </div>
    </div>
  );
};
