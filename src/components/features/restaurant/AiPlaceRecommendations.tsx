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
  // New props for separate sections
  searchRecommendations?: MenuPlaceRecommendationGroup[];
  communityRecommendations?: MenuPlaceRecommendationGroup[];
  isSearchLoading?: boolean;
  isCommunityLoading?: boolean;
  searchLoadingMenuName?: string | null;
  communityLoadingMenuName?: string | null;
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
}: AiPlaceRecommendationsProps) => {
  const { t } = useTranslation();

  // Use new props if provided, otherwise fall back to legacy props for backward compatibility
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

  // Legacy support
  const visibleGroups = recommendations.filter((group) => group.recommendations.length > 0);
  const hasRecommendations = visibleGroups.length > 0;
  const pendingMenuName = loadingMenuName;

  // 아코디언 상태 관리: 각 메뉴별로 펼침/접힘 상태 (섹션 prefix 포함)
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  // activeMenuName이 변경되면 해당 메뉴를 자동으로 펼침 (모든 섹션에서)
  useEffect(() => {
    if (activeMenuName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpandedMenus((prev) => {
        const newSet = new Set(prev);
        // Auto-expand in all sections
        newSet.add(`search-${activeMenuName}`);
        newSet.add(`community-${activeMenuName}`);
        newSet.add(`legacy-${activeMenuName}`);
        // Legacy support without prefix
        newSet.add(activeMenuName);
        return newSet;
      });
    }
  }, [activeMenuName]);

  // 메뉴 클릭 시 펼침/접힘 토글
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

  // Helper component to render recommendation groups
  const renderRecommendationGroups = (
    groups: MenuPlaceRecommendationGroup[],
    sectionPrefix: string
  ) => {
    return groups.map((group) => {
      const isExpanded = expandedMenus.has(`${sectionPrefix}-${group.menuName}`);
      const isActive = activeMenuName === group.menuName;

      return (
        <div
          key={`${sectionPrefix}-${group.menuName}`}
          className={`rounded-xl border transition-all duration-300 ${
            isActive
              ? 'border-orange-400/30 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent'
              : 'border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent'
          }`}
        >
          {/* Accordion Header */}
          <button
            onClick={() => toggleMenu(`${sectionPrefix}-${group.menuName}`)}
            className="group w-full px-4 py-3 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/50"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`text-base font-semibold truncate ${
                    isActive ? 'text-orange-200' : 'text-white'
                  }`}>
                    {group.menuName}
                  </h3>
                  <span className="flex-shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">
                    {group.recommendations.length}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 rounded-full p-1 transition-all duration-300 group-hover:bg-white/10">
                <svg
                  className={`h-5 w-5 text-slate-400 transition-transform duration-300 group-hover:text-white ${
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

          {/* Accordion Content */}
          {isExpanded && (
            <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-4 animate-fade-in">
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
                    className="rounded-lg border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400/40"
                  >
                    <div className="flex items-start gap-3">
                      {/* Thumbnail Image */}
                      {typedRec.photoUrl && (
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-slate-700">
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
                          <h4 className="text-base font-semibold text-white">
                            {formatMultilingualName(recommendation.name, typedRec.localizedName)}
                          </h4>
                          {/* Operating Status Badge */}
                          {typedRec.isOpen !== undefined && typedRec.isOpen !== null && (
                            <span
                              className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                                typedRec.isOpen
                                  ? 'bg-emerald-500/20 text-emerald-200'
                                  : 'bg-slate-500/20 text-slate-300'
                              }`}
                            >
                              {typedRec.isOpen ? t('place.open') : t('place.closed')}
                            </span>
                          )}
                        </div>
                        {/* Rating and Review Count */}
                        {(typedRec.rating !== undefined || typedRec.reviewCount !== undefined) && (
                          <div className="flex items-center gap-2 mt-1">
                            {typedRec.rating !== undefined && typedRec.rating !== null && (
                              <div className="flex items-center gap-1">
                                <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-sm font-medium text-yellow-200">{typedRec.rating.toFixed(1)}</span>
                              </div>
                            )}
                            {typedRec.reviewCount !== undefined && typedRec.reviewCount !== null && (
                              <span className="text-xs text-slate-400">({typedRec.reviewCount})</span>
                            )}
                          </div>
                        )}
                        {/* Address */}
                        {(typedRec.localizedAddress || typedRec.address) && (
                          <p className="mt-1 text-xs text-slate-400 truncate">
                            {formatMultilingualAddress(typedRec.address, typedRec.localizedAddress)}
                          </p>
                        )}
                        {/* Recommendation Reason */}
                        <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-300">
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

  // Render loading card
  const renderLoadingCard = (menuName: string | null) => {
    if (!menuName) return null;
    return (
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-white truncate">{menuName}</h3>
            <p className="mt-1 text-sm text-slate-400">{t('restaurant.aiSearching')}</p>
          </div>
          <div className="h-8 w-8 flex-shrink-0 animate-spin rounded-full border-b-2 border-orange-500" />
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.6)] backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-orange-200/80">AI Places</p>
          <h2 className="mt-1.5 text-xl font-semibold text-white">{t('restaurant.aiRecommendedStores')}</h2>
        </div>
        {(hasRecommendations || hasAnyRecommendations) && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-slate-400 hover:text-white">
            {t('restaurant.reset')}
          </Button>
        )}
      </div>

      {!hasRecommendations && !hasAnyRecommendations && !pendingMenuName && !finalSearchLoading && !finalCommunityLoading ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-slate-300">
          {t('restaurant.noRecommendations')}
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <p className="text-xs text-slate-400">
            {t('restaurant.tapCardForDetails')}
          </p>

          {/* Search Recommendations Section */}
          {(hasSearchRecommendations || finalSearchLoading) && (
            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-orange-200">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                검색 추천
              </h3>
              <div className="space-y-3">
                {renderRecommendationGroups(searchVisibleGroups, 'search')}
                {finalSearchLoading && renderLoadingCard(finalSearchLoadingMenu)}
              </div>
            </section>
          )}

          {/* Community Recommendations Section */}
          {(hasCommunityRecommendations || finalCommunityLoading) && (
            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-200">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                커뮤니티 추천
              </h3>
              <div className="space-y-3">
                {renderRecommendationGroups(communityVisibleGroups, 'community')}
                {finalCommunityLoading && renderLoadingCard(finalCommunityLoadingMenu)}
              </div>
            </section>
          )}

          {/* Legacy support - show old recommendations if no new sections */}
          {!hasSearchRecommendations && !hasCommunityRecommendations && !finalSearchLoading && !finalCommunityLoading && hasRecommendations && (
            <div className="space-y-3">
              {renderRecommendationGroups(visibleGroups, 'legacy')}
              {pendingMenuName && renderLoadingCard(pendingMenuName)}
            </div>
          )}
        </div>
      )}

      {/* Google ToS - Search Entry Point HTML */}
      {searchEntryPointHtml && (
        <div
          className="mt-4 text-xs text-slate-500"
          dangerouslySetInnerHTML={{ __html: searchEntryPointHtml }}
        />
      )}
    </div>
  );
};
