import type { PlaceRecommendationItemV2 } from '@/types/menu';
import { CompactPlaceCard } from './CompactPlaceCard';
import { useTranslation } from 'react-i18next';

interface CompactPlaceGridProps {
  places: (PlaceRecommendationItemV2 & { _source?: 'search' | 'community' })[];
  onSelectPlace: (place: PlaceRecommendationItemV2) => void;
}

export function CompactPlaceGrid({ places, onSelectPlace }: CompactPlaceGridProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-4 space-y-2">
      {places.length > 0 ? (
        places.map((place, index) => (
          <div key={`${place._source || 'legacy'}-${place.placeId || index}`} className="stagger-item">
            <CompactPlaceCard
              place={place}
              index={index}
              source={place._source}
              onSelect={() => onSelectPlace(place)}
            />
          </div>
        ))
      ) : (
        <div className="py-8 text-center text-sm text-text-tertiary">
          {t('restaurant.noRecommendationsForMenu')}
        </div>
      )}
    </div>
  );
}
