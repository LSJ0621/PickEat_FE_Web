import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { createMockBugReports } from '@tests/factories';
import { BugReportList } from '@features/admin/components/bug-reports/BugReportList';

describe('BugReportList', () => {
  const mockOnItemClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering with Data', () => {
    it('should render list with bug reports', () => {
      const bugReports = createMockBugReports(3);
      renderWithProviders(
        <BugReportList bugReports={bugReports} onItemClick={mockOnItemClick} />
      );

      bugReports.forEach((report) => {
        expect(screen.getByText(report.title)).toBeInTheDocument();
      });
    });

    it('should render multiple bug report items', () => {
      const bugReports = createMockBugReports(5);
      renderWithProviders(
        <BugReportList bugReports={bugReports} onItemClick={mockOnItemClick} />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(5);
    });

    it('should render bug reports with correct descriptions', () => {
      const bugReports = createMockBugReports(2);
      renderWithProviders(
        <BugReportList bugReports={bugReports} onItemClick={mockOnItemClick} />
      );

      const descriptions = screen.getAllByText(bugReports[0].description);
      expect(descriptions.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no bug reports', () => {
      renderWithProviders(<BugReportList bugReports={[]} onItemClick={mockOnItemClick} />);

      expect(screen.getByText('버그 제보가 없습니다.')).toBeInTheDocument();
    });

    it('should render empty state icon when no bug reports', () => {
      const { container } = renderWithProviders(
        <BugReportList bugReports={[]} onItemClick={mockOnItemClick} />
      );

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should not render any list items in empty state', () => {
      renderWithProviders(<BugReportList bugReports={[]} onItemClick={mockOnItemClick} />);

      const buttons = screen.queryAllByRole('button');
      expect(buttons).toHaveLength(0);
    });

    it('should apply empty state container styles', () => {
      const { container } = renderWithProviders(
        <BugReportList bugReports={[]} onItemClick={mockOnItemClick} />
      );

      const emptyContainer = container.querySelector('.flex.flex-col.items-center');
      expect(emptyContainer).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onItemClick when a bug report is clicked', async () => {
      const user = userEvent.setup();
      const bugReports = createMockBugReports(3);
      renderWithProviders(
        <BugReportList bugReports={bugReports} onItemClick={mockOnItemClick} />
      );

      const firstButton = screen.getByText(bugReports[0].title).closest('button');
      expect(firstButton).toBeInTheDocument();
      await user.click(firstButton!);

      expect(mockOnItemClick).toHaveBeenCalledTimes(1);
      expect(mockOnItemClick).toHaveBeenCalledWith(bugReports[0]);
    });

    it('should call onItemClick with correct bug report data', async () => {
      const user = userEvent.setup();
      const bugReports = createMockBugReports(2);
      renderWithProviders(
        <BugReportList bugReports={bugReports} onItemClick={mockOnItemClick} />
      );

      const secondButton = screen.getByText(bugReports[1].title).closest('button');
      expect(secondButton).toBeInTheDocument();
      await user.click(secondButton!);

      expect(mockOnItemClick).toHaveBeenCalledWith(bugReports[1]);
    });

    it('should handle multiple clicks on different items', async () => {
      const user = userEvent.setup();
      const bugReports = createMockBugReports(3);
      renderWithProviders(
        <BugReportList bugReports={bugReports} onItemClick={mockOnItemClick} />
      );

      const firstButton = screen.getByText(bugReports[0].title).closest('button');
      const secondButton = screen.getByText(bugReports[1].title).closest('button');

      expect(firstButton).toBeInTheDocument();
      expect(secondButton).toBeInTheDocument();
      await user.click(firstButton!);
      await user.click(secondButton!);

      expect(mockOnItemClick).toHaveBeenCalledTimes(2);
      expect(mockOnItemClick).toHaveBeenNthCalledWith(1, bugReports[0]);
      expect(mockOnItemClick).toHaveBeenNthCalledWith(2, bugReports[1]);
    });
  });

  describe('List Layout', () => {
    it('should render items in vertical layout with spacing', () => {
      const bugReports = createMockBugReports(3);
      const { container } = renderWithProviders(
        <BugReportList bugReports={bugReports} onItemClick={mockOnItemClick} />
      );

      const listContainer = container.querySelector('.space-y-3');
      expect(listContainer).toBeInTheDocument();
    });

    it('should render each item as a button', () => {
      const bugReports = createMockBugReports(3);
      renderWithProviders(
        <BugReportList bugReports={bugReports} onItemClick={mockOnItemClick} />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle single bug report', () => {
      const bugReports = createMockBugReports(1);
      renderWithProviders(
        <BugReportList bugReports={bugReports} onItemClick={mockOnItemClick} />
      );

      expect(screen.getByText(bugReports[0].title)).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(1);
    });

    it('should handle large number of bug reports', () => {
      const bugReports = createMockBugReports(50);
      renderWithProviders(
        <BugReportList bugReports={bugReports} onItemClick={mockOnItemClick} />
      );

      expect(screen.getAllByRole('button')).toHaveLength(50);
    });

    it('should maintain list structure with varying content lengths', () => {
      const bugReports = [
        createMockBugReports(1)[0],
        {
          ...createMockBugReports(1)[0],
          title: 'Very long title '.repeat(10),
          description: 'Very long description '.repeat(20),
        },
      ];

      renderWithProviders(
        <BugReportList bugReports={bugReports} onItemClick={mockOnItemClick} />
      );

      expect(screen.getAllByRole('button')).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const bugReports = createMockBugReports(3);
      renderWithProviders(
        <BugReportList bugReports={bugReports} onItemClick={mockOnItemClick} />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should render clickable buttons for each item', () => {
      const bugReports = createMockBugReports(2);
      renderWithProviders(
        <BugReportList bugReports={bugReports} onItemClick={mockOnItemClick} />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeEnabled();
      });
    });
  });
});
