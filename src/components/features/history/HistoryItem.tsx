/**
 * 추천 이력 아이템 컴포넌트
 */

import { menuService } from '@/api/services/menu';
import { searchService } from '@/api/services/search';
import { Button } from '@/components/common/Button';
import { AiPlaceRecommendations } from '@/components/features/restaurant/AiPlaceRecommendations';
import { PlaceDetailsModal } from '@/components/features/restaurant/PlaceDetailsModal';
import { RestaurantList } from '@/components/features/restaurant/RestaurantList';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useAppSelector } from '@/store/hooks';
import type { PlaceRecommendationItem } from '@/types/menu';
import type { Restaurant } from '@/types/search';
import type { RecommendationHistoryItem } from '@/types/user';
import { isAxiosError } from 'axios';
import { useMemo, useState } from 'react';

interface MenuPlaceRecommendationGroup {
  menuName: string;
  recommendations: PlaceRecommendationItem[];
}

interface HistoryItemProps {
  item: RecommendationHistoryItem;
  formatDate: (dateString: string) => string;
}

export const HistoryItem = ({ item, formatDate }: HistoryItemProps) => {
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [showConfirmCard, setShowConfirmCard] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<PlaceRecommendationItem[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiLoadingMenu, setAiLoadingMenu] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceRecommendationItem | null>(null);
  // AI 추천 이력 전용 state (카드 내부 표시용)
  const [aiHistoryRecommendations, setAiHistoryRecommendations] = useState<PlaceRecommendationItem[]>([]);
  const [isAiHistoryLoading, setIsAiHistoryLoading] = useState(false);
  const [showAiHistory, setShowAiHistory] = useState(false);
  const { latitude, longitude, hasLocation, address } = useUserLocation();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const hasAiQueryContext =
    Boolean(
      item.requestAddress?.trim() ||
        item.requestLocation ||
        address?.trim() ||
        (latitude !== null && longitude !== null)
    );

  const handleMenuClick = (menu: string) => {
    const isSameMenu = selectedMenu === menu;
    setSelectedMenu(menu);
    setShowConfirmCard(true);
    if (!isSameMenu) {
      setRestaurants([]);
      setAiRecommendations([]);
      setSelectedPlace(null);
    }
  };

  const handleSearch = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!hasLocation || latitude === null || longitude === null) {
      alert('위치 정보가 없습니다. 주소를 등록해주세요.');
      return;
    }

    if (!selectedMenu) {
      return;
    }

    setShowConfirmCard(false);
    setLoading(true);
    try {
      const result = await searchService.restaurants({
        menuName: selectedMenu,
        latitude,
        longitude,
        includeRoadAddress: false,
      });
      setRestaurants(result.restaurants);
    } catch (error) {
      console.error('식당 검색 실패:', error);
      alert('식당 검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmCard(false);
  };

  const loadStoredAiRecommendations = async (
    menuName: string,
    { silent }: { silent?: boolean } = {}
  ) => {
    try {
      const response = await menuService.getPlaceRecommendationsByHistoryId(item.id);
      const normalized = (response.places || [])
        .filter((place) => place.menuName === menuName)
        .map((place) => ({
          placeId: place.placeId.replace(/^places\//i, ''),
          name: place.name ?? '이름 없는 가게',
          reason: place.reason ?? '',
          menuName: place.menuName,
        }));

      setAiRecommendations(normalized);
      setSelectedPlace(null);

      if (!silent) {
        if (normalized.length === 0) {
          alert('저장된 AI 추천 결과가 없습니다.');
        } else {
          alert('이미 추천받은 메뉴입니다. 저장된 결과를 보여드렸어요.');
        }
      }
    } catch (historyError) {
      console.error('기존 AI 추천 조회 실패:', historyError);
      if (!silent) {
        alert('기존 AI 추천 결과를 가져오지 못했습니다.');
      }
    }
  };

  const handleAiRecommend = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!selectedMenu) {
      return;
    }

    const normalizedAddress = item.requestAddress?.trim() || address?.trim();
    const locationFallback = item.requestLocation
      ? `${item.requestLocation.lat},${item.requestLocation.lng}`
      : latitude !== null && longitude !== null
        ? `${latitude},${longitude}`
        : null;
    const queryBase = normalizedAddress || locationFallback;

    if (!queryBase) {
      alert('AI 추천을 사용하려면 주소 또는 위치 정보가 필요합니다.');
      return;
    }

    const query = `${queryBase} ${selectedMenu}`.trim();

    setShowConfirmCard(false);
    setAiLoadingMenu(selectedMenu);
    setIsAiLoading(true);

    try {
      const response = await menuService.recommendPlaces({
        query,
        historyId: item.id,
        menuName: selectedMenu,
      });
      const normalized = (response.recommendations || []).map((item) => ({
        ...item,
        placeId: item.placeId.replace(/^places\//i, ''),
        menuName: selectedMenu,
      }));

      setAiRecommendations(normalized);
      if (normalized.length === 0) {
        alert('AI 추천 결과가 없습니다.');
      }
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 400) {
        await loadStoredAiRecommendations(selectedMenu);
      } else {
        console.error('AI 추천 식당 조회 실패:', error);
        alert('AI 추천 식당을 가져오지 못했습니다.');
      }
    } finally {
      setIsAiLoading(false);
      setAiLoadingMenu(null);
    }
  };

  const handleShowAiHistory = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!item.hasPlaceRecommendations) {
      alert('이 메뉴에 대한 AI 추천 이력이 없습니다.');
      return;
    }

    // 이미 열려있으면 닫기 (토글)
    if (showAiHistory && aiHistoryRecommendations.length > 0) {
      setShowAiHistory(false);
      return;
    }

    setIsAiHistoryLoading(true);
    setShowAiHistory(true);
    setAiHistoryRecommendations([]);

    try {
      const response = await menuService.getPlaceRecommendationsByHistoryId(item.id);
      const normalized = (response.places || []).map((place) => ({
        placeId: place.placeId.replace(/^places\//i, ''),
        name: place.name ?? '이름 없는 가게',
        reason: place.reason ?? '',
        menuName: place.menuName,
      }));

      setAiHistoryRecommendations(normalized);
      if (normalized.length === 0) {
        alert('AI 추천 이력이 없습니다.');
        setShowAiHistory(false);
      }
    } catch (error) {
      console.error('AI 추천 이력 조회 실패:', error);
      alert('AI 추천 이력을 가져오지 못했습니다.');
      setShowAiHistory(false);
    } finally {
      setIsAiHistoryLoading(false);
    }
  };

  const groupedAiHistory: MenuPlaceRecommendationGroup[] = useMemo(() => {
    return aiHistoryRecommendations.reduce<MenuPlaceRecommendationGroup[]>((acc, place) => {
      const key = place.menuName || '선택한 메뉴';
      const existing = acc.find((group) => group.menuName === key);
      if (existing) {
        existing.recommendations.push(place);
      } else {
        acc.push({ menuName: key, recommendations: [place] });
      }
      return acc;
    }, []);
  }, [aiHistoryRecommendations]);

  const aiRecommendationGroups: MenuPlaceRecommendationGroup[] = useMemo(() => {
    if (!selectedMenu || aiRecommendations.length === 0) {
      return [];
    }
    return [{ menuName: selectedMenu, recommendations: aiRecommendations }];
  }, [aiRecommendations, selectedMenu]);

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
              onClick={() => handleMenuClick(menu)}
              className="rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-200 transition hover:bg-orange-500/20 hover:border-orange-500/50 cursor-pointer"
            >
              {menu}
            </button>
          ))}
          
          {/* AI 추천 이력 버튼 - 메뉴 태그와 같은 줄에 배치 */}
          {item.hasPlaceRecommendations && (
            <button
              onClick={handleShowAiHistory}
              disabled={!isAuthenticated || isAiHistoryLoading}
              className={`
                ml-auto flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-all
                ${showAiHistory 
                  ? 'bg-slate-700/50 text-slate-300' 
                  : 'bg-gradient-to-r from-orange-500/20 to-rose-500/20 text-orange-200 hover:from-orange-500/30 hover:to-rose-500/30'
                }
              `}
            >
              {isAiHistoryLoading ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <svg className={`h-3.5 w-3.5 transition-transform ${showAiHistory ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )}
              <span>{showAiHistory ? '닫기' : 'AI 추천'}</span>
            </button>
          )}
        </div>

        {/* AI 추천 이력 결과 (카드 내부) */}
        {item.hasPlaceRecommendations && showAiHistory && (
          <div className="mt-4 rounded-2xl border border-orange-500/10 bg-gradient-to-br from-orange-500/5 to-rose-500/5 p-4">
            {isAiHistoryLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                <span>AI 추천 맛집 불러오는 중...</span>
              </div>
            ) : aiHistoryRecommendations.length > 0 ? (
              <div className="space-y-4">
                {groupedAiHistory.map((group) => (
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
      {showConfirmCard && selectedMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl backdrop-blur">
            <button
              onClick={handleCancel}
              className="absolute right-6 top-6 text-slate-400 hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="space-y-4">
              <p className="text-center text-lg text-white">
                <span className="font-semibold text-orange-300">{selectedMenu}</span>에 대해 어떤 방식으로 탐색할까요?
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  onClick={handleSearch}
                  disabled={!hasLocation}
                  variant="primary"
                  size="lg"
                >
                  일반 검색 (네이버)
                </Button>
                <Button
                  onClick={handleAiRecommend}
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
      {!showConfirmCard && selectedMenu && (
        <div className="mt-4 space-y-4">
          {restaurants.length > 0 && (
            <RestaurantList
              menuName={selectedMenu}
              restaurants={restaurants}
              loading={loading}
              onClose={() => {
                setRestaurants([]);
              }}
            />
          )}

          {(aiRecommendations.length > 0 || isAiLoading) && (
            <AiPlaceRecommendations
              activeMenuName={selectedMenu}
              recommendations={aiRecommendationGroups}
              isLoading={isAiLoading}
              loadingMenuName={aiLoadingMenu}
              onSelect={(recommendation) => setSelectedPlace(recommendation)}
              onReset={() => {
                setAiRecommendations([]);
                setAiLoadingMenu(null);
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
