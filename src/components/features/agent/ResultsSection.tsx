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

  // 메뉴 선택 시 스크롤 처리 (탭 변경은 모달에서 선택한 후에만)
  useEffect(() => {
    // 메뉴가 새로 선택되었을 때
    if (selectedMenu && selectedMenu !== previousSelectedMenuRef.current) {
      // ⚠️ 중요: 모달에서 선택하기 전에는 탭 변경하지 않음
      // 탭 변경은 Agent.tsx의 handleSearch/handleAiRecommendation에서 처리
      // 여기서는 스크롤만 처리
      
      // 새 메뉴 선택 시 사용자 선택 초기화 (다음 선택을 위해)
      userSelectedTabRef.current = null;

      // 모바일에서 결과 영역으로 스크롤 (데스크톱은 이미 보이므로 스크롤 불필요)
      // 데스크톱에서는 그리드 레이아웃으로 결과가 이미 보이므로 스크롤 불필요
      let timer: ReturnType<typeof setTimeout> | null = null;
      if (resultsSectionRef.current && window.innerWidth < 768) {
        // 약간의 지연을 두어 DOM 업데이트 후 스크롤
        timer = setTimeout(() => {
          resultsSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 150);
      }
      
      previousSelectedMenuRef.current = selectedMenu;
      
      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    } else {
      previousSelectedMenuRef.current = selectedMenu;
    }
  }, [selectedMenu, searchCount, hasAiRecommendations, isSearching, aiLoadingMenu]);

  // AI 추천 완료 후에도 AI 추천 탭 유지 (계획서 요구사항)
  // ⚠️ 중요: 탭 전환은 Agent.tsx의 handleAiRecommendation에서 이미 처리됨
  // 여기서는 AI 추천이 완료된 후에도 탭이 유지되도록 보장
  useEffect(() => {
    if (!selectedMenu) return;
    
    // 사용자가 명시적으로 일반 검색을 선택한 경우는 제외
    if (userSelectedTabRef.current === 'search') {
      return;
    }

    // 메뉴가 변경된 경우는 탭을 변경하지 않음 (모달에서 선택할 때까지 유지)
    const isMenuChanged = previousSelectedMenuRef.current !== selectedMenu;
    if (isMenuChanged) {
      const currentAiCount = aiRecommendationGroups.reduce(
        (sum, group) => sum + (group.menuName === selectedMenu ? group.recommendations.length : 0),
        0
      );
      previousAiCountRef.current = currentAiCount;
      return;
    }

    // AI 추천이 시작되었을 때 (이미 Agent.tsx에서 탭 전환했지만, 추가 보장)
    if (aiLoadingMenu && selectedMenu) {
      // Agent.tsx에서 이미 탭을 전환했으므로, 여기서는 userSelectedTabRef만 업데이트
      userSelectedTabRef.current = 'ai';
    }
    
    // AI 추천 결과가 실제로 변경되었을 때만 탭 변경 (새로운 AI 추천이 완료된 경우)
    const currentAiCount = aiRecommendationGroups.reduce(
      (sum, group) => sum + (group.menuName === selectedMenu ? group.recommendations.length : 0),
      0
    );
    const isAiResultChanged = previousAiCountRef.current !== currentAiCount;
    
    // AI 추천이 완료되었을 때 AI 탭 유지
    const currentMenuAiRecommendations = aiRecommendationGroups.find(
      (group) => group.menuName === selectedMenu && group.recommendations.length > 0
    );
    if (isAiResultChanged && currentMenuAiRecommendations && !aiLoadingMenu && !isSearching) {
      // AI 추천을 선택한 경우 AI 탭 유지
      userSelectedTabRef.current = 'ai';
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab('ai');
    }

    previousAiCountRef.current = currentAiCount;
  }, [selectedMenu, aiLoadingMenu, aiRecommendationGroups, isSearching]);

  // 일반 검색 완료 후에도 일반 검색 탭 유지 (계획서 요구사항)
  // ⚠️ 중요: 탭 전환은 Agent.tsx의 handleSearch에서 이미 처리됨
  // 여기서는 일반 검색이 완료된 후에도 탭이 유지되도록 보장
  useEffect(() => {
    if (!selectedMenu) return;
    
    // 사용자가 명시적으로 AI 추천을 선택한 경우는 제외
    if (userSelectedTabRef.current === 'ai') {
      return;
    }

    // 메뉴가 변경된 경우는 탭을 변경하지 않음 (모달에서 선택할 때까지 유지)
    const isMenuChanged = previousSelectedMenuRef.current !== selectedMenu;
    if (isMenuChanged) {
      previousSearchCountRef.current = searchCount;
      return;
    }

    // 검색 결과가 실제로 변경되었을 때만 탭 변경 (새로운 검색이 완료된 경우)
    const isSearchResultChanged = previousSearchCountRef.current !== searchCount;
    
    // 일반 검색이 완료되었을 때 일반 검색 탭 유지
    if (isSearchResultChanged && searchCount > 0 && !isSearching && !aiLoadingMenu) {
      const currentMenuAiRecommendations = aiRecommendationGroups.find(
        (group) => group.menuName === selectedMenu && group.recommendations.length > 0
      );
      // 현재 메뉴에 AI 추천 결과가 없고 일반 검색 결과만 있는 경우
      if (!currentMenuAiRecommendations) {
        // 일반 검색을 선택한 경우 일반 검색 탭 유지
        userSelectedTabRef.current = 'search';
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveTab('search');
      }
    }

    previousSearchCountRef.current = searchCount;
  }, [selectedMenu, searchCount, isSearching, aiLoadingMenu, aiRecommendationGroups]);

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

