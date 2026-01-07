/**
 * Naver Maps Mock Utilities
 * 네이버 지도 API 테스트를 위한 공통 Mock 유틸리티
 */

import { vi } from 'vitest';

/**
 * Mock LatLng 좌표 인터페이스
 */
export interface MockLatLng {
  lat: () => number;
  lng: () => number;
}

/**
 * Mock Bounds 인터페이스 (naver.maps.Bounds 대체)
 */
export interface MockNaverMapsBounds {
  getNE: () => MockLatLng;
  getSW: () => MockLatLng;
  extend?: ReturnType<typeof vi.fn>;
}

/**
 * Mock LatLng 객체 생성
 */
export function createMockLatLng(lat: number, lng: number): MockLatLng {
  return {
    lat: () => lat,
    lng: () => lng,
  };
}

/**
 * Mock Bounds 객체 생성
 * @param ne - 북동쪽 좌표 { lat, lng }
 * @param sw - 남서쪽 좌표 { lat, lng }
 */
export function createMockBounds(
  ne: { lat: number; lng: number },
  sw: { lat: number; lng: number }
): MockNaverMapsBounds {
  return {
    getNE: () => createMockLatLng(ne.lat, ne.lng),
    getSW: () => createMockLatLng(sw.lat, sw.lng),
    extend: vi.fn(),
  };
}

/**
 * Mock Naver Maps SDK 인터페이스
 */
export interface MockNaverMaps {
  maps: {
    LatLng: new (lat: number, lng: number) => { lat: number; lng: number };
    LatLngBounds: new () => {
      extend: ReturnType<typeof vi.fn>;
      getNE: () => MockLatLng;
      getSW: () => MockLatLng;
    };
    Map: new (element: HTMLElement, options?: unknown) => {
      setCenter: ReturnType<typeof vi.fn>;
      setZoom: ReturnType<typeof vi.fn>;
      panTo: ReturnType<typeof vi.fn>;
      fitBounds: ReturnType<typeof vi.fn>;
      getBounds: () => MockNaverMapsBounds;
      getCenter: () => MockLatLng;
    };
    Marker: new (options?: unknown) => {
      setMap: ReturnType<typeof vi.fn>;
      setPosition: ReturnType<typeof vi.fn>;
      setIcon: ReturnType<typeof vi.fn>;
      getPosition: () => MockLatLng;
    };
    InfoWindow: new (options?: unknown) => {
      open: ReturnType<typeof vi.fn>;
      close: ReturnType<typeof vi.fn>;
      setContent: ReturnType<typeof vi.fn>;
    };
    Event: {
      addListener: ReturnType<typeof vi.fn>;
      removeListener: ReturnType<typeof vi.fn>;
    };
    Size?: new (width: number, height: number) => { width: number; height: number };
    Point?: new (x: number, y: number) => { x: number; y: number };
  };
}

/**
 * 전역 window에 Naver Maps Mock 설정
 * @returns cleanup 함수
 */
export function setupNaverMapsMock(): () => void {
  const originalNaver = (window as unknown as { naver?: MockNaverMaps }).naver;

  const mockNaver: MockNaverMaps = {
    maps: {
      LatLng: function (this: { lat: number; lng: number }, lat: number, lng: number) {
        this.lat = lat;
        this.lng = lng;
      } as unknown as new (lat: number, lng: number) => { lat: number; lng: number },
      LatLngBounds: function (this: {
        extend: ReturnType<typeof vi.fn>;
        getNE: () => MockLatLng;
        getSW: () => MockLatLng;
        _ne: { lat: number; lng: number };
        _sw: { lat: number; lng: number };
      }) {
        this._ne = { lat: 37.6, lng: 127.1 };
        this._sw = { lat: 37.4, lng: 126.9 };
        this.extend = vi.fn();
        this.getNE = () => createMockLatLng(this._ne.lat, this._ne.lng);
        this.getSW = () => createMockLatLng(this._sw.lat, this._sw.lng);
      } as unknown as new () => {
        extend: ReturnType<typeof vi.fn>;
        getNE: () => MockLatLng;
        getSW: () => MockLatLng;
      },
      Map: vi.fn().mockImplementation(() => ({
        setCenter: vi.fn(),
        setZoom: vi.fn(),
        panTo: vi.fn(),
        fitBounds: vi.fn(),
        getBounds: () => createMockBounds({ lat: 37.6, lng: 127.1 }, { lat: 37.4, lng: 126.9 }),
        getCenter: () => createMockLatLng(37.5, 127.0),
      })) as unknown as MockNaverMaps['maps']['Map'],
      Marker: vi.fn().mockImplementation(() => ({
        setMap: vi.fn(),
        setPosition: vi.fn(),
        setIcon: vi.fn(),
        getPosition: () => createMockLatLng(37.5, 127.0),
      })) as unknown as MockNaverMaps['maps']['Marker'],
      InfoWindow: vi.fn().mockImplementation(() => ({
        open: vi.fn(),
        close: vi.fn(),
        setContent: vi.fn(),
      })) as unknown as MockNaverMaps['maps']['InfoWindow'],
      Event: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
      Size: function (this: { width: number; height: number }, width: number, height: number) {
        this.width = width;
        this.height = height;
      } as unknown as new (width: number, height: number) => { width: number; height: number },
      Point: function (this: { x: number; y: number }, x: number, y: number) {
        this.x = x;
        this.y = y;
      } as unknown as new (x: number, y: number) => { x: number; y: number },
    },
  };

  (window as unknown as { naver: MockNaverMaps }).naver = mockNaver;

  // cleanup 함수 반환
  return () => {
    if (originalNaver) {
      (window as unknown as { naver: MockNaverMaps }).naver = originalNaver;
    } else {
      delete (window as unknown as { naver?: MockNaverMaps }).naver;
    }
  };
}

/**
 * Naver Maps Mock 제거
 */
export function cleanupNaverMapsMock(): void {
  delete (window as unknown as { naver?: MockNaverMaps }).naver;
}

/**
 * Naver Maps 사용 가능 여부 확인
 */
export function isNaverMapsAvailable(): boolean {
  return typeof window !== 'undefined' && 'naver' in window && 'maps' in (window as unknown as { naver: MockNaverMaps }).naver;
}
