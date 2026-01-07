import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { BugReportListSkeleton } from '@/components/features/admin/bug-reports/BugReportListSkeleton';

describe('BugReportListSkeleton', () => {
  describe('Rendering', () => {
    it('should render skeleton items', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const skeletonItems = container.querySelectorAll('.animate-pulse');
      expect(skeletonItems.length).toBeGreaterThan(0);
    });

    it('should render exactly 5 skeleton items', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const skeletonItems = container.querySelectorAll('.animate-pulse');
      expect(skeletonItems).toHaveLength(5);
    });

    it('should render skeleton container with proper spacing', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const containerDiv = container.querySelector('.space-y-3');
      expect(containerDiv).toBeInTheDocument();
    });
  });

  describe('Skeleton Structure', () => {
    it('should render skeleton badges for each item', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const badges = container.querySelectorAll('.h-6.w-16.rounded-full');
      expect(badges.length).toBeGreaterThanOrEqual(5);
    });

    it('should render skeleton title placeholders', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const titles = container.querySelectorAll('.h-5');
      expect(titles.length).toBeGreaterThan(0);
    });

    it('should render skeleton description placeholders', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const descriptions = container.querySelectorAll('.h-4');
      expect(descriptions.length).toBeGreaterThan(0);
    });

    it('should render skeleton arrow icons', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const arrows = container.querySelectorAll('.h-5.w-5.flex-shrink-0');
      expect(arrows).toHaveLength(5);
    });
  });

  describe('Styling', () => {
    it('should apply animation to skeleton items', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const skeletonItems = container.querySelectorAll('.animate-pulse');
      skeletonItems.forEach((item) => {
        expect(item).toHaveClass('animate-pulse');
      });
    });

    it('should apply proper border styling', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const skeletonItems = container.querySelectorAll('.border-slate-700');
      expect(skeletonItems.length).toBeGreaterThan(0);
    });

    it('should apply rounded corners to skeleton items', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const skeletonItems = container.querySelectorAll('.rounded-lg');
      expect(skeletonItems.length).toBeGreaterThan(0);
    });

    it('should apply background color to skeleton elements', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const skeletonElements = container.querySelectorAll('.bg-slate-700');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('should apply proper padding to skeleton items', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const skeletonItems = container.querySelectorAll('.p-4');
      expect(skeletonItems.length).toBeGreaterThan(0);
    });
  });

  describe('Layout Structure', () => {
    it('should render items in flex layout', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const flexContainers = container.querySelectorAll('.flex');
      expect(flexContainers.length).toBeGreaterThan(0);
    });

    it('should have proper spacing between elements', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const spacedContainers = container.querySelectorAll('.space-y-3, .space-y-2');
      expect(spacedContainers.length).toBeGreaterThan(0);
    });

    it('should render skeleton with gap between items', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const gapContainers = container.querySelectorAll('.gap-3, .gap-4');
      expect(gapContainers.length).toBeGreaterThan(0);
    });
  });

  describe('Skeleton Dimensions', () => {
    it('should render badge skeletons with correct size', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const badges = container.querySelectorAll('.h-6.w-16');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should render title skeleton with proper width', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const titles = container.querySelectorAll('.w-3\\/4');
      expect(titles.length).toBeGreaterThan(0);
    });

    it('should render description skeleton with full width', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const descriptions = container.querySelectorAll('.w-full');
      expect(descriptions.length).toBeGreaterThan(0);
    });

    it('should render description skeleton with 5/6 width', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const descriptions = container.querySelectorAll('.w-5\\/6');
      expect(descriptions.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should render without interactive elements', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const buttons = container.querySelectorAll('button');
      expect(buttons).toHaveLength(0);
    });

    it('should not have any links', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const links = container.querySelectorAll('a');
      expect(links).toHaveLength(0);
    });

    it('should render as static content only', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const interactiveElements = container.querySelectorAll('button, a, input');
      expect(interactiveElements).toHaveLength(0);
    });
  });

  describe('Visual Consistency', () => {
    it('should maintain consistent structure across all skeleton items', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const skeletonItems = container.querySelectorAll('.animate-pulse');

      const firstItem = skeletonItems[0];
      const lastItem = skeletonItems[4];

      expect(firstItem.className).toBe(lastItem.className);
    });

    it('should render all items with same styling', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const skeletonItems = container.querySelectorAll('.bg-slate-900\\/50');
      expect(skeletonItems).toHaveLength(5);
    });
  });

  describe('Component Isolation', () => {
    it('should render independently without props', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should not throw errors when rendered', () => {
      expect(() => renderWithProviders(<BugReportListSkeleton />)).not.toThrow();
    });

    it('should render consistently on multiple renders', () => {
      const { container, rerender } = renderWithProviders(<BugReportListSkeleton />);
      const initialHTML = container.innerHTML;

      rerender(<BugReportListSkeleton />);
      const rerenderedHTML = container.innerHTML;

      expect(initialHTML).toBe(rerenderedHTML);
    });
  });

  describe('Performance', () => {
    it('should render efficiently with minimal elements', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const allElements = container.querySelectorAll('*');
      expect(allElements.length).toBeLessThan(100);
    });

    it('should use CSS animations instead of JavaScript', () => {
      const { container } = renderWithProviders(<BugReportListSkeleton />);
      const animatedElements = container.querySelectorAll('.animate-pulse');
      expect(animatedElements.length).toBeGreaterThan(0);
    });
  });
});
