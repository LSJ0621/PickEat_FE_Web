/**
 * 네이버 지도 초기화 및 관리 Custom Hook
 * 지도 초기화, 마커 표시, 뷰포트 조정 로직을 관리합니다.
 */

import type { NaverLatLng } from '@/types/naverMaps';
import type { Restaurant } from '@/types/search';
import { useCallback, useEffect, useState } from 'react';
import { MAP_CONFIG } from '@/utils/constants';
import { useTranslation } from 'react-i18next';

interface UseNaverMapOptions {
  mapRef: React.RefObject<HTMLDivElement | null>;
  naverClientId: string | undefined;
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  userLatLng: { latitude: number; longitude: number } | null;
  blockingError: string | null;
}

interface UseNaverMapReturn {
  loading: boolean;
  runtimeError: string | null;
}

/**
 * 네이버 지도 초기화 및 관리 Custom Hook
 */
export const useNaverMap = (options: UseNaverMapOptions): UseNaverMapReturn => {
  const { mapRef, naverClientId, restaurants, selectedRestaurant, userLatLng, blockingError } = options;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  // 식당 좌표 변환
  const getLatLngFromRestaurant = useCallback((restaurant: Restaurant): NaverLatLng | null => {
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
      } catch {
        return null;
      }
    }

    return null;
  }, []);

  useEffect(() => {
    if (blockingError || !naverClientId) {
      return;
    }

    let isMounted = true;
    const scriptId = 'naver-map-sdk';
    const callbackName = `initNaverMap_${Date.now()}`;
    const clientId = naverClientId;

    const initMap = () => {
      if (!isMounted || !mapRef.current) {
        return;
      }

      const naverMaps = window.naver?.maps;
      if (!naverMaps) {
        setRuntimeError(t('map.mapInitFailed'));
        setLoading(false);
        return;
      }

      const userLatLngObj =
        userLatLng && naverMaps
          ? new naverMaps.LatLng(userLatLng.latitude, userLatLng.longitude)
          : null;

      type MarkerInfo = { restaurant: Restaurant; latLng: NaverLatLng };

      const restaurantMarkers: MarkerInfo[] = restaurants
        .map((restaurant) => {
          const latLng = getLatLngFromRestaurant(restaurant);
          if (!latLng) {
            return null;
          }
          return { restaurant, latLng };
        })
        .filter((item): item is MarkerInfo => item !== null);

      const selectedLatLng = selectedRestaurant ? getLatLngFromRestaurant(selectedRestaurant) : null;
      const mapCenter = selectedLatLng || userLatLngObj || restaurantMarkers[0]?.latLng;

      if (!mapCenter) {
        setRuntimeError(t('map.noCoordinates'));
        setLoading(false);
        return;
      }

      const comfortableZoom = selectedRestaurant 
        ? MAP_CONFIG.ZOOM.SINGLE_MARKER 
        : restaurants.length > 3 
          ? MAP_CONFIG.ZOOM.MULTIPLE_MARKERS_SMALL 
          : MAP_CONFIG.ZOOM.MULTIPLE_MARKERS_LARGE;

      const map = new naverMaps.Map(mapRef.current, {
        center: mapCenter,
        zoom: comfortableZoom,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: naverMaps.MapTypeControlStyle?.BUTTON ?? 0,
          position: naverMaps.Position?.TOP_RIGHT ?? 0,
        },
      });

      const bounds = new naverMaps.LatLngBounds();
      restaurantMarkers.forEach(({ latLng }) => bounds.extend(latLng));
      if (userLatLngObj) {
        bounds.extend(userLatLngObj);
      }

      const adjustViewport = () => {
        if (!(restaurantMarkers.length > 0 || userLatLngObj)) {
          return;
        }

        if (selectedLatLng) {
          map.setCenter(selectedLatLng);
          map.setZoom(16);
          return;
        }

        if (restaurantMarkers.length === 1 && !userLatLngObj) {
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
          return;
        }

        naverMaps.Event.trigger(map, 'resize');

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
      naverMaps.Event.addListener(map, 'idle', () => {
        if (idleHandled) {
          return;
        }
        idleHandled = true;
        adjustViewport();
      });

      // 사용자 위치 마커
      if (userLatLngObj) {
        new naverMaps.Marker({
          position: userLatLngObj,
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

      // 식당 마커
      restaurantMarkers.forEach(({ restaurant, latLng }) => {
        const isSelected =
          !!selectedRestaurant &&
          restaurant.name === selectedRestaurant.name &&
          restaurant.address === selectedRestaurant.address;

        const marker = new naverMaps.Marker({
          position: latLng,
          map,
          title: restaurant.name,
        });

        const infoWindow = new naverMaps.InfoWindow({
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

        naverMaps.Event.addListener(marker, 'click', () => {
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

      const windowWithCallback = window as unknown as Window & Record<string, () => void>;
      windowWithCallback[callbackName] = () => {
        initMap();
        delete windowWithCallback[callbackName];
      };

      window.navermap_authFailure = () => {
        setRuntimeError(t('map.loadMapError'));
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
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder&callback=${callbackName}`;
      script.onerror = () => {
        setRuntimeError(t('map.scriptLoadFailed'));
        setLoading(false);
      };
      document.head.appendChild(script);
    };

    Promise.resolve().then(() => {
      if (!isMounted) {
        return;
      }
      setRuntimeError(null);
      setLoading(true);
      loadScript();
    });

    return () => {
      isMounted = false;
      const windowWithCallback = window as unknown as Window & Record<string, () => void>;
      if (windowWithCallback[callbackName]) {
        delete windowWithCallback[callbackName];
      }
      window.navermap_authFailure = undefined;
    };
  }, [blockingError, naverClientId, restaurants, selectedRestaurant, userLatLng, getLatLngFromRestaurant, mapRef, t]);

  return {
    loading,
    runtimeError,
  };
};

