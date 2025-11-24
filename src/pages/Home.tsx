import { menuService } from '@/api/services/menu';
import { searchService } from '@/api/services/search';
import { AppHeader } from '@/components/common/AppHeader';
import { Button } from '@/components/common/Button';
import { MenuRecommendation } from '@/components/features/menu/MenuRecommendation';
import { RestaurantList } from '@/components/features/restaurant/RestaurantList';
import { AiPlaceRecommendations } from '@/components/features/restaurant/AiPlaceRecommendations';
import { PlaceDetailsModal } from '@/components/features/restaurant/PlaceDetailsModal';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useAppSelector } from '@/store/hooks';
import type { PlaceRecommendationItem } from '@/types/menu';
import type { Restaurant } from '@/types/search';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [showConfirmCard, setShowConfirmCard] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<PlaceRecommendationItem[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceRecommendationItem | null>(null);
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const { latitude, longitude, hasLocation, address } = useUserLocation();

  const handleMenuClick = (menu: string) => {
    const isSameMenu = selectedMenu === menu;
    setSelectedMenu(menu);
    setShowConfirmCard(true);

    // 다른 메뉴를 선택했을 때만 기존 결과 초기화
    if (!isSameMenu) {
      setRestaurants([]);
      setAiRecommendations([]);
      setSelectedPlace(null);
    }
  };

  const handleSearch = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!hasLocation || latitude === null || longitude === null) {
      alert('위치 정보가 없습니다. 주소를 등록해주세요.');
      return;
    }

    if (!selectedMenu) {
      return;
    }

    setShowConfirmCard(false);
    setIsSearching(true);
    try {
      const result = await searchService.restaurants({
        menuName: selectedMenu,
        latitude,
        longitude,
        includeRoadAddress: false,
      });
      setRestaurants(result.restaurants);
    } catch (error) {
      console.error('식당 검색 실패:', error);
      alert('식당 검색에 실패했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmCard(false);
  };

  const handleAiRecommendation = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!selectedMenu) {
      return;
    }

    const normalizedAddress = address?.trim();
    if (!normalizedAddress) {
      alert('AI 추천을 사용하려면 주소를 등록해주세요.');
      return;
    }

    const query = `${normalizedAddress} ${selectedMenu}`.trim();

    setShowConfirmCard(false);
    setIsAiLoading(true);

    try {
      const response = await menuService.recommendPlaces(query);
      const normalized = (response.recommendations || []).map((item) => ({
        ...item,
        placeId: item.placeId.replace(/^places\//i, ''),
      }));

      setAiRecommendations(normalized);
      if (normalized.length === 0) {
        alert('AI 추천 결과가 없습니다.');
      }
    } catch (error) {
      console.error('AI 추천 식당 조회 실패:', error);
      alert('AI 추천 식당을 가져오지 못했습니다.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-orange-400/40 via-rose-400/30 to-purple-500/30 blur-3xl animate-gradient" />
        <div className="absolute -bottom-52 left-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-sky-500/30 via-emerald-500/20 to-transparent blur-3xl animate-gradient" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <AppHeader />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
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
                <RestaurantList 
                  menuName={selectedMenu} 
                  restaurants={restaurants}
                  loading={isSearching}
                  onClose={() => {
                    setSelectedMenu(null);
                    setRestaurants([]);
                    setAiRecommendations([]);
                    setSelectedPlaceId(null);
                  }}
                />
              )}
              {selectedMenu && (aiRecommendations.length > 0 || isAiLoading) && (
                <AiPlaceRecommendations
                  menuName={selectedMenu}
                  recommendations={aiRecommendations}
                  loading={isAiLoading}
                  onSelect={(recommendation) => setSelectedPlace(recommendation)}
                  onReset={() => {
                    setAiRecommendations([]);
                    setSelectedPlace(null);
                  }}
                />
              )}
            </div>
          )}

      {/* 확인 카드 모달 */}
      {showConfirmCard && selectedMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl backdrop-blur">
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
                  일반 검색 (네이버)
                </Button>
                <Button
                  onClick={handleAiRecommendation}
                  variant="secondary"
                  size="lg"
                  disabled={!address?.trim()}
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
            {!address?.trim() && (
              <div className="mt-2 rounded-xl border border-amber-300/30 bg-amber-500/10 p-3 text-center text-sm text-amber-200">
                주소가 있어야 AI 추천을 사용할 수 있습니다.
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
        onClose={() => setSelectedPlace(null)}
      />
    </div>
  );
};
