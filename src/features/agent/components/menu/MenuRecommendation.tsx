/**
 * 메뉴 추천 컴포넌트
 */

import { menuService } from '@features/agent/api';
import { Button } from '@shared/components/Button';
import { Input } from '@shared/ui/input';
import { Skeleton } from '@shared/ui/skeleton';
import { useErrorHandler } from '@shared/hooks/useErrorHandler';
import { useStreamingRequest } from '@shared/hooks/useStreamingRequest';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import {
  clearSelectedMenu,
  resetAiRecommendations,
  setMenuRecommendationLoading,
  setMenuRecommendations,
  setMenuSelectionCompleted,
} from '@app/store/slices/agentSlice';
import type { MenuRecommendationResponse } from '@features/agent/types';
import { memo, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuSelectionModal } from './MenuSelectionModal';
import { MenuRecommendationList } from './MenuRecommendationList';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

interface MenuRecommendationProps {
  onMenuSelect?: (
    menuName: string,
    historyId: number,
    meta: { requestAddress: string | null }
  ) => void;
  selectedMenu?: string | null;
}

export const MenuRecommendation = memo(function MenuRecommendation({ onMenuSelect, selectedMenu }: MenuRecommendationProps) {
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
  const menuStreamAbortRef = useRef<AbortController | null>(null);
  const menuAbortedByVisibilityRef = useRef(false);

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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (menuStreamAbortRef.current) {
          menuAbortedByVisibilityRef.current = true;
        }
        menuStreamAbortRef.current?.abort();
      } else if (document.visibilityState === 'visible') {
        if (menuAbortedByVisibilityRef.current) {
          menuAbortedByVisibilityRef.current = false;
          dispatch(setMenuRecommendationLoading(false));
          handleError(t('errors.agent.connectionLostByAppSwitch'), 'MenuRecommendation');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [dispatch, handleError, t]);

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

    const menuAbort = new AbortController();
    menuStreamAbortRef.current = menuAbort;

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
            if (!menuAbortedByVisibilityRef.current) {
              handleError(t('errors.agent.recommendationFailed'), 'MenuRecommendation');
            }
          }
        },
      }, menuAbort.signal);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Silently handle - visibility change handler deals with this
      } else {
        handleError(error, 'MenuRecommendation');
      }
    } finally {
      dispatch(setMenuRecommendationLoading(false));
      menuStreamAbortRef.current = null;
    }
  };

  const loadingLabel = isRetrying
    ? t('menu.recommendation.retrying')
    : currentStatus === 'validating'
      ? t('menu.recommendation.validating')
      : currentStatus === 'searching'
        ? t('menu.recommendation.searching')
        : currentStatus === 'recommending'
          ? t('menu.recommendation.recommending')
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
          <MenuRecommendationList
            recommendations={recommendations}
            intro={intro}
            closing={closing}
            selectedMenu={selectedMenu}
            hasMenuSelectionCompleted={hasMenuSelectionCompleted}
            menuHistoryId={menuHistoryId}
            requestAddress={requestAddress}
            animatedMenus={animatedMenus}
            onMenuSelect={onMenuSelect}
            onOpenSelectionModal={() => setShowSelectionModal(true)}
          />
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
});
