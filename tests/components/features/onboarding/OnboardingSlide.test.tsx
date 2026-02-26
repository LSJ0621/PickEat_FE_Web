/**
 * OnboardingStepFeatures Unit Tests
 *
 * Tests for OnboardingStepFeatures component functionality.
 * This replaces the previous OnboardingSlide test which tested
 * a component that no longer exists. Feature slides are now
 * discrete step components.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingStepFeatures } from '@features/onboarding/components/OnboardingStepFeatures';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'onboarding.step2.title': 'PickEat 주요 기능',
        'onboarding.step2.feature1Title': 'AI 메뉴 추천',
        'onboarding.step2.feature1Desc': '기분, 날씨, 취향을 반영한 메뉴를 실시간으로 제안합니다.',
        'onboarding.step2.feature2Title': '지도 기반 탐색',
        'onboarding.step2.feature2Desc': '원하는 메뉴를 고르면 근처 가게 후보를 AI가 선별합니다.',
        'onboarding.step2.feature3Title': '취향 기억',
        'onboarding.step2.feature3Desc': '추천받은 메뉴와 가게 이력을 한눈에 확인하고 재탐색할 수 있습니다.',
        'onboarding.next': '다음',
        'onboarding.prev': '이전',
      };
      return translations[key] ?? key;
    },
  }),
}));

describe('OnboardingStepFeatures', () => {
  const mockOnNext = vi.fn();
  const mockOnPrev = vi.fn();

  const defaultProps = {
    onNext: mockOnNext,
    onPrev: mockOnPrev,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders step title', () => {
    render(<OnboardingStepFeatures {...defaultProps} />);
    expect(screen.getByText('PickEat 주요 기능')).toBeInTheDocument();
  });

  it('renders all three feature card titles', () => {
    render(<OnboardingStepFeatures {...defaultProps} />);
    expect(screen.getByText('AI 메뉴 추천')).toBeInTheDocument();
    expect(screen.getByText('지도 기반 탐색')).toBeInTheDocument();
    expect(screen.getByText('취향 기억')).toBeInTheDocument();
  });

  it('renders all three feature descriptions', () => {
    render(<OnboardingStepFeatures {...defaultProps} />);
    expect(screen.getByText('기분, 날씨, 취향을 반영한 메뉴를 실시간으로 제안합니다.')).toBeInTheDocument();
    expect(screen.getByText('원하는 메뉴를 고르면 근처 가게 후보를 AI가 선별합니다.')).toBeInTheDocument();
    expect(screen.getByText('추천받은 메뉴와 가게 이력을 한눈에 확인하고 재탐색할 수 있습니다.')).toBeInTheDocument();
  });

  it('renders next button', () => {
    render(<OnboardingStepFeatures {...defaultProps} />);
    expect(screen.getByText('다음')).toBeInTheDocument();
  });

  it('renders previous button', () => {
    render(<OnboardingStepFeatures {...defaultProps} />);
    expect(screen.getByText('이전')).toBeInTheDocument();
  });

  it('calls onNext when next button is clicked', () => {
    render(<OnboardingStepFeatures {...defaultProps} />);
    const nextButton = screen.getByText('다음');
    fireEvent.click(nextButton);
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('calls onPrev when previous button is clicked', () => {
    render(<OnboardingStepFeatures {...defaultProps} />);
    const prevButton = screen.getByText('이전');
    fireEvent.click(prevButton);
    expect(mockOnPrev).toHaveBeenCalledTimes(1);
  });

  it('renders header section with text-center class', () => {
    const { container } = render(<OnboardingStepFeatures {...defaultProps} />);
    const header = container.querySelector('.text-center');
    expect(header).toBeInTheDocument();
  });

  it('renders title as h2 heading', () => {
    render(<OnboardingStepFeatures {...defaultProps} />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toBe('PickEat 주요 기능');
  });

  it('renders three feature cards', () => {
    const { container } = render(<OnboardingStepFeatures {...defaultProps} />);
    const cards = container.querySelectorAll('.rounded-2xl.border');
    expect(cards).toHaveLength(3);
  });

  it('renders feature icons with aria-hidden', () => {
    const { container } = render(<OnboardingStepFeatures {...defaultProps} />);
    const icons = container.querySelectorAll('[aria-hidden="true"]');
    expect(icons.length).toBeGreaterThanOrEqual(3);
  });

  it('renders navigation buttons with flex layout', () => {
    const { container } = render(<OnboardingStepFeatures {...defaultProps} />);
    const navContainer = container.querySelector('.flex.gap-3');
    expect(navContainer).toBeInTheDocument();
  });

  it('renders next button with gradient style', () => {
    render(<OnboardingStepFeatures {...defaultProps} />);
    const nextButton = screen.getByText('다음');
    expect(nextButton.className).toContain('bg-gradient-to-r');
    expect(nextButton.className).toContain('from-orange-500');
  });

  it('renders previous button with border style', () => {
    render(<OnboardingStepFeatures {...defaultProps} />);
    const prevButton = screen.getByText('이전');
    expect(prevButton.className).toContain('border');
    expect(prevButton.className).toContain('border-border-default');
  });

  it('renders next button as type button', () => {
    render(<OnboardingStepFeatures {...defaultProps} />);
    const nextButton = screen.getByText('다음');
    expect(nextButton).toHaveAttribute('type', 'button');
  });

  it('renders previous button as type button', () => {
    render(<OnboardingStepFeatures {...defaultProps} />);
    const prevButton = screen.getByText('이전');
    expect(prevButton).toHaveAttribute('type', 'button');
  });

  it('renders first feature with orange color classes', () => {
    const { container } = render(<OnboardingStepFeatures {...defaultProps} />);
    const orangeCard = container.querySelector('.bg-orange-500\\/15');
    expect(orangeCard).toBeInTheDocument();
  });

  it('renders second feature with blue color classes', () => {
    const { container } = render(<OnboardingStepFeatures {...defaultProps} />);
    const blueCard = container.querySelector('.bg-blue-500\\/15');
    expect(blueCard).toBeInTheDocument();
  });

  it('renders third feature with rose color classes', () => {
    const { container } = render(<OnboardingStepFeatures {...defaultProps} />);
    const roseCard = container.querySelector('.bg-rose-500\\/15');
    expect(roseCard).toBeInTheDocument();
  });

  it('renders feature cards in a space-y container', () => {
    const { container } = render(<OnboardingStepFeatures {...defaultProps} />);
    const list = container.querySelector('.space-y-3');
    expect(list).toBeInTheDocument();
  });
});
