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
import type { PlaceRecommendationItem } from '@/types/menu';
import type { RecommendationHistoryItem } from '@/types/user';
import { useEffect, useMemo, useState } from 'react';

interface MenuPlaceRecommendationGroup {
  menuName: string;
  recommendations: PlaceRecommendationItem[];
}

interface HistoryItemProps {
  item: RecommendationHistoryItem;
  formatDate: (dateString: string) => string;
}

export const HistoryItem = ({ item, formatDate }: HistoryItemProps) => {
  const [selectedPlace, setSelectedPlace] = useState<PlaceRecommendationItem | null>(null);
  const { latitude, longitude, hasLocation, address } = useUserLocation();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  
  const menuActions = useHistoryMenuActions();
  const aiRecommendations = useHistoryAiRecommendations({ historyItem: item });
  const aiHistory = useHistoryAiHistory({ historyItem: item });

  const hasAiQueryContext =
    Boolean(
      item.requestAddress?.trim() ||
        item.requestLocation ||
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
    } catch (error) {
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
    } catch (error) {
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
  }, [menuActions.showConfirmCard, menuActions.handleCancel]);

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
            <p className="text-sm text-slate-400">{formatDate(item.recommendedAt)}</p>
            {item.prompt && (
              <p className="mt-2 text-slate-300">"{item.prompt}"</p>
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
              <span>{aiHistory.showAiHistory ? '닫기' : 'AI 추천'}</span>
            </button>
          )}
        </div>

        {/* AI 추천 이력 결과 (카드 내부) */}
        {item.hasPlaceRecommendations && aiHistory.showAiHistory && (
          <div className="mt-4 rounded-2xl border border-orange-500/10 bg-gradient-to-br from-orange-500/5 to-rose-500/5 p-4">
            {aiHistory.isAiHistoryLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                <span>AI 추천 맛집 불러오는 중...</span>
              </div>
            ) : aiHistory.aiHistoryRecommendations.length > 0 ? (
              <div className="space-y-4">
                {aiHistory.groupedAiHistory.map((group) => (
                  <div
                    key={group.menuName}
                    className="rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-orange-200/70">메뉴</p>
                        <h4 className="text-lg font-semibold text-white">{group.menuName}</h4>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {group.recommendations.map((place, idx) => (
                        <div
                          key={`${group.menuName}-${place.placeId}-${idx}`}
                          onClick={() => setSelectedPlace(place)}
                          className="group flex cursor-pointer items-center gap-3 rounded-lg p-3 transition hover:bg-white/5"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-xs font-semibold text-orange-300">
                            {idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h5 className="truncate font-medium text-white group-hover:text-orange-200">
                              {place.name}
                            </h5>
                            {place.reason && (
                              <p className="mt-0.5 truncate text-xs text-slate-500">{place.reason}</p>
                            )}
                          </div>
                          <svg className="h-4 w-4 shrink-0 text-slate-600 group-hover:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
                <span className="font-semibold text-orange-300">{menuActions.selectedMenu}</span>에 대해 어떤 방식으로 탐색할까요?
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  onClick={handleSearchWithClose}
                  disabled={!hasLocation}
                  variant="primary"
                  size="lg"
                >
                  일반 검색 (네이버)
                </Button>
                <Button
                  onClick={handleAiRecommendWithClose}
                  variant="secondary"
                  size="lg"
                  disabled={!hasAiQueryContext}
                >
                  AI 추천 받기
                </Button>
              </div>
            </div>
            {!hasLocation && (
              <div className="mt-4 rounded-xl border border-amber-300/30 bg-amber-500/10 p-3 text-center text-sm text-amber-200">
                위치 정보가 없습니다. 주소를 등록해야 식당을 검색할 수 있습니다.
              </div>
            )}
            {!hasAiQueryContext && (
              <div className="mt-2 rounded-xl border border-amber-300/30 bg-amber-500/10 p-3 text-center text-sm text-amber-200">
                주소 또는 위치 정보가 있어야 AI 추천을 사용할 수 있습니다.
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
              isLoading={aiRecommendations.isAiLoading}
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
