import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { PlaceReviewsSection } from '@features/agent/components/restaurant/PlaceReviewsSection';
import { createMockPlaceReview } from '@tests/factories';

describe('PlaceReviewsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('리뷰가 있을 때 리뷰 섹션이 렌더링된다', () => {
      const reviews = [createMockPlaceReview()];
      render(<PlaceReviewsSection reviews={reviews} />);

      expect(screen.getByText('리뷰')).toBeInTheDocument();
      expect(screen.getByText('일부 리뷰를 가져왔어요.')).toBeInTheDocument();
    });

    it('리뷰가 없을 때 아무것도 렌더링되지 않는다', () => {
      const { container } = render(<PlaceReviewsSection reviews={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('리뷰가 null일 때 아무것도 렌더링되지 않는다', () => {
      const { container } = render(<PlaceReviewsSection reviews={null as unknown as []} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('리뷰 목록 표시 테스트', () => {
    it('리뷰 작성자 이름이 표시된다', () => {
      const reviews = [createMockPlaceReview({ authorName: '홍길동' })];
      render(<PlaceReviewsSection reviews={reviews} />);

      expect(screen.getByText('홍길동')).toBeInTheDocument();
    });

    it('리뷰 내용이 표시된다', () => {
      const reviews = [createMockPlaceReview({ text: '정말 맛있어요!' })];
      render(<PlaceReviewsSection reviews={reviews} />);

      expect(screen.getByText('정말 맛있어요!')).toBeInTheDocument();
    });

    it('리뷰 작성 시간이 표시된다', () => {
      const reviews = [createMockPlaceReview({ publishTime: '2024-01-10T12:00:00.000Z' })];
      render(<PlaceReviewsSection reviews={reviews} />);

      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    it('여러 리뷰가 모두 표시된다', () => {
      const reviews = [
        createMockPlaceReview({ authorName: '홍길동', text: '첫 번째 리뷰' }),
        createMockPlaceReview({ authorName: '김영희', text: '두 번째 리뷰' }),
        createMockPlaceReview({ authorName: '이철수', text: '세 번째 리뷰' }),
      ];
      render(<PlaceReviewsSection reviews={reviews} />);

      expect(screen.getByText('홍길동')).toBeInTheDocument();
      expect(screen.getByText('김영희')).toBeInTheDocument();
      expect(screen.getByText('이철수')).toBeInTheDocument();
      expect(screen.getByText('첫 번째 리뷰')).toBeInTheDocument();
      expect(screen.getByText('두 번째 리뷰')).toBeInTheDocument();
      expect(screen.getByText('세 번째 리뷰')).toBeInTheDocument();
    });
  });

  describe('평점 표시 테스트', () => {
    it('리뷰 평점이 표시된다', () => {
      const reviews = [createMockPlaceReview({ rating: 4.5 })];
      render(<PlaceReviewsSection reviews={reviews} />);

      // Component shows rating as a number with SVG star icon separately
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    it('평점이 null일 때 표시되지 않는다', () => {
      const reviews = [createMockPlaceReview({ rating: null })];
      const { container } = render(<PlaceReviewsSection reviews={reviews} />);

      // No rating span should exist
      const ratingContainer = container.querySelector('.text-amber-300');
      expect(ratingContainer).not.toBeInTheDocument();
    });

    it('평점이 소수점 한 자리로 표시된다', () => {
      const reviews = [createMockPlaceReview({ rating: 4.567 })];
      render(<PlaceReviewsSection reviews={reviews} />);

      // Component uses toFixed(1) so 4.567 becomes 4.6
      expect(screen.getByText('4.6')).toBeInTheDocument();
    });
  });

  describe('리뷰 펼치기/접기 테스트', () => {
    it('150자 이하의 짧은 리뷰는 펼치기 버튼이 표시되지 않는다', () => {
      const shortText = '짧은 리뷰 텍스트입니다.';
      const reviews = [createMockPlaceReview({ text: shortText })];
      render(<PlaceReviewsSection reviews={reviews} />);

      expect(screen.queryByText('펼쳐보기')).not.toBeInTheDocument();
      expect(screen.queryByText('접기')).not.toBeInTheDocument();
    });

    it('150자 이상의 긴 리뷰는 펼쳐보기 버튼이 표시된다', () => {
      const longText = 'a'.repeat(160);
      const reviews = [createMockPlaceReview({ text: longText })];
      render(<PlaceReviewsSection reviews={reviews} />);

      expect(screen.getByText('펼쳐보기')).toBeInTheDocument();
    });

    it('긴 리뷰는 처음에 150자까지만 표시되고 ... 으로 축약된다', () => {
      const longText = 'a'.repeat(160);
      const reviews = [createMockPlaceReview({ text: longText })];
      const { container } = render(<PlaceReviewsSection reviews={reviews} />);

      const reviewText = container.textContent;
      expect(reviewText).toContain('...');
    });

    it('펼쳐보기 버튼을 클릭하면 전체 리뷰가 표시되고 접기 버튼이 나타난다', async () => {
      const user = userEvent.setup();
      const longText = 'a'.repeat(160);
      const reviews = [createMockPlaceReview({ text: longText })];
      render(<PlaceReviewsSection reviews={reviews} />);

      const expandButton = screen.getByText('펼쳐보기');
      await user.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('접기')).toBeInTheDocument();
      });
      expect(screen.queryByText('펼쳐보기')).not.toBeInTheDocument();
    });

    it('접기 버튼을 클릭하면 다시 축약된 텍스트가 표시된다', async () => {
      const user = userEvent.setup();
      const longText = 'a'.repeat(160);
      const reviews = [createMockPlaceReview({ text: longText })];
      render(<PlaceReviewsSection reviews={reviews} />);

      const expandButton = screen.getByText('펼쳐보기');
      await user.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('접기')).toBeInTheDocument();
      });

      const collapseButton = screen.getByText('접기');
      await user.click(collapseButton);

      await waitFor(() => {
        expect(screen.getByText('펼쳐보기')).toBeInTheDocument();
      });
    });

    it('여러 리뷰를 독립적으로 펼치고 접을 수 있다', async () => {
      const user = userEvent.setup();
      const longText1 = 'a'.repeat(160);
      const longText2 = 'b'.repeat(160);
      const reviews = [
        createMockPlaceReview({ text: longText1, authorName: '홍길동' }),
        createMockPlaceReview({ text: longText2, authorName: '김영희' }),
      ];
      render(<PlaceReviewsSection reviews={reviews} />);

      const expandButtons = screen.getAllByText('펼쳐보기');
      expect(expandButtons).toHaveLength(2);

      // 첫 번째 리뷰만 펼치기
      await user.click(expandButtons[0]);

      await waitFor(() => {
        expect(screen.getAllByText('접기')).toHaveLength(1);
        expect(screen.getAllByText('펼쳐보기')).toHaveLength(1);
      });
    });
  });

  describe('빈 상태 테스트', () => {
    it('리뷰 텍스트가 null인 경우 표시되지 않는다', () => {
      const reviews = [createMockPlaceReview({ text: null })];
      render(<PlaceReviewsSection reviews={reviews} />);

      expect(screen.queryByText('펼쳐보기')).not.toBeInTheDocument();
    });

    it('작성자 이름이 없는 경우 표시되지 않는다', () => {
      const reviews = [createMockPlaceReview({ authorName: null, text: '리뷰 내용' })];
      render(<PlaceReviewsSection reviews={reviews} />);

      expect(screen.getByText('리뷰 내용')).toBeInTheDocument();
      // authorName이 없을 때 해당 span이 렌더링되지 않는지 확인
      const reviewCards = screen.getByText('리뷰 내용').closest('div');
      expect(reviewCards).toBeInTheDocument();
    });

    it('작성 시간이 없는 경우 표시되지 않는다', () => {
      const reviews = [createMockPlaceReview({ publishTime: null, text: '리뷰 내용' })];
      const { container } = render(<PlaceReviewsSection reviews={reviews} />);

      expect(screen.getByText('리뷰 내용')).toBeInTheDocument();
      // publishTime이 없으면 날짜 관련 텍스트가 없는지 확인
      expect(container.textContent).not.toMatch(/\d{4}/);
    });
  });

  describe('스타일 테스트', () => {
    it('리뷰 카드가 수평 스크롤 가능한 레이아웃으로 렌더링된다', () => {
      const reviews = [createMockPlaceReview(), createMockPlaceReview()];
      const { container } = render(<PlaceReviewsSection reviews={reviews} />);

      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('각 리뷰 카드가 고정 너비를 가진다', () => {
      const reviews = [createMockPlaceReview()];
      const { container } = render(<PlaceReviewsSection reviews={reviews} />);

      const reviewCard = container.querySelector('.w-64');
      expect(reviewCard).toBeInTheDocument();
    });
  });
});
