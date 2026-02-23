/**
 * RatingPromptModal Unit Tests
 *
 * Tests for RatingPromptModal component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RatingPromptModal } from '@/components/features/rating/RatingPromptModal';

// Mock dependencies
vi.mock('@/components/common/Button', () => ({
  Button: ({ children, onClick, disabled, isLoading, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} data-loading={isLoading}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/features/rating/StarRatingInput', () => ({
  StarRatingInput: ({ rating, onRatingChange, size }: any) => (
    <div data-testid="star-rating-input" data-rating={rating} data-size={size}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} onClick={() => onRatingChange(star)} aria-label={`${star}점`}>
          Star {star}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('@/hooks/common/useModalAnimation', () => ({
  useModalAnimation: (open: boolean) => ({
    isAnimating: open,
    shouldRender: open,
  }),
}));

vi.mock('@/hooks/common/useModalScrollLock', () => ({
  useModalScrollLock: vi.fn(),
}));

vi.mock('@/hooks/common/useFocusTrap', () => ({
  useFocusTrap: () => ({ current: null }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.close': 'Close',
        'rating.promptTitle': ' was how?',
        'rating.didNotVisit': 'Did not visit',
        'rating.submit': 'Submit',
      };
      return translations[key] || key;
    },
  }),
}));

describe('RatingPromptModal', () => {
  const mockOnSubmit = vi.fn();
  const mockOnSkip = vi.fn();
  const mockOnDismiss = vi.fn();

  const defaultProps = {
    open: true,
    placeName: 'Test Restaurant',
    onSubmit: mockOnSubmit,
    onSkip: mockOnSkip,
    onDismiss: mockOnDismiss,
    isSubmitting: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open is true', () => {
    render(<RatingPromptModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<RatingPromptModal {...defaultProps} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays place name in title', () => {
    render(<RatingPromptModal {...defaultProps} />);
    expect(screen.getByText(/Test Restaurant was how/)).toBeInTheDocument();
  });

  it('renders StarRatingInput with large size', () => {
    render(<RatingPromptModal {...defaultProps} />);
    const starInput = screen.getByTestId('star-rating-input');
    expect(starInput).toHaveAttribute('data-size', 'lg');
  });

  it('renders Skip and Submit buttons', () => {
    render(<RatingPromptModal {...defaultProps} />);
    expect(screen.getByText('Did not visit')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('Submit button is disabled when no rating selected', () => {
    render(<RatingPromptModal {...defaultProps} />);
    const submitButton = screen.getByText('Submit');
    expect(submitButton).toBeDisabled();
  });

  it('Submit button is enabled when rating is selected', () => {
    render(<RatingPromptModal {...defaultProps} />);
    const star3 = screen.getByLabelText('3점');
    fireEvent.click(star3);

    const submitButton = screen.getByText('Submit');
    expect(submitButton).not.toBeDisabled();
  });

  it('calls onSubmit with selected rating when Submit is clicked', () => {
    render(<RatingPromptModal {...defaultProps} />);

    const star4 = screen.getByLabelText('4점');
    fireEvent.click(star4);

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(4);
  });

  it('calls onSkip when Skip button is clicked', () => {
    render(<RatingPromptModal {...defaultProps} />);
    const skipButton = screen.getByText('Did not visit');
    fireEvent.click(skipButton);
    expect(mockOnSkip).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when close button is clicked', () => {
    render(<RatingPromptModal {...defaultProps} />);
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when Escape key is pressed', () => {
    render(<RatingPromptModal {...defaultProps} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when isSubmitting is true', () => {
    render(<RatingPromptModal {...defaultProps} isSubmitting={true} />);

    const star3 = screen.getByLabelText('3점');
    fireEvent.click(star3);

    const submitButton = screen.getByText('Submit');
    const skipButton = screen.getByText('Did not visit');
    const closeButton = screen.getByLabelText('Close');

    expect(submitButton).toBeDisabled();
    expect(skipButton).toBeDisabled();
    expect(closeButton).toBeDisabled();
  });

  it('shows loading state on Submit button when isSubmitting', () => {
    render(<RatingPromptModal {...defaultProps} isSubmitting={true} />);
    const submitButton = screen.getByText('Submit');
    expect(submitButton).toHaveAttribute('data-loading', 'true');
  });

  it('prevents onDismiss when clicking backdrop during submission', () => {
    render(<RatingPromptModal {...defaultProps} isSubmitting={true} />);
    const backdrop = screen.getByRole('dialog').parentElement;
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnDismiss).not.toHaveBeenCalled();
    }
  });

  it('calls onDismiss when clicking backdrop when not submitting', () => {
    render(<RatingPromptModal {...defaultProps} />);
    const backdrop = screen.getByRole('dialog').parentElement;
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    }
  });

  it('does not submit when Submit clicked without rating', () => {
    render(<RatingPromptModal {...defaultProps} />);
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
