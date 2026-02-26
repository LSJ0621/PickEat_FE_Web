/**
 * OnboardingModal Step Indicator Unit Tests
 *
 * Tests for the step indicator (dots) rendered inside OnboardingModal.
 * The dot indicator is part of the OnboardingModal component itself.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

vi.mock('@shared/hooks/useEscapeKey', () => ({
  useEscapeKey: vi.fn(),
}));

// Mock step components
vi.mock('@features/onboarding/components/OnboardingStepIntro', () => ({
  OnboardingStepIntro: ({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) => (
    <div data-testid="step-intro">
      <button onClick={onNext}>Next</button>
      <button onClick={onSkip}>Skip</button>
    </div>
  ),
}));

vi.mock('@features/onboarding/components/OnboardingStepFeatures', () => ({
  OnboardingStepFeatures: () => <div data-testid="step-features" />,
}));

vi.mock('@features/onboarding/components/OnboardingStepHowItWorks', () => ({
  OnboardingStepHowItWorks: () => <div data-testid="step-how-it-works" />,
}));

vi.mock('@features/onboarding/components/OnboardingStepSetup', () => ({
  OnboardingStepSetup: () => <div data-testid="step-setup" />,
}));

vi.mock('@features/onboarding/components/OnboardingStepComplete', () => ({
  OnboardingStepComplete: () => <div data-testid="step-complete" />,
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

const defaultProps = {
  isOpen: true,
  currentStep: 0,
  totalSteps: 5,
  onNext: vi.fn(),
  onPrev: vi.fn(),
  onComplete: vi.fn(),
  onSkip: vi.fn(),
};

describe('OnboardingModal - Step Indicator (Dots)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correct number of step indicator dots', () => {
    render(<OnboardingModal {...defaultProps} />);
    // The step indicator has role="progressbar" on the container
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    // There should be totalSteps dots inside
    const dots = progressbar.children;
    expect(dots).toHaveLength(5);
  });

  it('marks current step dot as active (wider width)', () => {
    render(<OnboardingModal {...defaultProps} currentStep={0} />);
    const progressbar = screen.getByRole('progressbar');
    const firstDot = progressbar.children[0];
    expect(firstDot.className).toContain('w-6');
  });

  it('marks non-current step dots as inactive (narrower width)', () => {
    render(<OnboardingModal {...defaultProps} currentStep={0} />);
    const progressbar = screen.getByRole('progressbar');
    const secondDot = progressbar.children[1];
    expect(secondDot.className).toContain('w-1.5');
  });

  it('applies active color class to current step dot', () => {
    render(<OnboardingModal {...defaultProps} currentStep={2} />);
    const progressbar = screen.getByRole('progressbar');
    const activeDot = progressbar.children[2];
    expect(activeDot.className).toContain('bg-orange-500');
  });

  it('applies completed color class to past step dots', () => {
    render(<OnboardingModal {...defaultProps} currentStep={3} />);
    const progressbar = screen.getByRole('progressbar');
    const pastDot = progressbar.children[0];
    expect(pastDot.className).toContain('bg-orange-300');
  });

  it('applies inactive color class to future step dots', () => {
    render(<OnboardingModal {...defaultProps} currentStep={0} />);
    const progressbar = screen.getByRole('progressbar');
    const futureDot = progressbar.children[4];
    expect(futureDot.className).toContain('bg-border-default');
  });

  it('has progressbar role on step indicator container', () => {
    render(<OnboardingModal {...defaultProps} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
  });

  it('has correct aria-valuenow on progressbar', () => {
    render(<OnboardingModal {...defaultProps} currentStep={2} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '3');
  });

  it('has correct aria-valuemin on progressbar', () => {
    render(<OnboardingModal {...defaultProps} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuemin', '1');
  });

  it('has correct aria-valuemax on progressbar', () => {
    render(<OnboardingModal {...defaultProps} totalSteps={5} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuemax', '5');
  });

  it('renders all dots with aria-hidden', () => {
    render(<OnboardingModal {...defaultProps} />);
    const progressbar = screen.getByRole('progressbar');
    Array.from(progressbar.children).forEach((dot) => {
      expect(dot).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('applies transition class to all dots', () => {
    render(<OnboardingModal {...defaultProps} />);
    const progressbar = screen.getByRole('progressbar');
    Array.from(progressbar.children).forEach((dot) => {
      expect(dot.className).toContain('transition-all');
    });
  });

  it('renders dot indicator in the header section', () => {
    const { container } = render(<OnboardingModal {...defaultProps} />);
    const header = container.querySelector('.flex.items-center.justify-between');
    expect(header).toBeInTheDocument();
    expect(header?.querySelector('[role="progressbar"]')).toBeInTheDocument();
  });
});
