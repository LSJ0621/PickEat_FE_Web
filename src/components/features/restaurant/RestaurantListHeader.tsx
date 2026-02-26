/**
 * 식당 리스트 헤더 컴포넌트
 * 제목, 주소 표시 및 액션 버튼을 제공합니다.
 */

import { Button } from '@/components/common/Button';
import { useTranslation } from 'react-i18next';
import { MapPin, Map, ExternalLink } from 'lucide-react';

interface RestaurantListHeaderProps {
  address?: string;
  hasRestaurants: boolean;
  onOpenMapModal: () => void;
  onOpenGoogleMap: () => void;
}

export const RestaurantListHeader = ({
  address,
  hasRestaurants,
  onOpenMapModal,
  onOpenGoogleMap,
}: RestaurantListHeaderProps) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-brand-primary/70 sm:text-xs">
            Nearby Restaurants
          </p>
          <h2 className="mt-1.5 text-xl font-semibold text-text-primary sm:mt-2 sm:text-2xl">
            {t('restaurant.nearbyResults')}
          </h2>
        </div>
        {address && (
          <span className="hidden items-center gap-1.5 rounded-full border border-border-default px-3 py-1 text-xs text-text-secondary sm:inline-flex">
            <MapPin className="h-3 w-3 shrink-0 text-brand-primary/70" />
            {address}
          </span>
        )}
      </div>

      {hasRestaurants && (
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenMapModal}
            className="inline-flex items-center gap-1.5"
          >
            <Map className="h-3.5 w-3.5" />
            {t('restaurant.viewMap')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenGoogleMap}
            className="inline-flex items-center gap-1.5"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t('restaurant.viewSite')}
          </Button>
        </div>
      )}
    </>
  );
};
