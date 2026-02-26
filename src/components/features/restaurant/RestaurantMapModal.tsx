/**
 * 식당 리스트 지도 모달 컴포넌트
 * Google 지도를 사용하여 여러 식당 위치를 표시합니다.
 */

import { ModalCloseButton } from '@/components/common/ModalCloseButton';
import type { Restaurant } from '@/types/search';
import { MAP_CONFIG, Z_INDEX } from '@/utils/constants';
import { loadGoogleMaps, getGoogleMapId } from '@/utils/googleMapLoader';
import { getLatLngFromRestaurant } from '@/utils/googleMap';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';

interface RestaurantMapModalProps {
  restaurants: Restaurant[];
  menuName: string;
  onClose: () => void;
}

export const RestaurantMapModal = ({ restaurants, menuName, onClose }: RestaurantMapModalProps) => {
  const { t } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
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
      if (restaurants.length === 0) {
        setError(t('map.noStoresToDisplay'));
        return;
      }

      try {
        const { maps, marker: markerLib } = await loadGoogleMaps();

        // 새로운 실행이 시작되었는지 확인
        if (currentExecutionIdRef.current !== executionId || !mapRef.current) {
          return;
        }

        const markerTargets = restaurants
          .map((restaurant) => {
            const latLng = getLatLngFromRestaurant(restaurant);
            return latLng ? { restaurant, latLng } : null;
          })
          .filter((item): item is { restaurant: Restaurant; latLng: google.maps.LatLngLiteral } => item !== null);

        if (markerTargets.length === 0) {
          setError(t('map.noCoordinates'));
          return;
        }

        mapRef.current.innerHTML = '';
        const comfortableZoom = markerTargets.length > 3
          ? MAP_CONFIG.ZOOM.MULTIPLE_MARKERS_SMALL
          : MAP_CONFIG.ZOOM.MULTIPLE_MARKERS_LARGE;

        const map = new maps.Map(mapRef.current, {
          center: markerTargets[0].latLng,
          zoom: comfortableZoom,
          mapId: getGoogleMapId(),
          mapTypeControl: false,
          zoomControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          keyboardShortcuts: false,
        });

        const bounds = new google.maps.LatLngBounds();
        markerTargets.forEach(({ restaurant, latLng }) => {
          bounds.extend(latLng);

          const advancedMarker = new markerLib.AdvancedMarkerElement({
            map,
            position: latLng,
            title: restaurant.name,
          });

          const infoWindow = new google.maps.InfoWindow({
            content: DOMPurify.sanitize(`<div style="padding:8px 12px;font-size:13px;color:#1A1A1A;">
              <div style="font-weight:600;">${restaurant.name}</div>
              <div>${restaurant.roadAddress || restaurant.address || t('restaurant.noAddress')}</div>
            </div>`),
          });

          advancedMarker.addListener('click', () => {
            infoWindow.open({ map, anchor: advancedMarker });
          });
        });

        const adjustViewport = (): void => {
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
            if (currentZoom !== undefined && currentZoom > comfortableZoom) {
              map.setZoom(comfortableZoom);
            }
          }
        };

        // 모달이 완전히 렌더링된 후에 뷰포트 조정
        const stabiliseViewport = (): void => {
          if (!mapRef.current) return;

          // 지도 컨테이너의 실제 크기 확인
          const containerWidth = mapRef.current.offsetWidth;
          const containerHeight = mapRef.current.offsetHeight;

          if (containerWidth === 0 || containerHeight === 0) {
            return;
          }

          // resize 이벤트 트리거로 지도가 실제 크기를 인식하도록 함
          google.maps.event.trigger(map, 'resize');

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
          setError(t('map.loadMapError'));
        }
      }
    };

    initMap();

    return () => {
      // cleanup에서는 currentExecutionIdRef를 변경하지 않음
    };
  }, [markerKey, restaurants, t]);

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
      className={`fixed inset-0 flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur ${
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
      }`}
      style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}
    >
      <div
        className={`relative flex w-full max-w-6xl flex-col gap-6 rounded-[36px] border border-border-default bg-bg-surface p-6 text-text-primary shadow-[0_40px_120px_rgba(0,0,0,0.12)] lg:flex-row lg:p-10 ${
          isAnimating ? 'modal-content-enter' : 'modal-content-exit'
        }`}
      >
        <ModalCloseButton onClose={onClose} size="lg" />

        <div className="w-full lg:w-80">
          <p className="text-xs uppercase tracking-[0.45em] text-brand-primary/70">{t('restaurant.liveMap')}</p>
          <h3 className="mt-3 text-3xl font-semibold leading-tight text-text-primary">{menuName} {t('restaurant.recommendationStores')}</h3>
          <p className="mt-2 text-sm text-text-tertiary">{t('restaurant.totalStoresVisible', { count: restaurants.length })}</p>

          <div className="mt-6 space-y-3 pr-4">
            {restaurants.slice(0, 6).map((restaurant, idx) => (
              <div
                key={`${restaurant.name}-${idx}`}
                className="flex items-center gap-3 rounded-2xl border border-border-default bg-bg-secondary px-4 py-3"
              >
                <span className="text-xs font-semibold text-text-tertiary">{idx + 1}</span>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-text-primary">{restaurant.name}</p>
                  <p className="truncate text-xs text-text-tertiary">{restaurant.roadAddress || restaurant.address}</p>
                </div>
              </div>
            ))}
            {restaurants.length > 6 && (
              <div className="rounded-2xl border border-border-light bg-bg-secondary px-4 py-2 text-sm text-text-secondary">
                {t('restaurant.andMoreStores', { count: restaurants.length - 6 })}
              </div>
            )}
          </div>
        </div>

        <div className="relative flex-1 rounded-[28px] border border-border-default bg-gradient-to-br from-bg-secondary to-bg-primary p-6 flex flex-col gap-4 lg:min-h-[460px]">
          <div
            ref={mapRef}
            className="w-full flex-1 min-h-[360px] rounded-[24px] border border-border-default bg-bg-secondary"
          />
          {error && <p className="text-sm text-rose-200">{error}</p>}
        </div>
      </div>
    </div>,
    document.body
  );
};
