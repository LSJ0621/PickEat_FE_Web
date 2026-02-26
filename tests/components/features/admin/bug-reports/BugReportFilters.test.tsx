import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { BugReportFilters } from '@features/admin/components/bug-reports/BugReportFilters';
import type { BugReportStatus } from '@features/bug-report/types';

describe('BugReportFilters', () => {
  const mockOnStatusChange = vi.fn();
  const mockOnDateChange = vi.fn();
  const mockOnCategoryChange = vi.fn();
  const mockOnSearchChange = vi.fn();
  const mockOnReset = vi.fn();

  const defaultProps = {
    status: 'UNCONFIRMED' as BugReportStatus,
    date: '2024-01-15',
    category: undefined as any,
    search: '',
    onStatusChange: mockOnStatusChange,
    onDateChange: mockOnDateChange,
    onCategoryChange: mockOnCategoryChange,
    onSearchChange: mockOnSearchChange,
    onReset: mockOnReset,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render status filter with correct value', () => {
      renderWithProviders(<BugReportFilters {...defaultProps} />);
      const statusSelect = screen.getByDisplayValue('미확인');
      expect(statusSelect).toBeInTheDocument();
    });

    it('should render date filter with correct value', () => {
      renderWithProviders(<BugReportFilters {...defaultProps} />);
      const dateInput = screen.getByDisplayValue('2024-01-15');
      expect(dateInput).toBeInTheDocument();
    });

    it('should render reset button', () => {
      renderWithProviders(<BugReportFilters {...defaultProps} />);
      expect(screen.getByRole('button', { name: '초기화' })).toBeInTheDocument();
    });

    it('should render status options', () => {
      renderWithProviders(<BugReportFilters {...defaultProps} />);
      // Status select contains '미확인' and '확인' options
      expect(screen.getAllByRole('option', { name: '미확인' })).toHaveLength(1);
      expect(screen.getAllByRole('option', { name: '확인' })).toHaveLength(1);
      // Both status and category selects have '전체' option
      expect(screen.getAllByRole('option', { name: '전체' }).length).toBeGreaterThanOrEqual(1);
    });

    it('should render with ALL status', () => {
      renderWithProviders(<BugReportFilters {...defaultProps} status="ALL" />);
      // Both status and category selects show '전체' when status=ALL and category=undefined(ALL)
      const selects = screen.getAllByDisplayValue('전체');
      expect(selects.length).toBeGreaterThanOrEqual(1);
    });

    it('should render with CONFIRMED status', () => {
      renderWithProviders(<BugReportFilters {...defaultProps} status="CONFIRMED" />);
      const statusSelect = screen.getByDisplayValue('확인');
      expect(statusSelect).toBeInTheDocument();
    });

    it('should render with undefined status (defaults to UNCONFIRMED)', () => {
      renderWithProviders(<BugReportFilters {...defaultProps} status={undefined} />);
      const statusSelect = screen.getByDisplayValue('미확인');
      expect(statusSelect).toBeInTheDocument();
    });
  });

  describe('Status Filter Interaction', () => {
    it('should call onStatusChange when status is changed to CONFIRMED', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BugReportFilters {...defaultProps} />);

      const statusSelect = screen.getByDisplayValue('미확인');
      await user.selectOptions(statusSelect, 'CONFIRMED');

      expect(mockOnStatusChange).toHaveBeenCalledTimes(1);
      expect(mockOnStatusChange).toHaveBeenCalledWith('CONFIRMED');
    });

    it('should call onStatusChange when status is changed to ALL', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BugReportFilters {...defaultProps} />);

      const statusSelect = screen.getByDisplayValue('미확인');
      await user.selectOptions(statusSelect, 'ALL');

      expect(mockOnStatusChange).toHaveBeenCalledTimes(1);
      expect(mockOnStatusChange).toHaveBeenCalledWith('ALL');
    });

    it('should call onStatusChange when status is changed to UNCONFIRMED', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BugReportFilters {...defaultProps} status="CONFIRMED" />);

      const statusSelect = screen.getByDisplayValue('확인');
      await user.selectOptions(statusSelect, 'UNCONFIRMED');

      expect(mockOnStatusChange).toHaveBeenCalledTimes(1);
      expect(mockOnStatusChange).toHaveBeenCalledWith('UNCONFIRMED');
    });
  });

  describe('Date Filter Interaction', () => {
    it('should call onDateChange when date is changed', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BugReportFilters {...defaultProps} />);

      const dateInput = screen.getByDisplayValue('2024-01-15');
      await user.clear(dateInput);
      await user.type(dateInput, '2024-02-20');

      expect(mockOnDateChange).toHaveBeenCalled();
    });

    it('should handle empty date value', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(<BugReportFilters {...defaultProps} date="" />);

      // Use the date input specifically (type="date")
      const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
      expect(dateInput).toBeInTheDocument();
      expect(dateInput).toHaveValue('');

      await user.type(dateInput, '2024-01-20');
      expect(mockOnDateChange).toHaveBeenCalled();
    });
  });

  describe('Reset Button Interaction', () => {
    it('should call onReset when reset button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BugReportFilters {...defaultProps} />);

      const resetButton = screen.getByRole('button', { name: '초기화' });
      await user.click(resetButton);

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it('should not call status or date handlers when reset is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BugReportFilters {...defaultProps} />);

      const resetButton = screen.getByRole('button', { name: '초기화' });
      await user.click(resetButton);

      expect(mockOnReset).toHaveBeenCalledTimes(1);
      expect(mockOnStatusChange).not.toHaveBeenCalled();
      expect(mockOnDateChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for inputs', () => {
      renderWithProviders(<BugReportFilters {...defaultProps} />);
      expect(screen.getByText('상태')).toBeInTheDocument();
      expect(screen.getByText('날짜')).toBeInTheDocument();
    });

    it('should have accessible date input', () => {
      renderWithProviders(<BugReportFilters {...defaultProps} />);
      const dateInput = screen.getByDisplayValue('2024-01-15');
      expect(dateInput).toHaveAttribute('type', 'date');
    });
  });

  describe('Styling', () => {
    it('should apply proper container styles', () => {
      const { container } = renderWithProviders(<BugReportFilters {...defaultProps} />);
      const filterContainer = container.querySelector('.space-y-4');
      expect(filterContainer).toBeInTheDocument();
    });

    it('should apply proper select styles', () => {
      renderWithProviders(<BugReportFilters {...defaultProps} />);
      const statusSelect = screen.getByDisplayValue('미확인');
      expect(statusSelect).toHaveClass('rounded-lg', 'border', 'border-border-default');
    });

    it('should apply proper button styles', () => {
      renderWithProviders(<BugReportFilters {...defaultProps} />);
      const resetButton = screen.getByRole('button', { name: '초기화' });
      expect(resetButton).toHaveClass('rounded-lg', 'border', 'border-border-default');
    });
  });
});
