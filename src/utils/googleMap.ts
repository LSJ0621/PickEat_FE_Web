import type { Restaurant } from '@/types/search';

export const sanitizeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getBoundsSpan = (bounds: google.maps.LatLngBounds): { latSpan: number; lngSpan: number } => {
  const northEast = bounds.getNorthEast();
  const southWest = bounds.getSouthWest();
  return {
    latSpan: Math.abs(northEast.lat() - southWest.lat()),
    lngSpan: Math.abs(northEast.lng() - southWest.lng()),
  };
};

export const isCompactBounds = (bounds: google.maps.LatLngBounds | null, threshold = 0.05): boolean => {
  if (!bounds) {
    return false;
  }

  const { latSpan, lngSpan } = getBoundsSpan(bounds);
  return latSpan < threshold && lngSpan < threshold;
};

export const getBoundsCenter = (bounds: google.maps.LatLngBounds): google.maps.LatLngLiteral | null => {
  if (!bounds) {
    return null;
  }

  const center = bounds.getCenter();
  return center.toJSON();
};

export const createRestaurantMarkerContent = (name: string, highlighted = false): HTMLElement => {
  const safeName = sanitizeHtml(name || '매장');
  const markerClass = highlighted ? 'pickeat-marker pickeat-marker--highlighted' : 'pickeat-marker';

  const container = document.createElement('div');
  container.innerHTML = `
    <div class="${markerClass}">
      <div class="pickeat-marker__bubble">
        <span class="pickeat-marker__dot"></span>
        <span class="pickeat-marker__label">${safeName}</span>
      </div>
      <span class="pickeat-marker__tail"></span>
    </div>
  `;
  return container;
};

export const createUserLocationMarkerContent = (): HTMLElement => {
  const el = document.createElement('div');
  el.style.cssText = `
    background: #0ea5e9;
    color: white;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    border: 2px solid rgba(255,255,255,0.6);
    box-shadow: 0 10px 20px rgba(14,165,233,0.35);
  `;
  el.textContent = '내 위치';
  return el;
};

export const getLatLngFromRestaurant = (restaurant: Restaurant): google.maps.LatLngLiteral | null => {
  if (typeof restaurant.latitude === 'number' && typeof restaurant.longitude === 'number') {
    return { lat: restaurant.latitude, lng: restaurant.longitude };
  }

  if (restaurant.mapx !== undefined && restaurant.mapy !== undefined) {
    try {
      const mapx = Number(restaurant.mapx);
      const mapy = Number(restaurant.mapy);
      const lat = mapy / 10000000;
      const lng = mapx / 10000000;
      return { lat, lng };
    } catch {
      return null;
    }
  }

  return null;
};
