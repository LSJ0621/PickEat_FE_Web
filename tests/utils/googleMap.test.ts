import { describe, it, expect } from 'vitest';
import { sanitizeHtml, isCompactBounds, getBoundsCenter, createRestaurantMarkerContent, getLatLngFromRestaurant } from '@/utils/googleMap';
import { createMockBounds, type MockGoogleMapsBounds } from '@tests/mocks/googleMaps';

describe('googleMap utilities', () => {
  describe('sanitizeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(sanitizeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should escape ampersands', () => {
      expect(sanitizeHtml('a & b')).toBe('a &amp; b');
    });

    it('should escape single quotes', () => {
      expect(sanitizeHtml("it's")).toBe('it&#39;s');
    });
  });

  describe('isCompactBounds', () => {
    it('should return false when bounds is null', () => {
      expect(isCompactBounds(null)).toBe(false);
    });

    it('should return true when bounds span is below threshold', () => {
      const mockBounds = createMockBounds(
        { lat: 37.51, lng: 127.01 },
        { lat: 37.50, lng: 127.00 }
      );

      expect(isCompactBounds(mockBounds as unknown as google.maps.LatLngBounds)).toBe(true);
    });

    it('should return false when bounds span is above threshold', () => {
      const mockBounds: MockGoogleMapsBounds = createMockBounds(
        { lat: 37.10, lng: 127.10 },
        { lat: 37.00, lng: 127.00 }
      );

      expect(isCompactBounds(mockBounds as unknown as google.maps.LatLngBounds)).toBe(false);
    });

    it('should use custom threshold', () => {
      const mockBounds: MockGoogleMapsBounds = createMockBounds(
        { lat: 37.08, lng: 127.08 },
        { lat: 37.00, lng: 127.00 }
      );

      expect(isCompactBounds(mockBounds as unknown as google.maps.LatLngBounds, 0.1)).toBe(true);
      expect(isCompactBounds(mockBounds as unknown as google.maps.LatLngBounds, 0.05)).toBe(false);
    });
  });

  describe('getBoundsCenter', () => {
    it('should return center of bounds', () => {
      const mockBounds: MockGoogleMapsBounds = createMockBounds(
        { lat: 37.10, lng: 127.10 },
        { lat: 37.00, lng: 127.00 }
      );

      const center = getBoundsCenter(mockBounds as unknown as google.maps.LatLngBounds);

      expect(center).toBeDefined();
      expect(center?.lat).toBe(37.05);
      expect(center?.lng).toBe(127.05);
    });
  });

  describe('createRestaurantMarkerContent', () => {
    it('should return DOM element with restaurant name', () => {
      const el = createRestaurantMarkerContent('맛있는 식당');

      expect(el).toBeInstanceOf(HTMLElement);
      expect(el.innerHTML).toContain('맛있는 식당');
      expect(el.innerHTML).toContain('pickeat-marker');
    });

    it('should return highlighted marker when highlighted is true', () => {
      const el = createRestaurantMarkerContent('맛있는 식당', true);

      expect(el.innerHTML).toContain('pickeat-marker--highlighted');
    });

    it('should sanitize HTML in restaurant name', () => {
      const el = createRestaurantMarkerContent('<script>alert("xss")</script>');

      expect(el.innerHTML).not.toContain('<script>');
      expect(el.innerHTML).toContain('&lt;script&gt;');
    });

    it('should use default name when name is empty', () => {
      const el = createRestaurantMarkerContent('');

      expect(el.innerHTML).toContain('매장');
    });

    it('should escape special characters', () => {
      const sanitized = sanitizeHtml(`맛있는 "식당" & '카페'`);

      expect(sanitized).toContain('&quot;');
      expect(sanitized).toContain('&amp;');
      expect(sanitized).toContain('&#39;');

      // DOM element should render correctly
      const el = createRestaurantMarkerContent(`맛있는 "식당" & '카페'`);
      const label = el.querySelector('.pickeat-marker__label');
      expect(label?.textContent).toBe(`맛있는 "식당" & '카페'`);
    });
  });

  describe('getLatLngFromRestaurant', () => {
    it('should return LatLngLiteral from latitude/longitude', () => {
      const result = getLatLngFromRestaurant({
        name: 'Test',
        latitude: 37.5,
        longitude: 127.0,
      } as Parameters<typeof getLatLngFromRestaurant>[0]);

      expect(result).toEqual({ lat: 37.5, lng: 127.0 });
    });

    it('should convert mapx/mapy to LatLngLiteral', () => {
      const result = getLatLngFromRestaurant({
        name: 'Test',
        mapx: 1270000000,
        mapy: 375000000,
      } as Parameters<typeof getLatLngFromRestaurant>[0]);

      expect(result).toEqual({ lat: 37.5, lng: 127.0 });
    });

    it('should return null when no coordinates available', () => {
      const result = getLatLngFromRestaurant({
        name: 'Test',
      } as Parameters<typeof getLatLngFromRestaurant>[0]);

      expect(result).toBeNull();
    });

    it('should prefer latitude/longitude over mapx/mapy', () => {
      const result = getLatLngFromRestaurant({
        name: 'Test',
        latitude: 37.5,
        longitude: 127.0,
        mapx: 1280000000,
        mapy: 380000000,
      } as Parameters<typeof getLatLngFromRestaurant>[0]);

      expect(result).toEqual({ lat: 37.5, lng: 127.0 });
    });
  });
});
