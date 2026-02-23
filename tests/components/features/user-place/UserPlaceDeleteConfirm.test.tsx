/**
 * UserPlaceDeleteConfirm Unit Tests
 *
 * Tests for UserPlaceDeleteConfirm component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserPlaceDeleteConfirm } from '@/components/features/user-place/UserPlaceDeleteConfirm';
import type { UserPlace } from '@/types/user-place';

// Mock ConfirmDialog
vi.mock('@/components/common/ConfirmDialog', () => ({
  ConfirmDialog: ({ open, title, message, onConfirm, onCancel, confirmLabel, cancelLabel, variant }: any) => {
    if (!open) return null;
    return (
      <div data-testid="confirm-dialog" data-variant={variant}>
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onConfirm}>{confirmLabel}</button>
        <button onClick={onCancel}>{cancelLabel}</button>
      </div>
    );
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.delete': 'Delete',
        'common.cancel': 'Cancel',
        'userPlace.confirmDelete': 'Are you sure you want to delete this place?',
      };
      return translations[key] || key;
    },
  }),
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
    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
  });

  it('does not render when place is null', () => {
    render(<UserPlaceDeleteConfirm {...defaultProps} place={null} />);
    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<UserPlaceDeleteConfirm {...defaultProps} open={false} />);
    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
  });

  it('does not render when isDeleting is true', () => {
    render(<UserPlaceDeleteConfirm {...defaultProps} isDeleting={true} />);
    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
  });

  it('displays delete title', () => {
    render(<UserPlaceDeleteConfirm {...defaultProps} />);
    expect(screen.getByRole('heading', { name: 'Delete' })).toBeInTheDocument();
  });

  it('displays confirmation message with place name and address', () => {
    render(<UserPlaceDeleteConfirm {...defaultProps} />);
    const message = screen.getByText(/Are you sure you want to delete this place/);
    expect(message).toBeInTheDocument();
    expect(message.textContent).toContain('Test Restaurant');
    expect(message.textContent).toContain('123 Test Street');
  });

  it('uses danger variant', () => {
    render(<UserPlaceDeleteConfirm {...defaultProps} />);
    const dialog = screen.getByTestId('confirm-dialog');
    expect(dialog).toHaveAttribute('data-variant', 'danger');
  });

  it('renders delete and cancel buttons with correct labels', () => {
    render(<UserPlaceDeleteConfirm {...defaultProps} />);
    expect(screen.getAllByText('Delete')).toHaveLength(2); // title + button
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('returns null early when place is null', () => {
    const { container } = render(<UserPlaceDeleteConfirm {...defaultProps} place={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('hides dialog when both open and isDeleting change states', () => {
    const { rerender } = render(<UserPlaceDeleteConfirm {...defaultProps} />);
    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();

    rerender(<UserPlaceDeleteConfirm {...defaultProps} open={false} />);
    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();

    rerender(<UserPlaceDeleteConfirm {...defaultProps} isDeleting={true} />);
    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
  });
});
