import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { PreferencesEditModal } from '@/components/features/user/preferences/PreferencesEditModal';

describe('PreferencesEditModal', () => {
  const defaultProps = {
    open: true,
    likes: ['한식', '중식'],
    dislikes: ['매운 음식'],
    newLike: '',
    newDislike: '',
    isSaving: false,
    onClose: vi.fn(),
    onNewLikeChange: vi.fn(),
    onNewDislikeChange: vi.fn(),
    onAddLike: vi.fn(),
    onRemoveLike: vi.fn(),
    onAddDislike: vi.fn(),
    onRemoveDislike: vi.fn(),
    onSave: vi.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('모달이 열려있을 때 취향 수정 제목이 표시된다', async () => {
      renderWithProviders(<PreferencesEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('취향 수정')).toBeInTheDocument();
      });
    });

    it('모달이 닫혀있을 때 아무것도 렌더링되지 않는다', () => {
      const { container } = renderWithProviders(
        <PreferencesEditModal {...defaultProps} open={false} />
      );

      expect(container).toBeEmptyDOMElement();
    });

    it('닫기 버튼이 렌더링된다', async () => {
      renderWithProviders(<PreferencesEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
      });
    });

    it('좋아하는 것 레이블이 표시된다', async () => {
      renderWithProviders(<PreferencesEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('좋아하는 것')).toBeInTheDocument();
      });
    });

    it('싫어하는 것 레이블이 표시된다', async () => {
      renderWithProviders(<PreferencesEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('싫어하는 것')).toBeInTheDocument();
      });
    });

    it('좋아하는 것 입력 필드가 표시된다', async () => {
      renderWithProviders(<PreferencesEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('좋아하는 음식이나 재료를 입력하세요')
        ).toBeInTheDocument();
      });
    });

    it('싫어하는 것 입력 필드가 표시된다', async () => {
      renderWithProviders(<PreferencesEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('싫어하는 음식이나 재료를 입력하세요')
        ).toBeInTheDocument();
      });
    });

    it('취향 정보 저장 버튼이 표시된다', async () => {
      renderWithProviders(<PreferencesEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '취향 정보 저장' })).toBeInTheDocument();
      });
    });
  });

  describe('기존 데이터 표시 테스트', () => {
    it('기존 좋아하는 것 목록이 표시된다', async () => {
      renderWithProviders(<PreferencesEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('한식')).toBeInTheDocument();
        expect(screen.getByText('중식')).toBeInTheDocument();
      });
    });

    it('기존 싫어하는 것 목록이 표시된다', async () => {
      renderWithProviders(<PreferencesEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('매운 음식')).toBeInTheDocument();
      });
    });

    it('각 태그에 삭제 버튼이 있다', async () => {
      renderWithProviders(<PreferencesEditModal {...defaultProps} />);

      await waitFor(() => {
        // 한식, 중식, 매운 음식 3개의 삭제 버튼
        const deleteButtons = screen.getAllByRole('button', { name: '×' });
        expect(deleteButtons.length).toBe(3);
      });
    });
  });

  describe('상호작용 테스트', () => {
    it('닫기 버튼 클릭 시 onClose가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<PreferencesEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '닫기' }));

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('좋아하는 것 입력 시 onNewLikeChange가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<PreferencesEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('좋아하는 음식이나 재료를 입력하세요')
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('좋아하는 음식이나 재료를 입력하세요');
      await user.type(input, '일식');

      expect(defaultProps.onNewLikeChange).toHaveBeenCalled();
    });

    it('싫어하는 것 입력 시 onNewDislikeChange가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<PreferencesEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('싫어하는 음식이나 재료를 입력하세요')
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('싫어하는 음식이나 재료를 입력하세요');
      await user.type(input, '생선');

      expect(defaultProps.onNewDislikeChange).toHaveBeenCalled();
    });

    it('좋아하는 것 추가 버튼 클릭 시 onAddLike가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<PreferencesEditModal {...defaultProps} />);

      await waitFor(() => {
        const addButtons = screen.getAllByRole('button', { name: '추가' });
        expect(addButtons.length).toBe(2);
      });

      const addButtons = screen.getAllByRole('button', { name: '추가' });
      await user.click(addButtons[0]); // 첫 번째 추가 버튼 (좋아하는 것)

      expect(defaultProps.onAddLike).toHaveBeenCalledTimes(1);
    });

    it('싫어하는 것 추가 버튼 클릭 시 onAddDislike가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<PreferencesEditModal {...defaultProps} />);

      await waitFor(() => {
        const addButtons = screen.getAllByRole('button', { name: '추가' });
        expect(addButtons.length).toBe(2);
      });

      const addButtons = screen.getAllByRole('button', { name: '추가' });
      await user.click(addButtons[1]); // 두 번째 추가 버튼 (싫어하는 것)

      expect(defaultProps.onAddDislike).toHaveBeenCalledTimes(1);
    });

    it('좋아하는 것 삭제 버튼 클릭 시 onRemoveLike가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<PreferencesEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('한식')).toBeInTheDocument();
      });

      // 한식 태그의 삭제 버튼 클릭
      const likeTag = screen.getByText('한식').closest('span');
      const deleteButton = likeTag?.querySelector('button');
      expect(deleteButton).toBeInTheDocument();
      await user.click(deleteButton!);

      expect(defaultProps.onRemoveLike).toHaveBeenCalledWith('한식');
    });

    it('싫어하는 것 삭제 버튼 클릭 시 onRemoveDislike가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<PreferencesEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('매운 음식')).toBeInTheDocument();
      });

      // 매운 음식 태그의 삭제 버튼 클릭
      const dislikeTag = screen.getByText('매운 음식').closest('span');
      const deleteButton = dislikeTag?.querySelector('button');
      expect(deleteButton).toBeInTheDocument();
      await user.click(deleteButton!);

      expect(defaultProps.onRemoveDislike).toHaveBeenCalledWith('매운 음식');
    });

    it('저장 버튼 클릭 시 onSave가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<PreferencesEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '취향 정보 저장' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '취향 정보 저장' }));

      expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('키보드 상호작용 테스트', () => {
    it('좋아하는 것 입력 후 Enter 키를 누르면 onAddLike가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<PreferencesEditModal {...defaultProps} newLike="일식" />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('좋아하는 음식이나 재료를 입력하세요')
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('좋아하는 음식이나 재료를 입력하세요');
      await user.click(input);
      await user.keyboard('{Enter}');

      expect(defaultProps.onAddLike).toHaveBeenCalled();
    });

    it('싫어하는 것 입력 후 Enter 키를 누르면 onAddDislike가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<PreferencesEditModal {...defaultProps} newDislike="생선" />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('싫어하는 음식이나 재료를 입력하세요')
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('싫어하는 음식이나 재료를 입력하세요');
      await user.click(input);
      await user.keyboard('{Enter}');

      expect(defaultProps.onAddDislike).toHaveBeenCalled();
    });
  });

  describe('로딩 상태 테스트', () => {
    it('저장 중일 때 저장 버튼에 로딩 표시가 나타난다', async () => {
      renderWithProviders(<PreferencesEditModal {...defaultProps} isSaving={true} />);

      await waitFor(() => {
        // 로딩 중일 때는 버튼 텍스트가 '로딩 중...'으로 변경됨
        const saveButton = screen.getByRole('button', { name: /로딩 중.../ });
        expect(saveButton).toBeInTheDocument();
        expect(saveButton).toBeDisabled();
      });
    });
  });
});
