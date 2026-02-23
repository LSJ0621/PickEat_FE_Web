/**
 * CalendarDatePicker Unit Tests
 *
 * Tests for CalendarDatePicker component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CalendarDatePicker } from './index';

describe('CalendarDatePicker', () => {
  const mockOnClose = vi.fn();
  const mockOnDateSelect = vi.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    selectedDate: new Date(2026, 0, 15), // January 15, 2026
    onDateSelect: mockOnDateSelect,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    render(<CalendarDatePicker {...defaultProps} />);
    expect(screen.getByText('January 2026')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<CalendarDatePicker {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('January 2026')).not.toBeInTheDocument();
  });

  it('displays weekday headers in English', () => {
    render(<CalendarDatePicker {...defaultProps} />);
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
  });

  it('navigates to previous month', async () => {
    render(<CalendarDatePicker {...defaultProps} />);

    const prevButton = screen.getByLabelText('Previous month');
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(screen.getByText('December 2025')).toBeInTheDocument();
    });
  });

  it('navigates to next month', async () => {
    render(<CalendarDatePicker {...defaultProps} />);

    const nextButton = screen.getByLabelText('Next month');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('February 2026')).toBeInTheDocument();
    });
  });

  it('navigates to today when Today button is clicked', async () => {
    const today = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const expectedMonth = `${monthNames[today.getMonth()]} ${today.getFullYear()}`;

    render(<CalendarDatePicker {...defaultProps} />);

    const todayButton = screen.getByText('Today');
    fireEvent.click(todayButton);

    await waitFor(() => {
      expect(screen.getByText(expectedMonth)).toBeInTheDocument();
    });
  });

  it('calls onDateSelect and onClose when a date is clicked', async () => {
    render(<CalendarDatePicker {...defaultProps} />);

    // Find a date button (day 20 for example)
    const dateCells = screen.getAllByRole('button');
    const dateButton = dateCells.find(btn => btn.textContent === '20');

    if (dateButton) {
      fireEvent.click(dateButton);

      await waitFor(() => {
        expect(mockOnDateSelect).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    }
  });

  it('calls onClose when Close button is clicked', () => {
    render(<CalendarDatePicker {...defaultProps} />);

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    render(<CalendarDatePicker {...defaultProps} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('disables dates before minDate', () => {
    const minDate = new Date(2026, 0, 10); // January 10, 2026
    render(
      <CalendarDatePicker
        {...defaultProps}
        minDate={minDate}
      />
    );

    // Days before Jan 10 should have disabled styling
    const dateCells = screen.getAllByRole('button');
    const day5Button = dateCells.find(btn => btn.textContent === '5');

    if (day5Button) {
      expect(day5Button.className).toContain('cursor-not-allowed');
    }
  });

  it('disables dates after maxDate', () => {
    const maxDate = new Date(2026, 0, 20); // January 20, 2026
    render(
      <CalendarDatePicker
        {...defaultProps}
        maxDate={maxDate}
      />
    );

    // Days after Jan 20 should have disabled styling
    const dateCells = screen.getAllByRole('button');
    const day25Button = dateCells.find(btn => btn.textContent === '25');

    if (day25Button) {
      expect(day25Button.className).toContain('cursor-not-allowed');
    }
  });

  it('disables previous month button when viewing month before minDate', () => {
    const minDate = new Date(2026, 0, 1); // January 1, 2026
    render(
      <CalendarDatePicker
        {...defaultProps}
        selectedDate={new Date(2026, 0, 15)}
        minDate={minDate}
      />
    );

    const prevButton = screen.getByLabelText('Previous month');
    expect(prevButton).toBeDisabled();
  });

  it('disables next month button when viewing month after maxDate', () => {
    const maxDate = new Date(2026, 0, 31); // January 31, 2026
    render(
      <CalendarDatePicker
        {...defaultProps}
        selectedDate={new Date(2026, 0, 15)}
        maxDate={maxDate}
      />
    );

    const nextButton = screen.getByLabelText('Next month');
    expect(nextButton).toBeDisabled();
  });

  it('highlights selected date with orange gradient', () => {
    render(<CalendarDatePicker {...defaultProps} />);

    // Find the selected date (15th)
    const dateCells = screen.getAllByRole('button');
    const selectedButton = dateCells.find(btn => btn.textContent === '15');

    if (selectedButton) {
      expect(selectedButton.className).toContain('from-orange-500');
      expect(selectedButton.className).toContain('to-rose-500');
    }
  });

  it('handles year transitions correctly (December to January)', async () => {
    render(
      <CalendarDatePicker
        {...defaultProps}
        selectedDate={new Date(2025, 11, 15)} // December 2025
      />
    );

    expect(screen.getByText('December 2025')).toBeInTheDocument();

    const nextButton = screen.getByLabelText('Next month');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('January 2026')).toBeInTheDocument();
    });
  });

  it('handles year transitions correctly (January to December)', async () => {
    render(<CalendarDatePicker {...defaultProps} />);

    expect(screen.getByText('January 2026')).toBeInTheDocument();

    const prevButton = screen.getByLabelText('Previous month');
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(screen.getByText('December 2025')).toBeInTheDocument();
    });
  });
});
