/**
 * Google Maps Mock Utilities
 * 구글 지도 API 테스트를 위한 공통 Mock 유틸리티
 */

import { vi } from 'vitest';

/**
 * Mock LatLngLiteral
 */
export interface MockLatLngLiteral {
  lat: number;
  lng: number;
}

/**
 * Mock LatLng 객체 (메서드 형태)
 */
export interface MockLatLng {
  lat: () => number;
  lng: () => number;
  toJSON: () => MockLatLngLiteral;
}

/**
 * Mock LatLngBounds
 */
export interface MockGoogleMapsBounds {
  extend: ReturnType<typeof vi.fn>;
  getNorthEast: () => MockLatLng;
  getSouthWest: () => MockLatLng;
  getCenter: () => MockLatLng;
}

/**
 * Mock LatLng 객체 생성 (메서드 형태)
 */
export function createMockLatLng(lat: number, lng: number): MockLatLng {
  return {
    lat: () => lat,
    lng: () => lng,
    toJSON: () => ({ lat, lng }),
  };
}

/**
 * Mock LatLngBounds 객체 생성
 */
export function createMockBounds(
  ne: { lat: number; lng: number },
  sw: { lat: number; lng: number }
): MockGoogleMapsBounds {
  const neLatlng = createMockLatLng(ne.lat, ne.lng);
  const swLatlng = createMockLatLng(sw.lat, sw.lng);
  const centerLat = (ne.lat + sw.lat) / 2;
  const centerLng = (ne.lng + sw.lng) / 2;

  return {
    extend: vi.fn(),
    getNorthEast: () => neLatlng,
    getSouthWest: () => swLatlng,
    getCenter: () => createMockLatLng(centerLat, centerLng),
  };
}

/**
 * Google Maps 라이브러리 mock 객체 생성
 */
export function createGoogleMapsMock() {
  const mockMap = vi.fn().mockImplementation(function () {
    return {
      setCenter: vi.fn(),
      setZoom: vi.fn(),
      getZoom: vi.fn().mockReturnValue(15),
      panTo: vi.fn(),
      fitBounds: vi.fn(),
    };
  });

  const mockAdvancedMarkerElement = vi.fn().mockImplementation(function () {
    return { addListener: vi.fn() };
  });

  const mockInfoWindow = vi.fn().mockImplementation(function () {
    return { open: vi.fn(), close: vi.fn() };
  });

  return {
    maps: { Map: mockMap },
    marker: { AdvancedMarkerElement: mockAdvancedMarkerElement },
    InfoWindow: mockInfoWindow,
  };
}
