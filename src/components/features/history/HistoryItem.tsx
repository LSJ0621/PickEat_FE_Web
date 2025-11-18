/**
 * 추천 이력 아이템 컴포넌트
 */

import { useState } from 'react';
import { useUserLocation } from '@/hooks/useUserLocation';
import { searchService } from '@/api/services/search';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/components/common/Button';
import { RestaurantList } from '@/components/features/restaurant/RestaurantList';
import type { RecommendationHistoryItem } from '@/types/user';
import type { Restaurant } from '@/types/search';

interface HistoryItemProps {
  item: RecommendationHistoryItem;
  formatDate: (dateString: string) => string;
}

export const HistoryItem = ({ item, formatDate }: HistoryItemProps) => {
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [showConfirmCard, setShowConfirmCard] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const { latitude, longitude, address, hasLocation } = useUserLocation();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);

  const handleMenuClick = (menu: string) => {
    setSelectedMenu(menu);
    setShowConfirmCard(true);
    setRestaurants([]);
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
    setSelectedMenu(null);
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
            <p className="mb-6 text-center text-lg text-white">
              <span className="font-semibold text-orange-300">{selectedMenu}</span>에 대한 주변 식당을 검색해드릴까요?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleSearch}
                disabled={!hasLocation}
                variant="primary"
                size="lg"
                className="flex-1"
              >
                찾기
              </Button>
              <Button
                onClick={handleCancel}
                variant="ghost"
                size="lg"
                className="flex-1"
              >
                취소
              </Button>
            </div>
            {!hasLocation && (
              <div className="mt-4 rounded-xl border border-amber-300/30 bg-amber-500/10 p-3 text-center text-sm text-amber-200">
                위치 정보가 없습니다. 주소를 등록해야 식당을 검색할 수 있습니다.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 검색 결과 */}
      {!showConfirmCard && selectedMenu && (
        <div className="mt-4">
          <RestaurantList
            menuName={selectedMenu}
            restaurants={restaurants}
            loading={loading}
            onClose={() => {
              setSelectedMenu(null);
              setRestaurants([]);
            }}
          />
        </div>
      )}
    </>
  );
};

