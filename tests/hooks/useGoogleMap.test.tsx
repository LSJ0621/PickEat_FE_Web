/**
 * useGoogleMap 테스트
 * 전략 §4.1에 따라 최종 관찰 가능한 상태(loading/runtimeError)만 검증한다.
 * 내부 requestAnimationFrame/setTimeout 안정화 로직은 검증 대상이 아니다.
 */

import React, { useRef } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useGoogleMap } from '@features/map/hooks/useGoogleMap';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
}));

const mockLoadGoogleMaps = vi.hoisted(() => vi.fn());
vi.mock('@shared/utils/googleMapLoader', () => ({
  loadGoogleMaps: mockLoadGoogleMaps,
  getGoogleMapId: () => 'test-map-id',
}));

vi.mock('dompurify', () => ({
  default: { sanitize: (v: string) => v },
}));

// window.google.maps stubs
class FakeLatLngBounds {
  extend() { return this; }
}
class FakeInfoWindow {
  open() {}
}
class FakeMap {
  constructor(_el: unknown, _opts: unknown) {}
  setCenter() {}
  setZoom() {}
  getZoom() { return 10; }
  fitBounds() {}
  addListener() { return { remove: () => {} }; }
}
class FakeMarker {
  public position: unknown;
  public map: unknown;
  public title: unknown;
  public content: unknown;
  constructor(args: { position: unknown; map: unknown; title?: unknown; content?: unknown }) {
    this.position = args.position;
    this.map = args.map;
    this.title = args.title;
    this.content = args.content;
  }
  addListener() { return { remove: () => {} }; }
}

(globalThis as any).google = {
  maps: {
    Map: FakeMap,
    LatLngBounds: FakeLatLngBounds,
    InfoWindow: FakeInfoWindow,
    event: { trigger: vi.fn() },
  },
};

const successfulLoad = () =>
  Promise.resolve({
    maps: {
      Map: FakeMap,
      LatLngBounds: FakeLatLngBounds,
      InfoWindow: FakeInfoWindow,
    },
    marker: { AdvancedMarkerElement: FakeMarker },
  });

function useHarness(opts: {
  restaurants?: unknown[];
  selectedRestaurant?: unknown;
  userLatLng?: { latitude: number; longitude: number } | null;
  blockingError?: string | null;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  if (!mapRef.current) {
    const el = document.createElement('div');
    Object.defineProperty(el, 'offsetWidth', { value: 400, configurable: true });
    Object.defineProperty(el, 'offsetHeight', { value: 400, configurable: true });
    mapRef.current = el;
  }
  return useGoogleMap({
    mapRef,
    restaurants: (opts.restaurants ?? []) as never,
    selectedRestaurant: (opts.selectedRestaurant ?? null) as never,
    userLatLng: opts.userLatLng ?? null,
    blockingError: opts.blockingError ?? null,
  } as never);
}

describe('useGoogleMap', () => {
  beforeEach(() => {
    mockLoadGoogleMaps.mockReset();
  });

  it('초기 상태 — loading false, runtimeError null (blockingError 있을 때 초기화 스킵)', () => {
    const { result } = renderHook(() => useHarness({ blockingError: 'blocked' }));
    expect(result.current.loading).toBe(false);
    expect(result.current.runtimeError).toBeNull();
  });

  it('loadGoogleMaps 성공 → loading false, runtimeError null', async () => {
    mockLoadGoogleMaps.mockImplementation(successfulLoad);
    const { result } = renderHook(() =>
      useHarness({
        restaurants: [
          { name: 'A', address: 'addr', latitude: 37.5, longitude: 127.0 },
        ],
        userLatLng: { latitude: 37.5, longitude: 127.0 },
      }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.runtimeError).toBeNull();
  });

  it('loadGoogleMaps 실패 → runtimeError 설정 + loading false', async () => {
    mockLoadGoogleMaps.mockRejectedValue(new Error('load fail'));
    const { result } = renderHook(() =>
      useHarness({
        restaurants: [
          { name: 'A', address: 'addr', latitude: 37.5, longitude: 127.0 },
        ],
      }),
    );

    await waitFor(() => expect(result.current.runtimeError).not.toBeNull());
    expect(result.current.loading).toBe(false);
  });
});
