import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMockRestaurant } from '@tests/factories';
import { RestaurantListItem } from '@/components/features/restaurant/RestaurantListItem';

describe('RestaurantListItem', () => {
  describe('렌더링 테스트', () => {
    it('식당 이름이 렌더링된다', () => {
      const restaurant = createMockRestaurant({ name: '맛있는 식당' });
      render(<RestaurantListItem restaurant={restaurant} index={0} />);

      expect(screen.getByText('맛있는 식당')).toBeInTheDocument();
    });

    it('식당 주소가 렌더링된다', () => {
      const restaurant = createMockRestaurant({ roadAddress: '서울시 강남구 테헤란로 456' });
      render(<RestaurantListItem restaurant={restaurant} index={0} />);

      expect(screen.getByText(/서울시 강남구 테헤란로 456/)).toBeInTheDocument();
    });
  });

  describe('주소 표시 테스트', () => {
    it('roadAddress가 있으면 roadAddress가 표시된다', () => {
      const restaurant = createMockRestaurant({
        roadAddress: '도로명 주소',
        address: '지번 주소',
      });
      render(<RestaurantListItem restaurant={restaurant} index={0} />);

      expect(screen.getByText(/도로명 주소/)).toBeInTheDocument();
      expect(screen.queryByText(/지번 주소/)).not.toBeInTheDocument();
    });

    it('roadAddress가 없으면 address가 표시된다', () => {
      const restaurant = createMockRestaurant({
        roadAddress: undefined,
        address: '지번 주소입니다',
      });
      render(<RestaurantListItem restaurant={restaurant} index={0} />);

      expect(screen.getByText(/지번 주소입니다/)).toBeInTheDocument();
    });
  });

  describe('거리 표시 테스트', () => {
    it('거리 정보가 있으면 거리가 표시된다', () => {
      const restaurant = createMockRestaurant({ distance: 1.5 });
      render(<RestaurantListItem restaurant={restaurant} index={0} />);

      expect(screen.getByText('거리 1.5km')).toBeInTheDocument();
    });

    it('거리가 소수점으로 표시된다', () => {
      const restaurant = createMockRestaurant({ distance: 2.345 });
      render(<RestaurantListItem restaurant={restaurant} index={0} />);

      expect(screen.getByText('거리 2.3km')).toBeInTheDocument();
    });

    it('거리 정보가 없으면 거리 표시가 없다', () => {
      const restaurant = createMockRestaurant({ distance: undefined });
      render(<RestaurantListItem restaurant={restaurant} index={0} />);

      expect(screen.queryByText(/거리/)).not.toBeInTheDocument();
    });
  });

  describe('전화번호 표시 테스트', () => {
    it('전화번호가 있으면 전화번호가 표시된다', () => {
      const restaurant = createMockRestaurant({ phone: '02-9876-5432' });
      render(<RestaurantListItem restaurant={restaurant} index={0} />);

      expect(screen.getByText(/02-9876-5432/)).toBeInTheDocument();
    });

    it('전화번호가 없으면 전화번호 표시가 없다', () => {
      const restaurant = createMockRestaurant({ phone: undefined });
      render(<RestaurantListItem restaurant={restaurant} index={0} />);

      // 전화 아이콘도 표시되지 않아야 함
      expect(screen.queryByText(/📞/)).not.toBeInTheDocument();
    });
  });

  describe('스타일 테스트', () => {
    it('카드에 올바른 스타일 클래스가 적용된다', () => {
      const restaurant = createMockRestaurant();
      const { container } = render(<RestaurantListItem restaurant={restaurant} index={0} />);

      const card = container.firstChild;
      expect(card).toHaveClass('rounded-3xl');
      expect(card).toHaveClass('border');
    });

    it('식당 이름에 올바른 스타일이 적용된다', () => {
      const restaurant = createMockRestaurant({ name: '테스트 식당' });
      render(<RestaurantListItem restaurant={restaurant} index={0} />);

      const name = screen.getByText('테스트 식당');
      expect(name).toHaveClass('text-xl');
      expect(name).toHaveClass('font-bold');
      expect(name).toHaveClass('text-white');
    });
  });

  describe('메타 정보 배지 테스트', () => {
    it('거리와 전화번호 모두 있으면 두 배지가 표시된다', () => {
      const restaurant = createMockRestaurant({
        distance: 0.8,
        phone: '02-1111-2222',
      });
      const { container } = render(<RestaurantListItem restaurant={restaurant} index={0} />);

      const badges = container.querySelectorAll('.rounded-full.border');
      expect(badges).toHaveLength(2);
    });

    it('거리만 있으면 하나의 배지만 표시된다', () => {
      const restaurant = createMockRestaurant({
        distance: 0.8,
        phone: undefined,
      });
      const { container } = render(<RestaurantListItem restaurant={restaurant} index={0} />);

      const badges = container.querySelectorAll('.rounded-full.border');
      expect(badges).toHaveLength(1);
    });

    it('전화번호만 있으면 하나의 배지만 표시된다', () => {
      const restaurant = createMockRestaurant({
        distance: undefined,
        phone: '02-3333-4444',
      });
      const { container } = render(<RestaurantListItem restaurant={restaurant} index={0} />);

      const badges = container.querySelectorAll('.rounded-full.border');
      expect(badges).toHaveLength(1);
    });

    it('둘 다 없으면 배지가 표시되지 않는다', () => {
      const restaurant = createMockRestaurant({
        distance: undefined,
        phone: undefined,
      });
      const { container } = render(<RestaurantListItem restaurant={restaurant} index={0} />);

      const badgeContainer = container.querySelector('.flex.flex-wrap.gap-3');
      expect(badgeContainer?.children).toHaveLength(0);
    });
  });

  describe('인덱스 테스트', () => {
    it('다른 인덱스로 렌더링해도 정상 동작한다', () => {
      const restaurant = createMockRestaurant({ name: '테스트 식당' });

      const { rerender } = render(<RestaurantListItem restaurant={restaurant} index={0} />);
      expect(screen.getByText('테스트 식당')).toBeInTheDocument();

      rerender(<RestaurantListItem restaurant={restaurant} index={5} />);
      expect(screen.getByText('테스트 식당')).toBeInTheDocument();
    });
  });
});
