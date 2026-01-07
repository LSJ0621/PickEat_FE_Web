import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { createMockRecommendationGroup, createMockPlaceRecommendationItem } from '@tests/factories';
import { AiPlaceRecommendations } from '@/components/features/restaurant/AiPlaceRecommendations';

describe('AiPlaceRecommendations', () => {
  const mockOnSelect = vi.fn();
  const mockOnReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('기본 헤더가 렌더링된다', () => {
      renderWithProviders(
        <AiPlaceRecommendations
          activeMenuName={null}
          recommendations={[]}
          loadingMenuName={null}
          onSelect={mockOnSelect}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('AI Places')).toBeInTheDocument();
      expect(screen.getByText('AI 추천 식당')).toBeInTheDocument();
    });

    it('추천이 없을 때 빈 상태 메시지가 표시된다', () => {
      renderWithProviders(
        <AiPlaceRecommendations
          activeMenuName={null}
          recommendations={[]}
          loadingMenuName={null}
          onSelect={mockOnSelect}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('아직 추천 결과가 없습니다. AI 추천을 실행해보세요.')).toBeInTheDocument();
    });
  });

  describe('추천 목록 표시 테스트', () => {
    it('추천 그룹이 표시된다', () => {
      const recommendations = [
        createMockRecommendationGroup('김치찌개'),
        createMockRecommendationGroup('불고기'),
      ];

      renderWithProviders(
        <AiPlaceRecommendations
          activeMenuName={null}
          recommendations={recommendations}
          loadingMenuName={null}
          onSelect={mockOnSelect}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('김치찌개')).toBeInTheDocument();
      expect(screen.getByText('불고기')).toBeInTheDocument();
    });

    it('추천 개수가 배지로 표시된다', () => {
      const recommendations = [
        createMockRecommendationGroup('김치찌개', 3),
      ];

      renderWithProviders(
        <AiPlaceRecommendations
          activeMenuName={null}
          recommendations={recommendations}
          loadingMenuName={null}
          onSelect={mockOnSelect}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('추천이 있으면 초기화 버튼이 표시된다', () => {
      const recommendations = [createMockRecommendationGroup('김치찌개')];

      renderWithProviders(
        <AiPlaceRecommendations
          activeMenuName={null}
          recommendations={recommendations}
          loadingMenuName={null}
          onSelect={mockOnSelect}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('초기화')).toBeInTheDocument();
    });

    it('추천이 없으면 초기화 버튼이 표시되지 않는다', () => {
      renderWithProviders(
        <AiPlaceRecommendations
          activeMenuName={null}
          recommendations={[]}
          loadingMenuName={null}
          onSelect={mockOnSelect}
          onReset={mockOnReset}
        />
      );

      expect(screen.queryByText('초기화')).not.toBeInTheDocument();
    });
  });

  describe('로딩 상태 테스트', () => {
    it('로딩 중일 때 로딩 UI가 표시된다', () => {
      renderWithProviders(
        <AiPlaceRecommendations
          activeMenuName={null}
          recommendations={[]}
          loadingMenuName="비빔밥"
          onSelect={mockOnSelect}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('비빔밥')).toBeInTheDocument();
      expect(screen.getByText('AI가 가게를 찾는 중입니다...')).toBeInTheDocument();
    });

    it('로딩 중일 때 스피너가 표시된다', () => {
      renderWithProviders(
        <AiPlaceRecommendations
          activeMenuName={null}
          recommendations={[]}
          loadingMenuName="비빔밥"
          onSelect={mockOnSelect}
          onReset={mockOnReset}
        />
      );

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('아코디언 동작 테스트', () => {
    it('메뉴 클릭 시 아코디언이 토글된다', async () => {
      const user = userEvent.setup();
      const recommendations = [createMockRecommendationGroup('김치찌개')];

      renderWithProviders(
        <AiPlaceRecommendations
          activeMenuName={null}
          recommendations={recommendations}
          loadingMenuName={null}
          onSelect={mockOnSelect}
          onReset={mockOnReset}
        />
      );

      // 처음에는 접혀있어서 개별 추천이 보이지 않음
      expect(screen.queryByText('김치찌개 추천 이유 1')).not.toBeInTheDocument();

      // 클릭하여 펼침
      await user.click(screen.getByText('김치찌개'));

      await waitFor(() => {
        expect(screen.getByText('김치찌개 추천 이유 1')).toBeInTheDocument();
      });

      // 다시 클릭하여 접기
      await user.click(screen.getByText('김치찌개'));

      await waitFor(() => {
        expect(screen.queryByText('김치찌개 추천 이유 1')).not.toBeInTheDocument();
      });
    });

    it('activeMenuName이 변경되면 해당 메뉴가 자동으로 펼쳐진다', async () => {
      const recommendations = [
        createMockRecommendationGroup('김치찌개'),
        createMockRecommendationGroup('불고기'),
      ];

      const { rerender } = renderWithProviders(
        <AiPlaceRecommendations
          activeMenuName={null}
          recommendations={recommendations}
          loadingMenuName={null}
          onSelect={mockOnSelect}
          onReset={mockOnReset}
        />
      );

      // activeMenuName을 김치찌개로 변경
      rerender(
        <AiPlaceRecommendations
          activeMenuName="김치찌개"
          recommendations={recommendations}
          loadingMenuName={null}
          onSelect={mockOnSelect}
          onReset={mockOnReset}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('김치찌개 추천 이유 1')).toBeInTheDocument();
      });
    });
  });

  describe('추천 선택 테스트', () => {
    it('추천 카드 클릭 시 onSelect가 호출된다', async () => {
      const user = userEvent.setup();
      const recommendations = [createMockRecommendationGroup('김치찌개')];

      renderWithProviders(
        <AiPlaceRecommendations
          activeMenuName="김치찌개"
          recommendations={recommendations}
          loadingMenuName={null}
          onSelect={mockOnSelect}
          onReset={mockOnReset}
        />
      );

      // 펼쳐진 상태에서 개별 추천 클릭
      await user.click(screen.getByText('김치찌개 맛집 1'));

      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          placeId: 'place-김치찌개-0',
          name: '김치찌개 맛집 1',
        })
      );
    });

    it('키보드 Enter로 추천 선택이 가능하다', async () => {
      const user = userEvent.setup();
      const recommendations = [createMockRecommendationGroup('김치찌개')];

      renderWithProviders(
        <AiPlaceRecommendations
          activeMenuName="김치찌개"
          recommendations={recommendations}
          loadingMenuName={null}
          onSelect={mockOnSelect}
          onReset={mockOnReset}
        />
      );

      const recommendationCard = screen.getByText('김치찌개 맛집 1').closest('[role="button"]');
      expect(recommendationCard).toBeInTheDocument();

      recommendationCard?.focus();
      await user.keyboard('{Enter}');

      expect(mockOnSelect).toHaveBeenCalled();
    });

    it('키보드 Space로 추천 선택이 가능하다', async () => {
      const user = userEvent.setup();
      const recommendations = [createMockRecommendationGroup('김치찌개')];

      renderWithProviders(
        <AiPlaceRecommendations
          activeMenuName="김치찌개"
          recommendations={recommendations}
          loadingMenuName={null}
          onSelect={mockOnSelect}
          onReset={mockOnReset}
        />
      );

      const recommendationCard = screen.getByText('김치찌개 맛집 1').closest('[role="button"]');
      expect(recommendationCard).toBeInTheDocument();

      recommendationCard?.focus();
      await user.keyboard(' ');

      expect(mockOnSelect).toHaveBeenCalled();
    });
  });

  describe('초기화 테스트', () => {
    it('초기화 버튼 클릭 시 onReset이 호출된다', async () => {
      const user = userEvent.setup();
      const recommendations = [createMockRecommendationGroup('김치찌개')];

      renderWithProviders(
        <AiPlaceRecommendations
          activeMenuName={null}
          recommendations={recommendations}
          loadingMenuName={null}
          onSelect={mockOnSelect}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('초기화'));

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('활성 메뉴 스타일 테스트', () => {
    it('활성 메뉴에 강조 스타일이 적용된다', () => {
      const recommendations = [
        createMockRecommendationGroup('김치찌개'),
        createMockRecommendationGroup('불고기'),
      ];

      renderWithProviders(
        <AiPlaceRecommendations
          activeMenuName="김치찌개"
          recommendations={recommendations}
          loadingMenuName={null}
          onSelect={mockOnSelect}
          onReset={mockOnReset}
        />
      );

      const kimchiButton = screen.getByText('김치찌개');
      const kimchiContainer = kimchiButton.closest('.rounded-xl.border');
      expect(kimchiContainer).toHaveClass('border-orange-400/30');
    });
  });

  describe('추천 이유 표시 테스트', () => {
    it('추천 이유가 표시된다', async () => {
      const user = userEvent.setup();
      const recommendations = [
        {
          menuName: '김치찌개',
          recommendations: [
            createMockPlaceRecommendationItem({
              name: '맛집',
              reason: '정통 김치찌개로 유명한 곳입니다.',
            }),
          ],
        },
      ];

      renderWithProviders(
        <AiPlaceRecommendations
          activeMenuName={null}
          recommendations={recommendations}
          loadingMenuName={null}
          onSelect={mockOnSelect}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('김치찌개'));

      await waitFor(() => {
        expect(screen.getByText('정통 김치찌개로 유명한 곳입니다.')).toBeInTheDocument();
      });
    });
  });

  describe('빈 추천 그룹 필터링 테스트', () => {
    it('빈 추천 그룹은 표시되지 않는다', () => {
      const recommendations = [
        createMockRecommendationGroup('김치찌개', 2),
        { menuName: '비어있는메뉴', recommendations: [] },
      ];

      renderWithProviders(
        <AiPlaceRecommendations
          activeMenuName={null}
          recommendations={recommendations}
          loadingMenuName={null}
          onSelect={mockOnSelect}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('김치찌개')).toBeInTheDocument();
      expect(screen.queryByText('비어있는메뉴')).not.toBeInTheDocument();
    });
  });
});
