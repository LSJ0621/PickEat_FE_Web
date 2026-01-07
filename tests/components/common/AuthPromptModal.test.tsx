import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { AuthPromptModal } from '@/components/common/AuthPromptModal';

describe('AuthPromptModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('open이 true일 때 모달이 렌더링된다', () => {
      render(
        <AuthPromptModal
          open={true}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('로그인이 필요한 서비스입니다')).toBeInTheDocument();
    });

    it('open이 false일 때 모달이 렌더링되지 않는다', () => {
      render(
        <AuthPromptModal
          open={false}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText('로그인이 필요한 서비스입니다')).not.toBeInTheDocument();
    });

    it('기본 메시지가 렌더링된다', () => {
      render(
        <AuthPromptModal
          open={true}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('해당 기능은 로그인 후 이용할 수 있습니다. 지금 로그인하시겠어요?')).toBeInTheDocument();
    });

    it('커스텀 메시지를 사용할 수 있다', () => {
      render(
        <AuthPromptModal
          open={true}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
          message="이 기능을 사용하려면 로그인이 필요합니다."
        />
      );

      expect(screen.getByText('이 기능을 사용하려면 로그인이 필요합니다.')).toBeInTheDocument();
    });

    it('로그인하러 가기 버튼이 렌더링된다', () => {
      render(
        <AuthPromptModal
          open={true}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('button', { name: '로그인하러 가기' })).toBeInTheDocument();
    });

    it('닫기 버튼이 렌더링된다', () => {
      render(
        <AuthPromptModal
          open={true}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
    });
  });

  describe('상호작용 테스트', () => {
    it('로그인하러 가기 버튼을 클릭하면 onConfirm이 호출된다', async () => {
      const user = userEvent.setup();

      render(
        <AuthPromptModal
          open={true}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByRole('button', { name: '로그인하러 가기' }));

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('닫기 버튼을 클릭하면 onClose가 호출된다', async () => {
      const user = userEvent.setup();

      render(
        <AuthPromptModal
          open={true}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByRole('button', { name: '닫기' }));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Portal 렌더링 테스트', () => {
    it('모달이 document.body에 렌더링된다', () => {
      render(
        <AuthPromptModal
          open={true}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      const modal = document.body.querySelector('.fixed.inset-0.z-50');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('애니메이션 테스트', () => {
    it('모달 열림 시 애니메이션 클래스가 적용된다', async () => {
      render(
        <AuthPromptModal
          open={true}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      // requestAnimationFrame 후 애니메이션 클래스 확인
      await waitFor(() => {
        const backdrop = document.body.querySelector('.modal-backdrop-enter');
        expect(backdrop).toBeInTheDocument();
      });
    });

    it('모달이 닫힐 때 shouldRender가 false가 된다', async () => {
      const { rerender } = render(
        <AuthPromptModal
          open={true}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('로그인이 필요한 서비스입니다')).toBeInTheDocument();

      rerender(
        <AuthPromptModal
          open={false}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      // 애니메이션이 완료된 후 모달이 사라짐
      await waitFor(() => {
        expect(screen.queryByText('로그인이 필요한 서비스입니다')).not.toBeInTheDocument();
      }, { timeout: 500 });
    });
  });

  describe('접근성 테스트', () => {
    it('모달 내부 버튼들이 모두 접근 가능하다', () => {
      render(
        <AuthPromptModal
          open={true}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });
  });

  describe('스타일 테스트', () => {
    it('backdrop이 blur 효과를 가진다', () => {
      render(
        <AuthPromptModal
          open={true}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      const backdrop = document.body.querySelector('.bg-black\\/60');
      expect(backdrop).toBeInTheDocument();
    });

    it('모달 컨텐츠가 둥근 모서리를 가진다', () => {
      render(
        <AuthPromptModal
          open={true}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      const modalContent = document.body.querySelector('.rounded-\\[28px\\]');
      expect(modalContent).toBeInTheDocument();
    });
  });

  describe('상태 변경 테스트', () => {
    it('open prop이 변경되면 모달이 다시 열린다', async () => {
      const { rerender } = render(
        <AuthPromptModal
          open={false}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText('로그인이 필요한 서비스입니다')).not.toBeInTheDocument();

      rerender(
        <AuthPromptModal
          open={true}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('로그인이 필요한 서비스입니다')).toBeInTheDocument();
      });
    });
  });
});
