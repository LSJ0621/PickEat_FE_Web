/**
 * 추천 이력 아이템 컴포넌트
 */

import { Button } from '@/components/common/Button';
import { AiPlaceRecommendations } from '@/components/features/restaurant/AiPlaceRecommendations';
import { PlaceDetailsModal } from '@/components/features/restaurant/PlaceDetailsModal';
import { RestaurantList } from '@/components/features/restaurant/RestaurantList';
import { useHistoryAiHistory } from '@/hooks/history/useHistoryAiHistory';
import { useHistoryAiRecommendations } from '@/hooks/history/useHistoryAiRecommendations';
import { useHistoryMenuActions } from '@/hooks/history/useHistoryMenuActions';
import { useUserLocation } from '@/hooks/map/useUserLocation';
import { useAppSelector } from '@/store/hooks';
import type { MenuPlaceRecommendationGroup } from '@/store/slices/agentSlice';
import type { PlaceRecommendationItem } from '@/types/menu';
import type { RecommendationHistoryItem } from '@/types/user';
import { formatDateTimeKorean } from '@/utils/format';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface HistoryItemProps {
  item: RecommendationHistoryItem;
}

/**
 * Helper component for rendering individual place items
 */
interface PlaceListItemProps {
  recommendation: PlaceRecommendationItem;
  index: number;
  sourceType: 'community' | 'search';
  onSelect: (place: PlaceRecommendationItem) => void;
}

const PlaceListItem = ({ recommendation, index, sourceType, onSelect }: PlaceListItemProps) => {
  const bgColorClass = sourceType === 'community' ? 'bg-blue-500/10' : 'bg-emerald-500/10';
  const hoverBgClass = sourceType === 'community' ? 'hover:bg-blue-500/15' : 'hover:bg-emerald-500/15';
  const numberBgClass = sourceType === 'community' ? 'bg-blue-500/20' : 'bg-emerald-500/20';
  const numberTextClass = sourceType === 'community' ? 'text-blue-300' : 'text-emerald-300';

  return (
    <div
      onClick={() => onSelect(recommendation)}
      className={`group flex cursor-pointer items-center gap-3 rounded-lg p-3 transition ${bgColorClass} ${hoverBgClass}`}
    >
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${numberBgClass} ${numberTextClass}`}>
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <h5 className="truncate font-medium text-white group-hover:text-orange-200">
          {recommendation.name}
        </h5>
        {recommendation.reason && (
          <p className="mt-0.5 truncate text-xs text-slate-500">{recommendation.reason}</p>
        )}
      </div>
      <svg className="h-4 w-4 shrink-0 text-slate-600 group-hover:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
};

export const HistoryItem = ({ item }: HistoryItemProps) => {
  const { t } = useTranslation();
  const [selectedPlace, setSelectedPlace] = useState<PlaceRecommendationItem | null>(null);
  const { latitude, longitude, hasLocation, address } = useUserLocation();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);

  const menuActions = useHistoryMenuActions();
  const aiRecommendations = useHistoryAiRecommendations({ historyItem: item });
  const aiHistory = useHistoryAiHistory({ historyItem: item });

  const hasAiQueryContext =
    Boolean(
      item.requestAddress?.trim() ||
        address?.trim() ||
        (latitude !== null && longitude !== null)
    );

  const handleMenuClickWithReset = (menu: string) => {
    const isSameMenu = menuActions.selectedMenu === menu;
    menuActions.handleMenuClick(menu);
    if (!isSameMenu) {
      aiRecommendations.resetAiRecommendations();
      setSelectedPlace(null);
    }
  };

  const handleSearchWithClose = async () => {
    // 모달을 먼저 닫기 (비동기 작업과 관계없이 즉시 닫힘)
    menuActions.handleCancel();
    
    // 모달을 닫은 후 검색 작업 실행
    try {
      await menuActions.handleSearch();
    } catch {
      // 에러는 handleSearch 내부에서 처리되므로 여기서는 무시
    }
  };

  const handleAiRecommendWithClose = async () => {
    // 모달을 먼저 닫기 (비동기 작업과 관계없이 즉시 닫힘)
    menuActions.handleCancel();
    
    if (!menuActions.selectedMenu) {
      return;
    }
    
    // 모달을 닫은 후 AI 추천 작업 실행
    try {
      await aiRecommendations.handleAiRecommend(menuActions.selectedMenu);
    } catch {
      // 에러는 handleAiRecommend 내부에서 처리되므로 여기서는 무시
    }
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!menuActions.showConfirmCard) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        menuActions.handleCancel();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [menuActions]);

  const aiRecommendationGroups: MenuPlaceRecommendationGroup[] = useMemo(() => {
    if (!menuActions.selectedMenu || aiRecommendations.aiRecommendations.length === 0) {
      return [];
    }
    return [{ menuName: menuActions.selectedMenu, recommendations: aiRecommendations.aiRecommendations }];
  }, [aiRecommendations.aiRecommendations, menuActions.selectedMenu]);

  return (
    <>
      <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400">{formatDateTimeKorean(item.recommendedAt)}</p>
            {item.prompt && (
              <p className="mt-2 text-slate-300">"{item.prompt}"</p>
            )}
          {item.reason && (
            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
              <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200/80">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-500 text-[10px] text-white shadow-sm shadow-orange-500/40">i</span>
                {t('history.recommendationReason')}
              </div>
              <p className="leading-relaxed text-slate-200">{item.reason}</p>
            </div>
          )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {item.recommendations.map((menu, index) => (
            <button
              key={index}
              onClick={() => handleMenuClickWithReset(menu)}
              className="rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-200 transition hover:bg-orange-500/20 hover:border-orange-500/50 cursor-pointer"
            >
              {menu}
            </button>
          ))}
          
          {/* AI 추천 이력 버튼 - 메뉴 태그와 같은 줄에 배치 */}
          {item.hasPlaceRecommendations && (
            <button
              onClick={aiHistory.handleShowAiHistory}
              disabled={!isAuthenticated || aiHistory.isAiHistoryLoading}
              className={`
                ml-auto flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-all
                ${aiHistory.showAiHistory 
                  ? 'bg-slate-700/50 text-slate-300' 
                  : 'bg-gradient-to-r from-orange-500/20 to-rose-500/20 text-orange-200 hover:from-orange-500/30 hover:to-rose-500/30'
                }
              `}
            >
              {aiHistory.isAiHistoryLoading ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <svg className={`h-3.5 w-3.5 transition-transform ${aiHistory.showAiHistory ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )}
              <span>{aiHistory.showAiHistory ? t('history.close') : t('history.aiRecommendation')}</span>
            </button>
          )}
        </div>

        {/* AI 추천 이력 결과 (카드 내부) */}
        {item.hasPlaceRecommendations && aiHistory.showAiHistory && (
          <div className="mt-4 rounded-2xl border border-orange-500/10 bg-gradient-to-br from-orange-500/5 to-rose-500/5 p-4">
            {aiHistory.isAiHistoryLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                <span>{t('history.loadingAiRecommendations')}</span>
              </div>
            ) : aiHistory.aiHistoryRecommendations.length > 0 ? (
              <div className="space-y-4">
                {aiHistory.groupedAiHistory.map((group) => {
                  // Filter recommendations by source
                  const communityPlaces = group.recommendations.filter(r => r.source === 'USER');
                  const searchPlaces = group.recommendations.filter(r => r.source === 'GOOGLE');

                  return (
                    <div
                      key={group.menuName}
                      className="rounded-xl border border-white/10 bg-white/5 p-3"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.3em] text-orange-200/70">{t('history.menuLabel')}</p>
                          <h4 className="text-lg font-semibold text-white">{group.menuName}</h4>
                        </div>
                      </div>

                      {/* Community Section */}
                      {communityPlaces.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 h-px bg-blue-500/30" />
                            <span className="text-xs text-blue-400">{t('history.communityBadge')}</span>
                            <div className="flex-1 h-px bg-blue-500/30" />
                          </div>
                          <div className="space-y-2">
                            {communityPlaces.map((place, idx) => (
                              <PlaceListItem
                                key={`${group.menuName}-${place.placeId}-${idx}`}
                                recommendation={place}
                                index={idx}
                                sourceType="community"
                                onSelect={setSelectedPlace}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Search Section */}
                      {searchPlaces.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 h-px bg-emerald-500/30" />
                            <span className="text-xs text-emerald-400">{t('history.searchBadge')}</span>
                            <div className="flex-1 h-px bg-emerald-500/30" />
                          </div>
                          <div className="space-y-2">
                            {searchPlaces.map((place, idx) => (
                              <PlaceListItem
                                key={`${group.menuName}-${place.placeId}-${idx}`}
                                recommendation={place}
                                index={idx}
                                sourceType="search"
                                onSelect={setSelectedPlace}
                              />
                            ))}
                          </div>
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

      {/* 확인 카드 모달 */}
      {menuActions.showConfirmCard && menuActions.selectedMenu && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => {
            // 배경 클릭 시 모달 닫기
            if (e.target === e.currentTarget) {
              menuActions.handleCancel();
            }
          }}
        >
          <div 
            className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl backdrop-blur"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={menuActions.handleCancel}
              className="absolute right-6 top-6 text-slate-400 hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="space-y-4">
              <p className="text-center text-lg text-white">
                {t('history.exploreOptions', { menuName: menuActions.selectedMenu })}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  onClick={handleSearchWithClose}
                  disabled={!hasLocation}
                  variant="primary"
                  size="lg"
                >
                  {t('history.normalSearch')}
                </Button>
                <Button
                  onClick={handleAiRecommendWithClose}
                  variant="secondary"
                  size="lg"
                  disabled={!hasAiQueryContext}
                >
                  {t('history.aiRecommendGet')}
                </Button>
              </div>
            </div>
            {!hasLocation && (
              <div className="mt-4 rounded-xl border border-amber-300/30 bg-amber-500/10 p-3 text-center text-sm text-amber-200">
                {t('history.noLocationWarning')}
              </div>
            )}
            {!hasAiQueryContext && (
              <div className="mt-2 rounded-xl border border-amber-300/30 bg-amber-500/10 p-3 text-center text-sm text-amber-200">
                {t('history.needsAddressForAi')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 검색 결과 */}
      {!menuActions.showConfirmCard && menuActions.selectedMenu && (
        <div className="mt-4 space-y-4">
          {menuActions.restaurants.length > 0 && (
            <RestaurantList
              menuName={menuActions.selectedMenu}
              restaurants={menuActions.restaurants}
              loading={menuActions.loading}
              onClose={menuActions.resetSearchResults}
            />
          )}

          {(aiRecommendations.aiRecommendations.length > 0 || aiRecommendations.isAiLoading) && (
            <AiPlaceRecommendations
              activeMenuName={menuActions.selectedMenu}
              recommendations={aiRecommendationGroups}
              loadingMenuName={aiRecommendations.aiLoadingMenu}
              onSelect={(recommendation) => setSelectedPlace(recommendation)}
              onReset={() => {
                aiRecommendations.resetAiRecommendations();
                setSelectedPlace(null);
              }}
            />
          )}
        </div>
      )}
      <PlaceDetailsModal
        placeId={selectedPlace?.placeId ?? null}
        placeName={selectedPlace?.name ?? null}
        onClose={() => setSelectedPlace(null)}
      />
    </>
  );
};
