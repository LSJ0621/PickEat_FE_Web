/**
 * 추천 이력 페이지
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '@/api/services/user';
import { useAppSelector } from '@/store/hooks';
import { AppHeader } from '@/components/common/AppHeader';
import { HistoryItem } from '@/components/features/history/HistoryItem';
import type { RecommendationHistoryItem } from '@/types/user';

export const RecommendationHistory = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const [history, setHistory] = useState<RecommendationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadHistory();
  }, [isAuthenticated, navigate, selectedDate]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const result = await userService.getRecommendationHistory(selectedDate || undefined);
      setHistory(result.history);
    } catch (error: any) {
      console.error('추천 이력 조회 실패:', error);
      alert('추천 이력을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-orange-400/40 via-rose-400/30 to-purple-500/30 blur-3xl animate-gradient" />
        <div className="absolute -bottom-52 left-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-sky-500/30 via-emerald-500/20 to-transparent blur-3xl animate-gradient" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <AppHeader />
        <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">추천 이력</h1>
            <p className="mt-2 text-slate-300">과거에 받은 메뉴 추천을 확인할 수 있습니다.</p>
          </div>

        <div className="mb-6">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-white focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="ml-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              전체 보기
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-12 text-center shadow-2xl shadow-black/40 backdrop-blur">
            <p className="text-slate-400">추천 이력이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <HistoryItem key={item.id} item={item} formatDate={formatDate} />
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

