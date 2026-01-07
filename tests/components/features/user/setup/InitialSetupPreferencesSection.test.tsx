import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { InitialSetupPreferencesSection } from '@/components/features/user/setup/InitialSetupPreferencesSection';

describe('InitialSetupPreferencesSection', () => {
  const defaultProps = {
    likes: [],
    dislikes: [],
    onLikesChange: vi.fn(),
    onDislikesChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('취향 정보 섹션이 렌더링된다', () => {
      renderWithProviders(<InitialSetupPreferencesSection {...defaultProps} />);

      expect(screen.getByText('취향 정보')).toBeInTheDocument();
    });

    it('안내 문구가 표시된다', () => {
      renderWithProviders(<InitialSetupPreferencesSection {...defaultProps} />);

      expect(
        screen.getByText('좋아하는 음식과 싫어하는 음식을 입력해주세요')
      ).toBeInTheDocument();
    });

    it('좋아하는 것 레이블이 표시된다', () => {
      renderWithProviders(<InitialSetupPreferencesSection {...defaultProps} />);

      expect(screen.getByText('좋아하는 것')).toBeInTheDocument();
    });

    it('싫어하는 것 레이블이 표시된다', () => {
      renderWithProviders(<InitialSetupPreferencesSection {...defaultProps} />);

      expect(screen.getByText('싫어하는 것')).toBeInTheDocument();
    });

    it('좋아하는 것 입력 필드가 표시된다', () => {
      renderWithProviders(<InitialSetupPreferencesSection {...defaultProps} />);

      expect(
        screen.getByPlaceholderText('좋아하는 음식이나 재료를 입력하세요')
      ).toBeInTheDocument();
    });

    it('싫어하는 것 입력 필드가 표시된다', () => {
      renderWithProviders(<InitialSetupPreferencesSection {...defaultProps} />);

      expect(
        screen.getByPlaceholderText('싫어하는 음식이나 재료를 입력하세요')
      ).toBeInTheDocument();
    });

    it('추가 버튼이 2개 표시된다', () => {
      renderWithProviders(<InitialSetupPreferencesSection {...defaultProps} />);

      const addButtons = screen.getAllByRole('button', { name: '추가' });
      expect(addButtons.length).toBe(2);
    });
  });

  describe('기존 데이터 표시 테스트', () => {
    it('기존 좋아하는 것 목록이 태그로 표시된다', () => {
      renderWithProviders(
        <InitialSetupPreferencesSection
          {...defaultProps}
          likes={['한식', '중식']}
        />
      );

      expect(screen.getByText('한식')).toBeInTheDocument();
      expect(screen.getByText('중식')).toBeInTheDocument();
    });

    it('기존 싫어하는 것 목록이 태그로 표시된다', () => {
      renderWithProviders(
        <InitialSetupPreferencesSection
          {...defaultProps}
          dislikes={['매운 음식', '생선']}
        />
      );

      expect(screen.getByText('매운 음식')).toBeInTheDocument();
      expect(screen.getByText('생선')).toBeInTheDocument();
    });

    it('각 태그에 삭제 버튼이 있다', () => {
      renderWithProviders(
        <InitialSetupPreferencesSection
          {...defaultProps}
          likes={['한식']}
          dislikes={['매운 음식']}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: '×' });
      expect(deleteButtons.length).toBe(2);
    });
  });

  describe('좋아하는 것 추가 테스트', () => {
    it('좋아하는 것 입력 후 추가 버튼 클릭 시 onLikesChange가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<InitialSetupPreferencesSection {...defaultProps} />);

      const input = screen.getByPlaceholderText('좋아하는 음식이나 재료를 입력하세요');
      await user.type(input, '일식');

      const addButtons = screen.getAllByRole('button', { name: '추가' });
      await user.click(addButtons[0]);

      expect(defaultProps.onLikesChange).toHaveBeenCalledWith(['일식']);
    });

    it('좋아하는 것 입력 후 Enter 키로 추가할 수 있다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<InitialSetupPreferencesSection {...defaultProps} />);

      const input = screen.getByPlaceholderText('좋아하는 음식이나 재료를 입력하세요');
      await user.type(input, '일식{Enter}');

      expect(defaultProps.onLikesChange).toHaveBeenCalledWith(['일식']);
    });

    it('빈 입력은 추가되지 않는다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<InitialSetupPreferencesSection {...defaultProps} />);

      const addButtons = screen.getAllByRole('button', { name: '추가' });
      await user.click(addButtons[0]);

      expect(defaultProps.onLikesChange).not.toHaveBeenCalled();
    });

    it('중복된 항목은 추가되지 않는다', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <InitialSetupPreferencesSection {...defaultProps} likes={['한식']} />
      );

      const input = screen.getByPlaceholderText('좋아하는 음식이나 재료를 입력하세요');
      await user.type(input, '한식');

      const addButtons = screen.getAllByRole('button', { name: '추가' });
      await user.click(addButtons[0]);

      expect(defaultProps.onLikesChange).not.toHaveBeenCalled();
    });

    it('추가 후 입력 필드가 초기화된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<InitialSetupPreferencesSection {...defaultProps} />);

      const input = screen.getByPlaceholderText('좋아하는 음식이나 재료를 입력하세요');
      await user.type(input, '일식');

      const addButtons = screen.getAllByRole('button', { name: '추가' });
      await user.click(addButtons[0]);

      expect(input).toHaveValue('');
    });
  });

  describe('싫어하는 것 추가 테스트', () => {
    it('싫어하는 것 입력 후 추가 버튼 클릭 시 onDislikesChange가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<InitialSetupPreferencesSection {...defaultProps} />);

      const input = screen.getByPlaceholderText('싫어하는 음식이나 재료를 입력하세요');
      await user.type(input, '생선');

      const addButtons = screen.getAllByRole('button', { name: '추가' });
      await user.click(addButtons[1]);

      expect(defaultProps.onDislikesChange).toHaveBeenCalledWith(['생선']);
    });

    it('싫어하는 것 입력 후 Enter 키로 추가할 수 있다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<InitialSetupPreferencesSection {...defaultProps} />);

      const input = screen.getByPlaceholderText('싫어하는 음식이나 재료를 입력하세요');
      await user.type(input, '생선{Enter}');

      expect(defaultProps.onDislikesChange).toHaveBeenCalledWith(['생선']);
    });
  });

  describe('삭제 테스트', () => {
    it('좋아하는 것 삭제 버튼 클릭 시 onLikesChange가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <InitialSetupPreferencesSection {...defaultProps} likes={['한식', '중식']} />
      );

      // 한식 태그의 삭제 버튼 클릭
      const likeTag = screen.getByText('한식').closest('span');
      const deleteButton = likeTag?.querySelector('button');
      expect(deleteButton).toBeInTheDocument();
      await user.click(deleteButton!);

      expect(defaultProps.onLikesChange).toHaveBeenCalledWith(['중식']);
    });

    it('싫어하는 것 삭제 버튼 클릭 시 onDislikesChange가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <InitialSetupPreferencesSection
          {...defaultProps}
          dislikes={['매운 음식', '생선']}
        />
      );

      // 매운 음식 태그의 삭제 버튼 클릭
      const dislikeTag = screen.getByText('매운 음식').closest('span');
      const deleteButton = dislikeTag?.querySelector('button');
      expect(deleteButton).toBeInTheDocument();
      await user.click(deleteButton!);

      expect(defaultProps.onDislikesChange).toHaveBeenCalledWith(['생선']);
    });
  });

  describe('스타일 테스트', () => {
    it('섹션에 적절한 스타일이 적용된다', () => {
      const { container } = renderWithProviders(
        <InitialSetupPreferencesSection {...defaultProps} />
      );

      const section = container.firstChild as HTMLElement;
      expect(section).toHaveClass('rounded-2xl');
      expect(section).toHaveClass('border');
    });

    it('좋아하는 것 태그에 green 스타일이 적용된다', () => {
      renderWithProviders(
        <InitialSetupPreferencesSection {...defaultProps} likes={['한식']} />
      );

      const likeTag = screen.getByText('한식');
      expect(likeTag.closest('span')).toHaveClass('border-green-500/30');
    });

    it('싫어하는 것 태그에 red 스타일이 적용된다', () => {
      renderWithProviders(
        <InitialSetupPreferencesSection {...defaultProps} dislikes={['매운 음식']} />
      );

      const dislikeTag = screen.getByText('매운 음식');
      expect(dislikeTag.closest('span')).toHaveClass('border-red-500/30');
    });
  });
});
