import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { ResultsTabs } from '@/components/features/agent/ResultsTabs';

describe('ResultsTabs', () => {
  const mockOnTabChange = vi.fn();
  const mockSearchContent = <div>Search Results Content</div>;
  const mockAiContent = <div>AI Recommendations Content</div>;

  const defaultProps = {
    activeTab: 'search' as const,
    onTabChange: mockOnTabChange,
    searchCount: 5,
    aiCount: 3,
    searchLoading: false,
    aiLoading: false,
    searchContent: mockSearchContent,
    aiContent: mockAiContent,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render both tab buttons', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} />);
      expect(screen.getByText('일반 검색')).toBeInTheDocument();
      expect(screen.getByText('AI 추천')).toBeInTheDocument();
    });

    it('should render search count when provided', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} searchCount={10} />);
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should render ai count when provided', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} aiCount={7} />);
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('should not render count badges when counts are zero', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} searchCount={0} aiCount={0} />);
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('should render active tab content', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} activeTab="search" />);
      expect(screen.getByText('Search Results Content')).toBeInTheDocument();
      expect(screen.getByText('Search Results Content')).toBeVisible();
    });

    it('should hide inactive tab content', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} activeTab="search" />);
      const aiContent = screen.getByText('AI Recommendations Content');
      expect(aiContent).toBeInTheDocument();
      expect(aiContent.parentElement).toHaveClass('hidden');
    });
  });

  describe('Tab Switching', () => {
    it('should call onTabChange when search tab is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ResultsTabs {...defaultProps} activeTab="ai" />);

      const searchTab = screen.getByText('일반 검색');
      await user.click(searchTab);

      expect(mockOnTabChange).toHaveBeenCalledWith('search');
    });

    it('should call onTabChange when AI tab is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ResultsTabs {...defaultProps} activeTab="search" />);

      const aiTab = screen.getByText('AI 추천');
      await user.click(aiTab);

      expect(mockOnTabChange).toHaveBeenCalledWith('ai');
    });

    it('should display search content when search tab is active', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} activeTab="search" />);
      const searchContent = screen.getByText('Search Results Content');
      expect(searchContent.parentElement).not.toHaveClass('hidden');
    });

    it('should display AI content when AI tab is active', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} activeTab="ai" />);
      const aiContent = screen.getByText('AI Recommendations Content');
      expect(aiContent.parentElement).not.toHaveClass('hidden');
    });

    it('should allow switching between tabs multiple times', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ResultsTabs {...defaultProps} activeTab="search" />);

      const aiTab = screen.getByText('AI 추천');
      await user.click(aiTab);
      expect(mockOnTabChange).toHaveBeenCalledWith('ai');

      const searchTab = screen.getByText('일반 검색');
      await user.click(searchTab);
      expect(mockOnTabChange).toHaveBeenCalledWith('search');

      expect(mockOnTabChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('Active Tab Styling', () => {
    it('should apply active styles to search tab when active', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} activeTab="search" />);
      const searchTab = screen.getByText('일반 검색').closest('button');
      expect(searchTab).toHaveClass('from-orange-500/20', 'to-rose-500/20');
    });

    it('should apply active styles to AI tab when active', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} activeTab="ai" />);
      const aiTab = screen.getByText('AI 추천').closest('button');
      expect(aiTab).toHaveClass('from-orange-500/20', 'to-rose-500/20');
    });

    it('should apply inactive styles to search tab when not active', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} activeTab="ai" />);
      const searchTab = screen.getByText('일반 검색').closest('button');
      expect(searchTab).toHaveClass('text-slate-400');
    });

    it('should apply inactive styles to AI tab when not active', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} activeTab="search" />);
      const aiTab = screen.getByText('AI 추천').closest('button');
      expect(aiTab).toHaveClass('text-slate-400');
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner for search when searchLoading is true', () => {
      renderWithProviders(
        <ResultsTabs {...defaultProps} searchLoading={true} />
      );
      const searchButton = screen.getByText('일반 검색').parentElement;
      const spinner = searchButton?.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should show loading spinner for AI when aiLoading is true', () => {
      renderWithProviders(
        <ResultsTabs {...defaultProps} aiLoading={true} />
      );
      const aiButton = screen.getByText('AI 추천').parentElement;
      const spinner = aiButton?.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should not show count badge when search is loading', () => {
      renderWithProviders(
        <ResultsTabs {...defaultProps} searchLoading={true} searchCount={5} />
      );
      const searchButton = screen.getByText('일반 검색').parentElement;
      expect(searchButton?.textContent).not.toContain('5');
    });

    it('should not show count badge when AI is loading', () => {
      renderWithProviders(
        <ResultsTabs {...defaultProps} aiLoading={true} aiCount={3} />
      );
      const aiButton = screen.getByText('AI 추천').parentElement;
      expect(aiButton?.textContent).not.toContain('3');
    });

    it('should show count badge when not loading', () => {
      renderWithProviders(
        <ResultsTabs {...defaultProps} searchLoading={false} searchCount={5} />
      );
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Count Badges', () => {
    it('should display search count badge with correct number', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} searchCount={15} />);
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('should display AI count badge with correct number', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} aiCount={8} />);
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('should display both count badges when both have counts', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} searchCount={10} aiCount={5} />);
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should apply proper styling to count badges', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} searchCount={3} aiCount={5} />);
      const badge = screen.getByText('3');
      expect(badge).toHaveClass('rounded-full', 'bg-white/10');
    });
  });

  describe('Tab Content Display', () => {
    it('should render custom search content', () => {
      const customSearchContent = <div>Custom Search Content</div>;
      renderWithProviders(
        <ResultsTabs {...defaultProps} searchContent={customSearchContent} activeTab="search" />
      );
      expect(screen.getByText('Custom Search Content')).toBeInTheDocument();
    });

    it('should render custom AI content', () => {
      const customAiContent = <div>Custom AI Content</div>;
      renderWithProviders(
        <ResultsTabs {...defaultProps} aiContent={customAiContent} activeTab="ai" />
      );
      expect(screen.getByText('Custom AI Content')).toBeInTheDocument();
    });

    it('should maintain both contents in DOM but show only active', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} activeTab="search" />);

      expect(screen.getByText('Search Results Content')).toBeInTheDocument();
      expect(screen.getByText('AI Recommendations Content')).toBeInTheDocument();

      const searchContent = screen.getByText('Search Results Content');
      const aiContent = screen.getByText('AI Recommendations Content');

      expect(searchContent.parentElement).not.toHaveClass('hidden');
      expect(aiContent.parentElement).toHaveClass('hidden');
    });
  });

  describe('Responsive Design', () => {
    it('should apply responsive padding classes to tabs', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} />);
      const searchTab = screen.getByText('일반 검색').closest('button');
      expect(searchTab).toHaveClass('px-2.5', 'py-1.5', 'sm:px-4', 'sm:py-2');
    });

    it('should apply responsive text size classes', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} />);
      const searchTab = screen.getByText('일반 검색').closest('button');
      expect(searchTab).toHaveClass('text-xs', 'sm:text-sm');
    });

    it('should apply responsive gap classes to tab container', () => {
      const { container } = renderWithProviders(<ResultsTabs {...defaultProps} />);
      const tabContainer = container.querySelector('.flex.gap-1\\.5.sm\\:gap-2');
      expect(tabContainer).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should apply fade-in animation to tab content', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} activeTab="search" />);
      const searchContent = screen.getByText('Search Results Content');
      expect(searchContent.parentElement).toHaveClass('animate-fade-in');
    });

    it('should apply transition classes to tabs', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} />);
      const searchTab = screen.getByText('일반 검색').closest('button');
      expect(searchTab).toHaveClass('transition-all', 'duration-300');
    });
  });

  describe('Accessibility', () => {
    it('should render tabs as buttons', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ResultsTabs {...defaultProps} />);

      const aiTab = screen.getByText('AI 추천').closest('button');
      expect(aiTab).toBeInTheDocument();
      aiTab!.focus();
      await user.keyboard('{Enter}');
      expect(mockOnTabChange).toHaveBeenCalledWith('ai');
    });

    it('should maintain proper tab order', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveTextContent('일반 검색');
      expect(buttons[1]).toHaveTextContent('AI 추천');
    });
  });

  describe('Layout Structure', () => {
    it('should render tab navigation container', () => {
      const { container } = renderWithProviders(<ResultsTabs {...defaultProps} />);
      const tabNav = container.querySelector('.flex.gap-1\\.5');
      expect(tabNav).toBeInTheDocument();
    });

    it('should render content container with minimum height', () => {
      const { container } = renderWithProviders(<ResultsTabs {...defaultProps} />);
      const contentContainer = container.querySelector('.min-h-\\[200px\\]');
      expect(contentContainer).toBeInTheDocument();
    });

    it('should apply proper spacing between tabs and content', () => {
      const { container } = renderWithProviders(<ResultsTabs {...defaultProps} />);
      const mainContainer = container.querySelector('.space-y-3.sm\\:space-y-4');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should render tabs with equal flex basis', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} />);
      const searchTab = screen.getByText('일반 검색').closest('button');
      const aiTab = screen.getByText('AI 추천').closest('button');
      expect(searchTab).toHaveClass('flex-1');
      expect(aiTab).toHaveClass('flex-1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large count numbers', () => {
      renderWithProviders(<ResultsTabs {...defaultProps} searchCount={999} aiCount={888} />);
      expect(screen.getByText('999')).toBeInTheDocument();
      expect(screen.getByText('888')).toBeInTheDocument();
    });

    it('should handle tab change on already active tab', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ResultsTabs {...defaultProps} activeTab="search" />);

      const searchTab = screen.getByText('일반 검색');
      await user.click(searchTab);

      expect(mockOnTabChange).toHaveBeenCalledWith('search');
    });

    it('should handle empty content gracefully', () => {
      renderWithProviders(
        <ResultsTabs {...defaultProps} searchContent={null} aiContent={null} />
      );
      expect(screen.getByText('일반 검색')).toBeInTheDocument();
      expect(screen.getByText('AI 추천')).toBeInTheDocument();
    });
  });
});
