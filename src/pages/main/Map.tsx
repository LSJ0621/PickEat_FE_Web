/**
 * 네이버 지도 페이지
 * 선택한 가게 또는 전체 가게 위치를 지도에 표시합니다.
 */

import { Button } from '@/components/common/Button';
import { useNaverMap } from '@/hooks/map/useNaverMap';
import { useUserLocation } from '@/hooks/map/useUserLocation';
import type { Restaurant } from '@/types/search';
import { useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface MapPageState {
  restaurants?: Restaurant[];
  selectedRestaurant?: Restaurant | null;
  menuName?: string | null;
}

export const MapPage = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { latitude, longitude, address, hasLocation } = useUserLocation();
  const navigate = useNavigate();
  const location = useLocation();
  const naverClientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;
  const { restaurants = [], selectedRestaurant = null, menuName = null } = (location.state as MapPageState) || {};

  const hasRestaurantData = restaurants.length > 0;
  const hasAnyLocation = hasRestaurantData || hasLocation;
  const blockingError = useMemo(() => {
    if (!naverClientId) {
      return '네이버 지도 API 키가 설정되지 않았습니다. .env에 VITE_NAVER_MAP_CLIENT_ID를 추가해주세요.';
    }
    if (!hasAnyLocation) {
      return '표시할 위치 정보가 없습니다. 주소를 등록하거나 가게 목록에서 지도를 열어주세요.';
    }
    return null;
  }, [naverClientId, hasAnyLocation]);

  const userLatLng = hasLocation && latitude !== null && longitude !== null
    ? { latitude, longitude }
    : null;

  const { loading, runtimeError } = useNaverMap({
    mapRef,
    naverClientId,
    restaurants,
    selectedRestaurant,
    userLatLng,
    blockingError,
  });

  const error = blockingError ?? runtimeError;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (!hasAnyLocation) {
    return (
      <div className="relative min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">표시할 위치 정보가 없습니다</h2>
            <p className="mt-3 text-slate-300">먼저 주변 식당을 검색한 뒤, 지도 보기 버튼을 눌러주세요.</p>
            <Button className="mt-6" variant="primary" size="md" onClick={() => navigate('/')}>
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-orange-400/40 via-rose-400/30 to-purple-500/30 blur-3xl animate-gradient" />
        <div className="absolute -bottom-52 left-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-sky-500/30 via-emerald-500/20 to-transparent blur-3xl animate-gradient" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBack} className="text-white">
                ← 뒤로가기
              </Button>
              <div>
                <p className="text-xl font-semibold">네이버 지도</p>
                {menuName && (
                  <p className="text-xs text-slate-400">
                    {menuName} · {restaurants.length}개 매장
                  </p>
                )}
                {!menuName && hasRestaurantData && (
                  <p className="text-xs text-slate-400">총 {restaurants.length}개 매장</p>
                )}
                {!hasRestaurantData && address && (
                  <p className="text-xs text-slate-400">📍 {address}</p>
                )}
              </div>
            </div>
            {selectedRestaurant && (
              <div className="hidden rounded-full border border-white/15 px-4 py-1 text-xs text-white/80 sm:flex">
                선택됨: {selectedRestaurant.name}
              </div>
            )}
          </div>
        </header>

        <main className="relative flex-1">
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/50 backdrop-blur">
              <div className="text-center">
                <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500"></div>
                <p className="text-sm text-slate-300">지도를 불러오는 중...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/70 backdrop-blur">
              <div className="mx-4 max-w-md rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-center shadow-2xl">
                <h3 className="mb-2 text-lg font-semibold text-red-400">오류가 발생했습니다</h3>
                <p className="mb-4 text-sm text-slate-200">{error}</p>
                <Button variant="primary" size="sm" onClick={() => window.location.reload()}>
                  새로고침
                </Button>
              </div>
            </div>
          )}
          <div ref={mapRef} className="h-[calc(100vh-73px)] w-full" style={{ minHeight: '600px' }} />
        </main>
      </div>
    </div>
  );
};
