import { menuService } from '@/api/services/menu';
import { searchService } from '@/api/services/search';
import { Button } from '@/components/common/Button';
import { MenuRecommendation } from '@/components/features/menu/MenuRecommendation';
import { AiPlaceRecommendations } from '@/components/features/restaurant/AiPlaceRecommendations';
import { PlaceDetailsModal } from '@/components/features/restaurant/PlaceDetailsModal';
import { RestaurantList } from '@/components/features/restaurant/RestaurantList';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useUserLocation } from '@/hooks/map/useUserLocation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  clearSelectedMenu,
  resetAiRecommendations,
  setAiLoading,
  setRestaurants,
  setSelectedMenu,
  setSelectedPlace,
  setIsSearching,
  setShowConfirmCard,
  upsertAiRecommendations,
} from '@/store/slices/agentSlice';
import type { RecommendationLocation } from '@/types/user';
import { isAxiosError } from 'axios';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const AgentPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const { latitude, longitude, hasLocation, address } = useUserLocation();
  const { handleError, handleSuccess } = useErrorHandler();

  // 섹션 위치 참조 (검색 결과 / AI 추천 카드로 스크롤 이동용)
  const restaurantSectionRef = useRef<HTMLDivElement | null>(null);
  const aiSectionRef = useRef<HTMLDivElement | null>(null);

  // Redux에서 상태 가져오기
  const selectedMenu = useAppSelector((state) => state.agent.selectedMenu);
  const menuHistoryId = useAppSelector((state) => state.agent.menuHistoryId);
  const menuRequestAddress = useAppSelector((state) => state.agent.menuRequestAddress);
  const menuRequestLocation = useAppSelector((state) => state.agent.menuRequestLocation);
  const showConfirmCard = useAppSelector((state) => state.agent.showConfirmCard);
  const restaurants = useAppSelector((state) => state.agent.restaurants);
  const isSearching = useAppSelector((state) => state.agent.isSearching);
  const aiRecommendationGroups = useAppSelector((state) => state.agent.aiRecommendationGroups);
  const isAiLoading = useAppSelector((state) => state.agent.isAiLoading);
  const aiLoadingMenu = useAppSelector((state) => state.agent.aiLoadingMenu);
  const selectedPlace = useAppSelector((state) => state.agent.selectedPlace);
  const hasAiRecommendations = aiRecommendationGroups.some((group) => group.recommendations.length > 0);

  // 카드 전체가 잘 보이도록 약간의 여백을 두고 스크롤
  const scrollCardIntoView = (element: HTMLElement | null, offset = 80) => {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    const targetTop = Math.max(absoluteTop - offset, 0);
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  };

  // 직전 로딩 상태를 기억해서 "로딩 시작 시점"을 감지
  const prevIsSearchingRef = useRef(isSearching);
  const prevIsAiLoadingRef = useRef(isAiLoading);

  // 네이버 검색: 로딩 시작 직후(카드가 생긴 시점)에 카드로 스크롤
  useEffect(() => {
    const prev = prevIsSearchingRef.current;
    if (!prev && isSearching && selectedMenu) {
      // 이 시점에는 RestaurantList 래퍼 div가 이미 렌더링되어 ref가 연결된 상태
      scrollCardIntoView(restaurantSectionRef.current);
    }
    prevIsSearchingRef.current = isSearching;
  }, [isSearching, selectedMenu]);

  // AI 추천: 로딩 시작 직후(카드가 생긴 시점)에 카드로 스크롤
  useEffect(() => {
    const prev = prevIsAiLoadingRef.current;
    if (!prev && isAiLoading && selectedMenu) {
      scrollCardIntoView(aiSectionRef.current);
    }
    prevIsAiLoadingRef.current = isAiLoading;
  }, [isAiLoading, selectedMenu]);

  const hasAiQueryContext =
    Boolean(
      menuRequestAddress?.trim() ||
        menuRequestLocation ||
        address?.trim() ||
        (latitude !== null && longitude !== null)
    );

  const handleMenuClick = (
    menu: string,
    historyId: number,
    meta: { requestAddress: string | null; requestLocation: RecommendationLocation | null } = {
      requestAddress: null,
      requestLocation: null,
    }
  ) => {
    dispatch(
      setSelectedMenu({
        menu,
        historyId,
        requestAddress: meta.requestAddress ?? null,
        requestLocation: meta.requestLocation ?? null,
      })
    );
  };

  const handleSearch = async () => {
    if (!isAuthenticated) {
      handleError('로그인이 필요합니다.', 'Agent');
      return;
    }

    if (!hasLocation || latitude === null || longitude === null) {
      handleError('위치 정보가 없습니다. 주소를 등록해주세요.', 'Agent');
      return;
    }

    if (!selectedMenu) {
      return;
    }

    dispatch(setShowConfirmCard(false));
    dispatch(setIsSearching(true));
    try {
      const result = await searchService.restaurants({
        menuName: selectedMenu,
        latitude,
        longitude,
        includeRoadAddress: false,
      });
      dispatch(setRestaurants(result.restaurants));
    } catch (error) {
      handleError(error, 'Agent');
    } finally {
      dispatch(setIsSearching(false));
    }
  };

  const handleCancel = () => {
    dispatch(setShowConfirmCard(false));
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!showConfirmCard) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [showConfirmCard]);

  const loadStoredAiRecommendations = async (
    historyId: number,
    menuName: string,
    { silent }: { silent?: boolean } = {}
  ) => {
    try {
      const response = await menuService.getPlaceRecommendationsByHistoryId(historyId);
      const normalized = (response.places || [])
        .filter((place) => place.menuName === menuName)
        .map((place) => ({
          placeId: place.placeId.replace(/^places\//i, ''),
          name: place.name ?? '이름 없는 가게',
          reason: place.reason ?? '',
          menuName: place.menuName,
        }));

      dispatch(upsertAiRecommendations({ menuName, recommendations: normalized }));
      dispatch(setSelectedPlace(null));

      if (!silent) {
        if (normalized.length === 0) {
          handleError('이미 추천받은 이력이 있지만 저장된 결과를 찾지 못했습니다.', 'Agent');
        } else {
          handleSuccess('이미 추천받은 메뉴입니다. 저장된 결과를 보여드렸어요.');
        }
      }
    } catch (historyError) {
      if (!silent) {
        handleError(historyError, 'Agent');
      }
    }
  };

  const handleAiRecommendation = async () => {
    if (!isAuthenticated) {
      handleError('로그인이 필요합니다.', 'Agent');
      return;
    }

    if (!selectedMenu || menuHistoryId === null) {
      return;
    }

    const alreadyRecommended = aiRecommendationGroups.find(
      (group) => group.menuName === selectedMenu && group.recommendations.length > 0
    );
    if (alreadyRecommended) {
      dispatch(setShowConfirmCard(false));
      handleSuccess('이미 추천받은 메뉴입니다. 저장된 결과를 보여드렸어요.');
      return;
    }

    const normalizedAddress = menuRequestAddress?.trim() || address?.trim();
    const locationFallback = menuRequestLocation
      ? `${menuRequestLocation.lat},${menuRequestLocation.lng}`
      : latitude !== null && longitude !== null
        ? `${latitude},${longitude}`
        : null;
    const queryBase = normalizedAddress || locationFallback;

    if (!queryBase) {
      handleError('AI 추천을 사용하려면 주소 또는 위치 정보를 등록해주세요.', 'Agent');
      return;
    }

    const query = `${queryBase} ${selectedMenu}`.trim();

    dispatch(setShowConfirmCard(false));
    dispatch(setAiLoading({ isLoading: true, menuName: selectedMenu }));

    try {
      const response = await menuService.recommendPlaces({
        query,
        historyId: menuHistoryId,
        menuName: selectedMenu,
      });
      const normalized = (response.recommendations || []).map((item) => ({
        ...item,
        placeId: item.placeId.replace(/^places\//i, ''),
        menuName: selectedMenu,
      }));

      dispatch(upsertAiRecommendations({ menuName: selectedMenu, recommendations: normalized }));
      if (normalized.length === 0) {
        handleError('AI 추천 결과가 없습니다.', 'Agent');
      }
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 400 && menuHistoryId !== null) {
        await loadStoredAiRecommendations(menuHistoryId, selectedMenu);
      } else {
        handleError(error, 'Agent');
      }
    } finally {
      dispatch(setAiLoading({ isLoading: false, menuName: null }));
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-orange-400/40 via-rose-400/30 to-purple-500/30 blur-3xl animate-gradient" />
        <div className="absolute -bottom-52 left-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-sky-500/30 via-emerald-500/20 to-transparent blur-3xl animate-gradient" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 pb-28 sm:px-6 lg:px-8">
          <section className="mb-10 rounded-[32px] border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-rose-500/10 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.4em] text-orange-200/80">Smart Eatery Companion</p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              기분 · 날씨 · 위치를 이해하는 추천과
              <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-500 bg-clip-text text-transparent">
                {' '}
                주변 맛집 탐색
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-base text-slate-300">
              PickEat 홈에서 AI 추천을 받고, 바로 근처 매장까지 확인하세요. 
            </p>
            {!isAuthenticated && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" onClick={() => navigate('/login')}>
                  로그인하고 추천 받기
                </Button>
                <Button variant="ghost" size="lg" onClick={() => navigate('/login')}>
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
            <div className="space-y-8">
              <MenuRecommendation onMenuSelect={handleMenuClick} />
              {selectedMenu && (restaurants.length > 0 || isSearching) && (
                <div ref={restaurantSectionRef}>
                  <RestaurantList 
                    menuName={selectedMenu} 
                    restaurants={restaurants}
                    loading={isSearching}
                    onClose={() => {
                      dispatch(clearSelectedMenu());
                    }}
                  />
                </div>
              )}
              {(hasAiRecommendations || aiLoadingMenu) && (
                <div ref={aiSectionRef}>
                  <AiPlaceRecommendations
                    activeMenuName={selectedMenu}
                    recommendations={aiRecommendationGroups}
                    isLoading={isAiLoading}
                    loadingMenuName={aiLoadingMenu}
                    onSelect={(recommendation) => dispatch(setSelectedPlace(recommendation))}
                    onReset={() => dispatch(resetAiRecommendations())}
                  />
                </div>
              )}
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
            className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl backdrop-blur"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCancel}
              className="absolute right-6 top-6 text-slate-400 hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="space-y-4">
              <p className="text-center text-lg text-white">
                <span className="font-semibold text-orange-300">{selectedMenu}</span>에 대해 어떤 방식으로 탐색할까요?
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
      <PlaceDetailsModal
        placeId={selectedPlace?.placeId ?? null}
        placeName={selectedPlace?.name ?? null}
        onClose={() => dispatch(setSelectedPlace(null))}
      />
    </div>
  );
};

