import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { PlaceMiniMap } from '@/components/features/restaurant/PlaceMiniMap';
import { createMockPlaceDetail } from '@tests/factories';

// Mock naver maps
const mockMapFn = vi.fn();
const mockMarkerFn = vi.fn();
const mockEventTrigger = vi.fn();

function setupNaverMapsMock() {
  const mockNaverMaps = {
    LatLng: function(this: { lat: number; lng: number }, lat: number, lng: number) {
      this.lat = lat;
      this.lng = lng;
    },
    Map: function(...args: unknown[]) {
      mockMapFn(...args);
      return {
        setCenter: vi.fn(),
        setZoom: vi.fn(),
      };
    },
    Marker: function(options: unknown) {
      mockMarkerFn(options);
      return {};
    },
    Event: {
      trigger: mockEventTrigger,
    },
  };

  (window as unknown as { naver: { maps: typeof mockNaverMaps } }).naver = {
    maps: mockNaverMaps,
  };
}

describe('PlaceMiniMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupNaverMapsMock();
  });

  afterEach(() => {
    // Set to undefined instead of delete since jsdom doesn't allow deletion
    (window as unknown as { naver: unknown }).naver = undefined;
  });

  describe('렌더링 테스트', () => {
    it('placeDetail이 null이면 아무것도 렌더링되지 않는다', () => {
      const { container } = render(
        <PlaceMiniMap
          placeDetail={null}
          naverClientId="test-client-id"
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('naverClientId가 없으면 아무것도 렌더링되지 않는다', () => {
      const placeDetail = createMockPlaceDetail();
      const { container } = render(
        <PlaceMiniMap
          placeDetail={placeDetail}
          naverClientId={undefined}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('placeDetail에 location이 없으면 아무것도 렌더링되지 않는다', () => {
      const placeDetail = createMockPlaceDetail({ location: null });
      const { container } = render(
        <PlaceMiniMap
          placeDetail={placeDetail}
          naverClientId="test-client-id"
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('유효한 props가 있으면 지도 섹션이 렌더링된다', () => {
      const placeDetail = createMockPlaceDetail();
      render(
        <PlaceMiniMap
          placeDetail={placeDetail}
          naverClientId="test-client-id"
        />
      );

      expect(screen.getByText('위치 정보')).toBeInTheDocument();
    });

    it('지도 안내 텍스트가 표시된다', () => {
      const placeDetail = createMockPlaceDetail();
      render(
        <PlaceMiniMap
          placeDetail={placeDetail}
          naverClientId="test-client-id"
        />
      );

      expect(screen.getByText('지도를 드래그해 주변 위치를 살펴볼 수 있습니다.')).toBeInTheDocument();
    });
  });

  describe('지도 초기화 테스트', () => {
    it('지도 컨테이너가 렌더링된다', async () => {
      const placeDetail = createMockPlaceDetail();
      await act(async () => {
        render(
          <PlaceMiniMap
            placeDetail={placeDetail}
            naverClientId="test-client-id"
          />
        );
      });

      const mapContainer = document.querySelector('.h-40.w-full');
      expect(mapContainer).toBeInTheDocument();
    });

    it('naver.maps.Map이 호출된다', async () => {
      const placeDetail = createMockPlaceDetail({
        location: { latitude: 37.5, longitude: 127.0 },
      });

      await act(async () => {
        render(
          <PlaceMiniMap
            placeDetail={placeDetail}
            naverClientId="test-client-id"
          />
        );
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
        render(
          <PlaceMiniMap
            placeDetail={placeDetail}
            naverClientId="test-client-id"
          />
        );
      });

      await waitFor(() => {
        expect(mockMarkerFn).toHaveBeenCalled();
      });
    });

    it('마커 title이 가게 이름으로 설정된다', async () => {
      const placeDetail = createMockPlaceDetail({
        name: '맛있는 식당',
        location: { latitude: 37.5, longitude: 127.0 },
      });

      await act(async () => {
        render(
          <PlaceMiniMap
            placeDetail={placeDetail}
            naverClientId="test-client-id"
          />
        );
      });

      await waitFor(() => {
        expect(mockMarkerFn).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '맛있는 식당',
          })
        );
      });
    });
  });

  describe('placeName prop 테스트', () => {
    it('placeDetail.name이 없으면 placeName이 사용된다', async () => {
      const placeDetail = createMockPlaceDetail({
        name: null,
        location: { latitude: 37.5, longitude: 127.0 },
      });

      await act(async () => {
        render(
          <PlaceMiniMap
            placeDetail={placeDetail}
            placeName="대체 이름"
            naverClientId="test-client-id"
          />
        );
      });

      await waitFor(() => {
        expect(mockMarkerFn).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '대체 이름',
          })
        );
      });
    });

    it('placeDetail.name과 placeName 모두 없으면 기본값이 사용된다', async () => {
      const placeDetail = createMockPlaceDetail({
        name: null,
        location: { latitude: 37.5, longitude: 127.0 },
      });

      await act(async () => {
        render(
          <PlaceMiniMap
            placeDetail={placeDetail}
            placeName={null}
            naverClientId="test-client-id"
          />
        );
      });

      await waitFor(() => {
        expect(mockMarkerFn).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '가게 위치',
          })
        );
      });
    });
  });

  describe('스타일 테스트', () => {
    it('지도 컨테이너가 올바른 스타일을 가진다', () => {
      const placeDetail = createMockPlaceDetail();
      const { container } = render(
        <PlaceMiniMap
          placeDetail={placeDetail}
          naverClientId="test-client-id"
        />
      );

      const mapContainer = container.querySelector('.rounded-xl.border');
      expect(mapContainer).toBeInTheDocument();
    });

    it('제목이 올바른 스타일을 가진다', () => {
      const placeDetail = createMockPlaceDetail();
      render(
        <PlaceMiniMap
          placeDetail={placeDetail}
          naverClientId="test-client-id"
        />
      );

      const title = screen.getByText('위치 정보');
      expect(title).toHaveClass('text-sm');
      expect(title).toHaveClass('font-semibold');
    });
  });

  describe('스크립트 로드 에러 처리', () => {
    beforeEach(() => {
      // Clear naver object for error scenarios
      (window as unknown as { naver: unknown }).naver = undefined;
      // Remove any existing script
      const existingScript = document.getElementById('naver-map-sdk');
      if (existingScript) {
        existingScript.remove();
      }
    });

    it('스크립트 로드 실패 시 에러를 무시한다', async () => {
      const placeDetail = createMockPlaceDetail({
        location: { latitude: 37.5, longitude: 127.0 },
      });

      // Don't throw error, component should handle gracefully
      await act(async () => {
        render(
          <PlaceMiniMap
            placeDetail={placeDetail}
            naverClientId="test-client-id"
          />
        );
      });

      // Component should still render
      expect(screen.getByText('위치 정보')).toBeInTheDocument();
    });

    it('스크립트 로드 타임아웃 시 에러를 무시한다', async () => {
      vi.useFakeTimers();

      const placeDetail = createMockPlaceDetail({
        location: { latitude: 37.5, longitude: 127.0 },
      });

      // Create script element but don't set window.naver
      const script = document.createElement('script');
      script.id = 'naver-map-sdk';
      document.head.appendChild(script);

      await act(async () => {
        render(
          <PlaceMiniMap
            placeDetail={placeDetail}
            naverClientId="test-client-id"
          />
        );

        // Fast-forward past timeout (50 checks * 100ms = 5000ms)
        vi.advanceTimersByTime(5100);
      });

      // Component should still render despite timeout
      expect(screen.getByText('위치 정보')).toBeInTheDocument();

      vi.useRealTimers();
    });

    it('새로 생성된 스크립트 로드 실패 시 에러 이벤트 처리', async () => {
      vi.useFakeTimers();

      const placeDetail = createMockPlaceDetail({
        location: { latitude: 37.5, longitude: 127.0 },
      });

      // Mock appendChild to trigger error event on script
      const originalAppendChild = document.head.appendChild.bind(document.head);
      document.head.appendChild = vi.fn((node: Node) => {
        const result = originalAppendChild(node);
        const script = node as HTMLScriptElement;
        if (script.id === 'naver-map-sdk') {
          // Trigger error event asynchronously
          setTimeout(() => {
            const errorEvent = new Event('error');
            script.dispatchEvent(errorEvent);
          }, 10);
        }
        return result;
      }) as typeof document.head.appendChild;

      await act(async () => {
        render(
          <PlaceMiniMap
            placeDetail={placeDetail}
            naverClientId="test-client-id"
          />
        );
      });

      // Advance timers to trigger the error event
      await act(async () => {
        vi.advanceTimersByTime(20);
      });

      // Component should still render (error caught in catch block)
      expect(screen.getByText('위치 정보')).toBeInTheDocument();

      document.head.appendChild = originalAppendChild;
      vi.useRealTimers();
    });
  });

  describe('ResizeEvent 트리거', () => {
    it('지도 초기화 후 resize 이벤트가 트리거 된다', async () => {
      const placeDetail = createMockPlaceDetail({
        location: { latitude: 37.5, longitude: 127.0 },
      });

      await act(async () => {
        render(
          <PlaceMiniMap
            placeDetail={placeDetail}
            naverClientId="test-client-id"
          />
        );
      });

      // Wait for map initialization
      await waitFor(() => {
        expect(mockMapFn).toHaveBeenCalled();
      });

      // Wait for resize event (with timeout for the 200ms setTimeout)
      await waitFor(
        () => {
          expect(mockEventTrigger).toHaveBeenCalled();
        },
        { timeout: 500 }
      );
    });

    it('resize 이벤트는 map 객체와 resize 문자열로 호출된다', async () => {
      const placeDetail = createMockPlaceDetail({
        location: { latitude: 37.5, longitude: 127.0 },
      });

      await act(async () => {
        render(
          <PlaceMiniMap
            placeDetail={placeDetail}
            naverClientId="test-client-id"
          />
        );
      });

      await waitFor(() => {
        expect(mockMapFn).toHaveBeenCalled();
      });

      await waitFor(
        () => {
          // Event.trigger should be called with map object and 'resize'
          expect(mockEventTrigger).toHaveBeenCalledWith(
            expect.anything(), // map object
            'resize'
          );
        },
        { timeout: 500 }
      );
    });
  });

  describe('Polling 메커니즘', () => {
    it('기존 스크립트가 있으면 polling으로 window.naver를 확인한다', async () => {
      // Create script
      const script = document.createElement('script');
      script.id = 'naver-map-sdk';
      document.head.appendChild(script);

      const placeDetail = createMockPlaceDetail({
        location: { latitude: 37.5, longitude: 127.0 },
      });

      await act(async () => {
        render(
          <PlaceMiniMap
            placeDetail={placeDetail}
            naverClientId="test-client-id"
          />
        );
      });

      // window.naver is already set in beforeEach via setupNaverMapsMock
      // Map should be initialized even with existing script
      await waitFor(() => {
        expect(mockMapFn).toHaveBeenCalled();
      });
    });

    it('폴링 타임아웃 시 에러를 무시한다', async () => {
      vi.useFakeTimers();

      // Clear naver object
      (window as unknown as { naver: unknown }).naver = undefined;

      // Remove existing script
      const existingScript = document.getElementById('naver-map-sdk');
      if (existingScript) {
        existingScript.remove();
      }

      const placeDetail = createMockPlaceDetail({
        location: { latitude: 37.5, longitude: 127.0 },
      });

      await act(async () => {
        render(
          <PlaceMiniMap
            placeDetail={placeDetail}
            naverClientId="test-client-id"
          />
        );

        // Fast-forward past polling timeout (50 checks * 100ms = 5000ms)
        vi.advanceTimersByTime(5100);
      });

      // Component should still render despite timeout
      expect(screen.getByText('위치 정보')).toBeInTheDocument();

      vi.useRealTimers();
    });

    it('폴링 50회 후 Promise가 reject되고 에러가 무시된다', async () => {
      vi.useFakeTimers();

      // Clear naver to force polling path
      (window as unknown as { naver: unknown }).naver = undefined;

      // Remove any existing script first
      const existingScript = document.getElementById('naver-map-sdk');
      if (existingScript) {
        existingScript.remove();
      }

      // Create existing script to trigger polling branch (not new script creation)
      const script = document.createElement('script');
      script.id = 'naver-map-sdk';
      document.head.appendChild(script);

      const placeDetail = createMockPlaceDetail({
        location: { latitude: 37.5, longitude: 127.0 },
      });

      await act(async () => {
        render(
          <PlaceMiniMap
            placeDetail={placeDetail}
            naverClientId="test-client-id"
          />
        );
      });

      // Advance timers to trigger all 50 polling checks
      for (let i = 0; i < 51; i++) {
        await act(async () => {
          vi.advanceTimersByTime(100);
        });
      }

      // Component should still be rendered (error is caught and ignored)
      expect(screen.getByText('위치 정보')).toBeInTheDocument();

      vi.useRealTimers();
    });
  });

  describe('지도 초기화 에러 처리', () => {
    it('지도 초기화 중 에러 발생 시 처리한다', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock Map constructor to throw error
      const mockNaverMaps = {
        LatLng: function(this: { lat: number; lng: number }, lat: number, lng: number) {
          this.lat = lat;
          this.lng = lng;
        },
        Map: function() {
          throw new Error('Map initialization failed');
        },
        Marker: function() {
          return {};
        },
        Event: {
          trigger: vi.fn(),
        },
      };

      (window as unknown as { naver: { maps: typeof mockNaverMaps } }).naver = {
        maps: mockNaverMaps,
      };

      const placeDetail = createMockPlaceDetail({
        location: { latitude: 37.5, longitude: 127.0 },
      });

      await act(async () => {
        render(
          <PlaceMiniMap
            placeDetail={placeDetail}
            naverClientId="test-client-id"
          />
        );
      });

      // Component should still render
      expect(screen.getByText('위치 정보')).toBeInTheDocument();

      consoleSpy.mockRestore();
      setupNaverMapsMock();
    });
  });

  describe('executionId 변경 처리', () => {
    it('executionId 변경 시 이전 실행을 취소한다', async () => {
      const placeDetail1 = createMockPlaceDetail({
        location: { latitude: 37.5, longitude: 127.0 },
      });
      const placeDetail2 = createMockPlaceDetail({
        location: { latitude: 37.6, longitude: 127.1 },
      });

      const { rerender } = await act(async () => {
        return render(
          <PlaceMiniMap
            placeDetail={placeDetail1}
            naverClientId="test-client-id"
          />
        );
      });

      await waitFor(() => {
        expect(mockMapFn).toHaveBeenCalled();
      });

      // Clear mock calls
      mockMapFn.mockClear();

      // Change placeDetail to trigger new execution
      await act(async () => {
        rerender(
          <PlaceMiniMap
            placeDetail={placeDetail2}
            naverClientId="test-client-id"
          />
        );
      });

      await waitFor(() => {
        expect(mockMapFn).toHaveBeenCalled();
      });
    });

    it('loadScript 완료 후 executionId가 변경되면 조기 반환', async () => {
      vi.useFakeTimers();

      // Clear naver and remove existing script to force script creation
      (window as unknown as { naver: unknown }).naver = undefined;
      const existingScript = document.getElementById('naver-map-sdk');
      if (existingScript) {
        existingScript.remove();
      }

      // Track script load callback
      let scriptLoadCallback: (() => void) | null = null;
      const originalAppendChild = document.head.appendChild.bind(document.head);
      document.head.appendChild = vi.fn((node: Node) => {
        const result = originalAppendChild(node);
        const script = node as HTMLScriptElement;
        if (script.id === 'naver-map-sdk') {
          // Capture the load callback to trigger it later
          const originalAddEventListener = script.addEventListener.bind(script);
          script.addEventListener = ((type: string, listener: EventListener) => {
            if (type === 'load') {
              scriptLoadCallback = listener as () => void;
            }
            return originalAddEventListener(type, listener);
          }) as typeof script.addEventListener;
        }
        return result;
      }) as typeof document.head.appendChild;

      const placeDetail1 = createMockPlaceDetail({
        location: { latitude: 37.5, longitude: 127.0 },
      });
      const placeDetail2 = createMockPlaceDetail({
        location: { latitude: 37.6, longitude: 127.1 },
      });

      mockMapFn.mockClear();

      const { rerender } = await act(async () => {
        return render(
          <PlaceMiniMap
            placeDetail={placeDetail1}
            naverClientId="test-client-id"
          />
        );
      });

      // Rerender with different props before script loads - this changes executionId
      await act(async () => {
        rerender(
          <PlaceMiniMap
            placeDetail={placeDetail2}
            naverClientId="test-client-id"
          />
        );
      });

      // Now trigger the script load callback for the first execution
      if (scriptLoadCallback) {
        setupNaverMapsMock();
        await act(async () => {
          scriptLoadCallback!();
        });
      }

      // Advance timers
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      // The map should be called for the new execution, not the old one
      expect(screen.getByText('위치 정보')).toBeInTheDocument();

      document.head.appendChild = originalAppendChild;
      vi.useRealTimers();
    });
  });

  describe('placeDetail.location null 조기 반환', () => {
    it('placeDetail.location이 null이면 조기 반환한다', () => {
      const placeDetail = createMockPlaceDetail({ location: null });
      const { container } = render(
        <PlaceMiniMap
          placeDetail={placeDetail}
          naverClientId="test-client-id"
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('loadScript 후 null 체크', () => {
    it('loadScript 성공 후 window.naver.maps가 없으면 조기 반환', async () => {
      vi.useFakeTimers();

      // Clear naver and remove existing script
      (window as unknown as { naver: unknown }).naver = undefined;
      const existingScript = document.getElementById('naver-map-sdk');
      if (existingScript) {
        existingScript.remove();
      }

      // Mock appendChild to trigger load event but NOT set window.naver.maps
      const originalAppendChild = document.head.appendChild.bind(document.head);
      document.head.appendChild = vi.fn((node: Node) => {
        const result = originalAppendChild(node);
        const script = node as HTMLScriptElement;
        if (script.id === 'naver-map-sdk') {
          // Trigger load event but don't set window.naver.maps
          setTimeout(() => {
            script.dispatchEvent(new Event('load'));
          }, 10);
        }
        return result;
      }) as typeof document.head.appendChild;

      mockMapFn.mockClear();

      const placeDetail = createMockPlaceDetail({
        location: { latitude: 37.5, longitude: 127.0 },
      });

      await act(async () => {
        render(
          <PlaceMiniMap
            placeDetail={placeDetail}
            naverClientId="test-client-id"
          />
        );
      });

      // Advance timers to trigger the load event
      await act(async () => {
        vi.advanceTimersByTime(50);
      });

      // Map should NOT be called since naver.maps is not set
      expect(mockMapFn).not.toHaveBeenCalled();

      // Component should still render
      expect(screen.getByText('위치 정보')).toBeInTheDocument();

      document.head.appendChild = originalAppendChild;
      vi.useRealTimers();
    });

    it('initMiniMap 내부에서 LatLng 생성 중 에러 발생 시 catch 블록에서 처리', async () => {
      const mockNaverMapsWithError = {
        LatLng: function() {
          throw new Error('LatLng initialization failed');
        },
        Map: mockMapFn,
        Marker: mockMarkerFn,
        Event: {
          trigger: mockEventTrigger,
        },
      };

      (window as unknown as { naver: { maps: typeof mockNaverMapsWithError } }).naver = {
        maps: mockNaverMapsWithError,
      };

      const placeDetail = createMockPlaceDetail({
        location: { latitude: 37.5, longitude: 127.0 },
      });

      // Should not throw
      await act(async () => {
        render(
          <PlaceMiniMap
            placeDetail={placeDetail}
            naverClientId="test-client-id"
          />
        );
      });

      // Component should still render
      expect(screen.getByText('위치 정보')).toBeInTheDocument();

      // Restore
      setupNaverMapsMock();
    });
  });

  describe('StrictMode 대응 테스트', () => {
    it('동일한 placeDetail과 naverClientId로 rerender 시 스킵', async () => {
      const placeDetail = createMockPlaceDetail({
        location: { latitude: 37.5, longitude: 127.0 },
      });

      const { rerender } = await act(async () => {
        return render(
          <PlaceMiniMap
            placeDetail={placeDetail}
            naverClientId="test-client-id"
          />
        );
      });

      await waitFor(() => {
        expect(mockMapFn).toHaveBeenCalled();
      });

      // Clear mock calls
      mockMapFn.mockClear();

      // Rerender with SAME placeDetail and naverClientId
      await act(async () => {
        rerender(
          <PlaceMiniMap
            placeDetail={placeDetail}
            naverClientId="test-client-id"
          />
        );
      });

      // Map should NOT be called again since props haven't changed
      expect(mockMapFn).not.toHaveBeenCalled();
    });
  });

  describe('폴링 중 naver가 로드되는 경우', () => {
    it('폴링 중 naver.maps가 로드되면 성공적으로 초기화', async () => {
      vi.useFakeTimers();

      // Clear naver initially
      (window as unknown as { naver: unknown }).naver = undefined;

      // Remove any existing script first
      const existingScript = document.getElementById('naver-map-sdk');
      if (existingScript) {
        existingScript.remove();
      }

      // Create existing script to trigger polling branch
      const script = document.createElement('script');
      script.id = 'naver-map-sdk';
      document.head.appendChild(script);

      const placeDetail = createMockPlaceDetail({
        location: { latitude: 37.5, longitude: 127.0 },
      });

      mockMapFn.mockClear();

      await act(async () => {
        render(
          <PlaceMiniMap
            placeDetail={placeDetail}
            naverClientId="test-client-id"
          />
        );
      });

      // After a few polling cycles, set naver.maps
      await act(async () => {
        vi.advanceTimersByTime(200); // 2 polling cycles
      });

      // Set up naver.maps
      setupNaverMapsMock();

      // One more polling cycle to detect it
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Wait for the resize setTimeout (200ms)
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      // Map should be called after naver.maps becomes available
      expect(mockMapFn).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });
});
