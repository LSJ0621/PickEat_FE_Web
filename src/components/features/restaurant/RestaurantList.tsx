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
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, X } from 'lucide-react';

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

  const handleOpenGoogleMap = () => {
    const encodedMenuName = encodeURIComponent(menuName);
    const googleMapUrl = `https://www.google.com/maps/search/${encodedMenuName}`;
    window.location.href = googleMapUrl;
  };

  return (
    <div className="rounded-2xl border border-border-default bg-bg-surface p-4 shadow-md sm:rounded-3xl sm:p-6">
      <RestaurantListHeader
        address={address || undefined}
        hasRestaurants={hasRestaurants}
        onOpenMapModal={handleOpenMapModal}
        onOpenGoogleMap={handleOpenGoogleMap}
      />

      {loading ? (
        <div className="mt-4 space-y-3 sm:mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-bg-tertiary/60" />
          ))}
        </div>
      ) : hasRestaurants ? (
        <>
          <div className="mt-4 space-y-3 sm:mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary sm:text-base">
                {t('restaurant.searchResults', { menuName, count: restaurants.length })}
              </h3>
              {onClose && (
                <button
                  onClick={onClose}
                  className="flex items-center gap-1 rounded-lg p-1.5 text-xs text-text-tertiary transition-colors hover:bg-bg-secondary hover:text-text-primary"
                  aria-label={t('restaurant.close')}
                >
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('restaurant.close')}</span>
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
                  onClick={handleOpenGoogleMap}
                  className="inline-flex items-center gap-1.5 text-orange-400 hover:text-orange-300"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t('restaurant.viewMoreOnGoogleMap')}
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
        <div className="mt-4 sm:mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary sm:text-base">
              {t('restaurant.searchResultsTitle', { menuName })}
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                className="flex items-center gap-1 rounded-lg p-1.5 text-xs text-text-tertiary transition-colors hover:bg-bg-secondary hover:text-text-primary"
                aria-label={t('restaurant.close')}
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">{t('restaurant.close')}</span>
              </button>
            )}
          </div>
          <div className="rounded-2xl border border-border-default bg-bg-secondary p-6 text-center">
            <p className="text-sm text-text-secondary sm:text-base">
              {t('restaurant.noRestaurantsFound')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
