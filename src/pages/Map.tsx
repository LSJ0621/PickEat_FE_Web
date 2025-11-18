/**
 * 네이버 지도 페이지
 * 선택한 가게 또는 전체 가게 위치를 지도에 표시합니다.
 */

import { Button } from '@/components/common/Button';
import { useUserLocation } from '@/hooks/useUserLocation';
import type { Restaurant } from '@/types/search';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    naver: any;
    navermap_authFailure?: () => void;
  }
}

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
  const restaurantsKey = useMemo(() => JSON.stringify(restaurants), [restaurants]);
  const selectedRestaurantKey = useMemo(
    () => (selectedRestaurant ? JSON.stringify(selectedRestaurant) : 'none'),
    [selectedRestaurant]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasRestaurantData = restaurants.length > 0;
  const hasAnyLocation = hasRestaurantData || hasLocation;

  useEffect(() => {
    if (!naverClientId) {
      setError('네이버 지도 API 키가 설정되지 않았습니다. .env에 VITE_NAVER_MAP_CLIENT_ID를 추가해주세요.');
      setLoading(false);
      return;
    }

    if (!hasAnyLocation) {
      setError('표시할 위치 정보가 없습니다. 주소를 등록하거나 가게 목록에서 지도를 열어주세요.');
      setLoading(false);
      return;
    }

    let isMounted = true;
    const scriptId = 'naver-map-sdk';
    const callbackName = `initNaverMap_${Date.now()}`;

    const getLatLngFromRestaurant = (restaurant: Restaurant) => {
      if (!window.naver?.maps) {
        return null;
      }

      // 위도/경도가 있으면 직접 사용
      if (typeof restaurant.latitude === 'number' && typeof restaurant.longitude === 'number') {
        return new window.naver.maps.LatLng(restaurant.latitude, restaurant.longitude);
      }

      // mapx, mapy를 위도/경도로 변환
      if (restaurant.mapx !== undefined && restaurant.mapy !== undefined) {
        try {
          const mapx = Number(restaurant.mapx);
          const mapy = Number(restaurant.mapy);
          const lat = mapy / 10000000;
          const lng = mapx / 10000000;
          return new window.naver.maps.LatLng(lat, lng);
        } catch (error) {
          console.error('좌표 변환 실패:', error);
          return null;
        }
      }

      return null;
    };

    const initMap = () => {
      if (!isMounted || !mapRef.current || !window.naver?.maps) {
        return;
      }

      const userLatLng =
        hasLocation && latitude !== null && longitude !== null
          ? new window.naver.maps.LatLng(latitude, longitude)
          : null;

      const restaurantMarkers = restaurants
        .map((restaurant) => {
          const latLng = getLatLngFromRestaurant(restaurant);
          if (latLng) {
            console.log(`[지도] ${restaurant.name}:`, {
              mapx: restaurant.mapx,
              mapy: restaurant.mapy,
              lat: latLng.lat(),
              lng: latLng.lng(),
            });
          }
          if (!latLng) {
            return null;
          }
          return { restaurant, latLng };
        })
        .filter((item): item is { restaurant: Restaurant; latLng: any } => !!item);

      const selectedLatLng = selectedRestaurant ? getLatLngFromRestaurant(selectedRestaurant) : null;
      const mapCenter = selectedLatLng || userLatLng || restaurantMarkers[0]?.latLng;

      if (!mapCenter) {
        setError('지도에 표시할 좌표가 없습니다.');
        setLoading(false);
        return;
      }

      const comfortableZoom = selectedRestaurant ? 16 : restaurants.length > 3 ? 14 : 15;

      const map = new window.naver.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: comfortableZoom,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.naver.maps.MapTypeControlStyle.BUTTON,
          position: window.naver.maps.Position.TOP_RIGHT,
        },
      });

      const bounds = new window.naver.maps.LatLngBounds();
      restaurantMarkers.forEach(({ latLng }) => bounds.extend(latLng));
      if (userLatLng) {
        bounds.extend(userLatLng);
      }

      console.log('[지도] Bounds:', {
        ne: { lat: bounds.getNE().lat(), lng: bounds.getNE().lng() },
        sw: { lat: bounds.getSW().lat(), lng: bounds.getSW().lng() },
        span: {
          lat: Math.abs(bounds.getNE().lat() - bounds.getSW().lat()),
          lng: Math.abs(bounds.getNE().lng() - bounds.getSW().lng()),
        },
      });

      const adjustViewport = () => {
        if (!(restaurantMarkers.length > 0 || userLatLng)) {
          return;
        }

        if (selectedLatLng) {
          map.setCenter(selectedLatLng);
          map.setZoom(16);
          return;
        }

        if (restaurantMarkers.length === 1 && !userLatLng) {
          map.setCenter(restaurantMarkers[0].latLng);
          map.setZoom(16);
          return;
        }

        // padding을 추가하여 적절한 여백 확보
        map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
        // 너무 확대되지 않도록 최대 줌 레벨 제한
        const currentZoom = map.getZoom();
        if (currentZoom > comfortableZoom) {
          map.setZoom(comfortableZoom);
        }
      };

      // 지도 컨테이너 크기 확인 후 뷰포트 조정
      const stabiliseViewport = () => {
        if (!mapRef.current) return;
        
        const containerWidth = mapRef.current.offsetWidth;
        const containerHeight = mapRef.current.offsetHeight;
        
        if (containerWidth === 0 || containerHeight === 0) {
          console.log('[지도] 컨테이너 크기가 0입니다. 재시도합니다...');
          return;
        }

        console.log('[지도] 컨테이너 크기:', { width: containerWidth, height: containerHeight });
        
        window.naver.maps.Event.trigger(map, 'resize');
        
        setTimeout(() => {
          adjustViewport();
        }, 50);
      };

      // 초기 렌더링 후 여러 단계로 뷰포트 안정화
      requestAnimationFrame(() => {
        stabiliseViewport();
        setTimeout(() => {
          stabiliseViewport();
        }, 100);
        setTimeout(() => {
          stabiliseViewport();
        }, 300);
      });

      let idleHandled = false;
      window.naver.maps.Event.addListener(map, 'idle', () => {
        if (idleHandled) {
          return;
        }
        idleHandled = true;
        adjustViewport();
      });

      if (userLatLng) {
        new window.naver.maps.Marker({
          position: userLatLng,
          map,
          title: '내 위치',
          icon: {
            content: `
              <div style="
                background: #0ea5e9;
                color: white;
                padding: 6px 10px;
                border-radius: 999px;
                font-size: 12px;
                font-weight: 600;
                border: 2px solid rgba(255,255,255,0.6);
                box-shadow: 0 10px 20px rgba(14,165,233,0.35);
              ">
                내 위치
              </div>
            `,
          },
        });
      }

      restaurantMarkers.forEach(({ restaurant, latLng }) => {
        const isSelected =
          !!selectedRestaurant &&
          restaurant.name === selectedRestaurant.name &&
          restaurant.address === selectedRestaurant.address;

        const marker = new window.naver.maps.Marker({
          position: latLng,
          map,
          title: restaurant.name,
        });

        const infoWindow = new window.naver.maps.InfoWindow({
          content: `
            <div style="min-width:180px;padding:10px 12px;border-radius:16px;border:1px solid rgba(148,163,184,0.4);background:rgba(15,23,42,0.9);color:white;">
              <div style="font-size:14px;font-weight:600;">${restaurant.name}</div>
              <div style="margin-top:6px;font-size:12px;color:#cbd5f5;">${restaurant.roadAddress || restaurant.address || '주소 정보 없음'}</div>
              ${
                restaurant.phone
                  ? `<div style="margin-top:4px;font-size:12px;color:#fcd34d;">전화: ${restaurant.phone}</div>`
                  : ''
              }
            </div>
          `,
        });

        window.naver.maps.Event.addListener(marker, 'click', () => {
          infoWindow.open(map, marker);
          map.setCenter(latLng);
        });

        if (isSelected) {
          infoWindow.open(map, marker);
        }
      });

      setLoading(false);
    };

    const loadScript = () => {
      const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

      (window as any)[callbackName] = () => {
        initMap();
        delete (window as any)[callbackName];
      };

      window.navermap_authFailure = () => {
        setError('네이버 지도 인증에 실패했습니다. 클라이언트 ID를 확인해주세요.');
        setLoading(false);
      };

      if (window.naver?.maps) {
        initMap();
        return;
      }

      if (existingScript) {
        const scriptUrl = new URL(existingScript.src);
        scriptUrl.searchParams.set('callback', callbackName);
        existingScript.src = scriptUrl.toString();
        return;
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${naverClientId}&submodules=geocoder&callback=${callbackName}`;
      script.onerror = () => {
        setError('네이버 지도 API 로드에 실패했습니다.');
        setLoading(false);
      };
      document.head.appendChild(script);
    };

    loadScript();

    return () => {
      isMounted = false;
      if ((window as any)[callbackName]) {
        delete (window as any)[callbackName];
      }
      window.navermap_authFailure = undefined;
    };
  }, [
    naverClientId,
    hasAnyLocation,
    hasLocation,
    latitude,
    longitude,
    restaurantsKey,
    selectedRestaurantKey,
  ]);

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
