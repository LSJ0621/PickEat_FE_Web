/**
 * OnboardingModal Unit Tests
 *
 * Tests for OnboardingModal component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingModal } from '@/components/features/onboarding/OnboardingModal';

// Mock react-dom createPortal
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

// Mock dependencies
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

vi.mock('@/hooks/onboarding/useSwipeGesture', () => ({
  useSwipeGesture: () => ({
    swipeOffset: 0,
    handlers: {},
  }),
}));

vi.mock('@/components/features/onboarding/OnboardingSlide', () => ({
  OnboardingSlide: ({ slide, isActive }: any) => (
    <div data-testid={`slide-${slide.key}`} data-active={isActive}>
      Slide {slide.key}
    </div>
  ),
}));

vi.mock('@/components/features/onboarding/OnboardingDotIndicator', () => ({
  OnboardingDotIndicator: ({ total, current, onDotClick }: any) => (
    <div data-testid="dot-indicator">
      {Array.from({ length: total }).map((_, i) => (
        <button key={i} onClick={() => onDotClick(i)} data-active={i === current}>
          Dot {i}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('@/components/features/onboarding/OnboardingNavigation', () => ({
  OnboardingNavigation: ({ currentIndex, totalSlides, onPrevious, onNext, onComplete }: any) => (
    <div data-testid="navigation">
      <button onClick={onPrevious} disabled={currentIndex === 0}>
        Previous
      </button>
      <button onClick={onNext} disabled={currentIndex === totalSlides - 1}>
        Next
      </button>
      <button onClick={onComplete}>Complete</button>
    </div>
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'onboarding.skip': 'Skip',
        'onboarding.intro.title': 'Welcome',
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock('@/utils/constants', () => ({
  Z_INDEX: {
    MODAL_BACKDROP: 1000,
    MODAL_CONTENT: 1001,
  },
}));

describe('OnboardingModal', () => {
  const mockOnClose = vi.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open is true', () => {
    render(<OnboardingModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<OnboardingModal {...defaultProps} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders skip button', () => {
    render(<OnboardingModal {...defaultProps} />);
    expect(screen.getByText('Skip')).toBeInTheDocument();
  });

  it('calls onClose when skip button is clicked', () => {
    render(<OnboardingModal {...defaultProps} />);
    const skipButton = screen.getByText('Skip');
    fireEvent.click(skipButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders all 5 slides', () => {
    render(<OnboardingModal {...defaultProps} />);
    expect(screen.getByTestId('slide-intro')).toBeInTheDocument();
    expect(screen.getByTestId('slide-preferences')).toBeInTheDocument();
    expect(screen.getByTestId('slide-menuGuide')).toBeInTheDocument();
    expect(screen.getByTestId('slide-storeGuide')).toBeInTheDocument();
    expect(screen.getByTestId('slide-userPlace')).toBeInTheDocument();
  });

  it('renders dot indicator', () => {
    render(<OnboardingModal {...defaultProps} />);
    expect(screen.getByTestId('dot-indicator')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(<OnboardingModal {...defaultProps} />);
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('starts at first slide', () => {
    render(<OnboardingModal {...defaultProps} />);
    const firstSlide = screen.getByTestId('slide-intro');
    expect(firstSlide).toHaveAttribute('data-active', 'true');
  });

  it('navigates to next slide when Next is clicked', () => {
    render(<OnboardingModal {...defaultProps} />);
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    const secondSlide = screen.getByTestId('slide-preferences');
    expect(secondSlide).toHaveAttribute('data-active', 'true');
  });

  it('navigates to previous slide when Previous is clicked', () => {
    render(<OnboardingModal {...defaultProps} />);
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    const prevButton = screen.getByText('Previous');
    fireEvent.click(prevButton);

    const firstSlide = screen.getByTestId('slide-intro');
    expect(firstSlide).toHaveAttribute('data-active', 'true');
  });

  it('calls onClose when Complete is clicked', () => {
    render(<OnboardingModal {...defaultProps} />);
    const completeButton = screen.getByText('Complete');
    fireEvent.click(completeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('navigates to specific slide when dot is clicked', () => {
    render(<OnboardingModal {...defaultProps} />);
    const dots = screen.getAllByText(/Dot/);
    fireEvent.click(dots[2]); // Click third dot

    const thirdSlide = screen.getByTestId('slide-menuGuide');
    expect(thirdSlide).toHaveAttribute('data-active', 'true');
  });

  it('calls onClose when Escape key is pressed', () => {
    render(<OnboardingModal {...defaultProps} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('navigates forward with ArrowRight key', () => {
    render(<OnboardingModal {...defaultProps} />);
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    const secondSlide = screen.getByTestId('slide-preferences');
    expect(secondSlide).toHaveAttribute('data-active', 'true');
  });

  it('navigates backward with ArrowLeft key', () => {
    render(<OnboardingModal {...defaultProps} />);
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(window, { key: 'ArrowLeft' });

    const firstSlide = screen.getByTestId('slide-intro');
    expect(firstSlide).toHaveAttribute('data-active', 'true');
  });

  it('calls onClose with Enter key on last slide', () => {
    render(<OnboardingModal {...defaultProps} />);

    // Navigate to last slide
    for (let i = 0; i < 4; i++) {
      fireEvent.keyDown(window, { key: 'ArrowRight' });
    }

    fireEvent.keyDown(window, { key: 'Enter' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('navigates forward with Enter key on non-last slide', () => {
    render(<OnboardingModal {...defaultProps} />);
    fireEvent.keyDown(window, { key: 'Enter' });

    const secondSlide = screen.getByTestId('slide-preferences');
    expect(secondSlide).toHaveAttribute('data-active', 'true');
  });

  it('calls onClose when backdrop is clicked', () => {
    render(<OnboardingModal {...defaultProps} />);
    const backdrop = screen.getByRole('dialog').previousSibling;
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('resets to first slide when modal reopens', () => {
    const { rerender } = render(<OnboardingModal {...defaultProps} open={false} />);

    rerender(<OnboardingModal {...defaultProps} open={true} />);

    const firstSlide = screen.getByTestId('slide-intro');
    expect(firstSlide).toHaveAttribute('data-active', 'true');
  });

  it('has proper accessibility attributes', () => {
    render(<OnboardingModal {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Welcome');
  });
});
