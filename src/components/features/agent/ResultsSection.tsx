/**
 * 결과 영역 컴포넌트
 * 선택된 메뉴에 대한 AI 추천 결과를 표시합니다.
 */

import { AiPlaceRecommendations } from '@/components/features/restaurant/AiPlaceRecommendations';
import { useAppSelector } from '@/store/hooks';
import type { PlaceRecommendationItem } from '@/types/menu';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardList } from 'lucide-react';

interface ResultsSectionProps {
  selectedMenu: string | null;
  onClearMenu: () => void;
  onSelectPlace: (recommendation: PlaceRecommendationItem) => void;
  onResetAiRecommendations: () => void;
  aiSectionRef: React.RefObject<HTMLDivElement | null>;
  onOpenPlaceSelection?: () => void;
}

export function ResultsSection({
  selectedMenu,
  onSelectPlace,
  onResetAiRecommendations,
  aiSectionRef,
  onOpenPlaceSelection,
}: ResultsSectionProps) {
  const { t } = useTranslation();

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

  const resultsSectionRef = useRef<HTMLDivElement>(null);
  const previousSelectedMenuRef = useRef<string | null>(null);

  const hasResults =
    selectedMenu &&
    (hasAiRecommendations ||
      hasAnySeparateAiRecommendations ||
      aiLoadingMenu ||
      isSearchAiLoading ||
      isCommunityAiLoading);

  const hasRequestedMenuRecommendation =
    menuRecommendations.length > 0 || isMenuRecommendationLoading;

  useEffect(() => {
    if (selectedMenu !== previousSelectedMenuRef.current) {
      if (selectedMenu && resultsSectionRef.current && window.innerWidth < 768) {
        const timer = setTimeout(() => {
          resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
        previousSelectedMenuRef.current = selectedMenu;
        return () => clearTimeout(timer);
      }

      previousSelectedMenuRef.current = selectedMenu;
    }
  }, [selectedMenu]);

  // Empty state
  if (
    !selectedMenu &&
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

  return (
    <div ref={resultsSectionRef} className="space-y-4 transition-all duration-300 sm:space-y-6">
      {hasResults ? (
        <div ref={aiSectionRef}>
          <AiPlaceRecommendations
            activeMenuName={selectedMenu}
            recommendations={aiRecommendationGroups}
            loadingMenuName={aiLoadingMenu}
            onSelect={onSelectPlace}
            onReset={onResetAiRecommendations}
            onOpenPlaceSelection={onOpenPlaceSelection}
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
        selectedMenu && (
          <div className="rounded-xl border border-border-default bg-bg-secondary p-6 text-center text-text-secondary sm:rounded-2xl sm:p-8">
            <p className="text-sm sm:text-base">{t('agent.results.noAiResults')}</p>
            <p className="mt-1.5 text-xs text-text-tertiary sm:mt-2 sm:text-sm">
              {t('agent.results.tryAiRecommendation')}
            </p>
          </div>
        )
      )}
    </div>
  );
}
