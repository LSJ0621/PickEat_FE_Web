/**
 * OnboardingStepIntro Unit Tests
 *
 * Tests for OnboardingStepIntro component functionality.
 * This replaces the previous OnboardingNavigation test which tested
 * a component that no longer exists. Navigation is now embedded in each step component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingStepIntro } from '@features/onboarding/components/OnboardingStepIntro';

// Mock Button component
vi.mock('@shared/components/Button', () => ({
  Button: ({ children, onClick, size, className }: {
    children: React.ReactNode;
    onClick?: () => void;
    size?: string;
    className?: string;
  }) => (
    <button onClick={onClick} data-size={size} className={className}>
      {children}
    </button>
  ),
}));

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'onboarding.step1.title': 'PickEat에 오신 걸 환영합니다!',
        'onboarding.step1.subtitle': 'AI 기반 식사 추천 서비스',
        'onboarding.step1.description': '기분, 날씨, 취향에 맞는 메뉴와 가게를 AI가 추천해드립니다.',
        'onboarding.next': '다음',
        'onboarding.skip': '건너뛰기',
      };
      return translations[key] ?? key;
    },
  }),
}));

describe('OnboardingStepIntro', () => {
  const mockOnNext = vi.fn();
  const mockOnSkip = vi.fn();

  const defaultProps = {
    onNext: mockOnNext,
    onSkip: mockOnSkip,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders step title', () => {
    render(<OnboardingStepIntro {...defaultProps} />);
    expect(screen.getByText('PickEat에 오신 걸 환영합니다!')).toBeInTheDocument();
  });

  it('renders step subtitle', () => {
    render(<OnboardingStepIntro {...defaultProps} />);
    expect(screen.getByText('AI 기반 식사 추천 서비스')).toBeInTheDocument();
  });

  it('renders step description', () => {
    render(<OnboardingStepIntro {...defaultProps} />);
    expect(screen.getByText('기분, 날씨, 취향에 맞는 메뉴와 가게를 AI가 추천해드립니다.')).toBeInTheDocument();
  });

  it('renders next button', () => {
    render(<OnboardingStepIntro {...defaultProps} />);
    expect(screen.getByText('다음')).toBeInTheDocument();
  });

  it('renders skip button', () => {
    render(<OnboardingStepIntro {...defaultProps} />);
    expect(screen.getByText('건너뛰기')).toBeInTheDocument();
  });

  it('calls onNext when next button is clicked', () => {
    render(<OnboardingStepIntro {...defaultProps} />);
    const nextButton = screen.getByText('다음');
    fireEvent.click(nextButton);
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('calls onSkip when skip button is clicked', () => {
    render(<OnboardingStepIntro {...defaultProps} />);
    const skipButton = screen.getByText('건너뛰기');
    fireEvent.click(skipButton);
    expect(mockOnSkip).toHaveBeenCalledTimes(1);
  });

  it('renders hero icon with emoji', () => {
    const { container } = render(<OnboardingStepIntro {...defaultProps} />);
    const iconContainer = container.querySelector('.rounded-full');
    expect(iconContainer).toBeInTheDocument();
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('renders icon with gradient background', () => {
    const { container } = render(<OnboardingStepIntro {...defaultProps} />);
    const gradient = container.querySelector('.bg-gradient-to-br');
    expect(gradient).toBeInTheDocument();
  });

  it('renders fork and knife emoji with aria-label', () => {
    render(<OnboardingStepIntro {...defaultProps} />);
    const emoji = screen.getByRole('img', { hidden: true });
    expect(emoji).toHaveAttribute('aria-label', 'fork and knife');
  });

  it('renders next button with lg size', () => {
    render(<OnboardingStepIntro {...defaultProps} />);
    const nextButton = screen.getByText('다음');
    expect(nextButton).toHaveAttribute('data-size', 'lg');
  });

  it('renders next button with w-full class', () => {
    render(<OnboardingStepIntro {...defaultProps} />);
    const nextButton = screen.getByText('다음');
    expect(nextButton.className).toContain('w-full');
  });

  it('renders skip as a plain button with focus style', () => {
    render(<OnboardingStepIntro {...defaultProps} />);
    const skipButton = screen.getByText('건너뛰기');
    expect(skipButton.tagName).toBe('BUTTON');
    expect(skipButton).toHaveAttribute('type', 'button');
  });

  it('has centered flex layout', () => {
    const { container } = render(<OnboardingStepIntro {...defaultProps} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('flex', 'flex-col', 'items-center', 'text-center');
  });

  it('renders title as h2 heading', () => {
    render(<OnboardingStepIntro {...defaultProps} />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toContain('PickEat에 오신 걸 환영합니다!');
  });

  it('renders subtitle with orange color class', () => {
    render(<OnboardingStepIntro {...defaultProps} />);
    const subtitle = screen.getByText('AI 기반 식사 추천 서비스');
    expect(subtitle).toHaveClass('text-orange-400');
  });

  it('renders actions container with flex column', () => {
    const { container } = render(<OnboardingStepIntro {...defaultProps} />);
    const actions = container.querySelector('.flex.w-full.flex-col.gap-3');
    expect(actions).toBeInTheDocument();
  });
});
