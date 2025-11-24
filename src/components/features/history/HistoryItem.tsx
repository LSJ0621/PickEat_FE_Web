/**
 * 추천 이력 아이템 컴포넌트
 */

import { useState } from 'react';
import { useUserLocation } from '@/hooks/useUserLocation';
import { searchService } from '@/api/services/search';
import { menuService } from '@/api/services/menu';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/components/common/Button';
import { RestaurantList } from '@/components/features/restaurant/RestaurantList';
import { AiPlaceRecommendations } from '@/components/features/restaurant/AiPlaceRecommendations';
import { PlaceDetailsModal } from '@/components/features/restaurant/PlaceDetailsModal';
import type { RecommendationHistoryItem } from '@/types/user';
import type { Restaurant } from '@/types/search';
import type { PlaceRecommendationItem } from '@/types/menu';

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
  const [selectedPlace, setSelectedPlace] = useState<PlaceRecommendationItem | null>(null);
  const { latitude, longitude, hasLocation, address } = useUserLocation();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);

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

  const handleAiRecommendation = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    // AI 추천 이력이 없는 경우 버튼이 비활성화되어야 하지만, 방어적으로 체크
    if (!item.hasPlaceRecommendations) {
      alert('이 메뉴에 대한 AI 추천 이력이 없습니다.');
      return;
    }

    setShowConfirmCard(false);
    setIsAiLoading(true);

    try {
      const response = await menuService.getPlaceRecommendationsByHistoryId(item.id);
      const normalized = (response.places || []).map((place) => ({
        placeId: place.placeId,
        name: place.name ?? '이름 없는 가게',
        reason: place.reason ?? '',
      }));

      setAiRecommendations(normalized);
      if (normalized.length === 0) {
        alert('AI 추천 이력이 없습니다.');
      }
    } catch (error) {
      console.error('AI 추천 이력 조회 실패:', error);
      alert('AI 추천 이력을 가져오지 못했습니다.');
    } finally {
      setIsAiLoading(false);
    }
  };

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
        <div className="flex flex-wrap gap-2">
          {item.recommendations.map((menu, index) => (
            <button
              key={index}
              onClick={() => handleMenuClick(menu)}
              className="rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-200 transition hover:bg-orange-500/20 hover:border-orange-500/50 cursor-pointer"
            >
              {menu}
            </button>
          ))}
        </div>
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
                {item.hasPlaceRecommendations && (
                  <Button
                    onClick={handleAiRecommendation}
                    variant="secondary"
                    size="lg"
                    disabled={!address?.trim()}
                  >
                    AI 추천 이력 보기
                  </Button>
                )}
              </div>
            </div>
            {!hasLocation && (
              <div className="mt-4 rounded-xl border border-amber-300/30 bg-amber-500/10 p-3 text-center text-sm text-amber-200">
                위치 정보가 없습니다. 주소를 등록해야 식당을 검색할 수 있습니다.
              </div>
            )}
            {!address?.trim() && (
              <div className="mt-2 rounded-xl border border-amber-300/30 bg-amber-500/10 p-3 text-center text-sm text-amber-200">
                주소가 있어야 AI 추천을 사용할 수 있습니다.
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
              menuName={selectedMenu}
              recommendations={aiRecommendations}
              loading={isAiLoading}
              onSelect={(recommendation) => setSelectedPlace(recommendation)}
              onReset={() => {
                setAiRecommendations([]);
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

