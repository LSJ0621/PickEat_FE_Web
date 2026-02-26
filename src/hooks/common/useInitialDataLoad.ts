/**
 * 초기 데이터 로드 Hook
 * StrictMode 대응 및 인증 확인 로직을 포함한 초기 데이터 로드 패턴을 관리합니다.
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface UseInitialDataLoadOptions {
  /** 데이터 로드가 활성화되어 있는지 여부 (예: isAuthenticated) */
  enabled: boolean;
  /** 데이터를 로드하는 함수 */
  loadFn: () => Promise<void> | void;
  /** 추가 의존성 배열 (이 값들이 변경되면 다시 로드) */
  dependencies?: unknown[];
}

/**
 * 초기 데이터 로드를 관리하는 Hook
 * StrictMode 대응 및 경로 변경 감지를 포함합니다.
 */
export const useInitialDataLoad = (options: UseInitialDataLoadOptions): void => {
  const { enabled, loadFn, dependencies = [] } = options;
  const location = useLocation();
  const hasInitializedRef = useRef(false);
  const currentPathnameRef = useRef<string>(location.pathname);
  const loadFnRef = useRef(loadFn);

  // 항상 최신 loadFn 유지 (stale closure 방지)
  useEffect(() => {
    loadFnRef.current = loadFn;
  }, [loadFn]);

  // 경로 변경 감지 및 초기화 리셋 (컴포넌트 재사용 시 대비)
  useEffect(() => {
    if (currentPathnameRef.current !== location.pathname) {
      hasInitializedRef.current = false;
      currentPathnameRef.current = location.pathname;
      
      // 경로 변경 시 enabled가 true이면 즉시 데이터 다시 로드
      if (enabled) {
        hasInitializedRef.current = true;
        void loadFnRef.current();
      }
    }
  }, [location.pathname, enabled]);

  // 데이터 로드 (StrictMode 대응)
  useEffect(() => {
    if (!enabled) {
      // enabled가 false가 되면 리셋하여 다음에 enabled=true일 때 다시 로드되도록
      hasInitializedRef.current = false;
      return;
    }

    // StrictMode 대응: 이미 초기화했으면 스킵
    if (hasInitializedRef.current) {
      return;
    }
    hasInitializedRef.current = true;

    // React 공식 문서 권장: 함수를 useEffect 내부에서 직접 호출
    void loadFnRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...dependencies]);
};
