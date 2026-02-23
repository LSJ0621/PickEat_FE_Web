/**
 * OnboardingDotIndicator Unit Tests
 *
 * Tests for OnboardingDotIndicator component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingDotIndicator } from '@/components/features/onboarding/OnboardingDotIndicator';

describe('OnboardingDotIndicator', () => {
  const mockOnDotClick = vi.fn();
  const defaultProps = {
    total: 5,
    current: 0,
    onDotClick: mockOnDotClick,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correct number of dots', () => {
    render(<OnboardingDotIndicator {...defaultProps} />);
    const dots = screen.getAllByRole('tab');
    expect(dots).toHaveLength(5);
  });

  it('marks current dot as selected', () => {
    render(<OnboardingDotIndicator {...defaultProps} current={2} />);
    const dots = screen.getAllByRole('tab');
    expect(dots[2]).toHaveAttribute('aria-selected', 'true');
    expect(dots[0]).toHaveAttribute('aria-selected', 'false');
    expect(dots[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('applies active styling to current dot', () => {
    render(<OnboardingDotIndicator {...defaultProps} current={1} />);
    const dots = screen.getAllByRole('tab');
    expect(dots[1].className).toContain('w-6');
    expect(dots[1].className).toContain('bg-brand-primary');
  });

  it('applies inactive styling to non-current dots', () => {
    render(<OnboardingDotIndicator {...defaultProps} current={1} />);
    const dots = screen.getAllByRole('tab');
    expect(dots[0].className).toContain('w-2');
    expect(dots[0].className).toContain('bg-text-tertiary/30');
    expect(dots[2].className).toContain('w-2');
    expect(dots[2].className).toContain('bg-text-tertiary/30');
  });

  it('calls onDotClick with correct index when dot is clicked', () => {
    render(<OnboardingDotIndicator {...defaultProps} />);
    const dots = screen.getAllByRole('tab');
    fireEvent.click(dots[3]);
    expect(mockOnDotClick).toHaveBeenCalledWith(3);
    expect(mockOnDotClick).toHaveBeenCalledTimes(1);
  });

  it('has accessible labels for each dot', () => {
    render(<OnboardingDotIndicator {...defaultProps} />);
    expect(screen.getByLabelText('Slide 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Slide 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Slide 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Slide 4')).toBeInTheDocument();
    expect(screen.getByLabelText('Slide 5')).toBeInTheDocument();
  });

  it('has tablist role on container', () => {
    render(<OnboardingDotIndicator {...defaultProps} />);
    const container = screen.getByRole('tablist');
    expect(container).toHaveAttribute('aria-label', 'Slide navigation');
  });

  it('handles single slide', () => {
    render(<OnboardingDotIndicator {...defaultProps} total={1} current={0} />);
    const dots = screen.getAllByRole('tab');
    expect(dots).toHaveLength(1);
    expect(dots[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('handles clicking on already active dot', () => {
    render(<OnboardingDotIndicator {...defaultProps} current={2} />);
    const dots = screen.getAllByRole('tab');
    fireEvent.click(dots[2]);
    expect(mockOnDotClick).toHaveBeenCalledWith(2);
  });

  it('handles last slide as current', () => {
    render(<OnboardingDotIndicator {...defaultProps} total={5} current={4} />);
    const dots = screen.getAllByRole('tab');
    expect(dots[4]).toHaveAttribute('aria-selected', 'true');
    expect(dots[4].className).toContain('bg-brand-primary');
  });
});
