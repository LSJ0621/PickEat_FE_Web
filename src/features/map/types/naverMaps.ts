export type NaverLatLng = {
  lat(): number;
  lng(): number;
};

export type NaverLatLngBounds = {
  extend(latLng: NaverLatLng): void;
  getNE(): NaverLatLng;
  getSW(): NaverLatLng;
};

export type NaverMap = {
  setCenter(latLng: NaverLatLng): void;
  setZoom(level: number): void;
  getZoom(): number;
  fitBounds(bounds: NaverLatLngBounds, padding?: { top?: number; right?: number; bottom?: number; left?: number }): void;
};

export type NaverInfoWindow = {
  open(map: NaverMap, marker: unknown): void;
};

export type NaverMapsAPI = {
  LatLng: new (lat: number, lng: number) => NaverLatLng;
  Map: new (
    element: HTMLElement,
    options: {
      center: NaverLatLng;
      zoom: number;
      mapTypeControl?: boolean;
      mapTypeControlOptions?: {
        style?: number;
        position?: number;
      };
    }
  ) => NaverMap;
  Marker: new (options: { map: NaverMap; position: NaverLatLng; title?: string; icon?: unknown }) => unknown;
  InfoWindow: new (options: { content: string }) => NaverInfoWindow;
  LatLngBounds: new () => NaverLatLngBounds;
  Event: {
    addListener: (target: unknown, event: string, handler: () => void) => void;
    trigger: (target: unknown, event: string) => void;
  };
  MapTypeControlStyle?: {
    BUTTON: number;
  };
  Position?: {
    TOP_RIGHT: number;
  };
  TransCoord?: unknown;
};

export interface NaverNamespace {
  maps?: NaverMapsAPI;
}

declare global {
  interface Window {
    naver?: NaverNamespace;
    navermap_authFailure?: () => void;
  }
}

export {};
