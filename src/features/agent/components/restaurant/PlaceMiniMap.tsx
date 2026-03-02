/**
 * 장소 미니 지도 컴포넌트
 * Google 지도를 사용하여 장소 위치를 표시합니다.
 */

import type { PlaceDetail } from '@features/agent/types';
import { useEffect, useRef } from 'react';
import { MAP_CONFIG } from '@shared/utils/constants';
import { loadGoogleMaps, getGoogleMapId } from '@shared/utils/googleMapLoader';
import { useTranslation } from 'react-i18next';

interface PlaceMiniMapProps {
  placeDetail: PlaceDetail | null;
  placeName?: string | null;
}

export const PlaceMiniMap = ({ placeDetail, placeName }: PlaceMiniMapProps) => {
  const { t } = useTranslation();
  const miniMapRef = useRef<HTMLDivElement | null>(null);
  const prevPlaceDetailRef = useRef<PlaceDetail | null | undefined>(null);
  const currentExecutionIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!placeDetail?.location || !miniMapRef.current) return;

    if (prevPlaceDetailRef.current === placeDetail) return;
    prevPlaceDetailRef.current = placeDetail;

    const executionId = Date.now();
    currentExecutionIdRef.current = executionId;

    const initMiniMap = async () => {
      try {
        const { maps, marker: markerLib } = await loadGoogleMaps();

        if (currentExecutionIdRef.current !== executionId) return;

        const mapContainer = miniMapRef.current;
        if (!mapContainer || !placeDetail.location) return;

        const { latitude, longitude } = placeDetail.location;
        const center = { lat: latitude, lng: longitude };

        const map = new maps.Map(mapContainer, {
          center,
          zoom: MAP_CONFIG.ZOOM.SINGLE_MARKER,
          mapId: getGoogleMapId(),
          mapTypeControl: false,
          zoomControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          keyboardShortcuts: false,
        });

        new markerLib.AdvancedMarkerElement({
          map,
          position: center,
          title: placeDetail.name ?? placeName ?? t('place.storeLocation'),
        });

        setTimeout(() => {
          if (map && mapContainer.isConnected) {
            google.maps.event.trigger(map, 'resize');
          }
        }, 200);
      } catch {
        // 에러 발생 시 무시
      }
    };

    void initMiniMap();

    return () => {
      // cleanup에서는 currentExecutionIdRef를 변경하지 않음
    };
  }, [placeDetail, placeName, t]);

  if (!placeDetail?.location) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-text-primary">{t('place.locationInfo')}</h4>
      <div className="rounded-2xl border border-border-default bg-bg-surface p-3 shadow-sm">
        <div
          ref={(el) => {
            miniMapRef.current = el;
          }}
          className="h-44 w-full overflow-hidden rounded-xl bg-bg-secondary"
        />
        <p className="mt-2 text-[11px] text-text-placeholder">{t('place.mapDragTip')}</p>
      </div>
    </div>
  );
};
