/**
 * RatingPromptModal Unit Tests
 *
 * Tests for RatingPromptModal component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RatingPromptModal } from '@features/rating/components/RatingPromptModal';

// Mock dependencies
vi.mock('@shared/components/Button', () => ({
  Button: ({ children, onClick, disabled, isLoading, className }: any) => (
    <button onClick={onClick} disabled={disabled || isLoading} className={className} data-loading={isLoading}>
      {children}
    </button>
  ),
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

vi.mock('@shared/hooks/useFocusTrap', () => ({
  useFocusTrap: () => ({ current: null }),
}));

vi.mock('@shared/hooks/useEscapeKey', () => ({
  useEscapeKey: (callback: () => void, active: boolean) => {
    if (active) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') callback();
      });
    }
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.close': 'Close',
        'rating.promptMessage': '방문은 어떠셨나요?',
        'rating.didNotVisit': 'Did not visit',
        'rating.goToRate': 'Go to rate',
        'rating.dismiss': 'Dismiss',
        'rating.neverShowAgain': 'Never show again',
      };
      return translations[key] || key;
    },
  }),
}));

describe('RatingPromptModal', () => {
  const mockOnGoToHistory = vi.fn();
  const mockOnSkipPlace = vi.fn();
  const mockOnDismiss = vi.fn();
  const mockOnNeverShow = vi.fn();

  const defaultProps = {
    open: true,
    placeName: 'Test Restaurant',
    onGoToHistory: mockOnGoToHistory,
    onSkipPlace: mockOnSkipPlace,
    onDismiss: mockOnDismiss,
    onNeverShow: mockOnNeverShow,
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
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
  });

  it('renders the place name as a heading', () => {
    render(<RatingPromptModal {...defaultProps} />);
    const heading = screen.getByRole('heading');
    expect(heading).toHaveTextContent('Test Restaurant');
  });

  it('renders Did not visit and Go to rate buttons', () => {
    render(<RatingPromptModal {...defaultProps} />);
    expect(screen.getByText('Did not visit')).toBeInTheDocument();
    expect(screen.getByText('Go to rate')).toBeInTheDocument();
  });

  it('renders prompt message', () => {
    render(<RatingPromptModal {...defaultProps} />);
    expect(screen.getByText('방문은 어떠셨나요?')).toBeInTheDocument();
  });

  it('renders Dismiss and Never show again buttons', () => {
    render(<RatingPromptModal {...defaultProps} />);
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
    expect(screen.getByText('Never show again')).toBeInTheDocument();
  });

  it('calls onSkipPlace when Did not visit is clicked', () => {
    render(<RatingPromptModal {...defaultProps} />);
    const skipButton = screen.getByText('Did not visit');
    fireEvent.click(skipButton);
    expect(mockOnSkipPlace).toHaveBeenCalledTimes(1);
  });

  it('calls onGoToHistory when Go to rate is clicked', () => {
    render(<RatingPromptModal {...defaultProps} />);
    const goButton = screen.getByText('Go to rate');
    fireEvent.click(goButton);
    expect(mockOnGoToHistory).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when close button is clicked', () => {
    render(<RatingPromptModal {...defaultProps} />);
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when Dismiss link is clicked', () => {
    render(<RatingPromptModal {...defaultProps} />);
    const dismissButton = screen.getByText('Dismiss');
    fireEvent.click(dismissButton);
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onNeverShow when Never show again is clicked', () => {
    render(<RatingPromptModal {...defaultProps} />);
    const neverShowButton = screen.getByText('Never show again');
    fireEvent.click(neverShowButton);
    expect(mockOnNeverShow).toHaveBeenCalledTimes(1);
  });

  it('disables close button when isSubmitting is true', () => {
    render(<RatingPromptModal {...defaultProps} isSubmitting={true} />);
    const closeButton = screen.getByLabelText('Close');
    expect(closeButton).toBeDisabled();
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

  it('disables Did not visit button when isSubmitting is true', () => {
    render(<RatingPromptModal {...defaultProps} isSubmitting={true} />);
    const skipButton = screen.getByText('Did not visit');
    expect(skipButton).toBeDisabled();
  });
});
