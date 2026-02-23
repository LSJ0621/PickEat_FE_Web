import { Button } from '@shared/components/Button';
import type { MenuPlaceRecommendationGroup } from '@app/store/slices/agentSlice';
import type { PlaceRecommendationItemV2 } from '@features/agent/types';
import { PlaceRecommendationList } from './PlaceRecommendationList';
import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AiPlaceRecommendationsProps {
  activeMenuName: string | null;
  recommendations: MenuPlaceRecommendationGroup[];
  loadingMenuName: string | null;
  onSelect: (recommendation: PlaceRecommendationItemV2) => void;
  onReset: () => void;
  onOpenPlaceSelection?: () => void;
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
  onOpenPlaceSelection,
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

  return (
    <div className="rounded-2xl border border-border-default bg-bg-surface p-5 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-brand-primary/70">AI Places</p>
          <h2 className="mt-1 text-xl font-semibold text-text-primary">{t('restaurant.aiRecommendedStores')}</h2>
        </div>
        {(hasRecommendations || hasAnyRecommendations) && (
          <div className="flex items-center gap-2">
            {onOpenPlaceSelection && (
              <Button variant="primary" size="sm" onClick={onOpenPlaceSelection}>
                가게 선택하기
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onReset} className="text-text-tertiary hover:text-text-primary">
              {t('restaurant.reset')}
            </Button>
          </div>
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
              <PlaceRecommendationList
                groups={searchVisibleGroups}
                sectionPrefix="search"
                showRating={false}
                expandedMenus={expandedMenus}
                activeMenuName={activeMenuName}
                onToggleMenu={toggleMenu}
                onSelect={onSelect}
                isLoading={finalSearchLoading}
                loadingMenuName={finalSearchLoadingMenu}
                isRetrying={searchRetrying}
              />
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
              <PlaceRecommendationList
                groups={communityVisibleGroups}
                sectionPrefix="community"
                showRating={true}
                expandedMenus={expandedMenus}
                activeMenuName={activeMenuName}
                onToggleMenu={toggleMenu}
                onSelect={onSelect}
                isLoading={finalCommunityLoading}
                loadingMenuName={finalCommunityLoadingMenu}
                isRetrying={communityRetrying}
              />
            </section>
          )}

          {/* Legacy support */}
          {!hasSearchRecommendations &&
            !hasCommunityRecommendations &&
            !finalSearchLoading &&
            !finalCommunityLoading &&
            hasRecommendations && (
              <PlaceRecommendationList
                groups={visibleGroups}
                sectionPrefix="legacy"
                showRating={true}
                expandedMenus={expandedMenus}
                activeMenuName={activeMenuName}
                onToggleMenu={toggleMenu}
                onSelect={onSelect}
                isLoading={!!pendingMenuName}
                loadingMenuName={pendingMenuName}
                isRetrying={false}
              />
            )}
        </div>
      )}

      {searchEntryPointHtml && (
        <div
          className="mt-4 text-xs text-text-tertiary"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(searchEntryPointHtml) }}
        />
      )}
    </div>
  );
};
