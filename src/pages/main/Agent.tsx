import { lazy, Suspense, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { MenuRecommendation } from '@/components/features/menu/MenuRecommendation';
import { ResultsSection } from '@/components/features/agent/ResultsSection';
import type { ResultsSectionRef } from '@/components/features/agent/ResultsSection';
import { useScrollToSection } from '@/hooks/common/useScrollToSection';
import { useUserLocation } from '@/hooks/map/useUserLocation';
import { useAgentActions } from '@/hooks/agent/useAgentActions';
import { useConfirmModal } from '@/hooks/agent/useConfirmModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  clearSelectedMenu,
  resetAiRecommendations,
  setSelectedPlace,
} from '@/store/slices/agentSlice';

// Lazy load modal
const PlaceDetailsModal = lazy(() => import('@/components/features/restaurant/PlaceDetailsModal').then(m => ({ default: m.PlaceDetailsModal })));

export const AgentPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const { latitude, longitude, hasLocation, address } = useUserLocation();

  // 섹션 위치 참조 (검색 결과 / AI 추천 카드로 스크롤 이동용)
  const restaurantSectionRef = useRef<HTMLDivElement>(null);
  const aiSectionRef = useRef<HTMLDivElement>(null);
  const resultsSectionRef = useRef<ResultsSectionRef>(null);

  // Redux에서 상태 가져오기
  const selectedMenu = useAppSelector((state) => state.agent.selectedMenu);
  const isSearching = useAppSelector((state) => state.agent.isSearching);
  const isAiLoading = useAppSelector((state) => state.agent.isAiLoading);
  const selectedPlace = useAppSelector((state) => state.agent.selectedPlace);

  // Custom hooks for business logic
  const { handleMenuClick, handleSearch, handleCancel, handleAiRecommendation } = useAgentActions({
    latitude,
    longitude,
    hasLocation,
    address,
    resultsSectionRef,
  });

  const { showConfirmCard } = useConfirmModal({ handleCancel });

  // 네이버 검색: 로딩 시작 직후(카드가 생긴 시점)에 카드로 스크롤 (모바일에서만)
  // 문제 4 해결: 데스크톱에서는 그리드 레이아웃으로 이미 보이므로 스크롤 불필요
  useScrollToSection({
    elementRef: restaurantSectionRef,
    shouldScroll: isSearching && selectedMenu !== null,
    offset: 80,
  });

  // AI 추천: 로딩 시작 직후(카드가 생긴 시점)에 카드로 스크롤 (모바일에서만)
  useScrollToSection({
    elementRef: aiSectionRef,
    shouldScroll: isAiLoading && selectedMenu !== null,
    offset: 80,
  });

  const hasAiQueryContext =
    Boolean(
      address?.trim() ||
        (latitude !== null && longitude !== null)
    );

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-orange-400/40 via-rose-400/30 to-purple-500/30 blur-3xl animate-gradient" />
        <div className="absolute -bottom-52 left-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-sky-500/30 via-emerald-500/20 to-transparent blur-3xl animate-gradient" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 pb-28 sm:px-6 lg:px-8">
          <section className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-center shadow-2xl shadow-rose-500/10 backdrop-blur sm:mb-6 sm:rounded-[32px] sm:p-6 lg:mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-orange-200/80 sm:text-sm sm:tracking-[0.4em]">Smart Eatery Companion</p>
            <h2 className="mt-2 text-xl font-semibold text-white sm:mt-3 sm:text-2xl md:mt-4 md:text-3xl lg:text-4xl">
              기분 · 날씨 · 위치를 이해하는 추천과
              <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-500 bg-clip-text text-transparent">
                {' '}
                주변 맛집 탐색
              </span>
            </h2>
            <p className="mx-auto mt-1.5 max-w-3xl text-xs text-slate-300 sm:mt-2 sm:text-sm md:mt-3 md:text-base">
              PickEat 홈에서 AI 추천을 받고, 바로 근처 매장까지 확인하세요. 
            </p>
            {!isAuthenticated && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:mt-6 sm:gap-4 lg:mt-8">
                <Button size="md" onClick={() => navigate('/login')} className="sm:size-lg">
                  로그인하고 추천 받기
                </Button>
                <Button variant="ghost" size="md" onClick={() => navigate('/login')} className="sm:size-lg">
                  카카오로 빠른 시작
                </Button>
              </div>
            )}
          </section>

          {!isAuthenticated ? (
            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-8 text-center shadow-xl shadow-black/30 backdrop-blur">
              <h3 className="text-2xl font-semibold text-white">맞춤 추천을 받으려면 로그인하세요</h3>
              <p className="mt-3 text-slate-300">
                로그인하면 오늘의 기분을 반영한 추천과 주변 식당 탐색을 하나의 보드에서 진행할 수 있습니다.
              </p>
              <Button className="mt-6" size="md" variant="secondary" onClick={() => navigate('/login')}>
                로그인 페이지로 이동
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6 lg:gap-8">
              {/* 메뉴 추천 섹션 */}
              <MenuRecommendation onMenuSelect={handleMenuClick} selectedMenu={selectedMenu} />
              
              {/* 결과 영역 */}
              <ResultsSection
                ref={resultsSectionRef}
                selectedMenu={selectedMenu}
                onClearMenu={() => dispatch(clearSelectedMenu())}
                onSelectPlace={(recommendation) => dispatch(setSelectedPlace(recommendation))}
                onResetAiRecommendations={() => dispatch(resetAiRecommendations())}
                restaurantSectionRef={restaurantSectionRef}
                aiSectionRef={aiSectionRef}
              />
            </div>
          )}

      {/* 확인 카드 모달 */}
      {showConfirmCard && selectedMenu && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => {
            // 배경 클릭 시 모달 닫기
            if (e.target === e.currentTarget) {
              handleCancel();
            }
          }}
        >
          <div
            data-testid="menu-selection-modal"
            className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl backdrop-blur"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              data-testid="modal-close-button"
              onClick={handleCancel}
              className="absolute right-6 top-6 text-slate-400 hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="space-y-4">
              <p className="text-center text-lg text-white">
                <span data-testid="selected-menu-name" className="font-semibold text-orange-300">{selectedMenu}</span>에 대해 어떤 방식으로 탐색할까요?
            </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  onClick={handleSearch}
                  disabled={!hasLocation}
                  variant="primary"
                  size="lg"
                >
                  일반 검색
                </Button>
                <Button
                  onClick={handleAiRecommendation}
                  variant="secondary"
                  size="lg"
                  disabled={!hasAiQueryContext}
                >
                  AI 추천 보기
                </Button>
              </div>
            </div>
            {!hasLocation && (
              <div className="mt-4 rounded-xl border border-amber-300/30 bg-amber-500/10 p-3 text-center text-sm text-amber-200">
                위치 정보가 없습니다. 주소를 등록해야 식당을 검색할 수 있습니다.
              </div>
            )}
            {!hasAiQueryContext && (
              <div className="mt-2 rounded-xl border border-amber-300/30 bg-amber-500/10 p-3 text-center text-sm text-amber-200">
                주소 또는 위치 정보가 있어야 AI 추천을 사용할 수 있습니다.
              </div>
            )}
          </div>
        </div>
      )}
        </main>
      </div>
      <Suspense fallback={null}>
        <PlaceDetailsModal
          placeId={selectedPlace?.placeId ?? null}
          placeName={selectedPlace?.name ?? null}
          onClose={() => dispatch(setSelectedPlace(null))}
        />
      </Suspense>
    </div>
  );
};

