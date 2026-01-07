import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { RestaurantListHeader } from '@/components/features/restaurant/RestaurantListHeader';

describe('RestaurantListHeader', () => {
  const mockOnOpenMapModal = vi.fn();
  const mockOnOpenNaverMap = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('기본 헤더 정보가 렌더링된다', () => {
      renderWithProviders(
        <RestaurantListHeader
          hasRestaurants={false}
          onOpenMapModal={mockOnOpenMapModal}
          onOpenNaverMap={mockOnOpenNaverMap}
        />
      );

      expect(screen.getByText('Nearby Restaurants')).toBeInTheDocument();
      expect(screen.getByText('주변 식당 검색 결과')).toBeInTheDocument();
    });

    it('주소가 제공되면 주소가 표시된다', () => {
      renderWithProviders(
        <RestaurantListHeader
          address="서울시 강남구 테헤란로 123"
          hasRestaurants={false}
          onOpenMapModal={mockOnOpenMapModal}
          onOpenNaverMap={mockOnOpenNaverMap}
        />
      );

      expect(screen.getByText('서울시 강남구 테헤란로 123')).toBeInTheDocument();
    });

    it('주소가 없으면 주소 영역이 표시되지 않는다', () => {
      renderWithProviders(
        <RestaurantListHeader
          hasRestaurants={false}
          onOpenMapModal={mockOnOpenMapModal}
          onOpenNaverMap={mockOnOpenNaverMap}
        />
      );

      // 주소 관련 스타일 확인 - hidden 클래스가 적용된 span이 없어야 함
      const addressBadge = document.querySelector('.rounded-full.border.border-white\\/15');
      expect(addressBadge).not.toBeInTheDocument();
    });
  });

  describe('버튼 렌더링 테스트', () => {
    it('식당이 있을 때 지도 보기 버튼이 표시된다', () => {
      renderWithProviders(
        <RestaurantListHeader
          hasRestaurants={true}
          onOpenMapModal={mockOnOpenMapModal}
          onOpenNaverMap={mockOnOpenNaverMap}
        />
      );

      expect(screen.getByText('지도 보기')).toBeInTheDocument();
    });

    it('식당이 있을 때 사이트 보기 버튼이 표시된다', () => {
      renderWithProviders(
        <RestaurantListHeader
          hasRestaurants={true}
          onOpenMapModal={mockOnOpenMapModal}
          onOpenNaverMap={mockOnOpenNaverMap}
        />
      );

      expect(screen.getByText('사이트 보기')).toBeInTheDocument();
    });

    it('식당이 없으면 버튼들이 표시되지 않는다', () => {
      renderWithProviders(
        <RestaurantListHeader
          hasRestaurants={false}
          onOpenMapModal={mockOnOpenMapModal}
          onOpenNaverMap={mockOnOpenNaverMap}
        />
      );

      expect(screen.queryByText('지도 보기')).not.toBeInTheDocument();
      expect(screen.queryByText('사이트 보기')).not.toBeInTheDocument();
    });
  });

  describe('버튼 클릭 핸들러 테스트', () => {
    it('지도 보기 버튼 클릭 시 onOpenMapModal이 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <RestaurantListHeader
          hasRestaurants={true}
          onOpenMapModal={mockOnOpenMapModal}
          onOpenNaverMap={mockOnOpenNaverMap}
        />
      );

      await user.click(screen.getByText('지도 보기'));

      expect(mockOnOpenMapModal).toHaveBeenCalledTimes(1);
    });

    it('사이트 보기 버튼 클릭 시 onOpenNaverMap이 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <RestaurantListHeader
          hasRestaurants={true}
          onOpenMapModal={mockOnOpenMapModal}
          onOpenNaverMap={mockOnOpenNaverMap}
        />
      );

      await user.click(screen.getByText('사이트 보기'));

      expect(mockOnOpenNaverMap).toHaveBeenCalledTimes(1);
    });
  });

  describe('스타일 테스트', () => {
    it('주소 배지가 올바른 스타일을 가진다', () => {
      renderWithProviders(
        <RestaurantListHeader
          address="서울시 강남구"
          hasRestaurants={false}
          onOpenMapModal={mockOnOpenMapModal}
          onOpenNaverMap={mockOnOpenNaverMap}
        />
      );

      const addressBadge = screen.getByText('서울시 강남구');
      expect(addressBadge).toHaveClass('rounded-full');
      expect(addressBadge).toHaveClass('text-xs');
    });
  });
});
