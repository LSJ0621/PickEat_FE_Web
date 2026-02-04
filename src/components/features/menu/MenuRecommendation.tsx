/**
 * 메뉴 추천 컴포넌트
 */

import { menuService } from '@/api/services/menu';
import { Button } from '@/components/common/Button';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    clearSelectedMenu,
    resetAiRecommendations,
    setMenuRecommendationLoading,
    setMenuRecommendations,
    setMenuSelectionCompleted,
    setRestaurants,
} from '@/store/slices/agentSlice';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuSelectionModal } from './MenuSelectionModal';
import { useTranslation } from 'react-i18next';

interface MenuRecommendationProps {
  onMenuSelect?: (
    menuName: string,
    historyId: number,
    meta: {
      requestAddress: string | null;
    }
  ) => void;
  selectedMenu?: string | null;
}

export const MenuRecommendation = ({ onMenuSelect, selectedMenu }: MenuRecommendationProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  
  // Redux에서 상태 가져오기
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const recommendations = useAppSelector((state) => state.agent.menuRecommendations);
  const menuHistoryId = useAppSelector((state) => state.agent.menuRecommendationHistoryId);
  const requestAddress = useAppSelector((state) => state.agent.menuRecommendationRequestAddress);
  const intro = useAppSelector((state) => state.agent.menuRecommendationIntro);
  const closing = useAppSelector((state) => state.agent.menuRecommendationClosing);
  const loading = useAppSelector((state) => state.agent.isMenuRecommendationLoading);
  const hasMenuSelectionCompleted = useAppSelector((state) => state.agent.hasMenuSelectionCompleted);
  
  const [prompt, setPrompt] = useState('');
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [animatedMenus, setAnimatedMenus] = useState<Set<number>>(new Set());
  const previousLoadingRef = useRef<boolean>(false);
  const previousRecommendationsRef = useRef<string>('');

  // 로딩이 완료되고 새로운 메뉴 추천이 나타나면 애니메이션 트리거
  useEffect(() => {
    const currentRecommendationsKey = recommendations.map(r => r.menu).join('|');
    const isLoadingCompleted = previousLoadingRef.current && !loading;
    const hasNewRecommendations = previousRecommendationsRef.current !== currentRecommendationsKey && recommendations.length > 0;

    if ((isLoadingCompleted || hasNewRecommendations) && recommendations.length > 0) {
      // 각 메뉴에 대해 애니메이션 적용
      setAnimatedMenus((prev) => {
        const newSet = new Set(prev);
        recommendations.forEach((_, index) => {
          if (!newSet.has(index)) {
            newSet.add(index);
          }
        });
        return newSet;
      });
    }

    previousLoadingRef.current = loading;
    previousRecommendationsRef.current = currentRecommendationsKey;
  }, [loading, recommendations]);

  const handleRecommend = async () => {
    if (!isAuthenticated) {
      handleError(t('menu.loginRequired'), 'MenuRecommendation');
      navigate('/login');
      return;
    }

    if (!prompt.trim()) {
      handleError(t('menu.promptRequired'), 'MenuRecommendation');
      return;
    }

    // 새 프롬프트로 추천 받을 때, 이전 검색/AI 결과 초기화
    dispatch(clearSelectedMenu());
    dispatch(setRestaurants([]));
    dispatch(resetAiRecommendations());
    dispatch(setMenuRecommendationLoading(true));
    try {
      const result = await menuService.recommend(prompt);
      dispatch(
        setMenuRecommendations({
          recommendations: result.recommendations,
          historyId: result.id,
          prompt,
          requestAddress: result.requestAddress ?? null,
          intro: result.intro,
          closing: result.closing,
        })
      );
    } catch (error) {
      handleError(error, 'MenuRecommendation');
    } finally {
      dispatch(setMenuRecommendationLoading(false));
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_20px_60px_rgba(15,23,42,0.6)] backdrop-blur sm:rounded-3xl sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-orange-200/80 sm:text-xs sm:tracking-[0.4em]">Recommendation</p>
          <h2 className="mt-1.5 text-xl font-semibold text-white sm:mt-2 sm:text-2xl">{t('menu.recommendation.title')}</h2>
        </div>
        <span className="hidden rounded-full border border-white/15 px-2.5 py-1 text-[10px] text-slate-300 sm:inline-flex sm:px-3 sm:text-xs">
          AI curated
        </span>
      </div>
      
      <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
        <div>
          <label htmlFor="prompt" className="mb-1.5 block text-xs font-medium text-slate-200 sm:mb-2 sm:text-sm">
            {t('menu.recommendation.prompt')}
          </label>
          <input
            id="prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                e.preventDefault();
                handleRecommend();
              }
            }}
            placeholder={t('menu.recommendation.placeholder')}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-base"
            disabled={loading}
          />
        </div>

        <Button
          onClick={handleRecommend}
          isLoading={loading}
          variant="primary"
          size="md"
          className="w-full sm:size-lg"
        >
          {t('menu.recommendation.submit')}
        </Button>
      </div>

      {/* 결과/로딩 영역 */}
      <div className="mt-4 sm:mt-6">
        {loading && (
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4 shadow-xl shadow-black/30 sm:rounded-2xl sm:p-5">
            <div className="flex items-center gap-2.5 text-slate-200 sm:gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500 sm:h-10 sm:w-10" />
              <div>
                <p className="text-xs font-medium text-white sm:text-sm">{t('menu.recommendation.loading')}</p>
                <p className="mt-0.5 text-[10px] text-slate-400 sm:mt-1 sm:text-xs">{t('menu.recommendation.loadingHint')}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && recommendations.length > 0 && (
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white sm:text-lg">{t('menu.recommendation.result')}</h3>
              {!hasMenuSelectionCompleted && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowSelectionModal(true)}
                  className="bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/40 text-xs sm:text-sm"
                >
                  {t('menu.recommendation.select')}
                </Button>
              )}
            </div>
            <div className="mt-3 space-y-3 sm:mt-4">
              {/* 통합 설명 블록 */}
              {(intro || closing) && (
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-transparent p-4 text-sm text-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.45)] sm:p-5 sm:text-base">
                  {/* Intro */}
                  {intro && <p className="leading-relaxed whitespace-pre-line">{intro}</p>}

                  {/* Condition/Menu 목록 */}
                  {recommendations.length > 0 && (
                    <ul className="mt-4 space-y-1.5">
                      {recommendations.map((item, index) => (
                        <li key={index} className="text-slate-300">
                          • {item.condition} → <span className="font-medium text-white">{item.menu}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Closing */}
                  {closing && <p className="mt-4 leading-relaxed">{closing}</p>}
                </div>
              )}

              {/* 메뉴 카드 그리드 - 메뉴명만 */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {recommendations.map((item, index) => {
                  const shouldAnimate = animatedMenus.has(index);
                  const isSelected = selectedMenu === item.menu;
                  return (
                    <button
                      key={index}
                      onClick={() =>
                        menuHistoryId &&
                        onMenuSelect?.(item.menu, menuHistoryId, {
                          requestAddress,
                        })
                      }
                      aria-label={`${item.menu} 선택`}
                      aria-pressed={isSelected}
                      className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border px-4 py-5 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 sm:py-6 ${
                        isSelected
                          ? 'border-orange-400/70 bg-gradient-to-r from-orange-500/15 via-rose-500/10 to-purple-500/10 hover:border-orange-300/80'
                          : 'border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-white/0 hover:border-white/30 hover:bg-white/5'
                      } ${shouldAnimate ? 'menu-card-enter' : 'opacity-0'}`}
                      style={{
                        animationDelay: shouldAnimate ? `${index * 100}ms` : '0ms',
                      }}
                    >
                      <span
                        className={`absolute left-0 top-0 h-full w-1.5 ${
                          isSelected
                            ? 'bg-gradient-to-b from-orange-400 via-rose-400 to-fuchsia-500'
                            : 'bg-gradient-to-b from-white/15 via-white/10 to-white/5'
                        }`}
                      />

                      {/* 숫자 */}
                      <span className="text-xs text-slate-400 sm:text-sm" aria-hidden="true">{index + 1}</span>

                      {/* 메뉴명 */}
                      <div className="mt-2 flex items-center gap-1.5">
                        <p className={`text-base font-semibold sm:text-lg ${isSelected ? 'text-orange-50' : 'text-white'}`}>
                          {item.menu}
                        </p>
                        {isSelected && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-[10px] text-orange-50">
                            ✓
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-center text-xs text-slate-400 sm:text-sm">
                {t('menu.recommendation.clickHint')}
              </p>
            </div>
          </div>
        )}
      </div>

      <MenuSelectionModal
        open={showSelectionModal}
        recommendations={recommendations}
        historyId={menuHistoryId}
        onClose={() => setShowSelectionModal(false)}
        onComplete={() => {
          dispatch(setMenuSelectionCompleted());
        }}
      />
    </div>
  );
};
