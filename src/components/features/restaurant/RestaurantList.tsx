/**
 * 식당 리스트 컴포넌트
 */

import { Button } from '@/components/common/Button';
import { useUserLocation } from '@/hooks/useUserLocation';
import type { Restaurant } from '@/types/search';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { NaverLatLng } from '@/types/naverMaps';

interface RestaurantListProps {
  menuName: string;
  restaurants?: Restaurant[];
  loading?: boolean;
  onClose?: () => void;
}

export const RestaurantList = ({
  menuName,
  restaurants = [],
  loading = false,
  onClose,
}: RestaurantListProps) => {
  const { address } = useUserLocation();
  const hasRestaurants = restaurants.length > 0;
  const [showMapModal, setShowMapModal] = useState(false);
  const DISPLAY_LIMIT = 5;
  const displayedRestaurants = restaurants.slice(0, DISPLAY_LIMIT);
  const hasMore = restaurants.length > DISPLAY_LIMIT;

  const handleOpenMapModal = () => {
    if (!hasRestaurants) return;
    setShowMapModal(true);
  };

  const handleCloseMapModal = () => {
    setShowMapModal(false);
  };

  const handleOpenNaverMap = () => {
    // 메뉴명을 검색어로 사용하여 네이버 지도 웹사이트로 이동
    const encodedMenuName = encodeURIComponent(menuName);
    const naverMapUrl = `https://map.naver.com/v5/search/${encodedMenuName}`;
    
    window.location.href = naverMapUrl;
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.6)] backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-orange-200/80">Nearby Restaurants</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">주변 식당 검색 결과</h2>
        </div>
        {address && (
          <span className="hidden rounded-full border border-white/15 px-3 py-1 text-xs text-slate-300 sm:inline-flex">
            {address}
          </span>
        )}
      </div>

      {hasRestaurants && (
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={handleOpenMapModal}>
            네이버 지도에서 보기
          </Button>
          <Button variant="ghost" size="sm" onClick={handleOpenNaverMap}>
            네이버 맵 사이트에서 보기
          </Button>
        </div>
      )}

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500"></div>
        </div>
      ) : hasRestaurants ? (
        <>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {menuName} 검색 결과 ({restaurants.length}개)
              </h3>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  닫기
                </button>
              )}
            </div>
            {displayedRestaurants.map((restaurant, index) => (
              <div
                key={index}
                className="group rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5 shadow-xl shadow-black/30 transition hover:-translate-y-0.5 hover:border-white/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-xl font-bold text-white">{restaurant.name}</h4>
                    <p className="mt-2 text-base text-slate-300">
                      📍 {restaurant.roadAddress || restaurant.address}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-200">
                  {restaurant.distance && (
                    <span className="rounded-full border border-white/15 px-3 py-1">
                      거리 {restaurant.distance.toFixed(1)}km
                    </span>
                  )}
                  {restaurant.phone && (
                    <span className="rounded-full border border-white/15 px-3 py-1">📞 {restaurant.phone}</span>
                  )}
                </div>
              </div>
            ))}
            {hasMore && (
              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenNaverMap}
                  className="text-orange-300 hover:text-orange-200"
                >
                  네이버 지도에서 더 많은 결과 확인하기
                </Button>
              </div>
            )}
          </div>

          {showMapModal && hasRestaurants && (
            <RestaurantMapModal
              restaurants={restaurants}
              menuName={menuName}
              onClose={handleCloseMapModal}
            />
          )}
        </>
      ) : (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {menuName} 검색 결과
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                닫기
              </button>
            )}
          </div>
          <div className="rounded-2xl border border-slate-500/30 bg-slate-800/50 p-6 text-center">
            <p className="text-slate-300">주변에 해당 메뉴를 판매하는 식당이 없습니다.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const NAVER_MAP_SCRIPT_ID = 'naver-map-sdk';
let naverMapLoaderPromise: Promise<void> | null = null;

const ensureNaverMaps = (clientId: string) => {
  if (window.naver?.maps?.TransCoord) {
    return Promise.resolve();
  }

  if (naverMapLoaderPromise) {
    return naverMapLoaderPromise;
  }

  naverMapLoaderPromise = new Promise<void>((resolve, reject) => {
    const callbackName = `naverMapInlineInit_${Date.now()}`;
    const windowWithCallback = window as Window & Record<string, () => void>;
    windowWithCallback[callbackName] = () => {
      delete windowWithCallback[callbackName];
      resolve();
    };

    const existingScript = document.getElementById(NAVER_MAP_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      const scriptUrl = new URL(existingScript.src);
      scriptUrl.searchParams.set('submodules', 'geocoder');
      scriptUrl.searchParams.set('callback', callbackName);
      existingScript.src = scriptUrl.toString();
    } else {
      const script = document.createElement('script');
      script.id = NAVER_MAP_SCRIPT_ID;
      script.async = true;
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder&callback=${callbackName}`;
      script.onerror = () => {
        delete windowWithCallback[callbackName];
        naverMapLoaderPromise = null;
        reject(new Error('네이버 지도 스크립트 로드 실패'));
      };
      document.head.appendChild(script);
    }
  });

  return naverMapLoaderPromise;
};

const getLatLngFromRestaurant = (restaurant: Restaurant) => {
  if (!window.naver?.maps) {
    return null;
  }

  if (typeof restaurant.latitude === 'number' && typeof restaurant.longitude === 'number') {
    return new window.naver.maps.LatLng(restaurant.latitude, restaurant.longitude);
  }

  if (restaurant.mapx !== undefined && restaurant.mapy !== undefined) {
    const mapx = Number(restaurant.mapx);
    const mapy = Number(restaurant.mapy);
    const lat = mapy / 10000000;
    const lng = mapx / 10000000;
    return new window.naver.maps.LatLng(lat, lng);
  }

  return null;
};

interface RestaurantMapModalProps {
  restaurants: Restaurant[];
  menuName: string;
  onClose: () => void;
}

const RestaurantMapModal = ({ restaurants, menuName, onClose }: RestaurantMapModalProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;

  const markerKey = useMemo(() => restaurants.map((r) => `${r.name}-${r.address}`).join('|'), [
    restaurants,
  ]);

  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      if (!clientId) {
        setError('네이버 지도 키가 설정되지 않았습니다.');
        return;
      }

      if (restaurants.length === 0) {
        setError('표시할 매장이 없습니다.');
        return;
      }

      try {
        await ensureNaverMaps(clientId);
        if (cancelled || !mapRef.current) {
          return;
        }

        const naverMaps = window.naver?.maps;
        if (!naverMaps) {
          setError('네이버 지도 객체를 초기화하지 못했습니다.');
          return;
        }

        const markerTargets = restaurants
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
            return latLng ? { restaurant, latLng } : null;
          })
          .filter((item): item is { restaurant: Restaurant; latLng: NaverLatLng } => item !== null);

        if (markerTargets.length === 0) {
          setError('표시할 좌표가 없습니다.');
          return;
        }

        mapRef.current.innerHTML = '';
        const comfortableZoom = markerTargets.length > 3 ? 14 : 15;
        const map = new naverMaps.Map(mapRef.current, {
          center: markerTargets[0].latLng,
          zoom: comfortableZoom,
        });

        const bounds = new naverMaps.LatLngBounds();
        markerTargets.forEach(({ restaurant, latLng }) => {
          bounds.extend(latLng);
          const marker = new naverMaps.Marker({
            map,
            position: latLng,
            title: restaurant.name,
          });

          const infoWindow = new naverMaps.InfoWindow({
            content: `<div style="padding:8px 12px;font-size:13px;color:#111;">
              <div style="font-weight:600;">${restaurant.name}</div>
              <div>${restaurant.roadAddress || restaurant.address || '주소 정보 없음'}</div>
            </div>`,
          });

          naverMaps.Event.addListener(marker, 'click', () => {
            infoWindow.open(map, marker);
          });
        });

        console.log('[지도] Bounds:', {
          ne: { lat: bounds.getNE().lat(), lng: bounds.getNE().lng() },
          sw: { lat: bounds.getSW().lat(), lng: bounds.getSW().lng() },
          span: {
            lat: Math.abs(bounds.getNE().lat() - bounds.getSW().lat()),
            lng: Math.abs(bounds.getNE().lng() - bounds.getSW().lng()),
          },
        });

        const adjustViewport = () => {
          if (markerTargets.length === 1) {
            map.setCenter(markerTargets[0].latLng);
            map.setZoom(16);
          } else if (markerTargets.length > 1) {
            // padding을 추가하여 적절한 여백 확보
            map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
            // 너무 확대되지 않도록 최대 줌 레벨 제한
            const currentZoom = map.getZoom();
            if (currentZoom > comfortableZoom) {
              map.setZoom(comfortableZoom);
            }
          }
        };

        // 모달이 완전히 렌더링된 후에 뷰포트 조정
        const stabiliseViewport = () => {
          if (!mapRef.current) return;
          
          // 지도 컨테이너의 실제 크기 확인
          const containerWidth = mapRef.current.offsetWidth;
          const containerHeight = mapRef.current.offsetHeight;
          
          if (containerWidth === 0 || containerHeight === 0) {
            console.log('[지도] 컨테이너 크기가 0입니다. 재시도합니다...');
            return;
          }

          console.log('[지도] 컨테이너 크기:', { width: containerWidth, height: containerHeight });
          
          // resize 이벤트 트리거로 지도가 실제 크기를 인식하도록 함
          naverMaps.Event.trigger(map, 'resize');
          
          // 약간의 지연 후 뷰포트 조정
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

        setError(null);
      } catch (err) {
        console.error('지도 미리보기 로드 실패:', err);
        if (!cancelled) {
          setError('지도를 불러오는 중 오류가 발생했습니다.');
        }
      }
    };

    initMap();

    return () => {
      cancelled = true;
    };
  }, [clientId, markerKey, restaurants]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur">
      <div className="relative flex w-full max-w-6xl flex-col gap-6 rounded-[36px] border border-white/10 bg-slate-950/95 p-6 text-white shadow-[0_40px_120px_rgba(2,6,23,0.8)] lg:flex-row lg:p-10">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-400 transition hover:text-white"
        >
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-full lg:w-80">
          <p className="text-xs uppercase tracking-[0.45em] text-orange-200/80">Live Map</p>
          <h3 className="mt-3 text-3xl font-semibold leading-tight">{menuName} 추천 매장</h3>
          <p className="mt-2 text-sm text-slate-400">총 {restaurants.length}개 매장이 한눈에 보입니다.</p>

          <div className="mt-6 space-y-3 pr-4">
            {restaurants.slice(0, 6).map((restaurant, idx) => (
              <div
                key={`${restaurant.name}-${idx}`}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <span className="text-xs font-semibold text-slate-400">{idx + 1}</span>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{restaurant.name}</p>
                  <p className="truncate text-xs text-slate-400">{restaurant.roadAddress || restaurant.address}</p>
                </div>
              </div>
            ))}
            {restaurants.length > 6 && (
              <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-2 text-sm text-slate-300">
                외 {restaurants.length - 6}개 매장
              </div>
            )}
          </div>
        </div>

        <div className="relative flex-1 rounded-[28px] border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 flex flex-col gap-4 lg:min-h-[460px]">
          <div
            ref={mapRef}
            className="w-full flex-1 min-h-[360px] rounded-[24px] border border-white/10 bg-slate-950/80"
          />
          {error && <p className="text-sm text-rose-200">{error}</p>}
        </div>
      </div>
    </div>,
    document.body
  );
};
