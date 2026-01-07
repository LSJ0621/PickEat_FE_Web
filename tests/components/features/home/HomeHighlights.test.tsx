import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { HomeHighlights } from '@/components/features/home/HomeHighlights';

// Mock useScrollAnimation hook with default visible state
const mockUseScrollAnimation = vi.fn(() => ({
  ref: { current: null },
  isVisible: true,
}));

vi.mock('@/hooks/common/useScrollAnimation', () => ({
  useScrollAnimation: () => mockUseScrollAnimation(),
}));

describe('HomeHighlights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseScrollAnimation.mockReturnValue({
      ref: { current: null },
      isVisible: true,
    });
  });

  describe('Rendering', () => {
    it('should render section heading', () => {
      renderWithProviders(<HomeHighlights />);

      expect(screen.getByText('Highlights')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: '주요 기능 하이라이트' })).toBeInTheDocument();
    });

    it('should render section description', () => {
      renderWithProviders(<HomeHighlights />);

      expect(
        screen.getByText('PickEat의 핵심 기능을 통해 더 스마트한 식사 선택을 경험하세요.')
      ).toBeInTheDocument();
    });

    it('should render all three highlight cards', () => {
      renderWithProviders(<HomeHighlights />);

      expect(screen.getByText('AI 추천 기능')).toBeInTheDocument();
      expect(screen.getByText('지도 기반 검색')).toBeInTheDocument();
      expect(screen.getByText('개인화된 추천')).toBeInTheDocument();
    });
  });

  describe('Highlight Cards Content', () => {
    it('should render AI recommendation highlight', () => {
      renderWithProviders(<HomeHighlights />);

      expect(screen.getByText('AI 추천 기능')).toBeInTheDocument();
      expect(
        screen.getByText('개인화된 메뉴 추천으로 매일 새로운 선택을 경험하세요.')
      ).toBeInTheDocument();
    });

    it('should render map-based search highlight', () => {
      renderWithProviders(<HomeHighlights />);

      expect(screen.getByText('지도 기반 검색')).toBeInTheDocument();
      expect(
        screen.getByText('지도와 연동하여 실제 위치 기반 식당을 찾아드립니다.')
      ).toBeInTheDocument();
    });

    it('should render personalized recommendation highlight', () => {
      renderWithProviders(<HomeHighlights />);

      expect(screen.getByText('개인화된 추천')).toBeInTheDocument();
      expect(
        screen.getByText('당신의 취향과 이력을 학습하여 더 정확한 추천을 제공합니다.')
      ).toBeInTheDocument();
    });

    it('should render all highlight icons', () => {
      renderWithProviders(<HomeHighlights />);

      expect(screen.getByText('✨')).toBeInTheDocument();
      expect(screen.getByText('🗺️')).toBeInTheDocument();
      expect(screen.getByText('🎯')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should use grid layout for cards', () => {
      const { container } = renderWithProviders(<HomeHighlights />);

      const grid = container.querySelector('.grid.gap-8.md\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('should have proper section padding', () => {
      const { container } = renderWithProviders(<HomeHighlights />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('py-20', 'px-4');
    });

    it('should have max width container', () => {
      const { container } = renderWithProviders(<HomeHighlights />);

      const maxWidthContainer = container.querySelector('.mx-auto.max-w-6xl');
      expect(maxWidthContainer).toBeInTheDocument();
    });

    it('should have centered heading section', () => {
      const { container } = renderWithProviders(<HomeHighlights />);

      const headingSection = container.querySelector('.text-center');
      expect(headingSection).toBeInTheDocument();
    });
  });

  describe('Highlight Card Styling', () => {
    it('should have rounded borders', () => {
      const { container } = renderWithProviders(<HomeHighlights />);

      const cards = container.querySelectorAll('.rounded-3xl');
      expect(cards.length).toBeGreaterThanOrEqual(3);
    });

    it('should have proper border styling', () => {
      const { container } = renderWithProviders(<HomeHighlights />);

      const cards = container.querySelectorAll('.border.border-white\\/10');
      expect(cards.length).toBeGreaterThanOrEqual(3);
    });

    it('should have hover effects', () => {
      const { container } = renderWithProviders(<HomeHighlights />);

      const cards = container.querySelectorAll('.hover\\:scale-105');
      expect(cards.length).toBeGreaterThanOrEqual(3);
    });

    it('should have overflow hidden for gradient effect', () => {
      const { container } = renderWithProviders(<HomeHighlights />);

      const cards = container.querySelectorAll('.overflow-hidden');
      expect(cards.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Gradient Effects', () => {
    it('should have gradient overlays on cards', () => {
      const { container } = renderWithProviders(<HomeHighlights />);

      const gradients = container.querySelectorAll('.bg-gradient-to-br');
      expect(gradients.length).toBeGreaterThanOrEqual(3);
    });

    it('should have absolute positioned gradient overlays', () => {
      const { container } = renderWithProviders(<HomeHighlights />);

      const absoluteElements = container.querySelectorAll('.absolute.inset-0');
      expect(absoluteElements.length).toBeGreaterThanOrEqual(3);
    });

    it('should have opacity transition on hover', () => {
      const { container } = renderWithProviders(<HomeHighlights />);

      const opacityElements = container.querySelectorAll('.group-hover\\:opacity-10');
      expect(opacityElements.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Scroll Animation', () => {
    it('should apply visible animation classes when isVisible is true', () => {
      const { container } = renderWithProviders(<HomeHighlights />);

      const animatedElements = container.querySelectorAll('.opacity-100.translate-y-0');
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('should apply hidden animation classes when isVisible is false', () => {
      mockUseScrollAnimation.mockReturnValue({
        ref: { current: null },
        isVisible: false,
      });

      const { container } = renderWithProviders(<HomeHighlights />);

      const hiddenElements = container.querySelectorAll('.opacity-0.translate-y-8');
      expect(hiddenElements.length).toBeGreaterThan(0);
    });

    it('should apply transition classes', () => {
      const { container } = renderWithProviders(<HomeHighlights />);

      const transitionElements = container.querySelectorAll('.transition-all.duration-700');
      expect(transitionElements.length).toBeGreaterThan(0);
    });
  });

  describe('Typography', () => {
    it('should have proper heading styles', () => {
      renderWithProviders(<HomeHighlights />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveClass('text-4xl', 'font-bold', 'text-white');
    });

    it('should have proper highlight title styles', () => {
      renderWithProviders(<HomeHighlights />);

      const aiTitle = screen.getByText('AI 추천 기능');
      expect(aiTitle).toHaveClass('text-2xl', 'font-semibold', 'text-white');
    });

    it('should have uppercase label with tracking', () => {
      renderWithProviders(<HomeHighlights />);

      const label = screen.getByText('Highlights');
      expect(label).toHaveClass('text-sm', 'uppercase', 'tracking-[0.4em]');
    });

    it('should have proper description text color', () => {
      renderWithProviders(<HomeHighlights />);

      const description = screen.getByText('개인화된 메뉴 추천으로 매일 새로운 선택을 경험하세요.');
      expect(description).toHaveClass('text-slate-300');
    });
  });

  describe('Accessibility', () => {
    it('should have semantic section element', () => {
      const { container } = renderWithProviders(<HomeHighlights />);

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      renderWithProviders(<HomeHighlights />);

      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toBeInTheDocument();

      const subHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(subHeadings).toHaveLength(3);
    });

    it('should have descriptive text for all highlights', () => {
      renderWithProviders(<HomeHighlights />);

      const descriptions = [
        '개인화된 메뉴 추천으로 매일 새로운 선택을 경험하세요.',
        '지도와 연동하여 실제 위치 기반 식당을 찾아드립니다.',
        '당신의 취향과 이력을 학습하여 더 정확한 추천을 제공합니다.',
      ];

      descriptions.forEach((desc) => {
        expect(screen.getByText(desc)).toBeInTheDocument();
      });
    });
  });

  describe('Content Accuracy', () => {
    it('should display exact highlight titles', () => {
      renderWithProviders(<HomeHighlights />);

      const expectedTitles = ['AI 추천 기능', '지도 기반 검색', '개인화된 추천'];
      expectedTitles.forEach((title) => {
        expect(screen.getByText(title)).toBeInTheDocument();
      });
    });

    it('should display correct icons for each highlight', () => {
      renderWithProviders(<HomeHighlights />);

      const icons = ['✨', '🗺️', '🎯'];
      icons.forEach((icon) => {
        expect(screen.getByText(icon)).toBeInTheDocument();
      });
    });

    it('should have proper max width description', () => {
      renderWithProviders(<HomeHighlights />);

      expect(
        screen.getByText('PickEat의 핵심 기능을 통해 더 스마트한 식사 선택을 경험하세요.')
      ).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid classes', () => {
      const { container } = renderWithProviders(<HomeHighlights />);

      const grid = container.querySelector('.md\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('should have responsive text sizes', () => {
      renderWithProviders(<HomeHighlights />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveClass('sm:text-5xl');
    });
  });

  describe('Group Hover Effects', () => {
    it('should have group class on cards for hover effects', () => {
      const { container } = renderWithProviders(<HomeHighlights />);

      const groups = container.querySelectorAll('.group');
      expect(groups.length).toBeGreaterThanOrEqual(3);
    });

    it('should have relative positioning on card content', () => {
      const { container } = renderWithProviders(<HomeHighlights />);

      const relativeElements = container.querySelectorAll('.relative');
      expect(relativeElements.length).toBeGreaterThan(0);
    });
  });
});
