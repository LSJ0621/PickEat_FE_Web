export interface UseGoogleMapOptions {
  mapRef: React.RefObject<HTMLDivElement | null>;
  restaurants: import('@features/map/types/search').Restaurant[];
  selectedRestaurant: import('@features/map/types/search').Restaurant | null;
  userLatLng: { latitude: number; longitude: number } | null;
  blockingError: string | null;
}

export interface UseGoogleMapReturn {
  loading: boolean;
  runtimeError: string | null;
}

export interface MapMarkerInfo {
  restaurant: import('@features/map/types/search').Restaurant;
  latLng: google.maps.LatLngLiteral;
}
