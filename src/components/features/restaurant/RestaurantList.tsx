/**
 * 식당 리스트 컴포넌트
 */

import { Button } from '@/components/common/Button';
import { useUserLocation } from '@/hooks/map/useUserLocation';
import type { Restaurant } from '@/types/search';
import { useState } from 'react';
import { RestaurantListItem } from './RestaurantListItem';
import { RestaurantListHeader } from './RestaurantListHeader';
import { RestaurantMapModal } from './RestaurantMapModal';
import { useTranslation } from 'react-i18next';

interface RestaurantListProps {
  menuName: string;
  restaurants?: Restaurant[];
  loading?: boolean;
  onClose?: () => void;
}

export const RestaurantList = ({
  menuName,
  restaurants = [],
  loading = false,
  onClose,
}: RestaurantListProps) => {
  const { t } = useTranslation();
  const { address } = useUserLocation();
  const hasRestaurants = restaurants.length > 0;
  const [showMapModal, setShowMapModal] = useState(false);
  const DISPLAY_LIMIT = 5;
  const displayedRestaurants = restaurants.slice(0, DISPLAY_LIMIT);
  const hasMore = restaurants.length > DISPLAY_LIMIT;

  const handleOpenMapModal = () => {
    if (!hasRestaurants) return;
    setShowMapModal(true);
  };

  const handleCloseMapModal = () => {
    setShowMapModal(false);
  };

  const handleOpenNaverMap = () => {
    // 메뉴명을 검색어로 사용하여 네이버 지도 웹사이트로 이동
    const encodedMenuName = encodeURIComponent(menuName);
    const naverMapUrl = `https://map.naver.com/v5/search/${encodedMenuName}`;
    
    window.location.href = naverMapUrl;
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.6)] backdrop-blur">
      <RestaurantListHeader
        address={address || undefined}
        hasRestaurants={hasRestaurants}
        onOpenMapModal={handleOpenMapModal}
        onOpenNaverMap={handleOpenNaverMap}
      />

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500"></div>
        </div>
      ) : hasRestaurants ? (
        <>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {t('restaurant.searchResults', { menuName, count: restaurants.length })}
              </h3>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {t('restaurant.close')}
                </button>
              )}
            </div>
            {displayedRestaurants.map((restaurant, index) => (
              <RestaurantListItem key={index} restaurant={restaurant} index={index} />
            ))}
            {hasMore && (
              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenNaverMap}
                  className="text-orange-300 hover:text-orange-200"
                >
                  {t('restaurant.viewMoreOnNaverMap')}
                </Button>
              </div>
            )}
          </div>

      {showMapModal && hasRestaurants && (
        <RestaurantMapModal
          restaurants={restaurants}
          menuName={menuName}
          onClose={handleCloseMapModal}
        />
      )}
        </>
      ) : (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {t('restaurant.searchResultsTitle', { menuName })}
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {t('restaurant.close')}
              </button>
            )}
          </div>
          <div className="rounded-2xl border border-slate-500/30 bg-slate-800/50 p-6 text-center">
            <p className="text-slate-300">{t('restaurant.noRestaurantsFound')}</p>
          </div>
        </div>
      )}
    </div>
  );
};
