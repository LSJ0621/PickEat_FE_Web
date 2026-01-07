import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { createMockRestaurant, createAuthenticatedState } from '@tests/factories';
import { RestaurantList } from '@/components/features/restaurant/RestaurantList';

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('RestaurantList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = '';
  });

  describe('렌더링 테스트', () => {
    it('기본 레이아웃이 렌더링된다', () => {
      renderWithProviders(
        <RestaurantList menuName="김치찌개" restaurants={[]} />
      );

      expect(screen.getByText('주변 식당 검색 결과')).toBeInTheDocument();
    });

    it('메뉴 이름이 표시된다', () => {
      renderWithProviders(
        <RestaurantList menuName="김치찌개" restaurants={[]} />
      );

      expect(screen.getByText('김치찌개 검색 결과')).toBeInTheDocument();
    });
  });

  describe('식당 목록 표시 테스트', () => {
    it('식당 목록이 표시된다', () => {
      const restaurants = [
        createMockRestaurant({ name: '김치찌개 전문점' }),
        createMockRestaurant({ name: '한식당' }),
      ];

      renderWithProviders(
        <RestaurantList menuName="김치찌개" restaurants={restaurants} />
      );

      expect(screen.getByText('김치찌개 전문점')).toBeInTheDocument();
      expect(screen.getByText('한식당')).toBeInTheDocument();
    });

    it('검색 결과 개수가 표시된다', () => {
      const restaurants = [
        createMockRestaurant({ name: '맛집 1' }),
        createMockRestaurant({ name: '맛집 2' }),
        createMockRestaurant({ name: '맛집 3' }),
      ];

      renderWithProviders(
        <RestaurantList menuName="김치찌개" restaurants={restaurants} />
      );

      expect(screen.getByText('김치찌개 검색 결과 (3개)')).toBeInTheDocument();
    });

    it('최대 5개까지만 표시된다', () => {
      const restaurants = Array.from({ length: 7 }, (_, i) =>
        createMockRestaurant({ name: `맛집 ${i + 1}` })
      );

      renderWithProviders(
        <RestaurantList menuName="김치찌개" restaurants={restaurants} />
      );

      expect(screen.getByText('맛집 1')).toBeInTheDocument();
      expect(screen.getByText('맛집 5')).toBeInTheDocument();
      expect(screen.queryByText('맛집 6')).not.toBeInTheDocument();
      expect(screen.queryByText('맛집 7')).not.toBeInTheDocument();
    });

    it('5개 초과시 더보기 버튼이 표시된다', () => {
      const restaurants = Array.from({ length: 6 }, (_, i) =>
        createMockRestaurant({ name: `맛집 ${i + 1}` })
      );

      renderWithProviders(
        <RestaurantList menuName="김치찌개" restaurants={restaurants} />
      );

      expect(screen.getByText('네이버 지도에서 더 많은 결과 확인하기')).toBeInTheDocument();
    });
  });

  describe('로딩 상태 테스트', () => {
    it('로딩 중일 때 스피너가 표시된다', () => {
      renderWithProviders(
        <RestaurantList menuName="김치찌개" restaurants={[]} loading={true} />
      );

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('로딩이 완료되면 스피너가 사라진다', () => {
      renderWithProviders(
        <RestaurantList menuName="김치찌개" restaurants={[]} loading={false} />
      );

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });
  });

  describe('빈 상태 테스트', () => {
    it('식당이 없을 때 빈 상태 메시지가 표시된다', () => {
      renderWithProviders(
        <RestaurantList menuName="김치찌개" restaurants={[]} />
      );

      expect(screen.getByText('주변에 해당 메뉴를 판매하는 식당이 없습니다.')).toBeInTheDocument();
    });
  });

  describe('닫기 버튼 테스트', () => {
    it('onClose가 제공되면 닫기 버튼이 표시된다', () => {
      const onClose = vi.fn();
      const restaurants = [createMockRestaurant()];

      renderWithProviders(
        <RestaurantList
          menuName="김치찌개"
          restaurants={restaurants}
          onClose={onClose}
        />
      );

      expect(screen.getByText('닫기')).toBeInTheDocument();
    });

    it('닫기 버튼 클릭 시 onClose가 호출된다', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const restaurants = [createMockRestaurant()];

      renderWithProviders(
        <RestaurantList
          menuName="김치찌개"
          restaurants={restaurants}
          onClose={onClose}
        />
      );

      await user.click(screen.getByText('닫기'));

      expect(onClose).toHaveBeenCalled();
    });

    it('빈 상태에서도 onClose가 제공되면 닫기 버튼이 표시된다', () => {
      const onClose = vi.fn();

      renderWithProviders(
        <RestaurantList
          menuName="김치찌개"
          restaurants={[]}
          onClose={onClose}
        />
      );

      expect(screen.getByText('닫기')).toBeInTheDocument();
    });
  });

  describe('네이버 지도 버튼 테스트', () => {
    it('더보기 버튼 클릭 시 네이버 지도로 이동한다', async () => {
      const user = userEvent.setup();
      const restaurants = Array.from({ length: 6 }, (_, i) =>
        createMockRestaurant({ name: `맛집 ${i + 1}` })
      );

      renderWithProviders(
        <RestaurantList menuName="김치찌개" restaurants={restaurants} />
      );

      await user.click(screen.getByText('네이버 지도에서 더 많은 결과 확인하기'));

      expect(mockLocation.href).toBe('https://map.naver.com/v5/search/%EA%B9%80%EC%B9%98%EC%B0%8C%EA%B0%9C');
    });
  });

  describe('헤더 버튼 테스트', () => {
    it('식당이 있을 때 지도 보기, 사이트 보기 버튼이 표시된다', () => {
      const restaurants = [createMockRestaurant()];

      renderWithProviders(
        <RestaurantList menuName="김치찌개" restaurants={restaurants} />
      );

      expect(screen.getByText('지도 보기')).toBeInTheDocument();
      expect(screen.getByText('사이트 보기')).toBeInTheDocument();
    });

    it('식당이 없을 때 헤더 버튼이 표시되지 않는다', () => {
      renderWithProviders(
        <RestaurantList menuName="김치찌개" restaurants={[]} />
      );

      expect(screen.queryByText('지도 보기')).not.toBeInTheDocument();
      expect(screen.queryByText('사이트 보기')).not.toBeInTheDocument();
    });
  });

  describe('주소 표시 테스트', () => {
    it('사용자 주소가 있으면 헤더에 표시된다', () => {
      const preloadedState = createAuthenticatedState({
        address: '서울시 강남구',
        latitude: 37.5,
        longitude: 127.0,
      });

      renderWithProviders(
        <RestaurantList menuName="김치찌개" restaurants={[]} />,
        { preloadedState }
      );

      expect(screen.getByText('서울시 강남구')).toBeInTheDocument();
    });
  });

  describe('지도 모달 테스트', () => {
    it('지도 보기 버튼 클릭 시 모달이 열린다', async () => {
      const user = userEvent.setup();
      const restaurants = [createMockRestaurant()];

      renderWithProviders(
        <RestaurantList menuName="김치찌개" restaurants={restaurants} />
      );

      await user.click(screen.getByText('지도 보기'));

      // 모달이 열리면 RestaurantMapModal 컴포넌트가 렌더링됨
      // 모달 내의 콘텐츠 확인
      await waitFor(() => {
        expect(screen.getByText('김치찌개 추천 매장')).toBeInTheDocument();
      });
    });
  });
});
