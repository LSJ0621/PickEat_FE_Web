import type { NaverLatLngBounds } from '@features/map/types/naverMaps';

const sanitizeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getBoundsSpan = (bounds: NaverLatLngBounds) => {
  const northEast = bounds.getNE();
  const southWest = bounds.getSW();
  return {
    latSpan: Math.abs(northEast.lat() - southWest.lat()),
    lngSpan: Math.abs(northEast.lng() - southWest.lng()),
  };
};

export const isCompactBounds = (bounds: NaverLatLngBounds, threshold = 0.05) => {
  if (!bounds) {
    return false;
  }

  const { latSpan, lngSpan } = getBoundsSpan(bounds);
  return latSpan < threshold && lngSpan < threshold;
};

export const getBoundsCenter = (bounds: NaverLatLngBounds) => {
  if (!window.naver?.maps?.LatLng) {
    return null;
  }

  const northEast = bounds.getNE();
  const southWest = bounds.getSW();
  return new window.naver.maps.LatLng(
    (northEast.lat() + southWest.lat()) / 2,
    (northEast.lng() + southWest.lng()) / 2
  );
};

export const getRestaurantMarkerIcon = (name: string, highlighted = false) => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const safeName = sanitizeHtml(name || '매장');
  const markerClass = highlighted ? 'pickeat-marker pickeat-marker--highlighted' : 'pickeat-marker';

  return {
    content: `
      <div class="${markerClass}">
        <div class="pickeat-marker__bubble">
          <span class="pickeat-marker__dot"></span>
          <span class="pickeat-marker__label">${safeName}</span>
        </div>
        <span class="pickeat-marker__tail"></span>
      </div>
    `,
  };
};
