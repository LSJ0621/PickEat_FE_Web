import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { ModalCloseButton } from '@/components/common/ModalCloseButton';

describe('ModalCloseButton', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('닫기 버튼이 렌더링된다', () => {
      render(<ModalCloseButton onClose={mockOnClose} />);

      expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
    });

    it('기본 aria-label이 적용된다', () => {
      render(<ModalCloseButton onClose={mockOnClose} />);

      expect(screen.getByLabelText('닫기')).toBeInTheDocument();
    });

    it('커스텀 aria-label을 사용할 수 있다', () => {
      render(<ModalCloseButton onClose={mockOnClose} ariaLabel="모달 닫기" />);

      expect(screen.getByLabelText('모달 닫기')).toBeInTheDocument();
    });

    it('X 아이콘이 렌더링된다', () => {
      const { container } = render(<ModalCloseButton onClose={mockOnClose} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('상호작용 테스트', () => {
    it('버튼을 클릭하면 onClose가 호출된다', async () => {
      const user = userEvent.setup();

      render(<ModalCloseButton onClose={mockOnClose} />);

      await user.click(screen.getByRole('button', { name: '닫기' }));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('사이즈 테스트', () => {
    it('기본 사이즈는 md이다', () => {
      const { container } = render(<ModalCloseButton onClose={mockOnClose} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-6');
      expect(svg).toHaveClass('w-6');
    });

    it('sm 사이즈를 사용할 수 있다', () => {
      const { container } = render(<ModalCloseButton onClose={mockOnClose} size="sm" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-5');
      expect(svg).toHaveClass('w-5');
    });

    it('lg 사이즈를 사용할 수 있다', () => {
      const { container } = render(<ModalCloseButton onClose={mockOnClose} size="lg" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-7');
      expect(svg).toHaveClass('w-7');
    });
  });

  describe('스타일 테스트', () => {
    it('절대 위치 스타일이 적용된다', () => {
      render(<ModalCloseButton onClose={mockOnClose} />);

      const button = screen.getByRole('button', { name: '닫기' });
      expect(button).toHaveClass('absolute');
      expect(button).toHaveClass('right-6');
      expect(button).toHaveClass('top-6');
    });

    it('추가 className을 적용할 수 있다', () => {
      render(<ModalCloseButton onClose={mockOnClose} className="custom-class" />);

      const button = screen.getByRole('button', { name: '닫기' });
      expect(button).toHaveClass('custom-class');
    });

    it('hover 스타일이 적용된다', () => {
      render(<ModalCloseButton onClose={mockOnClose} />);

      const button = screen.getByRole('button', { name: '닫기' });
      expect(button).toHaveClass('hover:text-white');
    });
  });

  describe('접근성 테스트', () => {
    it('button 역할을 가진다', () => {
      render(<ModalCloseButton onClose={mockOnClose} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('aria-label이 올바르게 설정된다', () => {
      render(<ModalCloseButton onClose={mockOnClose} ariaLabel="팝업 닫기" />);

      const button = screen.getByRole('button', { name: '팝업 닫기' });
      expect(button).toBeInTheDocument();
    });
  });
});
