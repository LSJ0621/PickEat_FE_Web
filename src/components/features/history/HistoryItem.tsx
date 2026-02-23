/**
 * 추천 이력 아이템 컴포넌트
 */

import { Button } from '@/components/common/Button';
import { AiPlaceRecommendations } from '@/components/features/restaurant/AiPlaceRecommendations';
import { PlaceDetailsModal } from '@/components/features/restaurant/PlaceDetailsModal';
import { useHistoryAiHistory } from '@/hooks/history/useHistoryAiHistory';
import { useHistoryAiRecommendations } from '@/hooks/history/useHistoryAiRecommendations';
import { useHistoryMenuActions } from '@/hooks/history/useHistoryMenuActions';
import { useUserLocation } from '@/hooks/map/useUserLocation';
import { useAppSelector } from '@/store/hooks';
import type { MenuPlaceRecommendationGroup } from '@/store/slices/agentSlice';
import type { PlaceRecommendationItemV2 } from '@/types/menu';
import type { RecommendationHistoryItem } from '@/types/user';
import { formatDateTimeKorean } from '@/utils/format';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ShieldCheck, Info, X } from 'lucide-react';

interface HistoryItemProps {
  item: RecommendationHistoryItem;
}

interface PlaceListItemProps {
  recommendation: PlaceRecommendationItemV2;
  index: number;
  sourceType: 'community' | 'search';
  onSelect: (place: PlaceRecommendationItemV2) => void;
}

const PlaceListItem = ({ recommendation, index, sourceType, onSelect }: PlaceListItemProps) => {
  const bg = sourceType === 'community' ? 'bg-blue-500/10 hover:bg-blue-500/15' : 'bg-emerald-500/10 hover:bg-emerald-500/15';
  const numBg = sourceType === 'community' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300';
  return (
    <div onClick={() => onSelect(recommendation)} className={`group flex cursor-pointer items-center gap-3 rounded-xl p-3 transition ${bg}`}>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${numBg}`}>{index + 1}</span>
      <div className="min-w-0 flex-1">
        <h5 className="truncate font-medium text-text-primary group-hover:text-brand-primary">{recommendation.name}</h5>
        {recommendation.reason && <p className="mt-0.5 truncate text-xs text-text-tertiary">{recommendation.reason}</p>}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-text-tertiary group-hover:text-brand-primary" />
    </div>
  );
};

export const HistoryItem = ({ item }: HistoryItemProps) => {
  const { t } = useTranslation();
  const [selectedPlace, setSelectedPlace] = useState<PlaceRecommendationItemV2 | null>(null);
  const { address } = useUserLocation();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const menuActions = useHistoryMenuActions();
  const aiRecommendations = useHistoryAiRecommendations({ historyItem: item });
  const aiHistory = useHistoryAiHistory({ historyItem: item });

  const hasAiQueryContext = Boolean(item.requestAddress?.trim() || address?.trim());

  const handleMenuClickWithReset = (menu: string) => {
    const isSameMenu = menuActions.selectedMenu === menu;
    menuActions.handleMenuClick(menu);
    if (!isSameMenu) { aiRecommendations.resetAiRecommendations(); setSelectedPlace(null); }
  };

  const handleAiRecommendWithClose = async () => {
    menuActions.handleCancel();
    if (!menuActions.selectedMenu) return;
    try { await aiRecommendations.handleAiRecommend(menuActions.selectedMenu); } catch { /* handled internally */ }
  };

  useEffect(() => {
    if (!menuActions.showConfirmCard) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') menuActions.handleCancel(); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [menuActions]);

  const aiRecommendationGroups: MenuPlaceRecommendationGroup[] = useMemo(() => {
    if (!menuActions.selectedMenu || aiRecommendations.aiRecommendations.length === 0) return [];
    return [{ menuName: menuActions.selectedMenu, recommendations: aiRecommendations.aiRecommendations }];
  }, [aiRecommendations.aiRecommendations, menuActions.selectedMenu]);

  return (
    <>
      <div className="rounded-2xl border border-border-default bg-bg-surface p-5 shadow-md transition-shadow hover:shadow-lg">
        {/* 헤더 */}
        <div className="mb-4">
          <p className="text-xs text-text-tertiary">{formatDateTimeKorean(item.recommendedAt)}</p>
          {item.prompt && <p className="mt-2 text-text-secondary">"{item.prompt}"</p>}
          {item.reason && (
            <div className="mt-3 rounded-xl border border-border-default bg-bg-secondary p-3 text-sm">
              <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-primary/80">
                <Info className="h-3.5 w-3.5 text-brand-primary" />
                {t('history.recommendationReason')}
              </div>
              <p className="leading-relaxed text-text-primary">{item.reason}</p>
            </div>
          )}
        </div>

        {/* 메뉴 태그 + AI 이력 버튼 */}
        <div className="flex flex-wrap items-center gap-2">
          {item.recommendations.map((rec) => (
            <button key={rec.menu} onClick={() => handleMenuClickWithReset(rec.menu)}
              className="rounded-full border border-brand-primary/30 bg-brand-primary/10 px-4 py-1.5 text-sm text-brand-primary transition hover:border-brand-primary/50 hover:bg-brand-primary/20">
              {rec.menu}
            </button>
          ))}
          {item.hasPlaceRecommendations && (
            <button onClick={aiHistory.handleShowAiHistory} disabled={!isAuthenticated || aiHistory.isAiHistoryLoading}
              className={`ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${aiHistory.showAiHistory ? 'bg-bg-secondary text-text-secondary' : 'bg-gradient-to-r from-brand-primary/20 to-rose-500/20 text-brand-primary hover:from-brand-primary/30 hover:to-rose-500/30'}`}>
              {aiHistory.isAiHistoryLoading ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <ShieldCheck className="h-3.5 w-3.5" />}
              <span>{aiHistory.showAiHistory ? t('history.close') : t('history.aiRecommendation')}</span>
            </button>
          )}
        </div>

        {/* AI 추천 이력 결과 */}
        {item.hasPlaceRecommendations && aiHistory.showAiHistory && (
          <div className="mt-4 rounded-2xl border border-orange-500/10 bg-gradient-to-br from-orange-500/5 to-rose-500/5 p-4">
            {aiHistory.isAiHistoryLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-text-tertiary">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                <span>{t('history.loadingAiRecommendations')}</span>
              </div>
            ) : aiHistory.aiHistoryRecommendations.length > 0 ? (
              <div className="space-y-4">
                {aiHistory.groupedAiHistory.map((group) => {
                  const communityPlaces = group.recommendations.filter(r => r.source === 'USER');
                  const searchPlaces = group.recommendations.filter(r => r.source === 'GOOGLE');
                  return (
                    <div key={group.menuName} className="rounded-xl border border-border-default bg-bg-surface p-3">
                      <div className="mb-3">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-brand-primary/70">{t('history.menuLabel')}</p>
                        <h4 className="text-lg font-semibold text-text-primary">{group.menuName}</h4>
                      </div>
                      {communityPlaces.length > 0 && (
                        <div className="mb-4">
                          <div className="mb-2 flex items-center gap-2"><div className="h-px flex-1 bg-blue-500/30" /><span className="text-xs text-blue-400">{t('history.communityBadge')}</span><div className="h-px flex-1 bg-blue-500/30" /></div>
                          <div className="space-y-2">{communityPlaces.map((place, idx) => <PlaceListItem key={`${group.menuName}-${place.placeId}-${idx}`} recommendation={place} index={idx} sourceType="community" onSelect={setSelectedPlace} />)}</div>
                        </div>
                      )}
                      {searchPlaces.length > 0 && (
                        <div>
                          <div className="mb-2 flex items-center gap-2"><div className="h-px flex-1 bg-emerald-500/30" /><span className="text-xs text-emerald-400">{t('history.searchBadge')}</span><div className="h-px flex-1 bg-emerald-500/30" /></div>
                          <div className="space-y-2">{searchPlaces.map((place, idx) => <PlaceListItem key={`${group.menuName}-${place.placeId}-${idx}`} recommendation={place} index={idx} sourceType="search" onSelect={setSelectedPlace} />)}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* AI 추천 확인 모달 */}
      {menuActions.showConfirmCard && menuActions.selectedMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) menuActions.handleCancel(); }}>
          <div className="relative w-full max-w-md rounded-2xl border border-border-default bg-bg-surface p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={menuActions.handleCancel} aria-label={t('common.close')}
              className="absolute right-5 top-5 rounded-lg p-1 text-text-tertiary transition hover:bg-bg-hover hover:text-text-primary">
              <X className="h-5 w-5" />
            </button>
            <p className="mb-5 text-center text-lg font-medium text-text-primary">
              <span className="font-semibold text-brand-primary">{menuActions.selectedMenu}</span>
              {t('history.aiRecommendGet')}
            </p>
            <Button onClick={handleAiRecommendWithClose} variant="primary" size="lg" disabled={!hasAiQueryContext} className="w-full">{t('common.confirm')}</Button>
            {!hasAiQueryContext && <p className="mt-4 rounded-xl border border-amber-300/30 bg-amber-500/10 p-3 text-center text-sm text-amber-200">{t('history.needsAddressForAi')}</p>}
          </div>
        </div>
      )}

      {/* AI 추천 결과 */}
      {!menuActions.showConfirmCard && menuActions.selectedMenu && (
        <div className="mt-4 space-y-4">
          {(aiRecommendations.aiRecommendations.length > 0 || aiRecommendations.isAiLoading) && (
            <AiPlaceRecommendations activeMenuName={menuActions.selectedMenu} recommendations={aiRecommendationGroups}
              loadingMenuName={aiRecommendations.aiLoadingMenu} searchEntryPointHtml={aiRecommendations.searchEntryPointHtml}
              onSelect={(recommendation) => setSelectedPlace(recommendation)}
              onReset={() => { aiRecommendations.resetAiRecommendations(); setSelectedPlace(null); }} />
          )}
        </div>
      )}

      <PlaceDetailsModal placeId={selectedPlace?.placeId ?? null} placeName={selectedPlace?.name ?? null}
        localizedName={selectedPlace?.localizedName ?? null} searchName={selectedPlace?.searchName ?? null}
        searchAddress={selectedPlace?.searchAddress ?? null} onClose={() => setSelectedPlace(null)} />
    </>
  );
};
