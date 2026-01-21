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

export const ResultsSection = forwardRef<ResultsSectionRef, ResultsSectionProps>(({
  selectedMenu,
  onClearMenu,
  onSelectPlace,
  onResetAiRecommendations,
  restaurantSectionRef,
  aiSectionRef,
}, ref) => {
  const { t } = useTranslation();

  // Redux에서 상태 가져오기 (기존 selector 패턴 유지)
  const restaurants = useAppSelector((state) => state.agent.restaurants);
  const isSearching = useAppSelector((state) => state.agent.isSearching);
  const menuRecommendations = useAppSelector(
    (state) => state.agent.menuRecommendations,
  );
  const isMenuRecommendationLoading = useAppSelector(
    (state) => state.agent.isMenuRecommendationLoading,
  );
  const aiRecommendationGroups = useAppSelector((state) => state.agent.aiRecommendationGroups);
  const aiLoadingMenu = useAppSelector((state) => state.agent.aiLoadingMenu);
  const hasAiRecommendations = aiRecommendationGroups.some((group) => group.recommendations.length > 0);

  const [activeTab, setActiveTab] = useState<'search' | 'ai'>('search');
  const resultsSectionRef = useRef<HTMLDivElement>(null);
  const previousSelectedMenuRef = useRef<string | null>(null);
  const userSelectedTabRef = useRef<'search' | 'ai' | null>(null); // 사용자가 명시적으로 선택한 탭
  const previousSearchCountRef = useRef<number>(0); // 이전 검색 결과 개수 추적
  const previousAiCountRef = useRef<number>(0); // 이전 AI 추천 개수 추적

  // 외부에서 탭 변경을 제어할 수 있도록 노출
  useImperativeHandle(ref, () => ({
    switchToTab: (tab: 'search' | 'ai') => {
      userSelectedTabRef.current = tab; // 사용자가 명시적으로 선택한 탭 기록
      setActiveTab(tab);
    },
  }));

  // 검색 결과 개수
  const searchCount = restaurants.length;
  // AI 추천 개수 (모든 그룹의 추천 합계)
  const aiCount = aiRecommendationGroups.reduce((sum, group) => sum + group.recommendations.length, 0);

  // 선택된 메뉴가 있고 결과가 있을 때만 탭 표시
  const hasResults = selectedMenu && (searchCount > 0 || hasAiRecommendations || isSearching || aiLoadingMenu);
  // 메뉴 추천을 눌러본 이후에만 빈 상태 안내를 노출
  const hasRequestedMenuRecommendation =
    menuRecommendations.length > 0 || isMenuRecommendationLoading;

  // Unified effect: Handle menu changes, scroll, and tab state
  // This consolidates the previous 3 useEffect hooks to prevent cascading state updates
  useEffect(() => {
    // Handle menu change - reset tracking and scroll
    if (selectedMenu !== previousSelectedMenuRef.current) {
      // Reset user tab selection on new menu
      userSelectedTabRef.current = null;

      // Reset count refs for new menu
      previousSearchCountRef.current = searchCount;
      const currentAiCount = aiRecommendationGroups.reduce(
        (sum, group) => sum + (group.menuName === selectedMenu ? group.recommendations.length : 0),
        0
      );
      previousAiCountRef.current = currentAiCount;

      // Scroll to results on mobile when menu is selected
      if (selectedMenu && resultsSectionRef.current && window.innerWidth < 768) {
        const timer = setTimeout(() => {
          resultsSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 150);

        previousSelectedMenuRef.current = selectedMenu;
        return () => clearTimeout(timer);
      }

      previousSelectedMenuRef.current = selectedMenu;
      return;
    }

    // Only process tab changes if menu hasn't changed
    if (!selectedMenu) return;

    // Track AI loading state
    if (aiLoadingMenu && selectedMenu) {
      userSelectedTabRef.current = 'ai';
    }

    // Calculate current counts for this menu
    const currentAiCount = aiRecommendationGroups.reduce(
      (sum, group) => sum + (group.menuName === selectedMenu ? group.recommendations.length : 0),
      0
    );
    const currentMenuHasAiResults = aiRecommendationGroups.some(
      (group) => group.menuName === selectedMenu && group.recommendations.length > 0
    );

    // Detect changes in results
    const isAiResultChanged = previousAiCountRef.current !== currentAiCount;
    const isSearchResultChanged = previousSearchCountRef.current !== searchCount;

    // Update tab based on completed results (not loading states)
    // Only change tab if user hasn't manually selected one, and results have actually changed
    if (!isSearching && !aiLoadingMenu) {
      // AI recommendation completed
      if (isAiResultChanged && currentMenuHasAiResults && userSelectedTabRef.current !== 'search') {
        userSelectedTabRef.current = 'ai';
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveTab('ai');
      }
      // Search completed (only if no AI results exist for this menu)
      else if (isSearchResultChanged && searchCount > 0 && !currentMenuHasAiResults && userSelectedTabRef.current !== 'ai') {
        userSelectedTabRef.current = 'search';
        setActiveTab('search');
      }
    }

    // Update refs
    previousAiCountRef.current = currentAiCount;
    previousSearchCountRef.current = searchCount;
  }, [selectedMenu, searchCount, aiRecommendationGroups, isSearching, aiLoadingMenu]);

  // 빈 상태
  if (
    !selectedMenu &&
    searchCount === 0 &&
    !hasAiRecommendations &&
    !aiLoadingMenu &&
    hasRequestedMenuRecommendation
  ) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center shadow-[0_20px_60px_rgba(15,23,42,0.6)] backdrop-blur sm:rounded-3xl sm:p-8">
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <svg className="h-12 w-12 text-slate-600 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <div>
            <h3 className="text-base font-semibold text-white sm:text-lg">{t('agent.results.selectMenu')}</h3>
            <p className="mt-1.5 text-xs text-slate-400 sm:mt-2 sm:text-sm">
              <span className="sm:hidden">{t('agent.results.selectMenuHint')}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={resultsSectionRef} className="space-y-4 transition-all duration-300 sm:space-y-6">
      {/* 결과가 있을 때 탭 표시 */}
      {hasResults ? (
        <ResultsTabs
          activeTab={activeTab}
          onTabChange={(tab) => {
            userSelectedTabRef.current = tab; // 사용자가 수동으로 탭을 변경한 경우 기록
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
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-slate-300 sm:rounded-2xl sm:p-8">
                <p className="text-sm sm:text-base">{t('agent.results.noSearchResults')}</p>
                <p className="mt-1.5 text-xs text-slate-400 sm:mt-2 sm:text-sm">{t('agent.results.trySearch')}</p>
              </div>
            )
          }
          aiContent={
            hasAiRecommendations || aiLoadingMenu ? (
              <div ref={aiSectionRef}>
                <AiPlaceRecommendations
                  activeMenuName={selectedMenu}
                  recommendations={aiRecommendationGroups}
                  loadingMenuName={aiLoadingMenu}
                  onSelect={onSelectPlace}
                  onReset={onResetAiRecommendations}
                />
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-slate-300 sm:rounded-2xl sm:p-8">
                <p className="text-sm sm:text-base">{t('agent.results.noAiResults')}</p>
                <p className="mt-1.5 text-xs text-slate-400 sm:mt-2 sm:text-sm">{t('agent.results.tryAiRecommendation')}</p>
              </div>
            )
          }
        />
      ) : (
        // 결과가 없지만 선택된 메뉴가 있을 때
        selectedMenu && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-slate-300 sm:rounded-2xl sm:p-8">
            <p className="text-sm sm:text-base">{t('agent.results.noResultsYet')}</p>
            <p className="mt-1.5 text-xs text-slate-400 sm:mt-2 sm:text-sm">{t('agent.results.tryBothOptions')}</p>
          </div>
        )
      )}
    </div>
  );
});

