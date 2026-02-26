/**
 * 결과 영역 컴포넌트
 * 선택된 메뉴에 대한 검색 결과와 AI 추천을 표시합니다.
 */

import { AiPlaceRecommendations } from '@/components/features/restaurant/AiPlaceRecommendations';
import { RestaurantList } from '@/components/features/restaurant/RestaurantList';
import { useAppSelector } from '@/store/hooks';
import type { PlaceRecommendationItem } from '@/types/menu';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResultsTabs } from './ResultsTabs';
import { ClipboardList } from 'lucide-react';

interface ResultsSectionProps {
  selectedMenu: string | null;
  onClearMenu: () => void;
  onSelectPlace: (recommendation: PlaceRecommendationItem) => void;
  onResetAiRecommendations: () => void;
  restaurantSectionRef: React.RefObject<HTMLDivElement | null>;
  aiSectionRef: React.RefObject<HTMLDivElement | null>;
}

export interface ResultsSectionRef {
  switchToTab: (tab: 'search' | 'ai') => void;
}

export const ResultsSection = forwardRef<ResultsSectionRef, ResultsSectionProps>(
  (
    {
      selectedMenu,
      onClearMenu,
      onSelectPlace,
      onResetAiRecommendations,
      restaurantSectionRef,
      aiSectionRef,
    },
    ref
  ) => {
    const { t } = useTranslation();

    const restaurants = useAppSelector((state) => state.agent.restaurants);
    const isSearching = useAppSelector((state) => state.agent.isSearching);
    const menuRecommendations = useAppSelector((state) => state.agent.menuRecommendations);
    const isMenuRecommendationLoading = useAppSelector(
      (state) => state.agent.isMenuRecommendationLoading
    );

    const aiRecommendationGroups = useAppSelector((state) => state.agent.aiRecommendationGroups);
    const aiLoadingMenu = useAppSelector((state) => state.agent.aiLoadingMenu);
    const hasAiRecommendations = aiRecommendationGroups.some(
      (group) => group.recommendations.length > 0
    );

    const searchAiRecommendationGroups = useAppSelector(
      (state) => state.agent.searchAiRecommendationGroups
    );
    const communityAiRecommendationGroups = useAppSelector(
      (state) => state.agent.communityAiRecommendationGroups
    );
    const isSearchAiLoading = useAppSelector((state) => state.agent.isSearchAiLoading);
    const isCommunityAiLoading = useAppSelector((state) => state.agent.isCommunityAiLoading);
    const searchAiLoadingMenu = useAppSelector((state) => state.agent.searchAiLoadingMenu);
    const communityAiLoadingMenu = useAppSelector((state) => state.agent.communityAiLoadingMenu);
    const searchAiRetrying = useAppSelector((state) => state.agent.searchAiRetrying);
    const communityAiRetrying = useAppSelector((state) => state.agent.communityAiRetrying);

    const hasSearchAiRecommendations = searchAiRecommendationGroups.some(
      (group) => group.recommendations.length > 0
    );
    const hasCommunityAiRecommendations = communityAiRecommendationGroups.some(
      (group) => group.recommendations.length > 0
    );
    const hasAnySeparateAiRecommendations =
      hasSearchAiRecommendations || hasCommunityAiRecommendations;

    const [activeTab, setActiveTab] = useState<'search' | 'ai'>('search');
    const resultsSectionRef = useRef<HTMLDivElement>(null);
    const previousSelectedMenuRef = useRef<string | null>(null);
    const userSelectedTabRef = useRef<'search' | 'ai' | null>(null);
    const previousSearchCountRef = useRef<number>(0);
    const previousAiCountRef = useRef<number>(0);

    useImperativeHandle(ref, () => ({
      switchToTab: (tab: 'search' | 'ai') => {
        userSelectedTabRef.current = tab;
        setActiveTab(tab);
      },
    }));

    const searchCount = restaurants.length;
    const legacyAiCount = aiRecommendationGroups.reduce(
      (sum, group) => sum + group.recommendations.length,
      0
    );
    const searchAiCount = searchAiRecommendationGroups.reduce(
      (sum, group) => sum + group.recommendations.length,
      0
    );
    const communityAiCount = communityAiRecommendationGroups.reduce(
      (sum, group) => sum + group.recommendations.length,
      0
    );
    const aiCount = Math.max(legacyAiCount, searchAiCount + communityAiCount);

    const hasResults =
      selectedMenu &&
      (searchCount > 0 ||
        hasAiRecommendations ||
        hasAnySeparateAiRecommendations ||
        isSearching ||
        aiLoadingMenu ||
        isSearchAiLoading ||
        isCommunityAiLoading);

    const hasRequestedMenuRecommendation =
      menuRecommendations.length > 0 || isMenuRecommendationLoading;

    useEffect(() => {
      if (selectedMenu !== previousSelectedMenuRef.current) {
        userSelectedTabRef.current = null;
        previousSearchCountRef.current = searchCount;
        const currentAiCount = aiRecommendationGroups.reduce(
          (sum, group) =>
            sum + (group.menuName === selectedMenu ? group.recommendations.length : 0),
          0
        );
        previousAiCountRef.current = currentAiCount;

        if (selectedMenu && resultsSectionRef.current && window.innerWidth < 768) {
          const timer = setTimeout(() => {
            resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 150);
          previousSelectedMenuRef.current = selectedMenu;
          return () => clearTimeout(timer);
        }

        previousSelectedMenuRef.current = selectedMenu;
        return;
      }

      if (!selectedMenu) return;

      if (aiLoadingMenu && selectedMenu) {
        userSelectedTabRef.current = 'ai';
      }

      const currentAiCount = aiRecommendationGroups.reduce(
        (sum, group) =>
          sum + (group.menuName === selectedMenu ? group.recommendations.length : 0),
        0
      );
      const currentMenuHasAiResults = aiRecommendationGroups.some(
        (group) => group.menuName === selectedMenu && group.recommendations.length > 0
      );
      const isAiResultChanged = previousAiCountRef.current !== currentAiCount;
      const isSearchResultChanged = previousSearchCountRef.current !== searchCount;

      if (!isSearching && !aiLoadingMenu) {
        if (isAiResultChanged && currentMenuHasAiResults && userSelectedTabRef.current !== 'search') {
          userSelectedTabRef.current = 'ai';
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setActiveTab('ai');
        } else if (
          isSearchResultChanged &&
          searchCount > 0 &&
          !currentMenuHasAiResults &&
          userSelectedTabRef.current !== 'ai'
        ) {
          userSelectedTabRef.current = 'search';
          setActiveTab('search');
        }
      }

      previousAiCountRef.current = currentAiCount;
      previousSearchCountRef.current = searchCount;
    }, [selectedMenu, searchCount, aiRecommendationGroups, isSearching, aiLoadingMenu]);

    // Empty state
    if (
      !selectedMenu &&
      searchCount === 0 &&
      !hasAiRecommendations &&
      !aiLoadingMenu &&
      hasRequestedMenuRecommendation
    ) {
      return (
        <div className="rounded-2xl border border-border-default bg-bg-surface p-6 text-center shadow-md sm:rounded-3xl sm:p-8">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-secondary sm:h-16 sm:w-16">
              <ClipboardList className="h-7 w-7 text-text-tertiary sm:h-8 sm:w-8" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary sm:text-lg">
                {t('agent.results.selectMenu')}
              </h3>
              <p className="mt-1.5 text-xs text-text-tertiary sm:mt-2 sm:text-sm">
                <span className="sm:hidden">{t('agent.results.selectMenuHint')}</span>
              </p>
            </div>
          </div>
        </div>
      );
    }

    const emptySearchContent = (
      <div className="rounded-xl border border-border-default bg-bg-secondary p-6 text-center text-text-secondary sm:rounded-2xl sm:p-8">
        <p className="text-sm sm:text-base">{t('agent.results.noSearchResults')}</p>
        <p className="mt-1.5 text-xs text-text-tertiary sm:mt-2 sm:text-sm">
          {t('agent.results.trySearch')}
        </p>
      </div>
    );

    const emptyAiContent = (
      <div className="rounded-xl border border-border-default bg-bg-secondary p-6 text-center text-text-secondary sm:rounded-2xl sm:p-8">
        <p className="text-sm sm:text-base">{t('agent.results.noAiResults')}</p>
        <p className="mt-1.5 text-xs text-text-tertiary sm:mt-2 sm:text-sm">
          {t('agent.results.tryAiRecommendation')}
        </p>
      </div>
    );

    return (
      <div ref={resultsSectionRef} className="space-y-4 transition-all duration-300 sm:space-y-6">
        {hasResults ? (
          <ResultsTabs
            activeTab={activeTab}
            onTabChange={(tab) => {
              userSelectedTabRef.current = tab;
              setActiveTab(tab);
            }}
            searchCount={searchCount}
            aiCount={aiCount}
            searchLoading={isSearching}
            aiLoading={!!aiLoadingMenu}
            searchContent={
              selectedMenu && (restaurants.length > 0 || isSearching) ? (
                <div ref={restaurantSectionRef}>
                  <RestaurantList
                    menuName={selectedMenu}
                    restaurants={restaurants}
                    loading={isSearching}
                    onClose={onClearMenu}
                  />
                </div>
              ) : (
                emptySearchContent
              )
            }
            aiContent={
              hasAiRecommendations ||
              hasAnySeparateAiRecommendations ||
              aiLoadingMenu ||
              isSearchAiLoading ||
              isCommunityAiLoading ? (
                <div ref={aiSectionRef}>
                  <AiPlaceRecommendations
                    activeMenuName={selectedMenu}
                    recommendations={aiRecommendationGroups}
                    loadingMenuName={aiLoadingMenu}
                    onSelect={onSelectPlace}
                    onReset={onResetAiRecommendations}
                    searchRecommendations={searchAiRecommendationGroups}
                    communityRecommendations={communityAiRecommendationGroups}
                    isSearchLoading={isSearchAiLoading}
                    isCommunityLoading={isCommunityAiLoading}
                    searchLoadingMenuName={searchAiLoadingMenu}
                    communityLoadingMenuName={communityAiLoadingMenu}
                    searchRetrying={searchAiRetrying}
                    communityRetrying={communityAiRetrying}
                  />
                </div>
              ) : (
                emptyAiContent
              )
            }
          />
        ) : (
          selectedMenu && (
            <div className="rounded-xl border border-border-default bg-bg-secondary p-6 text-center text-text-secondary sm:rounded-2xl sm:p-8">
              <p className="text-sm sm:text-base">{t('agent.results.noResultsYet')}</p>
              <p className="mt-1.5 text-xs text-text-tertiary sm:mt-2 sm:text-sm">
                {t('agent.results.tryBothOptions')}
              </p>
            </div>
          )
        )}
      </div>
    );
  }
);
