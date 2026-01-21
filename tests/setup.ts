import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { server } from '@tests/mocks/server';
import i18n from '@/i18n/config';

// MSW 서버 설정
beforeAll(async () => {
  await i18n.changeLanguage('ko');
  server.listen({ onUnhandledRequest: 'error' });
});
afterAll(() => server.close());
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// sessionStorage mock
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// window.location mock
const locationMock = {
  href: 'http://localhost:8080',
  origin: 'http://localhost:8080',
  protocol: 'http:',
  host: 'localhost:8080',
  hostname: 'localhost',
  port: '8080',
  pathname: '/',
  search: '',
  hash: '',
  assign: vi.fn(),
  reload: vi.fn(),
  replace: vi.fn(),
};
Object.defineProperty(window, 'location', {
  value: locationMock,
  writable: true,
});

// window.scrollTo mock
window.scrollTo = vi.fn();

// IntersectionObserver mock
const IntersectionObserverMock = vi.fn().mockImplementation(() => ({
  root: null,
  rootMargin: '',
  thresholds: [],
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => []),
}));
Object.defineProperty(window, 'IntersectionObserver', {
  value: IntersectionObserverMock,
  writable: true,
});

// ResizeObserver mock
const ResizeObserverMock = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
Object.defineProperty(window, 'ResizeObserver', {
  value: ResizeObserverMock,
  writable: true,
});

// matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Naver Maps SDK mock
const naverMapsMock = {
  maps: {
    Map: vi.fn().mockImplementation(() => ({
      setCenter: vi.fn(),
      setZoom: vi.fn(),
      panTo: vi.fn(),
      destroy: vi.fn(),
    })),
    LatLng: vi.fn().mockImplementation((lat: number, lng: number) => ({ lat, lng })),
    Marker: vi.fn().mockImplementation(() => ({
      setMap: vi.fn(),
      setPosition: vi.fn(),
    })),
    InfoWindow: vi.fn().mockImplementation(() => ({
      open: vi.fn(),
      close: vi.fn(),
    })),
    Event: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
};
Object.defineProperty(window, 'naver', { value: naverMapsMock, writable: true });

// Google Maps mock
vi.mock('@googlemaps/js-api-loader', () => ({
  Loader: vi.fn().mockImplementation(() => ({
    load: vi.fn().mockResolvedValue({}),
  })),
}));

// 환경 변수 mock
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3000');
vi.stubEnv('VITE_KAKAO_CLIENT_ID', 'mock-kakao-client-id');
vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'mock-google-client-id');
vi.stubEnv('VITE_NAVER_MAP_CLIENT_ID', 'mock-naver-map-client-id');
