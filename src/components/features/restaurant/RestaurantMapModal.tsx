/**
 * 식당 리스트 지도 모달 컴포넌트
 * 네이버 지도를 사용하여 여러 식당 위치를 표시합니다.
 */

import { ModalCloseButton } from '@/components/common/ModalCloseButton';
import type { NaverLatLng } from '@/types/naverMaps';
import type { Restaurant } from '@/types/search';
import { MAP_CONFIG } from '@/utils/constants';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface RestaurantMapModalProps {
  restaurants: Restaurant[];
  menuName: string;
  onClose: () => void;
}

const NAVER_MAP_SCRIPT_ID = 'naver-map-sdk';
let naverMapLoaderPromise: Promise<void> | null = null;

const ensureNaverMaps = (clientId: string) => {
  if (window.naver?.maps) {
    return Promise.resolve();
  }

  if (naverMapLoaderPromise) {
    return naverMapLoaderPromise;
  }

  naverMapLoaderPromise = new Promise<void>((resolve, reject) => {
    const callbackName = `naverMapInlineInit_${Date.now()}`;
    
    const windowWithCallback = window as unknown as Window & Record<string, () => void>;
    windowWithCallback[callbackName] = () => {
      delete windowWithCallback[callbackName];
      resolve();
    };

    const existingScript = document.getElementById(NAVER_MAP_SCRIPT_ID) as HTMLScriptElement | null;
    
    if (existingScript) {
      // 이미 로드된 스크립트는 polling으로 확인
      let checkCount = 0;
      const maxChecks = 50;
      
      const checkLoaded = () => {
        if (window.naver?.maps) {
          delete windowWithCallback[callbackName];
          resolve();
          return;
        }
        checkCount++;
        if (checkCount < maxChecks) {
          setTimeout(checkLoaded, 100);
        } else {
          delete windowWithCallback[callbackName];
          naverMapLoaderPromise = null;
          reject(new Error('네이버 지도 스크립트 로드 타임아웃'));
        }
      };
      
      checkLoaded();
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

export const RestaurantMapModal = ({ restaurants, menuName, onClose }: RestaurantMapModalProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;
  const prevMarkerKeyRef = useRef<string>('');
  const currentExecutionIdRef = useRef<number | null>(null);

  const markerKey = useMemo(() => restaurants.map((r) => `${r.name}-${r.address}`).join('|'), [
    restaurants,
  ]);

  useEffect(() => {
    // StrictMode 대응: markerKey가 변경되지 않았으면 스킵
    if (prevMarkerKeyRef.current === markerKey) {
      return;
    }
    prevMarkerKeyRef.current = markerKey;
    
    // 이 실행의 고유 ID
    const executionId = Date.now();
    currentExecutionIdRef.current = executionId;

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
        
        // 새로운 실행이 시작되었는지 확인
        if (currentExecutionIdRef.current !== executionId || !mapRef.current) {
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
            return latLng ? { restaurant, latLng } : null;
          })
          .filter((item): item is { restaurant: Restaurant; latLng: NaverLatLng } => item !== null);

        if (markerTargets.length === 0) {
          setError('표시할 좌표가 없습니다.');
          return;
        }

        mapRef.current.innerHTML = '';
        const comfortableZoom = markerTargets.length > 3 
          ? MAP_CONFIG.ZOOM.MULTIPLE_MARKERS_SMALL 
          : MAP_CONFIG.ZOOM.MULTIPLE_MARKERS_LARGE;
        
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

        const adjustViewport = () => {
          if (markerTargets.length === 1) {
            map.setCenter(markerTargets[0].latLng);
            map.setZoom(MAP_CONFIG.ZOOM.SINGLE_MARKER);
          } else if (markerTargets.length > 1) {
            // padding을 추가하여 적절한 여백 확보
            map.fitBounds(bounds, { 
              top: MAP_CONFIG.PADDING.FIT_BOUNDS, 
              right: MAP_CONFIG.PADDING.FIT_BOUNDS, 
              bottom: MAP_CONFIG.PADDING.FIT_BOUNDS, 
              left: MAP_CONFIG.PADDING.FIT_BOUNDS 
            });
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
            return;
          }
          
          // resize 이벤트 트리거로 지도가 실제 크기를 인식하도록 함
          naverMaps.Event.trigger(map, 'resize');
          
          // 약간의 지연 후 뷰포트 조정
          setTimeout(() => {
            adjustViewport();
          }, MAP_CONFIG.TIMEOUT.VIEWPORT_STABILIZE_SHORT);
        };

        // 초기 렌더링 후 여러 단계로 뷰포트 안정화
        requestAnimationFrame(() => {
          stabiliseViewport();
          setTimeout(() => {
            stabiliseViewport();
          }, MAP_CONFIG.TIMEOUT.VIEWPORT_STABILIZE_MEDIUM);
          setTimeout(() => {
            stabiliseViewport();
          }, MAP_CONFIG.TIMEOUT.VIEWPORT_STABILIZE_LONG);
        });

        setError(null);
      } catch {
        if (currentExecutionIdRef.current === executionId) {
          setError('지도를 불러오는 중 오류가 발생했습니다.');
        }
      }
    };

    initMap();

    return () => {
      // cleanup에서는 currentExecutionIdRef를 변경하지 않음
    };
  }, [clientId, markerKey, restaurants]);

  // 모달이 처음 마운트될 때는 애니메이션을 즉시 활성화하여 깜빡임 방지
  const [isAnimating, setIsAnimating] = useState(true);
  const [shouldRender, setShouldRender] = useState(restaurants.length > 0);
  const isFirstMountRef = useRef(true);

  useEffect(() => {
    if (restaurants.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRender(true);
      // 처음 마운트 시에는 이미 isAnimating이 true로 설정되어 있으므로 스킵
      // restaurants가 변경된 경우에만 애니메이션 재시작
      if (!isFirstMountRef.current) {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      }
      isFirstMountRef.current = false;
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [restaurants.length]);

  if (!shouldRender) {
    return null;
  }

  return createPortal(
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur ${
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
      }`}
    >
      <div 
        className={`relative flex w-full max-w-6xl flex-col gap-6 rounded-[36px] border border-white/10 bg-slate-950/95 p-6 text-white shadow-[0_40px_120px_rgba(2,6,23,0.8)] lg:flex-row lg:p-10 ${
          isAnimating ? 'modal-content-enter' : 'modal-content-exit'
        }`}
      >
        <ModalCloseButton onClose={onClose} size="lg" />

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

