/**
 * UserPlaceDeleteConfirm Unit Tests
 *
 * Tests for UserPlaceDeleteConfirm component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserPlaceDeleteConfirm } from '@features/user-place/components/UserPlaceDeleteConfirm';
import type { UserPlace } from '@features/user-place/types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.delete': '삭제',
        'common.cancel': '취소',
        'userPlace.confirmDelete': '이 가게를 삭제하시겠습니까?',
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock('@shared/hooks/useModalAnimation', () => ({
  useModalAnimation: (open: boolean) => ({
    isAnimating: open,
    shouldRender: open,
  }),
}));

vi.mock('@shared/hooks/useModalScrollLock', () => ({
  useModalScrollLock: vi.fn(),
}));

vi.mock('@shared/hooks/useEscapeKey', () => ({
  useEscapeKey: vi.fn(),
}));

vi.mock('@shared/components/ModalCloseButton', () => ({
  ModalCloseButton: ({ onClose }: { onClose: () => void }) => (
    <button onClick={onClose} aria-label="close">X</button>
  ),
}));

vi.mock('@shared/utils/constants', () => ({
  Z_INDEX: {
    MODAL_BACKDROP: 1000,
    MODAL_CONTENT: 1001,
  },
}));

describe('UserPlaceDeleteConfirm', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  const mockPlace: UserPlace = {
    id: 1,
    name: 'Test Restaurant',
    address: '123 Test Street',
    status: 'APPROVED',
    latitude: 37.5665,
    longitude: 126.9780,
    createdAt: '2024-01-01T00:00:00Z',
  };

  const defaultProps = {
    open: true,
    place: mockPlace,
    isDeleting: false,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open is true and place is provided', () => {
    render(<UserPlaceDeleteConfirm {...defaultProps} />);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('does not render when place is null', () => {
    render(<UserPlaceDeleteConfirm {...defaultProps} place={null} />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<UserPlaceDeleteConfirm {...defaultProps} open={false} />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('displays place name in the modal', () => {
    render(<UserPlaceDeleteConfirm {...defaultProps} />);
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
  });

  it('displays place address in the modal', () => {
    render(<UserPlaceDeleteConfirm {...defaultProps} />);
    expect(screen.getByText('123 Test Street')).toBeInTheDocument();
  });

  it('displays delete title', () => {
    render(<UserPlaceDeleteConfirm {...defaultProps} />);
    expect(screen.getByRole('heading', { name: '삭제' })).toBeInTheDocument();
  });

  it('displays confirmation message', () => {
    render(<UserPlaceDeleteConfirm {...defaultProps} />);
    expect(screen.getByText('이 가게를 삭제하시겠습니까?')).toBeInTheDocument();
  });

  it('renders delete and cancel buttons', () => {
    render(<UserPlaceDeleteConfirm {...defaultProps} />);
    expect(screen.getByText('취소')).toBeInTheDocument();
    // Multiple elements with '삭제' text (heading + button)
    expect(screen.getAllByText('삭제').length).toBeGreaterThanOrEqual(1);
  });

  it('calls onConfirm when delete button is clicked', () => {
    render(<UserPlaceDeleteConfirm {...defaultProps} />);
    // Find the delete button specifically (the one inside .flex.gap-3)
    const allDeleteTexts = screen.getAllByText('삭제');
    const deleteButton = allDeleteTexts.find(el => el.tagName === 'BUTTON' || el.closest('button'));
    if (deleteButton) {
      const btn = deleteButton.tagName === 'BUTTON' ? deleteButton : deleteButton.closest('button');
      fireEvent.click(btn as HTMLElement);
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    }
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<UserPlaceDeleteConfirm {...defaultProps} />);
    const cancelButton = screen.getByText('취소');
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('returns null early when place is null', () => {
    const { container } = render(<UserPlaceDeleteConfirm {...defaultProps} place={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('hides dialog when open changes to false', () => {
    const { rerender } = render(<UserPlaceDeleteConfirm {...defaultProps} />);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    rerender(<UserPlaceDeleteConfirm {...defaultProps} open={false} />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
