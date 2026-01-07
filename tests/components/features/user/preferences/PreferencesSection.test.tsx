import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { PreferencesSection } from '@/components/features/user/preferences/PreferencesSection';

describe('PreferencesSection', () => {
  const mockOnEditClick = vi.fn();

  const defaultProps = {
    likes: ['한식', '중식'],
    dislikes: ['매운 음식'],
    analysis: '한식과 중식을 선호하는 편입니다.',
    isLoading: false,
    onEditClick: mockOnEditClick,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('취향 섹션이 렌더링된다', () => {
      renderWithProviders(<PreferencesSection {...defaultProps} />);

      expect(screen.getByText('취향')).toBeInTheDocument();
    });

    it('좋아하는 것 목록이 표시된다', () => {
      renderWithProviders(<PreferencesSection {...defaultProps} />);

      expect(screen.getByText('좋아하는 것')).toBeInTheDocument();
      expect(screen.getByText('한식')).toBeInTheDocument();
      expect(screen.getByText('중식')).toBeInTheDocument();
    });

    it('싫어하는 것 목록이 표시된다', () => {
      renderWithProviders(<PreferencesSection {...defaultProps} />);

      expect(screen.getByText('싫어하는 것')).toBeInTheDocument();
      expect(screen.getByText('매운 음식')).toBeInTheDocument();
    });

    it('AI 리포트가 표시된다', () => {
      renderWithProviders(<PreferencesSection {...defaultProps} />);

      expect(screen.getByText('AI 리포트')).toBeInTheDocument();
      expect(screen.getByText('한식과 중식을 선호하는 편입니다.')).toBeInTheDocument();
    });

    it('취향 수정 버튼이 렌더링된다', () => {
      renderWithProviders(<PreferencesSection {...defaultProps} />);

      expect(screen.getByRole('button', { name: '취향 수정' })).toBeInTheDocument();
    });
  });

  describe('로딩 상태 테스트', () => {
    it('로딩 중일 때 로딩 표시가 나타난다', () => {
      renderWithProviders(<PreferencesSection {...defaultProps} isLoading={true} />);

      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    });

    it('로딩 중일 때 취향 정보가 표시되지 않는다', () => {
      renderWithProviders(<PreferencesSection {...defaultProps} isLoading={true} />);

      expect(screen.queryByText('좋아하는 것')).not.toBeInTheDocument();
      expect(screen.queryByText('싫어하는 것')).not.toBeInTheDocument();
    });
  });

  describe('빈 상태 테스트', () => {
    it('취향 정보가 없을 때 안내 메시지가 표시된다', () => {
      renderWithProviders(
        <PreferencesSection
          {...defaultProps}
          likes={[]}
          dislikes={[]}
          analysis={null}
        />
      );

      expect(screen.getByText('등록된 취향 정보가 없습니다.')).toBeInTheDocument();
    });

    it('좋아하는 것만 없을 때 싫어하는 것은 표시된다', () => {
      renderWithProviders(
        <PreferencesSection {...defaultProps} likes={[]} analysis={null} />
      );

      expect(screen.queryByText('좋아하는 것')).not.toBeInTheDocument();
      expect(screen.getByText('싫어하는 것')).toBeInTheDocument();
      expect(screen.getByText('매운 음식')).toBeInTheDocument();
    });

    it('싫어하는 것만 없을 때 좋아하는 것은 표시된다', () => {
      renderWithProviders(
        <PreferencesSection {...defaultProps} dislikes={[]} analysis={null} />
      );

      expect(screen.getByText('좋아하는 것')).toBeInTheDocument();
      expect(screen.queryByText('싫어하는 것')).not.toBeInTheDocument();
    });

    it('AI 리포트가 null일 때 표시되지 않는다', () => {
      renderWithProviders(<PreferencesSection {...defaultProps} analysis={null} />);

      expect(screen.queryByText('AI 리포트')).not.toBeInTheDocument();
    });
  });

  describe('상호작용 테스트', () => {
    it('취향 수정 버튼을 클릭하면 onEditClick이 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<PreferencesSection {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: '취향 수정' }));

      expect(mockOnEditClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('스타일 테스트', () => {
    it('카드 스타일이 적용된다', () => {
      const { container } = renderWithProviders(
        <PreferencesSection {...defaultProps} />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('rounded-[32px]');
      expect(card).toHaveClass('border');
    });

    it('좋아하는 것 태그에 green 스타일이 적용된다', () => {
      renderWithProviders(<PreferencesSection {...defaultProps} />);

      const likeTag = screen.getByText('한식');
      expect(likeTag).toHaveClass('border-green-500/30');
    });

    it('싫어하는 것 태그에 red 스타일이 적용된다', () => {
      renderWithProviders(<PreferencesSection {...defaultProps} />);

      const dislikeTag = screen.getByText('매운 음식');
      expect(dislikeTag).toHaveClass('border-red-500/30');
    });
  });
});
