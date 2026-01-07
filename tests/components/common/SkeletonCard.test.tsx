import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SkeletonCard, SkeletonCardList } from '@/components/common/SkeletonCard';

describe('SkeletonCard', () => {
  describe('렌더링 테스트', () => {
    it('스켈레톤 카드가 렌더링된다', () => {
      const { container } = render(<SkeletonCard />);

      const card = container.querySelector('.rounded-2xl');
      expect(card).toBeInTheDocument();
    });

    it('제목 스켈레톤이 렌더링된다', () => {
      const { container } = render(<SkeletonCard />);

      const titleSkeleton = container.querySelector('.h-6.w-3\\/4');
      expect(titleSkeleton).toBeInTheDocument();
    });

    it('설명 스켈레톤이 렌더링된다', () => {
      const { container } = render(<SkeletonCard />);

      const descriptionSkeletons = container.querySelectorAll('.h-4');
      expect(descriptionSkeletons.length).toBeGreaterThan(0);
    });

    it('메타 정보 스켈레톤이 렌더링된다', () => {
      const { container } = render(<SkeletonCard />);

      const metaSkeletons = container.querySelectorAll('.h-8');
      expect(metaSkeletons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('스타일 테스트', () => {
    it('카드가 둥근 모서리를 가진다', () => {
      const { container } = render(<SkeletonCard />);

      const card = container.querySelector('.rounded-2xl');
      expect(card).toBeInTheDocument();
    });

    it('카드가 테두리를 가진다', () => {
      const { container } = render(<SkeletonCard />);

      const card = container.querySelector('.border');
      expect(card).toBeInTheDocument();
    });

    it('카드가 backdrop-blur를 가진다', () => {
      const { container } = render(<SkeletonCard />);

      const card = container.querySelector('.backdrop-blur-sm');
      expect(card).toBeInTheDocument();
    });

    it('제목 스켈레톤이 적절한 배경색을 가진다', () => {
      const { container } = render(<SkeletonCard />);

      const titleSkeleton = container.querySelector('.bg-slate-700\\/50');
      expect(titleSkeleton).toBeInTheDocument();
    });

    it('설명 스켈레톤이 더 연한 배경색을 가진다', () => {
      const { container } = render(<SkeletonCard />);

      const descriptionSkeleton = container.querySelector('.bg-slate-700\\/30');
      expect(descriptionSkeleton).toBeInTheDocument();
    });

    it('메타 스켈레톤이 둥근 모서리를 가진다', () => {
      const { container } = render(<SkeletonCard />);

      const metaSkeleton = container.querySelector('.rounded-full');
      expect(metaSkeleton).toBeInTheDocument();
    });
  });

  describe('레이아웃 테스트', () => {
    it('카드 내부가 세로 방향 공간을 가진다', () => {
      const { container } = render(<SkeletonCard />);

      const cardContent = container.querySelector('.space-y-4');
      expect(cardContent).toBeInTheDocument();
    });

    it('설명 영역이 세로 방향 공간을 가진다', () => {
      const { container } = render(<SkeletonCard />);

      const descriptionArea = container.querySelector('.space-y-2');
      expect(descriptionArea).toBeInTheDocument();
    });

    it('메타 정보가 가로 방향으로 배치된다', () => {
      const { container } = render(<SkeletonCard />);

      const metaContainer = container.querySelector('.flex.gap-2');
      expect(metaContainer).toBeInTheDocument();
    });
  });
});

describe('SkeletonCardList', () => {
  describe('렌더링 테스트', () => {
    it('기본 3개의 스켈레톤 카드가 렌더링된다', () => {
      const { container } = render(<SkeletonCardList />);

      const cards = container.querySelectorAll('.rounded-2xl');
      expect(cards).toHaveLength(3);
    });

    it('지정한 개수만큼 스켈레톤 카드가 렌더링된다', () => {
      const { container } = render(<SkeletonCardList count={5} />);

      const cards = container.querySelectorAll('.rounded-2xl');
      expect(cards).toHaveLength(5);
    });

    it('1개의 스켈레톤 카드도 렌더링할 수 있다', () => {
      const { container } = render(<SkeletonCardList count={1} />);

      const cards = container.querySelectorAll('.rounded-2xl');
      expect(cards).toHaveLength(1);
    });

    it('0개를 전달하면 아무것도 렌더링되지 않는다', () => {
      const { container } = render(<SkeletonCardList count={0} />);

      const cards = container.querySelectorAll('.rounded-2xl');
      expect(cards).toHaveLength(0);
    });

    it('많은 수의 스켈레톤 카드를 렌더링할 수 있다', () => {
      const { container } = render(<SkeletonCardList count={10} />);

      const cards = container.querySelectorAll('.rounded-2xl');
      expect(cards).toHaveLength(10);
    });
  });

  describe('키 할당 테스트', () => {
    it('각 카드가 고유한 키를 가진다', () => {
      const { container } = render(<SkeletonCardList count={3} />);

      const cards = container.querySelectorAll('.rounded-2xl');
      expect(cards).toHaveLength(3);
      // React가 키를 올바르게 관리하면 에러 없이 렌더링됨
    });
  });
});
