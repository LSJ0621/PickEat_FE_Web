import { Button } from '@/components/common/Button';
import type { MenuPlaceRecommendationGroup } from '@/store/slices/agentSlice';
import type { PlaceRecommendationItemV2 } from '@/types/menu';
import { formatMultilingualName, formatMultilingualAddress } from '@/utils/format';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AiPlaceRecommendationsProps {
  activeMenuName: string | null;
  recommendations: MenuPlaceRecommendationGroup[];
  loadingMenuName: string | null;
  onSelect: (recommendation: PlaceRecommendationItemV2) => void;
  onReset: () => void;
  searchEntryPointHtml?: string | null;
  searchRecommendations?: MenuPlaceRecommendationGroup[];
  communityRecommendations?: MenuPlaceRecommendationGroup[];
  isSearchLoading?: boolean;
  isCommunityLoading?: boolean;
  searchLoadingMenuName?: string | null;
  communityLoadingMenuName?: string | null;
  searchRetrying?: boolean;
  communityRetrying?: boolean;
}

export const AiPlaceRecommendations = ({
  activeMenuName,
  recommendations,
  loadingMenuName,
  onSelect,
  onReset,
  searchEntryPointHtml,
  searchRecommendations = [],
  communityRecommendations = [],
  isSearchLoading = false,
  isCommunityLoading = false,
  searchLoadingMenuName = null,
  communityLoadingMenuName = null,
  searchRetrying = false,
  communityRetrying = false,
}: AiPlaceRecommendationsProps) => {
  const { t } = useTranslation();

  const finalSearchRecommendations = searchRecommendations.length > 0 ? searchRecommendations : recommendations;
  const finalCommunityRecommendations = communityRecommendations;
  const finalSearchLoading = isSearchLoading || !!searchLoadingMenuName;
  const finalCommunityLoading = isCommunityLoading || !!communityLoadingMenuName;
  const finalSearchLoadingMenu = searchLoadingMenuName || loadingMenuName;
  const finalCommunityLoadingMenu = communityLoadingMenuName;

  const searchVisibleGroups = finalSearchRecommendations.filter((group) => group.recommendations.length > 0);
  const communityVisibleGroups = finalCommunityRecommendations.filter((group) => group.recommendations.length > 0);
  const hasSearchRecommendations = searchVisibleGroups.length > 0;
  const hasCommunityRecommendations = communityVisibleGroups.length > 0;
  const hasAnyRecommendations = hasSearchRecommendations || hasCommunityRecommendations;

  const visibleGroups = recommendations.filter((group) => group.recommendations.length > 0);
  const hasRecommendations = visibleGroups.length > 0;
  const pendingMenuName = loadingMenuName;

  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (activeMenuName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpandedMenus((prev) => {
        const newSet = new Set(prev);
        newSet.add(`search-${activeMenuName}`);
        newSet.add(`community-${activeMenuName}`);
        newSet.add(`legacy-${activeMenuName}`);
        newSet.add(activeMenuName);
        return newSet;
      });
    }
  }, [activeMenuName]);

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuKey)) {
        newSet.delete(menuKey);
      } else {
        newSet.add(menuKey);
      }
      return newSet;
    });
  };

  const renderRecommendationGroups = (groups: MenuPlaceRecommendationGroup[], sectionPrefix: string) => {
    return groups.map((group) => {
      const isExpanded = expandedMenus.has(`${sectionPrefix}-${group.menuName}`);
      const isActive = activeMenuName === group.menuName;

      return (
        <div
          key={`${sectionPrefix}-${group.menuName}`}
          className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
            isActive
              ? 'border-brand-primary/30 bg-gradient-to-br from-brand-primary/10 via-brand-primary/5 to-transparent'
              : 'border-border-default bg-bg-surface'
          }`}
        >
          <button
            onClick={() => toggleMenu(`${sectionPrefix}-${group.menuName}`)}
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
                const itemKey = `${sectionPrefix}-${group.menuName}-${recommendation.placeId}`;
                const typedRec = recommendation as PlaceRecommendationItemV2;
                return (
                  <div
                    key={itemKey}
                    role="button"
                    tabIndex={0}
                    aria-label={recommendation.name}
                    onClick={() => onSelect(typedRec)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelect(typedRec);
                      }
                    }}
                    className="rounded-xl border border-border-default bg-bg-surface p-4 transition-all duration-200 hover:border-border-focus/40 hover:bg-bg-hover hover:-translate-y-0.5 hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                  >
                    <div className="flex items-start gap-3">
                      {typedRec.photoUrl && (
                        <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-bg-tertiary">
                          <img
                            src={typedRec.photoUrl}
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
                            {formatMultilingualName(recommendation.name, typedRec.localizedName)}
                          </h4>
                          {typedRec.isOpen !== undefined && typedRec.isOpen !== null && (
                            <span
                              className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                                typedRec.isOpen
                                  ? 'bg-emerald-500/20 text-emerald-700'
                                  : 'bg-bg-secondary text-text-tertiary'
                              }`}
                            >
                              {typedRec.isOpen ? t('place.open') : t('place.closed')}
                            </span>
                          )}
                        </div>
                        {(typedRec.rating !== undefined || typedRec.reviewCount !== undefined) && (
                          <div className="flex items-center gap-2 mt-1">
                            {typedRec.rating !== undefined && typedRec.rating !== null && (
                              <div className="flex items-center gap-1">
                                <svg className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-sm font-medium text-yellow-200">{typedRec.rating.toFixed(1)}</span>
                              </div>
                            )}
                            {typedRec.reviewCount !== undefined && typedRec.reviewCount !== null && (
                              <span className="text-xs text-text-tertiary">({typedRec.reviewCount})</span>
                            )}
                          </div>
                        )}
                        {(typedRec.localizedAddress || typedRec.address) && (
                          <p className="mt-1 text-xs text-text-tertiary truncate">
                            {formatMultilingualAddress(typedRec.address, typedRec.localizedAddress)}
                          </p>
                        )}
                        <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                          {recommendation.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  const renderLoadingCard = (menuName: string | null, isRetrying: boolean) => {
    if (!menuName) return null;
    return (
      <div className="rounded-2xl border border-border-default bg-bg-secondary p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-text-primary truncate">{menuName}</h3>
            <p className="mt-1 text-sm text-text-tertiary">
              {isRetrying ? t('restaurant.aiRetrying') : t('restaurant.aiSearchingDetailed')}
            </p>
          </div>
          <div className="h-7 w-7 flex-shrink-0 animate-spin rounded-full border-b-2 border-orange-500" />
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-border-default bg-bg-surface p-5 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-brand-primary/70">AI Places</p>
          <h2 className="mt-1 text-xl font-semibold text-text-primary">{t('restaurant.aiRecommendedStores')}</h2>
        </div>
        {(hasRecommendations || hasAnyRecommendations) && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-text-tertiary hover:text-text-primary">
            {t('restaurant.reset')}
          </Button>
        )}
      </div>

      {!hasRecommendations && !hasAnyRecommendations && !pendingMenuName && !finalSearchLoading && !finalCommunityLoading ? (
        <div className="mt-6 rounded-2xl border border-border-default bg-bg-secondary p-6 text-center text-text-secondary">
          {t('restaurant.noRecommendations')}
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          <p className="text-xs text-text-tertiary">{t('restaurant.tapCardForDetails')}</p>

          {/* Search Recommendations Section */}
          {(hasSearchRecommendations || finalSearchLoading) && (
            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-orange-200">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                검색 추천
              </h3>
              <div className="space-y-3">
                {renderRecommendationGroups(searchVisibleGroups, 'search')}
                {finalSearchLoading && renderLoadingCard(finalSearchLoadingMenu, searchRetrying)}
              </div>
            </section>
          )}

          {/* Community Recommendations Section */}
          {(hasCommunityRecommendations || finalCommunityLoading) && (
            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-200">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                커뮤니티 추천
              </h3>
              <div className="space-y-3">
                {renderRecommendationGroups(communityVisibleGroups, 'community')}
                {finalCommunityLoading && renderLoadingCard(finalCommunityLoadingMenu, communityRetrying)}
              </div>
            </section>
          )}

          {/* Legacy support */}
          {!hasSearchRecommendations &&
            !hasCommunityRecommendations &&
            !finalSearchLoading &&
            !finalCommunityLoading &&
            hasRecommendations && (
              <div className="space-y-3">
                {renderRecommendationGroups(visibleGroups, 'legacy')}
                {pendingMenuName && renderLoadingCard(pendingMenuName, false)}
              </div>
            )}
        </div>
      )}

      {searchEntryPointHtml && (
        <div
          className="mt-4 text-xs text-text-tertiary"
          dangerouslySetInnerHTML={{ __html: searchEntryPointHtml }}
        />
      )}
    </div>
  );
};
