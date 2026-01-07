import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { StatusPopupCard } from '@/components/common/StatusPopupCard';

describe('StatusPopupCard', () => {
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('open이 true일 때 팝업이 렌더링된다', () => {
      render(
        <StatusPopupCard
          open={true}
          message="테스트 메시지"
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText('테스트 메시지')).toBeInTheDocument();
    });

    it('open이 false일 때 팝업이 렌더링되지 않는다', () => {
      render(
        <StatusPopupCard
          open={false}
          message="테스트 메시지"
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.queryByText('테스트 메시지')).not.toBeInTheDocument();
    });

    it('기본 제목이 렌더링된다', () => {
      render(
        <StatusPopupCard
          open={true}
          message="테스트 메시지"
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText('알림')).toBeInTheDocument();
    });

    it('커스텀 제목을 사용할 수 있다', () => {
      render(
        <StatusPopupCard
          open={true}
          title="에러 발생"
          message="테스트 메시지"
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText('에러 발생')).toBeInTheDocument();
    });

    it('메시지가 렌더링된다', () => {
      render(
        <StatusPopupCard
          open={true}
          message="이것은 테스트 메시지입니다."
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText('이것은 테스트 메시지입니다.')).toBeInTheDocument();
    });

    it('기본 확인 버튼 레이블이 렌더링된다', () => {
      render(
        <StatusPopupCard
          open={true}
          message="테스트 메시지"
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
    });

    it('커스텀 확인 버튼 레이블을 사용할 수 있다', () => {
      render(
        <StatusPopupCard
          open={true}
          message="테스트 메시지"
          onConfirm={mockOnConfirm}
          confirmLabel="닫기"
        />
      );

      expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
    });
  });

  describe('상호작용 테스트', () => {
    it('확인 버튼을 클릭하면 onConfirm이 호출된다', async () => {
      const user = userEvent.setup();

      render(
        <StatusPopupCard
          open={true}
          message="테스트 메시지"
          onConfirm={mockOnConfirm}
        />
      );

      await user.click(screen.getByRole('button', { name: '확인' }));

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('스타일 테스트', () => {
    it('팝업이 고정 위치에 렌더링된다', () => {
      const { container } = render(
        <StatusPopupCard
          open={true}
          message="테스트 메시지"
          onConfirm={mockOnConfirm}
        />
      );

      const popup = container.querySelector('.fixed.inset-0');
      expect(popup).toBeInTheDocument();
    });

    it('backdrop이 blur 효과를 가진다', () => {
      const { container } = render(
        <StatusPopupCard
          open={true}
          message="테스트 메시지"
          onConfirm={mockOnConfirm}
        />
      );

      const backdrop = container.querySelector('.backdrop-blur-sm');
      expect(backdrop).toBeInTheDocument();
    });

    it('팝업이 둥근 모서리를 가진다', () => {
      const { container } = render(
        <StatusPopupCard
          open={true}
          message="테스트 메시지"
          onConfirm={mockOnConfirm}
        />
      );

      const popup = container.querySelector('.rounded-\\[32px\\]');
      expect(popup).toBeInTheDocument();
    });

    it('팝업이 z-index 100을 가진다', () => {
      const { container } = render(
        <StatusPopupCard
          open={true}
          message="테스트 메시지"
          onConfirm={mockOnConfirm}
        />
      );

      const popup = container.querySelector('.z-\\[100\\]');
      expect(popup).toBeInTheDocument();
    });

    it('제목이 흰색 텍스트를 가진다', () => {
      render(
        <StatusPopupCard
          open={true}
          message="테스트 메시지"
          onConfirm={mockOnConfirm}
        />
      );

      const title = screen.getByText('알림');
      expect(title).toHaveClass('text-white');
    });

    it('메시지가 중앙 정렬된다', () => {
      const { container } = render(
        <StatusPopupCard
          open={true}
          message="테스트 메시지"
          onConfirm={mockOnConfirm}
        />
      );

      const textCenter = container.querySelector('.text-center');
      expect(textCenter).toBeInTheDocument();
    });
  });

  describe('레이아웃 테스트', () => {
    it('팝업이 화면 중앙에 위치한다', () => {
      const { container } = render(
        <StatusPopupCard
          open={true}
          message="테스트 메시지"
          onConfirm={mockOnConfirm}
        />
      );

      const popup = container.querySelector('.flex.items-center.justify-center');
      expect(popup).toBeInTheDocument();
    });

    it('최대 너비가 설정되어 있다', () => {
      const { container } = render(
        <StatusPopupCard
          open={true}
          message="테스트 메시지"
          onConfirm={mockOnConfirm}
        />
      );

      const popupContent = container.querySelector('.max-w-md');
      expect(popupContent).toBeInTheDocument();
    });

    it('확인 버튼이 전체 너비를 차지한다', () => {
      render(
        <StatusPopupCard
          open={true}
          message="테스트 메시지"
          onConfirm={mockOnConfirm}
        />
      );

      const button = screen.getByRole('button', { name: '확인' });
      expect(button).toHaveClass('w-full');
    });
  });

  describe('Props 테스트', () => {
    it('code prop이 전달되어도 렌더링된다', () => {
      render(
        <StatusPopupCard
          open={true}
          message="테스트 메시지"
          code={404}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText('테스트 메시지')).toBeInTheDocument();
    });

    it('code가 문자열이어도 렌더링된다', () => {
      render(
        <StatusPopupCard
          open={true}
          message="테스트 메시지"
          code="ERROR_001"
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText('테스트 메시지')).toBeInTheDocument();
    });

    it('variant prop이 전달되어도 렌더링된다', () => {
      render(
        <StatusPopupCard
          open={true}
          message="테스트 메시지"
          variant="error"
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText('테스트 메시지')).toBeInTheDocument();
    });

    it('variant가 info여도 렌더링된다', () => {
      render(
        <StatusPopupCard
          open={true}
          message="테스트 메시지"
          variant="info"
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText('테스트 메시지')).toBeInTheDocument();
    });
  });

  describe('다양한 메시지 테스트', () => {
    it('긴 메시지도 렌더링할 수 있다', () => {
      const longMessage = '이것은 매우 긴 메시지입니다. '.repeat(10);

      render(
        <StatusPopupCard
          open={true}
          message={longMessage}
          onConfirm={mockOnConfirm}
        />
      );

      // Use getByText with a matcher function since the text might be broken up
      expect(screen.getByText((_content, element) => {
        return element?.textContent === longMessage;
      })).toBeInTheDocument();
    });

    it('짧은 메시지도 렌더링할 수 있다', () => {
      render(
        <StatusPopupCard
          open={true}
          message="OK"
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText('OK')).toBeInTheDocument();
    });
  });
});
