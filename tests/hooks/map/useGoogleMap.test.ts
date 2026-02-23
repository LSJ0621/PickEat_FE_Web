/**
 * useGoogleMap Hook 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGoogleMap } from '@/hooks/map/useGoogleMap';
import * as googleMapLoader from '@/utils/googleMapLoader';
import * as googleMapUtils from '@/utils/googleMap';
import type { Restaurant } from '@/types/search';
import { createRef } from 'react';

vi.mock('@/utils/googleMapLoader');
vi.mock('@/utils/googleMap');
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('useGoogleMap', () => {
  const mockRestaurant: Restaurant = {
    id: 1,
    name: 'Test Restaurant',
    address: '서울시 강남구',
    roadAddress: '서울시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    latitude: 37.5,
    longitude: 127.0,
    category: 'Korean',
    imageUrl: null,
  };

  const mockMap = {
    setCenter: vi.fn(),
    setZoom: vi.fn(),
    getZoom: vi.fn().mockReturnValue(14),
    fitBounds: vi.fn(),
    addListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
  };

  const mockAdvancedMarkerElement = vi.fn(() => ({
    addListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
  }));

  const mockInfoWindow = vi.fn(() => ({
    open: vi.fn(),
  }));

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Google Maps API
    global.google = {
      maps: {
        Map: vi.fn(() => mockMap),
        LatLngBounds: vi.fn(() => ({
          extend: vi.fn(),
        })),
        InfoWindow: mockInfoWindow,
        event: {
          trigger: vi.fn(),
        },
      },
    } as never;

    vi.mocked(googleMapLoader.loadGoogleMaps).mockResolvedValue({
      maps: global.google.maps,
      marker: {
        AdvancedMarkerElement: mockAdvancedMarkerElement,
      },
    } as never);

    vi.mocked(googleMapLoader.getGoogleMapId).mockReturnValue('test-map-id');

    vi.mocked(googleMapUtils.getLatLngFromRestaurant).mockImplementation((restaurant: Restaurant) => {
      if (restaurant.latitude && restaurant.longitude) {
        return { lat: restaurant.latitude, lng: restaurant.longitude };
      }
      return null;
    });

    vi.mocked(googleMapUtils.createUserLocationMarkerContent).mockReturnValue(
      document.createElement('div')
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('초기 상태', () => {
    it('should initialize with loading false and no runtime error', async () => {
      const { result } = renderHook(() =>
        useGoogleMap({
          mapRef: { current: null },
          restaurants: [],
          selectedRestaurant: null,
          userLatLng: null,
          blockingError: null,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.runtimeError).toBeNull();
      });
    });
  });

  describe('blockingError 처리', () => {
    it('should not initialize map when blockingError exists', async () => {
      const { result } = renderHook(() =>
        useGoogleMap({
          mapRef: createRef<HTMLDivElement>(),
          restaurants: [mockRestaurant],
          selectedRestaurant: null,
          userLatLng: null,
          blockingError: 'Geolocation error',
        })
      );

      await waitFor(() => {
        expect(googleMapLoader.loadGoogleMaps).not.toHaveBeenCalled();
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('지도 초기화', () => {
    it('should not initialize when mapRef is null', async () => {
      const { result } = renderHook(() =>
        useGoogleMap({
          mapRef: { current: null },
          restaurants: [mockRestaurant],
          selectedRestaurant: null,
          userLatLng: null,
          blockingError: null,
        })
      );

      await waitFor(() => {
        expect(googleMapLoader.loadGoogleMaps).not.toHaveBeenCalled();
        expect(result.current.loading).toBe(false);
      });
    });

    it('should call loadGoogleMaps when mapRef is provided', async () => {
      const divElement = document.createElement('div');
      Object.defineProperty(divElement, 'offsetWidth', { value: 800, writable: true });
      Object.defineProperty(divElement, 'offsetHeight', { value: 600, writable: true });

      const mapRef = { current: divElement };

      const { result } = renderHook(() =>
        useGoogleMap({
          mapRef,
          restaurants: [mockRestaurant],
          selectedRestaurant: null,
          userLatLng: null,
          blockingError: null,
        })
      );

      await waitFor(() => {
        expect(googleMapLoader.loadGoogleMaps).toHaveBeenCalled();
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });
    });
  });

  describe('좌표 처리', () => {
    it('should set runtime error when no coordinates available', async () => {
      const divElement = document.createElement('div');
      const mapRef = { current: divElement };

      vi.mocked(googleMapUtils.getLatLngFromRestaurant).mockReturnValue(null);

      const { result } = renderHook(() =>
        useGoogleMap({
          mapRef,
          restaurants: [mockRestaurant],
          selectedRestaurant: null,
          userLatLng: null,
          blockingError: null,
        })
      );

      await waitFor(() => {
        expect(result.current.runtimeError).toBe('map.noCoordinates');
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });
    });

    it('should call getLatLngFromRestaurant for selected restaurant', async () => {
      const divElement = document.createElement('div');
      const mapRef = { current: divElement };

      renderHook(() =>
        useGoogleMap({
          mapRef,
          restaurants: [mockRestaurant],
          selectedRestaurant: mockRestaurant,
          userLatLng: null,
          blockingError: null,
        })
      );

      await waitFor(() => {
        expect(googleMapUtils.getLatLngFromRestaurant).toHaveBeenCalledWith(mockRestaurant);
      }, { timeout: 3000 });
    });
  });

  describe('에러 처리', () => {
    it('should set runtime error when map loading fails', async () => {
      const divElement = document.createElement('div');
      const mapRef = { current: divElement };

      vi.mocked(googleMapLoader.loadGoogleMaps).mockRejectedValue(new Error('Load failed'));

      const { result } = renderHook(() =>
        useGoogleMap({
          mapRef,
          restaurants: [mockRestaurant],
          selectedRestaurant: null,
          userLatLng: null,
          blockingError: null,
        })
      );

      await waitFor(() => {
        expect(result.current.runtimeError).toBe('map.loadMapError');
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });
    });
  });

  describe('사용 시나리오', () => {
    it('should handle case with valid restaurant coordinates', async () => {
      const divElement = document.createElement('div');
      const mapRef = { current: divElement };

      const { result } = renderHook(() =>
        useGoogleMap({
          mapRef,
          restaurants: [mockRestaurant],
          selectedRestaurant: null,
          userLatLng: null,
          blockingError: null,
        })
      );

      await waitFor(() => {
        expect(result.current.runtimeError).toBeNull();
      }, { timeout: 3000 });
    });

    it('should handle case with user location', async () => {
      const divElement = document.createElement('div');
      const mapRef = { current: divElement };

      const userLatLng = { latitude: 37.5, longitude: 127.0 };

      renderHook(() =>
        useGoogleMap({
          mapRef,
          restaurants: [mockRestaurant],
          selectedRestaurant: null,
          userLatLng,
          blockingError: null,
        })
      );

      await waitFor(() => {
        expect(googleMapLoader.loadGoogleMaps).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should handle error scenario gracefully', async () => {
      const divElement = document.createElement('div');
      const mapRef = { current: divElement };

      vi.mocked(googleMapLoader.loadGoogleMaps).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() =>
        useGoogleMap({
          mapRef,
          restaurants: [mockRestaurant],
          selectedRestaurant: null,
          userLatLng: null,
          blockingError: null,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.runtimeError).toBe('map.loadMapError');
      }, { timeout: 3000 });
    });
  });

  describe('cleanup', () => {
    it('should cleanup on unmount without errors', async () => {
      const divElement = document.createElement('div');
      const mapRef = { current: divElement };

      const { unmount } = renderHook(() =>
        useGoogleMap({
          mapRef,
          restaurants: [mockRestaurant],
          selectedRestaurant: null,
          userLatLng: null,
          blockingError: null,
        })
      );

      await waitFor(() => {
        expect(googleMapLoader.loadGoogleMaps).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Should unmount without throwing errors
      expect(() => unmount()).not.toThrow();
    });
  });
});
