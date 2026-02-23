/**
 * OnboardingNavigation Unit Tests
 *
 * Tests for OnboardingNavigation component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingNavigation } from '@/components/features/onboarding/OnboardingNavigation';

// Mock Button component
vi.mock('@/components/common/Button', () => ({
  Button: ({ children, onClick, variant, className }: any) => (
    <button onClick={onClick} data-variant={variant} className={className}>
      {children}
    </button>
  ),
}));

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'onboarding.previous': 'Previous',
        'onboarding.next': 'Next',
        'onboarding.start': 'Start',
      };
      return translations[key] || key;
    },
  }),
}));

describe('OnboardingNavigation', () => {
  const mockOnPrevious = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnComplete = vi.fn();

  const defaultProps = {
    currentIndex: 1,
    totalSlides: 5,
    onPrevious: mockOnPrevious,
    onNext: mockOnNext,
    onComplete: mockOnComplete,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Next button on non-last slides', () => {
    render(<OnboardingNavigation {...defaultProps} />);
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('renders Previous button when not on first slide', () => {
    render(<OnboardingNavigation {...defaultProps} currentIndex={2} />);
    expect(screen.getByText('Previous')).toBeInTheDocument();
  });

  it('does not render Previous button on first slide', () => {
    render(<OnboardingNavigation {...defaultProps} currentIndex={0} />);
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
  });

  it('renders Start button on last slide', () => {
    render(<OnboardingNavigation {...defaultProps} currentIndex={4} totalSlides={5} />);
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('calls onNext when Next button is clicked', () => {
    render(<OnboardingNavigation {...defaultProps} />);
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('calls onPrevious when Previous button is clicked', () => {
    render(<OnboardingNavigation {...defaultProps} currentIndex={2} />);
    const previousButton = screen.getByText('Previous');
    fireEvent.click(previousButton);
    expect(mockOnPrevious).toHaveBeenCalledTimes(1);
  });

  it('calls onComplete when Start button is clicked on last slide', () => {
    render(<OnboardingNavigation {...defaultProps} currentIndex={4} />);
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('applies primary variant to Next button', () => {
    render(<OnboardingNavigation {...defaultProps} />);
    const nextButton = screen.getByText('Next');
    expect(nextButton).toHaveAttribute('data-variant', 'primary');
  });

  it('applies primary variant to Start button', () => {
    render(<OnboardingNavigation {...defaultProps} currentIndex={4} />);
    const startButton = screen.getByText('Start');
    expect(startButton).toHaveAttribute('data-variant', 'primary');
  });

  it('applies ghost variant to Previous button', () => {
    render(<OnboardingNavigation {...defaultProps} currentIndex={2} />);
    const previousButton = screen.getByText('Previous');
    expect(previousButton).toHaveAttribute('data-variant', 'ghost');
  });

  it('handles middle slide navigation', () => {
    render(<OnboardingNavigation {...defaultProps} currentIndex={2} totalSlides={5} />);
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.queryByText('Start')).not.toBeInTheDocument();
  });

  it('handles single slide navigation', () => {
    render(<OnboardingNavigation {...defaultProps} currentIndex={0} totalSlides={1} />);
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
  });
});
