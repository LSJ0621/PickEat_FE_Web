/**
 * OnboardingModal Unit Tests
 *
 * Tests for OnboardingModal component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingModal } from '@features/onboarding/components/OnboardingModal';

// Mock react-dom createPortal
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...rest }: React.ComponentPropsWithoutRef<'div'>) => (
      <div className={className} {...rest}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock shared hooks
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

const mockEscapeKeyCallback = vi.fn();
vi.mock('@shared/hooks/useEscapeKey', () => ({
  useEscapeKey: (callback: () => void, isActive: boolean) => {
    mockEscapeKeyCallback.mockImplementation(() => {
      if (isActive) callback();
    });
  },
}));

// Mock step components
vi.mock('@features/onboarding/components/OnboardingStepIntro', () => ({
  OnboardingStepIntro: ({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) => (
    <div data-testid="step-intro">
      <button onClick={onNext} data-testid="intro-next">Next from Intro</button>
      <button onClick={onSkip} data-testid="intro-skip">Skip from Intro</button>
    </div>
  ),
}));

vi.mock('@features/onboarding/components/OnboardingStepFeatures', () => ({
  OnboardingStepFeatures: ({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) => (
    <div data-testid="step-features">
      <button onClick={onPrev}>Prev</button>
      <button onClick={onNext}>Next</button>
    </div>
  ),
}));

vi.mock('@features/onboarding/components/OnboardingStepHowItWorks', () => ({
  OnboardingStepHowItWorks: ({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) => (
    <div data-testid="step-how-it-works">
      <button onClick={onPrev}>Prev</button>
      <button onClick={onNext}>Next</button>
    </div>
  ),
}));

vi.mock('@features/onboarding/components/OnboardingStepSetup', () => ({
  OnboardingStepSetup: ({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) => (
    <div data-testid="step-setup">
      <button onClick={onPrev}>Prev</button>
      <button onClick={onNext}>Next</button>
    </div>
  ),
}));

vi.mock('@features/onboarding/components/OnboardingStepComplete', () => ({
  OnboardingStepComplete: ({ onComplete, onPrev }: { onComplete: () => void; onPrev: () => void }) => (
    <div data-testid="step-complete">
      <button onClick={onPrev}>Prev</button>
      <button onClick={onComplete}>Complete</button>
    </div>
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'onboarding.skip': 'Skip',
        'onboarding.stepIndicator': 'Step indicator',
      };
      return translations[key] ?? key;
    },
  }),
}));

vi.mock('@shared/utils/constants', () => ({
  Z_INDEX: {
    PRIORITY_MODAL: 9999,
  },
}));

describe('OnboardingModal', () => {
  const mockOnNext = vi.fn();
  const mockOnPrev = vi.fn();
  const mockOnComplete = vi.fn();
  const mockOnSkip = vi.fn();

  const defaultProps = {
    isOpen: true,
    currentStep: 0,
    totalSteps: 5,
    onNext: mockOnNext,
    onPrev: mockOnPrev,
    onComplete: mockOnComplete,
    onSkip: mockOnSkip,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    render(<OnboardingModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<OnboardingModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders skip button when not on last step', () => {
    render(<OnboardingModal {...defaultProps} currentStep={0} />);
    expect(screen.getByText('Skip')).toBeInTheDocument();
  });

  it('does not render skip button on last step', () => {
    render(<OnboardingModal {...defaultProps} currentStep={4} />);
    expect(screen.queryByText('Skip')).not.toBeInTheDocument();
  });

  it('calls onSkip when skip button is clicked', () => {
    render(<OnboardingModal {...defaultProps} />);
    const skipButton = screen.getByText('Skip');
    fireEvent.click(skipButton);
    expect(mockOnSkip).toHaveBeenCalledTimes(1);
  });

  it('renders step 0 (intro) when currentStep is 0', () => {
    render(<OnboardingModal {...defaultProps} currentStep={0} />);
    expect(screen.getByTestId('step-intro')).toBeInTheDocument();
  });

  it('renders step 1 (features) when currentStep is 1', () => {
    render(<OnboardingModal {...defaultProps} currentStep={1} />);
    expect(screen.getByTestId('step-features')).toBeInTheDocument();
  });

  it('renders step 2 (how it works) when currentStep is 2', () => {
    render(<OnboardingModal {...defaultProps} currentStep={2} />);
    expect(screen.getByTestId('step-how-it-works')).toBeInTheDocument();
  });

  it('renders step 3 (setup) when currentStep is 3', () => {
    render(<OnboardingModal {...defaultProps} currentStep={3} />);
    expect(screen.getByTestId('step-setup')).toBeInTheDocument();
  });

  it('renders step 4 (complete) when currentStep is 4', () => {
    render(<OnboardingModal {...defaultProps} currentStep={4} />);
    expect(screen.getByTestId('step-complete')).toBeInTheDocument();
  });

  it('passes onNext to step intro component', () => {
    render(<OnboardingModal {...defaultProps} currentStep={0} />);
    fireEvent.click(screen.getByTestId('intro-next'));
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('passes onSkip to step intro component', () => {
    render(<OnboardingModal {...defaultProps} currentStep={0} />);
    fireEvent.click(screen.getByTestId('intro-skip'));
    expect(mockOnSkip).toHaveBeenCalledTimes(1);
  });

  it('passes onComplete to step complete component', () => {
    render(<OnboardingModal {...defaultProps} currentStep={4} />);
    fireEvent.click(screen.getByText('Complete'));
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('passes onPrev to step complete component', () => {
    render(<OnboardingModal {...defaultProps} currentStep={4} />);
    fireEvent.click(screen.getByText('Prev'));
    expect(mockOnPrev).toHaveBeenCalledTimes(1);
  });

  it('calls onSkip when backdrop is clicked', () => {
    const { container } = render(<OnboardingModal {...defaultProps} />);
    const backdrop = container.firstChild as HTMLElement;
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnSkip).toHaveBeenCalledTimes(1);
    }
  });

  it('has proper accessibility attributes on dialog', () => {
    render(<OnboardingModal {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'onboarding-title');
  });

  it('renders step indicator (progressbar)', () => {
    render(<OnboardingModal {...defaultProps} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders mobile drag handle', () => {
    const { container } = render(<OnboardingModal {...defaultProps} />);
    const dragHandle = container.querySelector('.h-1.w-12.rounded-full');
    expect(dragHandle).toBeInTheDocument();
  });

  it('renders sr-only onboarding title', () => {
    const { container } = render(<OnboardingModal {...defaultProps} />);
    const srTitle = container.querySelector('#onboarding-title');
    expect(srTitle).toBeInTheDocument();
    expect(srTitle).toHaveClass('sr-only');
  });

  it('renders header with skip and progress indicator', () => {
    const { container } = render(<OnboardingModal {...defaultProps} />);
    const header = container.querySelector('.flex.items-center.justify-between');
    expect(header).toBeInTheDocument();
  });

  it('applies z-index style from constants', () => {
    const { container } = render(<OnboardingModal {...defaultProps} />);
    const backdrop = container.firstChild as HTMLElement;
    expect(backdrop).toHaveStyle({ zIndex: 9999 });
  });

  it('renders step content wrapper with overflow-hidden', () => {
    const { container } = render(<OnboardingModal {...defaultProps} />);
    const overflow = container.querySelector('.overflow-hidden');
    expect(overflow).toBeInTheDocument();
  });

  it('renders total steps in progressbar aria-valuemax', () => {
    render(<OnboardingModal {...defaultProps} totalSteps={5} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuemax', '5');
  });

  it('renders current step + 1 in progressbar aria-valuenow', () => {
    render(<OnboardingModal {...defaultProps} currentStep={2} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '3');
  });
});
