/**
 * 메뉴 추천 컴포넌트
 */

import { menuService } from '@/api/services/menu';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useStreamingRequest } from '@/hooks/common/useStreamingRequest';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  clearSelectedMenu,
  resetAiRecommendations,
  setMenuRecommendationLoading,
  setMenuRecommendations,
  setMenuSelectionCompleted,
} from '@/store/slices/agentSlice';
import type { MenuRecommendationResponse } from '@/types/menu';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuSelectionModal } from './MenuSelectionModal';
import { useTranslation } from 'react-i18next';
import { Sparkles, ChevronRight } from 'lucide-react';

interface MenuRecommendationProps {
  onMenuSelect?: (
    menuName: string,
    historyId: number,
    meta: { requestAddress: string | null }
  ) => void;
  selectedMenu?: string | null;
}

export const MenuRecommendation = ({ onMenuSelect, selectedMenu }: MenuRecommendationProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const { currentStatus, isRetrying, handleStreamEvent, resetStreamState } = useStreamingRequest();

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

  useEffect(() => {
    const currentRecommendationsKey = recommendations.map((r) => r.menu).join('|');
    const isLoadingCompleted = previousLoadingRef.current && !loading;
    const hasNewRecommendations =
      previousRecommendationsRef.current !== currentRecommendationsKey &&
      recommendations.length > 0;

    if ((isLoadingCompleted || hasNewRecommendations) && recommendations.length > 0) {
      setAnimatedMenus((prev) => {
        const newSet = new Set(prev);
        recommendations.forEach((_, index) => {
          if (!newSet.has(index)) newSet.add(index);
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

    dispatch(clearSelectedMenu());
    dispatch(resetAiRecommendations());
    dispatch(setMenuRecommendationLoading(true));
    resetStreamState();

    try {
      await menuService.recommendStream(prompt, {
        onEvent: (event) => {
          handleStreamEvent(event);
          if (event.type === 'result' && event.data) {
            const result = event.data as MenuRecommendationResponse;
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
          } else if (event.type === 'error') {
            handleError(event.message || 'Recommendation failed', 'MenuRecommendation');
          }
        },
      });
    } catch (error) {
      handleError(error, 'MenuRecommendation');
    } finally {
      dispatch(setMenuRecommendationLoading(false));
    }
  };

  const loadingLabel = isRetrying
    ? t('menu.recommendation.retrying')
    : currentStatus === 'validating'
      ? t('menu.recommendation.validating')
      : currentStatus === 'searching'
        ? t('menu.recommendation.searching')
        : t('menu.recommendation.loading');

  const loadingHint = isRetrying
    ? t('menu.recommendation.retryHint')
    : t('menu.recommendation.loadingHint');

  return (
    <div className="rounded-2xl border border-border-default bg-bg-surface p-4 shadow-md sm:rounded-3xl sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-primary/70 sm:text-xs sm:tracking-[0.4em]">
            Recommendation
          </p>
          <h2 className="mt-1.5 text-xl font-semibold text-text-primary sm:mt-2 sm:text-2xl">
            {t('menu.recommendation.title')}
          </h2>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-border-default px-3 py-1 text-[10px] text-text-secondary sm:inline-flex sm:text-xs">
          <Sparkles className="h-3 w-3 text-brand-primary/70" />
          AI curated
        </span>
      </div>

      {/* Input + Submit */}
      <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
        <div>
          <label
            htmlFor="prompt"
            className="mb-1.5 block text-xs font-medium text-text-secondary sm:mb-2 sm:text-sm"
          >
            {t('menu.recommendation.prompt')}
          </label>
          <Input
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
            className="h-11 rounded-xl border-border-default bg-bg-secondary text-text-primary placeholder:text-text-placeholder focus-visible:ring-brand-primary/40 sm:h-12 sm:rounded-2xl sm:text-base"
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

      {/* Results / Loading area */}
      <div className="mt-4 sm:mt-6">
        {loading && (
          <div className="space-y-3 rounded-2xl border border-border-default bg-bg-secondary p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 flex-shrink-0 animate-spin rounded-full border-b-2 border-orange-500 sm:h-9 sm:w-9" />
              <div>
                <p className="text-xs font-medium text-text-primary sm:text-sm">{loadingLabel}</p>
                <p className="mt-0.5 text-[10px] text-text-tertiary sm:mt-1 sm:text-xs">
                  {loadingHint}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-2xl bg-bg-tertiary/60" />
              ))}
            </div>
          </div>
        )}

        {!loading && recommendations.length > 0 && (
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-text-primary sm:text-lg">
                {t('menu.recommendation.result')}
              </h3>
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
              {(intro || closing) && (
                <div className="rounded-2xl border border-border-default bg-bg-secondary p-4 text-sm text-text-secondary shadow-sm sm:p-5 sm:text-base">
                  {intro && <p className="leading-relaxed whitespace-pre-line">{intro}</p>}
                  {recommendations.length > 0 && (
                    <ul className="mt-4 space-y-1.5">
                      {recommendations.map((item, index) => (
                        <li key={index} className="text-text-secondary">
                          • {item.condition} →{' '}
                          <span className="font-medium text-text-primary">{item.menu}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {closing && <p className="mt-4 leading-relaxed">{closing}</p>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {recommendations.map((item, index) => {
                  const shouldAnimate = animatedMenus.has(index);
                  const isSelected = selectedMenu === item.menu;
                  return (
                    <button
                      key={index}
                      onClick={() =>
                        menuHistoryId &&
                        onMenuSelect?.(item.menu, menuHistoryId, { requestAddress })
                      }
                      aria-label={`${item.menu} 선택`}
                      aria-pressed={isSelected}
                      className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border px-4 py-5 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 sm:py-6 ${
                        isSelected
                          ? 'border-brand-primary/50 bg-gradient-to-b from-brand-primary/10 via-rose-500/5 to-transparent hover:border-brand-primary/70'
                          : 'border-border-default bg-bg-surface hover:border-border-focus/40 hover:bg-bg-hover'
                      } ${shouldAnimate ? 'menu-card-enter' : 'opacity-0'}`}
                      style={{ animationDelay: shouldAnimate ? `${index * 100}ms` : '0ms' }}
                    >
                      <span
                        className={`absolute left-0 top-0 h-full w-1.5 ${
                          isSelected
                            ? 'bg-gradient-to-b from-orange-400 via-rose-400 to-fuchsia-500'
                            : 'bg-gradient-to-b from-border-default via-border-light to-transparent'
                        }`}
                      />
                      <span className="text-xs text-text-tertiary sm:text-sm" aria-hidden="true">
                        {index + 1}
                      </span>
                      <div className="mt-2 flex items-center gap-1.5">
                        <p
                          className={`text-base font-semibold sm:text-lg ${
                            isSelected ? 'text-brand-primary' : 'text-text-primary'
                          }`}
                        >
                          {item.menu}
                        </p>
                        {isSelected && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary/15 text-[10px] text-brand-primary">
                            <ChevronRight className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-center text-xs text-text-tertiary sm:text-sm">
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
