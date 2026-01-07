import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { BugReportFilters } from '@/components/features/admin/bug-reports/BugReportFilters';
import type { BugReportStatus } from '@/types/bug-report';

describe('BugReportFilters', () => {
  const mockOnStatusChange = vi.fn();
  const mockOnDateChange = vi.fn();
  const mockOnReset = vi.fn();

  const defaultProps = {
    status: 'UNCONFIRMED' as BugReportStatus,
    date: '2024-01-15',
    onStatusChange: mockOnStatusChange,
    onDateChange: mockOnDateChange,
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

    it('should render all status options', () => {
      renderWithProviders(<BugReportFilters {...defaultProps} />);
      expect(screen.getByRole('option', { name: '미확인' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '확인' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '전체' })).toBeInTheDocument();
    });

    it('should render with ALL status', () => {
      renderWithProviders(<BugReportFilters {...defaultProps} status="ALL" />);
      const statusSelect = screen.getByDisplayValue('전체');
      expect(statusSelect).toBeInTheDocument();
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
      renderWithProviders(<BugReportFilters {...defaultProps} date="" />);

      const dateInput = screen.getByDisplayValue('');
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

    it('should not call other handlers when reset is clicked', async () => {
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
      const filterContainer = container.firstChild as HTMLElement;
      expect(filterContainer).toHaveClass('flex', 'flex-wrap', 'gap-4');
    });

    it('should apply proper select styles', () => {
      renderWithProviders(<BugReportFilters {...defaultProps} />);
      const statusSelect = screen.getByDisplayValue('미확인');
      expect(statusSelect).toHaveClass('rounded-lg', 'border', 'border-slate-700', 'bg-slate-800');
    });

    it('should apply proper button styles', () => {
      renderWithProviders(<BugReportFilters {...defaultProps} />);
      const resetButton = screen.getByRole('button', { name: '초기화' });
      expect(resetButton).toHaveClass('rounded-lg', 'border', 'border-slate-600');
    });
  });
});
