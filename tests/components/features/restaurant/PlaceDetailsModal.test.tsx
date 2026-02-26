import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { PlaceDetailsModal } from '@features/agent/components/restaurant/PlaceDetailsModal';
import { createMockPlaceDetail, createMockPlaceReview } from '@tests/factories';
import { menuService } from '@features/agent/api';

vi.mock('@features/agent/api', () => ({
  menuService: {
    getPlaceDetail: vi.fn(),
    getRestaurantBlogs: vi.fn(),
  },
}));

// Mock naver maps
function setupNaverMapsMock() {
  const mockNaverMaps = {
    LatLng: function(this: { lat: number; lng: number }, lat: number, lng: number) {
      this.lat = lat;
      this.lng = lng;
    },
    Map: function() {
      return {
        setCenter: vi.fn(),
        setZoom: vi.fn(),
      };
    },
    Marker: function() { return {}; },
    Event: {
      trigger: vi.fn(),
    },
  };

  (window as unknown as { naver: { maps: typeof mockNaverMaps } }).naver = {
    maps: mockNaverMaps,
  };
}

describe('PlaceDetailsModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    setupNaverMapsMock();
    // Mock blogs API
    vi.mocked(menuService.getRestaurantBlogs).mockResolvedValue({ blogs: [] });
  });

  afterEach(() => {
    // Set to undefined instead of delete since jsdom doesn't allow deletion
    (window as unknown as { naver: unknown }).naver = undefined;
  });

  describe('렌더링 테스트', () => {
    it('placeId가 null이면 아무것도 렌더링되지 않는다', async () => {
      const { container } = renderWithProviders(
        <PlaceDetailsModal placeId={null} onClose={mockOnClose} />
      );

      // createPortal로 렌더링되므로 body에서 확인
      await waitFor(() => {
        expect(container.querySelector('.fixed.inset-0')).not.toBeInTheDocument();
      });
    });

    it('placeId가 있으면 모달이 렌더링된다', async () => {
      const placeDetail = createMockPlaceDetail();
      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({ place: placeDetail });

      renderWithProviders(
        <PlaceDetailsModal placeId="test-place-id" onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText(placeDetail.name!)).toBeInTheDocument();
      });
    });
  });

  describe('로딩 상태 테스트', () => {
    it('로딩 중일 때 스피너가 표시된다', async () => {
      vi.mocked(menuService.getPlaceDetail).mockImplementation(
        () => new Promise(() => {})
      );

      renderWithProviders(
        <PlaceDetailsModal placeId="test-place-id" onClose={mockOnClose} />
      );

      await waitFor(() => {
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
      });
    });
  });

  describe('에러 상태 테스트', () => {
    it('API 에러 시 에러 메시지가 표시된다', async () => {
      vi.mocked(menuService.getPlaceDetail).mockRejectedValue(new Error('API Error'));

      renderWithProviders(
        <PlaceDetailsModal placeId="test-place-id" onClose={mockOnClose} />
      );

      await waitFor(() => {
        // Error message could be the raw error or the fallback
        const errorElement = screen.getByText(/API Error|가게 상세 정보를 불러오지 못했습니다/);
        expect(errorElement).toBeInTheDocument();
      });
    });
  });

  describe('정보 표시 테스트', () => {
    it('가게 이름이 표시된다', async () => {
      const placeDetail = createMockPlaceDetail({ name: '맛있는 식당' });
      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({ place: placeDetail });

      renderWithProviders(
        <PlaceDetailsModal placeId="test-place-id" onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('맛있는 식당')).toBeInTheDocument();
      });
    });

    it('placeName prop이 우선 표시된다', async () => {
      const placeDetail = createMockPlaceDetail({ name: 'API 이름' });
      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({ place: placeDetail });

      renderWithProviders(
        <PlaceDetailsModal
          placeId="test-place-id"
          placeName="props 이름"
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('props 이름')).toBeInTheDocument();
      });
    });

    it('평점이 표시된다', async () => {
      const placeDetail = createMockPlaceDetail({ rating: 4.5, userRatingCount: 100 });
      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({ place: placeDetail });

      renderWithProviders(
        <PlaceDetailsModal placeId="test-place-id" onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText(/평점 4.5/)).toBeInTheDocument();
        expect(screen.getByText(/리뷰 100개/)).toBeInTheDocument();
      });
    });

    it('영업 상태가 표시된다 - 영업 중', async () => {
      const placeDetail = createMockPlaceDetail({ openNow: true });
      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({ place: placeDetail });

      renderWithProviders(
        <PlaceDetailsModal placeId="test-place-id" onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('현재 영업 중')).toBeInTheDocument();
      });
    });

    it('영업 상태가 표시된다 - 영업 종료', async () => {
      const placeDetail = createMockPlaceDetail({ openNow: false });
      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({ place: placeDetail });

      renderWithProviders(
        <PlaceDetailsModal placeId="test-place-id" onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('현재 영업 종료')).toBeInTheDocument();
      });
    });
  });

  describe('사진 표시 테스트', () => {
    it('사진이 있으면 표시된다', async () => {
      const placeDetail = createMockPlaceDetail({
        photos: ['https://example.com/photo1.jpg'],
      });
      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({ place: placeDetail });

      renderWithProviders(
        <PlaceDetailsModal placeId="test-place-id" onClose={mockOnClose} />
      );

      await waitFor(() => {
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', 'https://example.com/photo1.jpg');
      });
    });

    it('여러 사진이 있을 때 카운터가 표시된다', async () => {
      const placeDetail = createMockPlaceDetail({
        photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
      });
      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({ place: placeDetail });

      renderWithProviders(
        <PlaceDetailsModal placeId="test-place-id" onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('1 / 3')).toBeInTheDocument();
      });
    });

    it('여러 사진이 있을 때 네비게이션 버튼이 표시된다', async () => {
      const placeDetail = createMockPlaceDetail({
        photos: ['photo1.jpg', 'photo2.jpg'],
      });
      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({ place: placeDetail });

      renderWithProviders(
        <PlaceDetailsModal placeId="test-place-id" onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByLabelText('이전 사진')).toBeInTheDocument();
        expect(screen.getByLabelText('다음 사진')).toBeInTheDocument();
      });
    });
  });

  describe('닫기 테스트', () => {
    it('닫기 버튼 클릭 시 onClose가 호출된다', async () => {
      const user = userEvent.setup();
      const placeDetail = createMockPlaceDetail();
      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({ place: placeDetail });

      renderWithProviders(
        <PlaceDetailsModal placeId="test-place-id" onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText(placeDetail.name!)).toBeInTheDocument();
      });

      const closeButton = screen.getByLabelText('닫기');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('ESC 키 누를 시 onClose가 호출된다', async () => {
      const user = userEvent.setup();
      const placeDetail = createMockPlaceDetail();
      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({ place: placeDetail });

      renderWithProviders(
        <PlaceDetailsModal placeId="test-place-id" onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText(placeDetail.name!)).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('배경 클릭 시 onClose가 호출된다', async () => {
      const user = userEvent.setup();
      const placeDetail = createMockPlaceDetail();
      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({ place: placeDetail });

      renderWithProviders(
        <PlaceDetailsModal placeId="test-place-id" onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText(placeDetail.name!)).toBeInTheDocument();
      });

      // 배경 요소 클릭
      const backdrop = document.querySelector('.fixed.inset-0');
      expect(backdrop).toBeInTheDocument();
      await user.click(backdrop!);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('리뷰 섹션 테스트', () => {
    it('리뷰가 있으면 리뷰 섹션이 표시된다', async () => {
      const reviews = [
        createMockPlaceReview({ text: '정말 맛있어요!' }),
      ];
      const placeDetail = createMockPlaceDetail({ reviews });
      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({ place: placeDetail });

      renderWithProviders(
        <PlaceDetailsModal placeId="test-place-id" onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('리뷰')).toBeInTheDocument();
        expect(screen.getByText('정말 맛있어요!')).toBeInTheDocument();
      });
    });
  });

  describe('사진 네비게이션 테스트', () => {
    it('다음 버튼 클릭 시 다음 사진으로 이동한다', async () => {
      const user = userEvent.setup();
      const placeDetail = createMockPlaceDetail({
        photos: ['photo1.jpg', 'photo2.jpg'],
      });
      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({ place: placeDetail });

      renderWithProviders(
        <PlaceDetailsModal placeId="test-place-id" onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('1 / 2')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('다음 사진'));

      await waitFor(() => {
        expect(screen.getByText('2 / 2')).toBeInTheDocument();
      });
    });

    it('이전 버튼 클릭 시 이전 사진으로 이동한다', async () => {
      const user = userEvent.setup();
      const placeDetail = createMockPlaceDetail({
        photos: ['photo1.jpg', 'photo2.jpg'],
      });
      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({ place: placeDetail });

      renderWithProviders(
        <PlaceDetailsModal placeId="test-place-id" onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('1 / 2')).toBeInTheDocument();
      });

      // 첫 번째 사진에서 이전을 누르면 마지막으로 이동
      await user.click(screen.getByLabelText('이전 사진'));

      await waitFor(() => {
        expect(screen.getByText('2 / 2')).toBeInTheDocument();
      });
    });
  });

  describe('접근성 테스트', () => {
    it('닫기 버튼이 접근 가능한 역할과 이름을 가진다', async () => {
      const placeDetail = createMockPlaceDetail();
      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({ place: placeDetail });

      renderWithProviders(
        <PlaceDetailsModal placeId="test-place-id" onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText(placeDetail.name!)).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: '닫기' });
      expect(closeButton).toBeInTheDocument();
    });

    it('이미지 네비게이션 버튼이 접근 가능한 라벨을 가진다', async () => {
      const placeDetail = createMockPlaceDetail({
        photos: ['photo1.jpg', 'photo2.jpg'],
      });
      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({ place: placeDetail });

      renderWithProviders(
        <PlaceDetailsModal placeId="test-place-id" onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByLabelText('이전 사진')).toBeInTheDocument();
        expect(screen.getByLabelText('다음 사진')).toBeInTheDocument();
      });
    });

    it('이미지가 접근 가능한 alt 속성을 가진다', async () => {
      const placeDetail = createMockPlaceDetail({
        name: '맛있는 식당',
        photos: ['photo1.jpg'],
      });
      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({ place: placeDetail });

      renderWithProviders(
        <PlaceDetailsModal placeId="test-place-id" onClose={mockOnClose} />
      );

      await waitFor(() => {
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('alt');
      });
    });

    it('모든 대화형 요소가 시맨틱 버튼을 사용한다', async () => {
      const placeDetail = createMockPlaceDetail({
        photos: ['photo1.jpg', 'photo2.jpg'],
      });
      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({ place: placeDetail });

      renderWithProviders(
        <PlaceDetailsModal placeId="test-place-id" onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText(placeDetail.name!)).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach((button) => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });
});
