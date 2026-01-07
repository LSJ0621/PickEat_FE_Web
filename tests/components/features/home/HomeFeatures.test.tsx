import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { HomeFeatures } from '@/components/features/home/HomeFeatures';

// Mock useScrollAnimation hook with default visible state
const mockUseScrollAnimation = vi.fn(() => ({
  ref: { current: null },
  isVisible: true,
}));

vi.mock('@/hooks/common/useScrollAnimation', () => ({
  useScrollAnimation: () => mockUseScrollAnimation(),
}));

describe('HomeFeatures', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseScrollAnimation.mockReturnValue({
      ref: { current: null },
      isVisible: true,
    });
  });

  describe('Rendering', () => {
    it('should render section heading', () => {
      renderWithProviders(<HomeFeatures />);

      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: '핵심 기능' })).toBeInTheDocument();
    });

    it('should render section description', () => {
      renderWithProviders(<HomeFeatures />);

      expect(
        screen.getByText('AI 기반의 스마트한 식사 추천 시스템으로 더 나은 선택을 경험하세요.')
      ).toBeInTheDocument();
    });

    it('should render all three feature cards', () => {
      renderWithProviders(<HomeFeatures />);

      expect(screen.getByText('AI 메뉴 추천')).toBeInTheDocument();
      expect(screen.getByText('메뉴별 가게 탐색')).toBeInTheDocument();
      expect(screen.getByText('히스토리 관리')).toBeInTheDocument();
    });
  });

  describe('Feature Cards Content', () => {
    it('should render AI menu recommendation feature', () => {
      renderWithProviders(<HomeFeatures />);

      expect(screen.getByText('AI 메뉴 추천')).toBeInTheDocument();
      expect(
        screen.getByText('기분, 날씨, 취향을 반영한 메뉴를 실시간으로 제안합니다.')
      ).toBeInTheDocument();
    });

    it('should render restaurant search feature', () => {
      renderWithProviders(<HomeFeatures />);

      expect(screen.getByText('메뉴별 가게 탐색')).toBeInTheDocument();
      expect(
        screen.getByText('원하는 메뉴를 고르면 근처 가게 후보를 AI가 선별합니다.')
      ).toBeInTheDocument();
    });

    it('should render history management feature', () => {
      renderWithProviders(<HomeFeatures />);

      expect(screen.getByText('히스토리 관리')).toBeInTheDocument();
      expect(
        screen.getByText('추천받은 메뉴와 가게 이력을 한눈에 확인하고 재탐색할 수 있습니다.')
      ).toBeInTheDocument();
    });

    it('should render all feature icons', () => {
      renderWithProviders(<HomeFeatures />);

      expect(screen.getByText('🤖')).toBeInTheDocument();
      expect(screen.getByText('🗺️')).toBeInTheDocument();
      expect(screen.getByText('📋')).toBeInTheDocument();
    });

    it('should render Feature label for each card', () => {
      renderWithProviders(<HomeFeatures />);

      const featureLabels = screen.getAllByText('Feature');
      expect(featureLabels).toHaveLength(3);
    });
  });

  describe('Layout', () => {
    it('should use grid layout for cards', () => {
      const { container } = renderWithProviders(<HomeFeatures />);

      const grid = container.querySelector('.grid.gap-8.md\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('should have proper section padding', () => {
      const { container } = renderWithProviders(<HomeFeatures />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('py-20', 'px-4');
    });

    it('should have max width container', () => {
      const { container } = renderWithProviders(<HomeFeatures />);

      const maxWidthContainer = container.querySelector('.mx-auto.max-w-6xl');
      expect(maxWidthContainer).toBeInTheDocument();
    });

    it('should have centered heading section', () => {
      const { container } = renderWithProviders(<HomeFeatures />);

      const headingSection = container.querySelector('.text-center');
      expect(headingSection).toBeInTheDocument();
    });
  });

  describe('Feature Card Styling', () => {
    it('should apply gradient backgrounds to cards', () => {
      const { container } = renderWithProviders(<HomeFeatures />);

      const cards = container.querySelectorAll('.rounded-3xl');
      expect(cards.length).toBeGreaterThanOrEqual(3);
    });

    it('should have proper border styling', () => {
      const { container } = renderWithProviders(<HomeFeatures />);

      const cards = container.querySelectorAll('.border.border-white\\/10');
      expect(cards.length).toBeGreaterThanOrEqual(3);
    });

    it('should have hover effects', () => {
      const { container } = renderWithProviders(<HomeFeatures />);

      const cards = container.querySelectorAll('.hover\\:scale-105');
      expect(cards.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Scroll Animation', () => {
    it('should apply visible animation classes when isVisible is true', () => {
      const { container } = renderWithProviders(<HomeFeatures />);

      const animatedElements = container.querySelectorAll('.opacity-100.translate-y-0');
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('should apply hidden animation classes when isVisible is false', () => {
      mockUseScrollAnimation.mockReturnValue({
        ref: { current: null },
        isVisible: false,
      });

      const { container } = renderWithProviders(<HomeFeatures />);

      const hiddenElements = container.querySelectorAll('.opacity-0.translate-y-8');
      expect(hiddenElements.length).toBeGreaterThan(0);
    });

    it('should apply transition classes', () => {
      const { container } = renderWithProviders(<HomeFeatures />);

      const transitionElements = container.querySelectorAll('.transition-all.duration-700');
      expect(transitionElements.length).toBeGreaterThan(0);
    });
  });

  describe('Typography', () => {
    it('should have proper heading styles', () => {
      renderWithProviders(<HomeFeatures />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveClass('text-4xl', 'font-bold', 'text-white');
    });

    it('should have proper feature title styles', () => {
      renderWithProviders(<HomeFeatures />);

      const aiTitle = screen.getByText('AI 메뉴 추천');
      expect(aiTitle).toHaveClass('text-2xl', 'font-semibold', 'text-white');
    });

    it('should have uppercase label with tracking', () => {
      renderWithProviders(<HomeFeatures />);

      const label = screen.getByText('Features');
      expect(label).toHaveClass('text-sm', 'uppercase', 'tracking-[0.4em]');
    });
  });

  describe('Accessibility', () => {
    it('should have semantic section element', () => {
      const { container } = renderWithProviders(<HomeFeatures />);

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      renderWithProviders(<HomeFeatures />);

      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toBeInTheDocument();

      const subHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(subHeadings).toHaveLength(3);
    });

    it('should have descriptive text for all features', () => {
      renderWithProviders(<HomeFeatures />);

      const descriptions = [
        '기분, 날씨, 취향을 반영한 메뉴를 실시간으로 제안합니다.',
        '원하는 메뉴를 고르면 근처 가게 후보를 AI가 선별합니다.',
        '추천받은 메뉴와 가게 이력을 한눈에 확인하고 재탐색할 수 있습니다.',
      ];

      descriptions.forEach((desc) => {
        expect(screen.getByText(desc)).toBeInTheDocument();
      });
    });
  });

  describe('Content Accuracy', () => {
    it('should display exact feature titles', () => {
      renderWithProviders(<HomeFeatures />);

      const expectedTitles = ['AI 메뉴 추천', '메뉴별 가게 탐색', '히스토리 관리'];
      expectedTitles.forEach((title) => {
        expect(screen.getByText(title)).toBeInTheDocument();
      });
    });

    it('should display correct icons for each feature', () => {
      renderWithProviders(<HomeFeatures />);

      const icons = ['🤖', '🗺️', '📋'];
      icons.forEach((icon) => {
        expect(screen.getByText(icon)).toBeInTheDocument();
      });
    });

    it('should have proper max width description', () => {
      renderWithProviders(<HomeFeatures />);

      expect(
        screen.getByText('AI 기반의 스마트한 식사 추천 시스템으로 더 나은 선택을 경험하세요.')
      ).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid classes', () => {
      const { container } = renderWithProviders(<HomeFeatures />);

      const grid = container.querySelector('.md\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('should have responsive text sizes', () => {
      renderWithProviders(<HomeFeatures />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveClass('sm:text-5xl');
    });
  });
});
