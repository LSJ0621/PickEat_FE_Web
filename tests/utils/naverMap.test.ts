import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isCompactBounds, getBoundsCenter, getRestaurantMarkerIcon } from '@/utils/naverMap';
import { createMockBounds, type MockNaverMapsBounds } from '@tests/mocks/naverMaps';

describe('naverMap utilities', () => {
  describe('isCompactBounds', () => {
    it('should return false when bounds is null', () => {
      expect(isCompactBounds(null)).toBe(false);
    });

    it('should return true when bounds span is below threshold', () => {
      const mockBounds: MockNaverMapsBounds = createMockBounds(
        { lat: 37.51, lng: 127.01 },
        { lat: 37.50, lng: 127.00 }
      );

      expect(isCompactBounds(mockBounds)).toBe(true);
    });

    it('should return false when bounds span is above threshold', () => {
      const mockBounds: MockNaverMapsBounds = createMockBounds(
        { lat: 37.10, lng: 127.10 },
        { lat: 37.00, lng: 127.00 }
      );

      expect(isCompactBounds(mockBounds)).toBe(false);
    });

    it('should use custom threshold', () => {
      const mockBounds: MockNaverMapsBounds = createMockBounds(
        { lat: 37.08, lng: 127.08 },
        { lat: 37.00, lng: 127.00 }
      );

      expect(isCompactBounds(mockBounds, 0.1)).toBe(true);
      expect(isCompactBounds(mockBounds, 0.05)).toBe(false);
    });
  });

  describe('getBoundsCenter', () => {
    interface MockNaver {
      maps: {
        LatLng: new (lat: number, lng: number) => { lat: number; lng: number };
      };
    }

    const originalNaver = (window as unknown as { naver?: MockNaver }).naver;

    beforeEach(() => {
      (window as unknown as { naver: MockNaver }).naver = {
        maps: {
          LatLng: function(this: { lat: number; lng: number }, lat: number, lng: number) {
            this.lat = lat;
            this.lng = lng;
          } as unknown as new (lat: number, lng: number) => { lat: number; lng: number },
        },
      };
    });

    afterEach(() => {
      if (originalNaver) {
        (window as unknown as { naver: MockNaver }).naver = originalNaver;
      } else {
        delete (window as unknown as { naver?: MockNaver }).naver;
      }
    });

    it('should return null when naver maps is not available', () => {
      (window as unknown as { naver?: MockNaver }).naver = undefined;

      const mockBounds: MockNaverMapsBounds = createMockBounds(
        { lat: 37.10, lng: 127.10 },
        { lat: 37.00, lng: 127.00 }
      );

      expect(getBoundsCenter(mockBounds)).toBe(null);
    });

    it('should return center of bounds', () => {
      const mockBounds: MockNaverMapsBounds = createMockBounds(
        { lat: 37.10, lng: 127.10 },
        { lat: 37.00, lng: 127.00 }
      );

      const center = getBoundsCenter(mockBounds) as { lat: number; lng: number } | null;

      expect(center).toBeDefined();
      expect(center?.lat).toBe(37.05);
      expect(center?.lng).toBe(127.05);
    });
  });

  describe('getRestaurantMarkerIcon', () => {
    describe('non-browser environment', () => {
      const originalWindow = globalThis.window;

      beforeEach(() => {
        delete (globalThis as { window?: Window & typeof globalThis }).window;
      });

      afterEach(() => {
        (globalThis as { window: Window & typeof globalThis }).window = originalWindow;
      });

      it('should return undefined in non-browser environment', () => {
        const icon = getRestaurantMarkerIcon('Test Restaurant');

        expect(icon).toBeUndefined();
      });
    });

    it('should return marker icon with restaurant name', () => {
      const icon = getRestaurantMarkerIcon('맛있는 식당');

      expect(icon).toBeDefined();
      expect(icon?.content).toContain('맛있는 식당');
      expect(icon?.content).toContain('pickeat-marker');
    });

    it('should return highlighted marker when highlighted is true', () => {
      const icon = getRestaurantMarkerIcon('맛있는 식당', true);

      expect(icon?.content).toContain('pickeat-marker--highlighted');
    });

    it('should sanitize HTML in restaurant name', () => {
      const icon = getRestaurantMarkerIcon('<script>alert("xss")</script>');

      expect(icon?.content).not.toContain('<script>');
      expect(icon?.content).toContain('&lt;script&gt;');
    });

    it('should use default name when name is empty', () => {
      const icon = getRestaurantMarkerIcon('');

      expect(icon?.content).toContain('매장');
    });

    it('should escape special characters', () => {
      const icon = getRestaurantMarkerIcon(`맛있는 "식당" & '카페'`);

      expect(icon?.content).toContain('&quot;');
      expect(icon?.content).toContain('&amp;');
      expect(icon?.content).toContain('&#39;');
    });
  });
});
