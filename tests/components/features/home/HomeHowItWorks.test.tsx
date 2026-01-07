import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { HomeHowItWorks } from '@/components/features/home/HomeHowItWorks';

// Mock useScrollAnimation hook with default visible state
const mockUseScrollAnimation = vi.fn(() => ({
  ref: { current: null },
  isVisible: true,
}));

vi.mock('@/hooks/common/useScrollAnimation', () => ({
  useScrollAnimation: () => mockUseScrollAnimation(),
}));

describe('HomeHowItWorks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseScrollAnimation.mockReturnValue({
      ref: { current: null },
      isVisible: true,
    });
  });

  describe('Rendering', () => {
    it('should render section heading', () => {
      renderWithProviders(<HomeHowItWorks />);

      expect(screen.getByText('How it works')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'AI 추천 플로우' })).toBeInTheDocument();
    });

    it('should render section description', () => {
      renderWithProviders(<HomeHowItWorks />);

      expect(screen.getByText('간단한 3단계로 원하는 메뉴와 가게를 찾아보세요.')).toBeInTheDocument();
    });

    it('should render all three step items', () => {
      renderWithProviders(<HomeHowItWorks />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Step Content', () => {
    it('should render step 1 content correctly', () => {
      renderWithProviders(<HomeHowItWorks />);

      expect(screen.getByText('AI에게 오늘의 기분이나 상황을 알려주세요.')).toBeInTheDocument();
      expect(screen.getByText('간단한 대화로 당신의 상황을 파악합니다.')).toBeInTheDocument();
    });

    it('should render step 2 content correctly', () => {
      renderWithProviders(<HomeHowItWorks />);

      expect(screen.getByText('추천된 메뉴 중 마음에 드는 항목을 선택하세요.')).toBeInTheDocument();
      expect(screen.getByText('AI가 제안한 메뉴 중에서 선택하면 됩니다.')).toBeInTheDocument();
    });

    it('should render step 3 content correctly', () => {
      renderWithProviders(<HomeHowItWorks />);

      expect(screen.getByText('메뉴별 AI 가게 추천으로 바로 근처 식당을 확인하세요.')).toBeInTheDocument();
      expect(screen.getByText('선택한 메뉴를 판매하는 주변 식당을 추천해드립니다.')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have proper section padding', () => {
      const { container } = renderWithProviders(<HomeHowItWorks />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('py-20', 'px-4');
    });

    it('should have max width container', () => {
      const { container } = renderWithProviders(<HomeHowItWorks />);

      const maxWidthContainer = container.querySelector('.mx-auto.max-w-4xl');
      expect(maxWidthContainer).toBeInTheDocument();
    });

    it('should have centered heading section', () => {
      const { container } = renderWithProviders(<HomeHowItWorks />);

      const headingSection = container.querySelector('.text-center');
      expect(headingSection).toBeInTheDocument();
    });

    it('should have vertical spacing between steps', () => {
      const { container } = renderWithProviders(<HomeHowItWorks />);

      const stepsContainer = container.querySelector('.space-y-8');
      expect(stepsContainer).toBeInTheDocument();
    });
  });

  describe('Step Item Styling', () => {
    it('should have rounded borders on step items', () => {
      const { container } = renderWithProviders(<HomeHowItWorks />);

      const stepItems = container.querySelectorAll('.rounded-3xl');
      expect(stepItems.length).toBeGreaterThanOrEqual(3);
    });

    it('should have flex layout for step items', () => {
      const { container } = renderWithProviders(<HomeHowItWorks />);

      const stepItems = container.querySelectorAll('.flex');
      expect(stepItems.length).toBeGreaterThan(0);
    });

    it('should have proper border styling', () => {
      const { container } = renderWithProviders(<HomeHowItWorks />);

      const stepItems = container.querySelectorAll('.border.border-white\\/10');
      expect(stepItems.length).toBeGreaterThanOrEqual(3);
    });

    it('should have gradient background', () => {
      const { container } = renderWithProviders(<HomeHowItWorks />);

      const gradients = container.querySelectorAll('.bg-gradient-to-br');
      expect(gradients.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Step Number Badge', () => {
    it('should display all step numbers', () => {
      renderWithProviders(<HomeHowItWorks />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should have circular badge styling', () => {
      const { container } = renderWithProviders(<HomeHowItWorks />);

      const badges = container.querySelectorAll('.rounded-full');
      expect(badges.length).toBeGreaterThanOrEqual(3);
    });

    it('should have proper size for badges', () => {
      const { container } = renderWithProviders(<HomeHowItWorks />);

      const badges = container.querySelectorAll('.h-16.w-16');
      expect(badges.length).toBeGreaterThanOrEqual(3);
    });

    it('should have gradient background on badges', () => {
      const { container } = renderWithProviders(<HomeHowItWorks />);

      const badgeGradients = container.querySelectorAll('.bg-gradient-to-br.from-orange-500\\/30');
      expect(badgeGradients.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Scroll Animation', () => {
    it('should apply visible animation classes when isVisible is true', () => {
      const { container } = renderWithProviders(<HomeHowItWorks />);

      const animatedElements = container.querySelectorAll('.opacity-100');
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('should apply hidden animation classes when isVisible is false', () => {
      mockUseScrollAnimation.mockReturnValue({
        ref: { current: null },
        isVisible: false,
      });

      const { container } = renderWithProviders(<HomeHowItWorks />);

      const hiddenElements = container.querySelectorAll('.opacity-0.-translate-x-8');
      expect(hiddenElements.length).toBeGreaterThan(0);
    });

    it('should apply horizontal translate animation', () => {
      const { container } = renderWithProviders(<HomeHowItWorks />);

      const translateElements = container.querySelectorAll('.translate-x-0');
      expect(translateElements.length).toBeGreaterThan(0);
    });

    it('should apply transition classes', () => {
      const { container } = renderWithProviders(<HomeHowItWorks />);

      const transitionElements = container.querySelectorAll('.transition-all.duration-700');
      expect(transitionElements.length).toBeGreaterThan(0);
    });
  });

  describe('Typography', () => {
    it('should have proper main heading styles', () => {
      renderWithProviders(<HomeHowItWorks />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveClass('text-4xl', 'font-bold', 'text-white');
    });

    it('should have proper step title styles', () => {
      renderWithProviders(<HomeHowItWorks />);

      const stepTitle = screen.getByText('AI에게 오늘의 기분이나 상황을 알려주세요.');
      expect(stepTitle).toHaveClass('text-xl', 'font-semibold', 'text-white');
    });

    it('should have uppercase label with tracking', () => {
      renderWithProviders(<HomeHowItWorks />);

      const label = screen.getByText('How it works');
      expect(label).toHaveClass('text-sm', 'uppercase', 'tracking-[0.4em]');
    });

    it('should have proper description text color', () => {
      renderWithProviders(<HomeHowItWorks />);

      const description = screen.getByText('간단한 대화로 당신의 상황을 파악합니다.');
      expect(description).toHaveClass('text-slate-300');
    });
  });

  describe('Accessibility', () => {
    it('should have semantic section element', () => {
      const { container } = renderWithProviders(<HomeHowItWorks />);

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      renderWithProviders(<HomeHowItWorks />);

      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toBeInTheDocument();

      const subHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(subHeadings).toHaveLength(3);
    });

    it('should have descriptive text for all steps', () => {
      renderWithProviders(<HomeHowItWorks />);

      const descriptions = [
        '간단한 대화로 당신의 상황을 파악합니다.',
        'AI가 제안한 메뉴 중에서 선택하면 됩니다.',
        '선택한 메뉴를 판매하는 주변 식당을 추천해드립니다.',
      ];

      descriptions.forEach((desc) => {
        expect(screen.getByText(desc)).toBeInTheDocument();
      });
    });
  });

  describe('Content Accuracy', () => {
    it('should display exact step titles', () => {
      renderWithProviders(<HomeHowItWorks />);

      const expectedTitles = [
        'AI에게 오늘의 기분이나 상황을 알려주세요.',
        '추천된 메뉴 중 마음에 드는 항목을 선택하세요.',
        '메뉴별 AI 가게 추천으로 바로 근처 식당을 확인하세요.',
      ];

      expectedTitles.forEach((title) => {
        expect(screen.getByText(title)).toBeInTheDocument();
      });
    });

    it('should display step numbers 1 through 3', () => {
      renderWithProviders(<HomeHowItWorks />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should have proper description text', () => {
      renderWithProviders(<HomeHowItWorks />);

      expect(screen.getByText('간단한 3단계로 원하는 메뉴와 가게를 찾아보세요.')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive flex direction', () => {
      const { container } = renderWithProviders(<HomeHowItWorks />);

      const flexItems = container.querySelectorAll('.sm\\:flex-row');
      expect(flexItems.length).toBeGreaterThanOrEqual(3);
    });

    it('should have responsive text sizes', () => {
      renderWithProviders(<HomeHowItWorks />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveClass('sm:text-5xl');
    });

    it('should have responsive title text sizes', () => {
      renderWithProviders(<HomeHowItWorks />);

      const stepTitle = screen.getByText('AI에게 오늘의 기분이나 상황을 알려주세요.');
      expect(stepTitle).toHaveClass('sm:text-2xl');
    });
  });

  describe('Flex Layout', () => {
    it('should have flex layout with gap', () => {
      const { container } = renderWithProviders(<HomeHowItWorks />);

      const flexContainers = container.querySelectorAll('.flex.gap-6');
      expect(flexContainers.length).toBeGreaterThanOrEqual(3);
    });

    it('should have flex-1 on content area', () => {
      const { container } = renderWithProviders(<HomeHowItWorks />);

      const flexOnes = container.querySelectorAll('.flex-1');
      expect(flexOnes.length).toBeGreaterThanOrEqual(3);
    });

    it('should have shrink-0 on badges', () => {
      const { container } = renderWithProviders(<HomeHowItWorks />);

      const noShrink = container.querySelectorAll('.shrink-0');
      expect(noShrink.length).toBeGreaterThanOrEqual(3);
    });
  });
});
