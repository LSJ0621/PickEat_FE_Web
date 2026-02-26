import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { PlaceMiniMap } from '@features/agent/components/restaurant/PlaceMiniMap';
import { createMockPlaceDetail } from '@tests/factories';

// Use vi.hoisted so these are available inside the vi.mock factory (which is hoisted to top)
const { mockMapFn, mockAdvancedMarkerFn, mockEventTrigger, mockMapInstance } = vi.hoisted(() => {
  const mockMapFn = vi.fn();
  const mockAdvancedMarkerFn = vi.fn();
  const mockEventTrigger = vi.fn();
  const mockMapInstance = {
    setCenter: vi.fn(),
    setZoom: vi.fn(),
  };
  return { mockMapFn, mockAdvancedMarkerFn, mockEventTrigger, mockMapInstance };
});

vi.mock('@shared/utils/googleMapLoader', () => ({
  loadGoogleMaps: vi.fn().mockResolvedValue({
    maps: {
      Map: function (...args: unknown[]) {
        mockMapFn(...args);
        return mockMapInstance;
      },
      event: {
        trigger: mockEventTrigger,
      },
    },
    marker: {
      AdvancedMarkerElement: function (options: unknown) {
        mockAdvancedMarkerFn(options);
        return {};
      },
    },
  }),
  getGoogleMapId: vi.fn().mockReturnValue('test-map-id'),
}));

describe('PlaceMiniMap', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Re-setup the google global after clearAllMocks
    vi.stubGlobal('google', {
      maps: {
        event: {
          trigger: mockEventTrigger,
        },
      },
    });

    // Re-setup loadGoogleMaps mock after clearAllMocks resets it
    const { loadGoogleMaps } = await import('@shared/utils/googleMapLoader');
    vi.mocked(loadGoogleMaps).mockResolvedValue({
      maps: {
        Map: function (...args: unknown[]) {
          mockMapFn(...args);
          return mockMapInstance;
        },
        event: {
          trigger: mockEventTrigger,
        },
      },
      marker: {
        AdvancedMarkerElement: function (options: unknown) {
          mockAdvancedMarkerFn(options);
          return {};
        },
      },
    } as Awaited<ReturnType<typeof loadGoogleMaps>>);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('렌더링 테스트', () => {
    it('placeDetail이 null이면 아무것도 렌더링되지 않는다', () => {
      const { container } = render(<PlaceMiniMap placeDetail={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('placeDetail에 location이 없으면 아무것도 렌더링되지 않는다', () => {
      const placeDetail = createMockPlaceDetail({ location: null });
      const { container } = render(<PlaceMiniMap placeDetail={placeDetail} />);
      expect(container.firstChild).toBeNull();
    });

    it('유효한 props가 있으면 지도 섹션이 렌더링된다', () => {
      const placeDetail = createMockPlaceDetail();
      render(<PlaceMiniMap placeDetail={placeDetail} />);

      expect(screen.getByText('위치 정보')).toBeInTheDocument();
    });

    it('지도 안내 텍스트가 표시된다', () => {
      const placeDetail = createMockPlaceDetail();
      render(<PlaceMiniMap placeDetail={placeDetail} />);

      expect(screen.getByText('지도를 드래그해 주변 위치를 살펴볼 수 있습니다.')).toBeInTheDocument();
    });
  });

  describe('지도 컨테이너 테스트', () => {
    it('지도 컨테이너가 렌더링된다', () => {
      const placeDetail = createMockPlaceDetail();
      const { container } = render(<PlaceMiniMap placeDetail={placeDetail} />);

      // Component uses h-44 w-full for the map div
      const mapContainer = container.querySelector('.h-44.w-full');
      expect(mapContainer).toBeInTheDocument();
    });
  });

  describe('스타일 테스트', () => {
    it('지도 컨테이너가 올바른 스타일을 가진다', () => {
      const placeDetail = createMockPlaceDetail();
      const { container } = render(<PlaceMiniMap placeDetail={placeDetail} />);

      // Component uses rounded-2xl border for the outer container
      const mapContainer = container.querySelector('.rounded-2xl.border');
      expect(mapContainer).toBeInTheDocument();
    });

    it('제목이 올바른 스타일을 가진다', () => {
      const placeDetail = createMockPlaceDetail();
      render(<PlaceMiniMap placeDetail={placeDetail} />);

      const title = screen.getByText('위치 정보');
      expect(title).toHaveClass('text-sm');
      expect(title).toHaveClass('font-semibold');
    });
  });

  describe('placeDetail.location null 조기 반환', () => {
    it('placeDetail.location이 null이면 조기 반환한다', () => {
      const placeDetail = createMockPlaceDetail({ location: null });
      const { container } = render(<PlaceMiniMap placeDetail={placeDetail} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('placeName prop 테스트', () => {
    it('placeName이 표시 없이 지도가 렌더링된다', () => {
      const placeDetail = createMockPlaceDetail();
      render(<PlaceMiniMap placeDetail={placeDetail} placeName="대체 이름" />);

      expect(screen.getByText('위치 정보')).toBeInTheDocument();
    });

    it('placeDetail.name과 placeName 모두 있어도 컴포넌트가 렌더링된다', () => {
      const placeDetail = createMockPlaceDetail({
        name: '원래 이름',
        location: { latitude: 37.5, longitude: 127.0 },
      });

      render(<PlaceMiniMap placeDetail={placeDetail} placeName="대체 이름" />);

      expect(screen.getByText('위치 정보')).toBeInTheDocument();
    });
  });

  describe('Google Maps 초기화 테스트', () => {
    it('유효한 location이 있으면 지도가 초기화된다', async () => {
      const placeDetail = createMockPlaceDetail({
        location: { latitude: 37.5, longitude: 127.0 },
      });

      await act(async () => {
        render(<PlaceMiniMap placeDetail={placeDetail} />);
      });

      await waitFor(() => {
        expect(mockMapFn).toHaveBeenCalled();
      });
    });

    it('지도에 마커가 추가된다', async () => {
      const placeDetail = createMockPlaceDetail({
        name: '테스트 가게',
        location: { latitude: 37.5, longitude: 127.0 },
      });

      await act(async () => {
        render(<PlaceMiniMap placeDetail={placeDetail} />);
      });

      await waitFor(() => {
        expect(mockAdvancedMarkerFn).toHaveBeenCalled();
      });
    });
  });

  describe('placeDetail 변경 처리', () => {
    it('동일한 placeDetail로 rerender 시 재초기화하지 않는다', async () => {
      const placeDetail = createMockPlaceDetail({
        location: { latitude: 37.5, longitude: 127.0 },
      });

      const { rerender } = await act(async () => {
        return render(<PlaceMiniMap placeDetail={placeDetail} />);
      });

      await waitFor(() => {
        expect(mockMapFn).toHaveBeenCalled();
      });

      mockMapFn.mockClear();

      // Rerender with SAME placeDetail
      await act(async () => {
        rerender(<PlaceMiniMap placeDetail={placeDetail} />);
      });

      // Map should NOT be called again since props haven't changed
      expect(mockMapFn).not.toHaveBeenCalled();
    });

    it('다른 placeDetail로 rerender 시 지도가 재초기화된다', async () => {
      const placeDetail1 = createMockPlaceDetail({
        location: { latitude: 37.5, longitude: 127.0 },
      });
      const placeDetail2 = createMockPlaceDetail({
        location: { latitude: 37.6, longitude: 127.1 },
      });

      const { rerender } = await act(async () => {
        return render(<PlaceMiniMap placeDetail={placeDetail1} />);
      });

      await waitFor(() => {
        expect(mockMapFn).toHaveBeenCalled();
      });

      mockMapFn.mockClear();

      await act(async () => {
        rerender(<PlaceMiniMap placeDetail={placeDetail2} />);
      });

      await waitFor(() => {
        expect(mockMapFn).toHaveBeenCalled();
      });
    });
  });
});
