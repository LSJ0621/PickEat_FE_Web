/**
 * 장소 미니 지도 컴포넌트
 * 네이버 지도를 사용하여 장소 위치를 표시합니다.
 */

import type { PlaceDetail } from '@/types/menu';
import { useEffect, useRef } from 'react';
import { MAP_CONFIG } from '@/utils/constants';

interface PlaceMiniMapProps {
  placeDetail: PlaceDetail | null;
  placeName?: string | null;
  naverClientId?: string;
}

export const PlaceMiniMap = ({ placeDetail, placeName, naverClientId }: PlaceMiniMapProps) => {
  const miniMapRef = useRef<HTMLDivElement | null>(null);
  const prevPlaceDetailRef = useRef<PlaceDetail | null | undefined>(null);
  const prevNaverClientIdRef = useRef<string | undefined>(undefined);
  const currentExecutionIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!placeDetail?.location || !naverClientId || !miniMapRef.current) {
      return;
    }

    // StrictMode 대응: placeDetail과 naverClientId가 변경되지 않았으면 스킵
    if (
      prevPlaceDetailRef.current === placeDetail &&
      prevNaverClientIdRef.current === naverClientId
    ) {
      return;
    }
    prevPlaceDetailRef.current = placeDetail;
    prevNaverClientIdRef.current = naverClientId;

    // 이 실행의 고유 ID
    const executionId = Date.now();
    currentExecutionIdRef.current = executionId;

    const loadScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (window.naver?.maps) {
          resolve();
          return;
        }

        const existingScript = document.getElementById('naver-map-sdk') as HTMLScriptElement | null;
        
        if (existingScript) {
          // 이미 로드된 스크립트는 polling으로 확인
          let checkCount = 0;
          const maxChecks = 50;
          
          const checkLoaded = () => {
            if (window.naver?.maps) {
              resolve();
              return;
            }
            checkCount++;
            if (checkCount < maxChecks) {
              setTimeout(checkLoaded, 100);
            } else {
              reject(new Error('네이버 지도 스크립트 로드 타임아웃'));
            }
          };
          
          checkLoaded();
          return;
        }

        const script = document.createElement('script');
        script.id = 'naver-map-sdk';
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${naverClientId}`;
        script.async = true;
        script.addEventListener('load', () => {
          resolve();
        });
        script.addEventListener('error', () => {
          reject(new Error('네이버 지도 스크립트 로드 실패'));
        });
        document.head.appendChild(script);
      });
    };

    const initMiniMap = async () => {
      try {
        await loadScript();
        
        // 새로운 실행이 시작되었는지 확인 (현재 executionId가 변경되었는지)
        if (currentExecutionIdRef.current !== executionId) {
          return;
        }
        
        if (!miniMapRef.current || !window.naver?.maps || !placeDetail.location) {
          return;
        }

        const { latitude, longitude } = placeDetail.location;
        
        const naverMaps = window.naver.maps;
        const center = new naverMaps.LatLng(latitude, longitude);

        const map = new naverMaps.Map(miniMapRef.current, {
          center,
          zoom: MAP_CONFIG.ZOOM.SINGLE_MARKER,
        });

        // 마커 표시
        new naverMaps.Marker({
          map,
          position: center,
          title: placeDetail.name ?? placeName ?? '가게 위치',
        });
        
        setTimeout(() => {
          if (map && miniMapRef.current) {
            naverMaps.Event.trigger(map, 'resize');
          }
        }, 200);
      } catch (error) {
        // 에러 발생 시 무시
      }
    };

    void initMiniMap();

    return () => {
      // cleanup에서는 currentExecutionIdRef를 변경하지 않음
    };
  }, [placeDetail, naverClientId, placeName]);
  
  if (!placeDetail?.location || !naverClientId) {
    return null;
  }

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-100">위치 정보</h4>
      <div className="rounded-xl border border-white/10 bg-slate-900/80 p-3">
        <div
          ref={(el) => {
            miniMapRef.current = el;
          }}
          className="h-40 w-full overflow-hidden rounded-lg bg-slate-800"
        />
        <p className="mt-2 text-[11px] text-slate-500">
          지도를 드래그해 주변 위치를 살펴볼 수 있습니다.
        </p>
      </div>
    </div>
  );
};

