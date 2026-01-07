import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { createMockBugReport, createMockBugReportWithImages } from '@tests/factories';
import { BugReportListItem } from '@/components/features/admin/bug-reports/BugReportListItem';
import { BUG_REPORT } from '@/utils/constants';

describe('BugReportListItem', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering Basic Information', () => {
    it('should render bug report title', () => {
      const bugReport = createMockBugReport({ title: '테스트 버그 제목' });
      renderWithProviders(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);
      expect(screen.getByText('테스트 버그 제목')).toBeInTheDocument();
    });

    it('should render bug report description', () => {
      const bugReport = createMockBugReport({ description: '버그 상세 설명입니다.' });
      renderWithProviders(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);
      expect(screen.getByText('버그 상세 설명입니다.')).toBeInTheDocument();
    });

    it('should render bug report category', () => {
      const bugReport = createMockBugReport({ category: 'BUG' });
      renderWithProviders(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);
      expect(screen.getByText(BUG_REPORT.CATEGORIES.BUG)).toBeInTheDocument();
    });

    it('should render different category types correctly', () => {
      const bugReport = createMockBugReport({ category: 'INQUIRY' });
      renderWithProviders(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);
      expect(screen.getByText(BUG_REPORT.CATEGORIES.INQUIRY)).toBeInTheDocument();
    });
  });

  describe('Status Badge Display', () => {
    it('should render UNCONFIRMED status badge with correct text', () => {
      const bugReport = createMockBugReport({ status: 'UNCONFIRMED' });
      renderWithProviders(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);
      expect(screen.getByText('미확인')).toBeInTheDocument();
    });

    it('should render CONFIRMED status badge with correct text', () => {
      const bugReport = createMockBugReport({ status: 'CONFIRMED' });
      renderWithProviders(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);
      expect(screen.getByText('확인')).toBeInTheDocument();
    });

    it('should apply UNCONFIRMED status badge styling', () => {
      const bugReport = createMockBugReport({ status: 'UNCONFIRMED' });
      renderWithProviders(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);
      const badge = screen.getByText('미확인');
      expect(badge).toHaveClass('bg-red-500/20', 'text-red-400');
    });

    it('should apply CONFIRMED status badge styling', () => {
      const bugReport = createMockBugReport({ status: 'CONFIRMED' });
      renderWithProviders(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);
      const badge = screen.getByText('확인');
      expect(badge).toHaveClass('bg-green-500/20', 'text-green-400');
    });
  });

  describe('Date Formatting', () => {
    it('should render formatted creation date', () => {
      const bugReport = createMockBugReport({ createdAt: '2024-01-15T10:30:00.000Z' });
      renderWithProviders(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);

      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    it('should format date in Korean locale', () => {
      const bugReport = createMockBugReport({ createdAt: '2024-03-20T15:45:00.000Z' });
      const { container } = renderWithProviders(
        <BugReportListItem bugReport={bugReport} onClick={mockOnClick} />
      );

      const dateElement = container.querySelector('.text-xs.text-slate-500');
      expect(dateElement?.textContent).toBeTruthy();
    });
  });

  describe('Image Indicator', () => {
    it('should display image count when images exist', () => {
      const bugReport = createMockBugReportWithImages();
      renderWithProviders(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should display image icon when images exist', () => {
      const bugReport = createMockBugReportWithImages();
      const { container } = renderWithProviders(
        <BugReportListItem bugReport={bugReport} onClick={mockOnClick} />
      );

      const imageIcon = container.querySelector('svg.h-4.w-4');
      expect(imageIcon).toBeInTheDocument();
    });

    it('should not display image indicator when no images', () => {
      const bugReport = createMockBugReport({ images: null });
      renderWithProviders(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);

      const imageIcon = screen.queryByText('0');
      expect(imageIcon).not.toBeInTheDocument();
    });

    it('should not display image indicator when images array is empty', () => {
      const bugReport = createMockBugReport({ images: [] });
      renderWithProviders(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);

      const imageIcon = screen.queryByRole('img');
      expect(imageIcon).not.toBeInTheDocument();
    });

    it('should display correct count for single image', () => {
      const bugReport = createMockBugReport({
        images: ['https://example.com/image1.png']
      });
      renderWithProviders(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should display correct count for multiple images', () => {
      const bugReport = createMockBugReport({
        images: [
          'https://example.com/image1.png',
          'https://example.com/image2.png',
          'https://example.com/image3.png',
        ]
      });
      renderWithProviders(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);

      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onClick when item is clicked', async () => {
      const user = userEvent.setup();
      const bugReport = createMockBugReport();
      renderWithProviders(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should be clickable as a button', () => {
      const bugReport = createMockBugReport();
      renderWithProviders(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it('should handle multiple clicks', async () => {
      const user = userEvent.setup();
      const bugReport = createMockBugReport();
      renderWithProviders(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Styling and Layout', () => {
    it('should render as a button element', () => {
      const bugReport = createMockBugReport();
      renderWithProviders(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should apply proper card styles', () => {
      const bugReport = createMockBugReport();
      renderWithProviders(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-lg', 'border', 'border-slate-700');
    });

    it('should have transition effects', () => {
      const bugReport = createMockBugReport();
      renderWithProviders(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition');
    });

    it('should render right arrow icon', () => {
      const bugReport = createMockBugReport();
      const { container } = renderWithProviders(
        <BugReportListItem bugReport={bugReport} onClick={mockOnClick} />
      );

      const arrowIcon = container.querySelector('svg.h-5.w-5.flex-shrink-0');
      expect(arrowIcon).toBeInTheDocument();
    });
  });

  describe('Text Truncation', () => {
    it('should apply line-clamp to description', () => {
      const bugReport = createMockBugReport({
        description: 'Very long description '.repeat(20)
      });
      const { container } = renderWithProviders(
        <BugReportListItem bugReport={bugReport} onClick={mockOnClick} />
      );

      const description = container.querySelector('.line-clamp-2');
      expect(description).toBeInTheDocument();
    });
  });

  describe('Component Memoization', () => {
    it('should render correctly with memo optimization', () => {
      const bugReport = createMockBugReport();
      const { rerender } = renderWithProviders(
        <BugReportListItem bugReport={bugReport} onClick={mockOnClick} />
      );

      expect(screen.getByText(bugReport.title)).toBeInTheDocument();

      rerender(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);

      expect(screen.getByText(bugReport.title)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const bugReport = createMockBugReport();
      renderWithProviders(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalled();
    });

    it('should have proper button role', () => {
      const bugReport = createMockBugReport();
      renderWithProviders(<BugReportListItem bugReport={bugReport} onClick={mockOnClick} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
