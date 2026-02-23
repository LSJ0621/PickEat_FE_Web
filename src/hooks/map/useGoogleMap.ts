/**
 * 구글 지도 초기화 및 관리 Custom Hook
 * 지도 초기화, 마커 표시, 뷰포트 조정 로직을 관리합니다.
 */

import type { UseGoogleMapOptions, UseGoogleMapReturn, MapMarkerInfo } from '@/types/googleMaps';
import { useCallback, useEffect, useState } from 'react';
import { MAP_CONFIG } from '@/utils/constants';
import { loadGoogleMaps, getGoogleMapId } from '@/utils/googleMapLoader';
import { getLatLngFromRestaurant, createUserLocationMarkerContent } from '@/utils/googleMap';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';

/**
 * 구글 지도 초기화 및 관리 Custom Hook
 */
export const useGoogleMap = (options: UseGoogleMapOptions): UseGoogleMapReturn => {
  const { mapRef, restaurants, selectedRestaurant, userLatLng, blockingError } = options;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  const getLatLng = useCallback((restaurant: import('@/types/search').Restaurant) => {
    return getLatLngFromRestaurant(restaurant);
  }, []);

  useEffect(() => {
    if (blockingError) {
      return;
    }

    let isMounted = true;
    const listenerRefs: google.maps.MapsEventListener[] = [];

    const initMap = async () => {
      if (!isMounted || !mapRef.current) {
        return;
      }

      try {
        const { maps, marker: markerLib } = await loadGoogleMaps();

        if (!isMounted || !mapRef.current) {
          return;
        }

        const userLatLngLiteral =
          userLatLng
            ? { lat: userLatLng.latitude, lng: userLatLng.longitude }
            : null;

        const restaurantMarkers: MapMarkerInfo[] = restaurants
          .map((restaurant) => {
            const latLng = getLatLng(restaurant);
            if (!latLng) {
              return null;
            }
            return { restaurant, latLng };
          })
          .filter((item): item is MapMarkerInfo => item !== null);

        const selectedLatLng = selectedRestaurant ? getLatLng(selectedRestaurant) : null;
        const mapCenter = selectedLatLng || userLatLngLiteral || restaurantMarkers[0]?.latLng;

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

        const map = new maps.Map(mapRef.current, {
          center: mapCenter,
          zoom: comfortableZoom,
          mapId: getGoogleMapId(),
          mapTypeControl: false,
          zoomControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          keyboardShortcuts: false,
        });

        const bounds = new google.maps.LatLngBounds();
        restaurantMarkers.forEach(({ latLng }) => bounds.extend(latLng));
        if (userLatLngLiteral) {
          bounds.extend(userLatLngLiteral);
        }

        const adjustViewport = (): void => {
          if (!(restaurantMarkers.length > 0 || userLatLngLiteral)) {
            return;
          }

          if (selectedLatLng) {
            map.setCenter(selectedLatLng);
            map.setZoom(16);
            return;
          }

          if (restaurantMarkers.length === 1 && !userLatLngLiteral) {
            map.setCenter(restaurantMarkers[0].latLng);
            map.setZoom(16);
            return;
          }

          map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
          const currentZoom = map.getZoom();
          if (currentZoom !== undefined && currentZoom > comfortableZoom) {
            map.setZoom(comfortableZoom);
          }
        };

        const stabiliseViewport = (): void => {
          if (!mapRef.current) return;

          const containerWidth = mapRef.current.offsetWidth;
          const containerHeight = mapRef.current.offsetHeight;

          if (containerWidth === 0 || containerHeight === 0) {
            return;
          }

          google.maps.event.trigger(map, 'resize');

          setTimeout(() => {
            adjustViewport();
          }, 50);
        };

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
        const idleListener = map.addListener('idle', () => {
          if (idleHandled) {
            return;
          }
          idleHandled = true;
          adjustViewport();
        });
        listenerRefs.push(idleListener);

        // 사용자 위치 마커
        if (userLatLngLiteral) {
          new markerLib.AdvancedMarkerElement({
            position: userLatLngLiteral,
            map,
            title: '내 위치',
            content: createUserLocationMarkerContent(),
          });
        }

        // 식당 마커
        restaurantMarkers.forEach(({ restaurant, latLng }) => {
          const isSelected =
            !!selectedRestaurant &&
            restaurant.name === selectedRestaurant.name &&
            restaurant.address === selectedRestaurant.address;

          const advancedMarker = new markerLib.AdvancedMarkerElement({
            position: latLng,
            map,
            title: restaurant.name,
          });

          const infoWindow = new google.maps.InfoWindow({
            content: DOMPurify.sanitize(`
              <div style="min-width:180px;padding:10px 12px;border-radius:16px;border:1px solid rgba(229,229,229,0.8);background:rgba(255,255,255,0.97);color:#1A1A1A;">
                <div style="font-size:14px;font-weight:600;">${restaurant.name}</div>
                <div style="margin-top:6px;font-size:12px;color:#4A4A4A;">${restaurant.roadAddress || restaurant.address || '주소 정보 없음'}</div>
                ${
                  restaurant.phone
                    ? `<div style="margin-top:4px;font-size:12px;color:#FF6B35;">전화: ${restaurant.phone}</div>`
                    : ''
                }
              </div>
            `),
          });

          const clickListener = advancedMarker.addListener('click', () => {
            infoWindow.open({ map, anchor: advancedMarker });
            map.setCenter(latLng);
          });
          listenerRefs.push(clickListener);

          if (isSelected) {
            infoWindow.open({ map, anchor: advancedMarker });
          }
        });

        setLoading(false);
      } catch {
        if (isMounted) {
          setRuntimeError(t('map.loadMapError'));
          setLoading(false);
        }
      }
    };

    Promise.resolve().then(() => {
      if (!isMounted) {
        return;
      }
      setRuntimeError(null);
      setLoading(true);
      initMap();
    });

    return () => {
      isMounted = false;
      // Cleanup event listeners
      listenerRefs.forEach(listener => listener.remove());
    };
  }, [blockingError, restaurants, selectedRestaurant, userLatLng, getLatLng, mapRef, t]);

  return {
    loading,
    runtimeError,
  };
};
