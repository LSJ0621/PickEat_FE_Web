import type { PlaceRecommendationItemV2 } from '@features/agent/types';
import { formatMultilingualName, formatMultilingualAddress } from '@shared/utils/format';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export interface PlaceRecommendationCardProps {
  recommendation: PlaceRecommendationItemV2;
  sectionPrefix: string;
  menuName: string;
  showRating: boolean;
  onSelect: (recommendation: PlaceRecommendationItemV2) => void;
}

export const PlaceRecommendationCard = memo(function PlaceRecommendationCard({
  recommendation,
  sectionPrefix,
  menuName,
  showRating,
  onSelect,
}: PlaceRecommendationCardProps) {
  const { t } = useTranslation();
  const itemKey = `${sectionPrefix}-${menuName}-${recommendation.placeId}`;

  return (
    <div
      key={itemKey}
      role="button"
      tabIndex={0}
      aria-label={recommendation.name}
      onClick={() => onSelect(recommendation)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(recommendation);
        }
      }}
      className="rounded-xl border border-border-default bg-bg-surface p-4 transition-all duration-200 hover:border-border-focus/40 hover:bg-bg-hover hover:-translate-y-0.5 hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
    >
      <div className="flex items-start gap-3">
        {recommendation.photoUrl && (
          <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-bg-tertiary">
            <img
              src={recommendation.photoUrl}
              alt={recommendation.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-base font-semibold text-text-primary">
              {formatMultilingualName(recommendation.name, recommendation.localizedName)}
            </h4>
            {recommendation.isOpen !== undefined && recommendation.isOpen !== null && (
              <span
                className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  recommendation.isOpen
                    ? 'bg-emerald-500/20 text-emerald-700'
                    : 'bg-bg-secondary text-text-tertiary'
                }`}
              >
                {recommendation.isOpen ? t('place.open') : t('place.closed')}
              </span>
            )}
          </div>
          {showRating && (recommendation.rating !== undefined || recommendation.reviewCount !== undefined) && (
            <div className="flex items-center gap-2 mt-1">
              {recommendation.rating !== undefined && recommendation.rating !== null && (
                <div className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium text-yellow-200">{recommendation.rating.toFixed(1)}</span>
                </div>
              )}
              {recommendation.reviewCount !== undefined && recommendation.reviewCount !== null && (
                <span className="text-xs text-text-tertiary">({recommendation.reviewCount})</span>
              )}
            </div>
          )}
          {(recommendation.localizedAddress || recommendation.address) && (
            <p className="mt-1 text-xs text-text-tertiary truncate">
              {formatMultilingualAddress(recommendation.address, recommendation.localizedAddress)}
            </p>
          )}
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
            {recommendation.reason}
          </p>
        </div>
      </div>
    </div>
  );
});
