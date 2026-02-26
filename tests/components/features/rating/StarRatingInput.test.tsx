/**
 * StarRatingInput Unit Tests
 *
 * Tests for StarRatingInput component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarRatingInput } from '@features/rating/components/StarRatingInput';

describe('StarRatingInput', () => {
  const mockOnRatingChange = vi.fn();
  const defaultProps = {
    rating: 0,
    onRatingChange: mockOnRatingChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 5 star buttons', () => {
    render(<StarRatingInput {...defaultProps} />);
    const stars = screen.getAllByRole('button');
    expect(stars).toHaveLength(5);
  });

  it('has accessible labels for each star', () => {
    render(<StarRatingInput {...defaultProps} />);
    expect(screen.getByLabelText('1점')).toBeInTheDocument();
    expect(screen.getByLabelText('2점')).toBeInTheDocument();
    expect(screen.getByLabelText('3점')).toBeInTheDocument();
    expect(screen.getByLabelText('4점')).toBeInTheDocument();
    expect(screen.getByLabelText('5점')).toBeInTheDocument();
  });

  it('calls onRatingChange with correct rating when star is clicked', () => {
    render(<StarRatingInput {...defaultProps} />);
    const thirdStar = screen.getByLabelText('3점');
    fireEvent.click(thirdStar);
    expect(mockOnRatingChange).toHaveBeenCalledWith(3);
    expect(mockOnRatingChange).toHaveBeenCalledTimes(1);
  });

  it('displays filled stars up to rating value', () => {
    render(<StarRatingInput {...defaultProps} rating={3} />);
    const stars = screen.getAllByRole('button');
    const star1 = stars[0].querySelector('svg');
    const star3 = stars[2].querySelector('svg');
    const star4 = stars[3].querySelector('svg');

    expect(star1?.getAttribute('fill')).toBe('currentColor');
    expect(star3?.getAttribute('fill')).toBe('currentColor');
    expect(star4?.getAttribute('fill')).toBe('none');
  });

  it('shows hover effect when mouse enters a star', () => {
    render(<StarRatingInput {...defaultProps} rating={2} />);
    const fourthStar = screen.getByLabelText('4점');
    fireEvent.mouseEnter(fourthStar);

    // After hover, 4 stars should show as filled
    const stars = screen.getAllByRole('button');
    const star4svg = stars[3].querySelector('svg');
    expect(star4svg?.getAttribute('fill')).toBe('currentColor');
  });

  it('reverts to original rating when mouse leaves', () => {
    render(<StarRatingInput {...defaultProps} rating={2} />);
    const fourthStar = screen.getByLabelText('4점');

    fireEvent.mouseEnter(fourthStar);
    fireEvent.mouseLeave(fourthStar);

    // Should revert to rating of 2
    const stars = screen.getAllByRole('button');
    const star2svg = stars[1].querySelector('svg');
    const star3svg = stars[2].querySelector('svg');

    expect(star2svg?.getAttribute('fill')).toBe('currentColor');
    expect(star3svg?.getAttribute('fill')).toBe('none');
  });

  it('applies small size class when size is sm', () => {
    render(<StarRatingInput {...defaultProps} size="sm" />);
    const firstStar = screen.getByLabelText('1점');
    expect(firstStar.className).toContain('w-8 h-8');
  });

  it('applies medium size class by default', () => {
    render(<StarRatingInput {...defaultProps} />);
    const firstStar = screen.getByLabelText('1점');
    expect(firstStar.className).toContain('w-10 h-10');
  });

  it('applies large size class when size is lg', () => {
    render(<StarRatingInput {...defaultProps} size="lg" />);
    const firstStar = screen.getByLabelText('1점');
    expect(firstStar.className).toContain('w-12 h-12');
  });

  it('handles rating of 0 (no stars selected)', () => {
    render(<StarRatingInput {...defaultProps} rating={0} />);
    const stars = screen.getAllByRole('button');
    stars.forEach(star => {
      const svg = star.querySelector('svg');
      expect(svg?.getAttribute('fill')).toBe('none');
    });
  });

  it('handles rating of 5 (all stars selected)', () => {
    render(<StarRatingInput {...defaultProps} rating={5} />);
    const stars = screen.getAllByRole('button');
    stars.forEach(star => {
      const svg = star.querySelector('svg');
      expect(svg?.getAttribute('fill')).toBe('currentColor');
    });
  });

  it('allows changing rating multiple times', () => {
    render(<StarRatingInput {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('3점'));
    expect(mockOnRatingChange).toHaveBeenCalledWith(3);

    fireEvent.click(screen.getByLabelText('5점'));
    expect(mockOnRatingChange).toHaveBeenCalledWith(5);

    fireEvent.click(screen.getByLabelText('1점'));
    expect(mockOnRatingChange).toHaveBeenCalledWith(1);

    expect(mockOnRatingChange).toHaveBeenCalledTimes(3);
  });
});
