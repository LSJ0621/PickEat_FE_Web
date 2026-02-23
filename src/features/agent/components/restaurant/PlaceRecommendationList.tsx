import type { MenuPlaceRecommendationGroup } from '@app/store/slices/agentSlice';
import type { PlaceRecommendationItemV2 } from '@features/agent/types';
import { PlaceRecommendationCard } from './PlaceRecommendationCard';
import { useTranslation } from 'react-i18next';

export interface PlaceRecommendationListProps {
  groups: MenuPlaceRecommendationGroup[];
  sectionPrefix: string;
  showRating?: boolean;
  expandedMenus: Set<string>;
  activeMenuName: string | null;
  onToggleMenu: (menuKey: string) => void;
  onSelect: (recommendation: PlaceRecommendationItemV2) => void;
  isLoading?: boolean;
  loadingMenuName?: string | null;
  isRetrying?: boolean;
}

export const PlaceRecommendationList = ({
  groups,
  sectionPrefix,
  showRating = true,
  expandedMenus,
  activeMenuName,
  onToggleMenu,
  onSelect,
  isLoading = false,
  loadingMenuName = null,
  isRetrying = false,
}: PlaceRecommendationListProps) => {
  const { t } = useTranslation();

  const renderLoadingCard = (menuName: string | null, retrying: boolean) => {
    if (!menuName) return null;
    return (
      <div className="rounded-2xl border border-border-default bg-bg-secondary p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-text-primary truncate">{menuName}</h3>
            <p className="mt-1 text-sm text-text-tertiary">
              {retrying ? t('restaurant.aiRetrying') : t('restaurant.aiSearchingDetailed')}
            </p>
          </div>
          <div className="h-7 w-7 flex-shrink-0 animate-spin rounded-full border-b-2 border-orange-500" />
        </div>
      </div>
    );
  };

  const visibleGroups = groups.filter((group) => group.recommendations.length > 0);

  return (
    <div className="space-y-3">
      {visibleGroups.map((group) => {
        const menuKey = `${sectionPrefix}-${group.menuName}`;
        const isExpanded = expandedMenus.has(menuKey);
        const isActive = activeMenuName === group.menuName;

        return (
          <div
            key={menuKey}
            className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
              isActive
                ? 'border-brand-primary/30 bg-gradient-to-br from-brand-primary/10 via-brand-primary/5 to-transparent'
                : 'border-border-default bg-bg-surface'
            }`}
          >
            <button
              onClick={() => onToggleMenu(menuKey)}
              className="group w-full px-4 py-3.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/50"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <h3 className={`text-base font-semibold truncate ${isActive ? 'text-brand-primary' : 'text-text-primary'}`}>
                    {group.menuName}
                  </h3>
                  <span className="flex-shrink-0 rounded-full bg-bg-secondary px-2 py-0.5 text-xs text-text-secondary">
                    {group.recommendations.length}
                  </span>
                </div>
                <div className="flex-shrink-0 rounded-full p-1 transition-all duration-200 group-hover:bg-bg-hover">
                  <svg
                    className={`h-4 w-4 text-text-tertiary transition-transform duration-300 group-hover:text-text-primary ${
                      isExpanded ? 'rotate-0' : '-rotate-90'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-border-default pt-4 animate-fade-in">
                {group.recommendations.map((recommendation) => {
                  const typedRec = recommendation as PlaceRecommendationItemV2;
                  return (
                    <PlaceRecommendationCard
                      key={`${sectionPrefix}-${group.menuName}-${recommendation.placeId}`}
                      recommendation={typedRec}
                      sectionPrefix={sectionPrefix}
                      menuName={group.menuName}
                      showRating={showRating}
                      onSelect={onSelect}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {isLoading && renderLoadingCard(loadingMenuName, isRetrying)}
    </div>
  );
};
