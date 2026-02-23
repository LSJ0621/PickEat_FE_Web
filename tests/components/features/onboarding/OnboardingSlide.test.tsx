/**
 * OnboardingSlide Unit Tests
 *
 * Tests for OnboardingSlide component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OnboardingSlide } from '@/components/features/onboarding/OnboardingSlide';
import { Sparkles } from 'lucide-react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'onboarding.intro.title': 'Welcome to PickEat',
        'onboarding.intro.description': 'Your personal food recommendation assistant',
        'onboarding.menuGuide.title': 'AI Menu Recommendations',
        'onboarding.menuGuide.description': 'Get personalized menu suggestions',
        'onboarding.menuGuide.promptExample': 'Recommend me a spicy Korean dish',
        'menu.recommendation.placeholder': 'Ask for menu recommendations, etc',
      };
      return translations[key] || key;
    },
  }),
}));

describe('OnboardingSlide', () => {
  const defaultSlide = {
    key: 'intro',
    icon: Sparkles,
    accentColor: 'brand-primary' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders slide with title', () => {
    render(<OnboardingSlide slide={defaultSlide} isActive={true} />);
    expect(screen.getByText('Welcome to PickEat')).toBeInTheDocument();
  });

  it('renders slide with description', () => {
    render(<OnboardingSlide slide={defaultSlide} isActive={true} />);
    expect(screen.getByText('Your personal food recommendation assistant')).toBeInTheDocument();
  });

  it('renders icon component', () => {
    const { container } = render(<OnboardingSlide slide={defaultSlide} isActive={true} />);
    const iconContainer = container.querySelector('.h-20.w-20');
    expect(iconContainer).toBeInTheDocument();
  });

  it('applies active animation when isActive is true', () => {
    const { container } = render(<OnboardingSlide slide={defaultSlide} isActive={true} />);
    const iconContainer = container.querySelector('.animate-onboarding-icon');
    expect(iconContainer).toBeInTheDocument();
  });

  it('does not apply animation when isActive is false', () => {
    const { container } = render(<OnboardingSlide slide={defaultSlide} isActive={false} />);
    const iconContainer = container.querySelector('.animate-onboarding-icon');
    expect(iconContainer).not.toBeInTheDocument();
  });

  it('sets aria-hidden to true when not active', () => {
    const { container } = render(<OnboardingSlide slide={defaultSlide} isActive={false} />);
    const slideContainer = container.querySelector('[aria-hidden="true"]');
    expect(slideContainer).toBeInTheDocument();
  });

  it('sets aria-hidden to false when active', () => {
    const { container } = render(<OnboardingSlide slide={defaultSlide} isActive={true} />);
    const slideContainer = container.querySelector('[aria-hidden="false"]');
    expect(slideContainer).toBeInTheDocument();
  });

  it('applies brand-primary accent color class', () => {
    const { container } = render(<OnboardingSlide slide={defaultSlide} isActive={true} />);
    const iconContainer = container.querySelector('.bg-brand-primary\\/10');
    expect(iconContainer).toBeInTheDocument();
  });

  it('applies brand-coral accent color class', () => {
    const coralSlide = { ...defaultSlide, accentColor: 'brand-coral' as const };
    const { container } = render(<OnboardingSlide slide={coralSlide} isActive={true} />);
    const iconContainer = container.querySelector('.bg-brand-coral\\/10');
    expect(iconContainer).toBeInTheDocument();
  });

  it('applies brand-amber accent color class', () => {
    const amberSlide = { ...defaultSlide, accentColor: 'brand-amber' as const };
    const { container } = render(<OnboardingSlide slide={amberSlide} isActive={true} />);
    const iconContainer = container.querySelector('.bg-brand-amber\\/10');
    expect(iconContainer).toBeInTheDocument();
  });

  it('renders prompt example for menuGuide slide', () => {
    const menuGuideSlide = { ...defaultSlide, key: 'menuGuide' };
    render(<OnboardingSlide slide={menuGuideSlide} isActive={true} />);
    expect(screen.getByText(/Recommend me a spicy Korean dish/)).toBeInTheDocument();
  });

  it('does not render prompt example for non-menuGuide slides', () => {
    render(<OnboardingSlide slide={defaultSlide} isActive={true} />);
    expect(screen.queryByText(/Recommend me a spicy Korean dish/)).not.toBeInTheDocument();
  });

  it('translates slide title using i18n', () => {
    const menuSlide = { ...defaultSlide, key: 'menuGuide' };
    render(<OnboardingSlide slide={menuSlide} isActive={true} />);
    expect(screen.getByText('AI Menu Recommendations')).toBeInTheDocument();
  });

  it('translates slide description using i18n', () => {
    const menuSlide = { ...defaultSlide, key: 'menuGuide' };
    render(<OnboardingSlide slide={menuSlide} isActive={true} />);
    expect(screen.getByText('Get personalized menu suggestions')).toBeInTheDocument();
  });

  it('renders with correct structure', () => {
    const { container } = render(<OnboardingSlide slide={defaultSlide} isActive={true} />);
    const slideDiv = container.querySelector('.flex.w-full.shrink-0.flex-col');
    expect(slideDiv).toBeInTheDocument();
  });
});
