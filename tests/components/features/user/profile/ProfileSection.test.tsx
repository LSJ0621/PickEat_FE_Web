/**
 * ProfileSection Unit Tests
 *
 * Tests for ProfileSection component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileSection } from '@/components/features/user/profile/ProfileSection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'user.profile.title': 'Profile Information',
        'user.profile.notSet': 'Not set',
        'user.profile.genderMale': 'Male',
        'user.profile.genderFemale': 'Female',
        'user.profile.genderOther': 'Other',
      };
      return translations[key] || key;
    },
  }),
}));

describe('ProfileSection', () => {
  const mockOnEditClick = vi.fn();

  const defaultProps = {
    onEditClick: mockOnEditClick,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders profile section', () => {
    render(<ProfileSection {...defaultProps} />);
    expect(screen.getByText('Profile Information')).toBeInTheDocument();
  });

  it('displays "Not set" when birth date is not provided', () => {
    render(<ProfileSection {...defaultProps} />);
    // Text is combined with separator, use regex
    expect(screen.getByText(/Not set · Not set/)).toBeInTheDocument();
  });

  it('displays formatted birth date when provided', () => {
    render(<ProfileSection {...defaultProps} birthDate="1990-05-15" />);
    expect(screen.getByText(/1990\.05\.15/)).toBeInTheDocument();
  });

  it('displays "Not set" when gender is not provided', () => {
    render(<ProfileSection {...defaultProps} />);
    expect(screen.getByText(/Not set/)).toBeInTheDocument();
  });

  it('displays "Male" when gender is male', () => {
    render(<ProfileSection {...defaultProps} gender="male" />);
    expect(screen.getByText(/Male/)).toBeInTheDocument();
  });

  it('displays "Female" when gender is female', () => {
    render(<ProfileSection {...defaultProps} gender="female" />);
    expect(screen.getByText(/Female/)).toBeInTheDocument();
  });

  it('displays "Other" when gender is other', () => {
    render(<ProfileSection {...defaultProps} gender="other" />);
    expect(screen.getByText(/Other/)).toBeInTheDocument();
  });

  it('calls onEditClick when clicked', () => {
    render(<ProfileSection {...defaultProps} />);
    const section = screen.getByRole('button');
    fireEvent.click(section);
    expect(mockOnEditClick).toHaveBeenCalledTimes(1);
  });

  it('calls onEditClick when Enter key is pressed', () => {
    render(<ProfileSection {...defaultProps} />);
    const section = screen.getByRole('button');
    fireEvent.keyDown(section, { key: 'Enter' });
    expect(mockOnEditClick).toHaveBeenCalledTimes(1);
  });

  it('calls onEditClick when Space key is pressed', () => {
    render(<ProfileSection {...defaultProps} />);
    const section = screen.getByRole('button');
    fireEvent.keyDown(section, { key: ' ' });
    expect(mockOnEditClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onEditClick when other keys are pressed', () => {
    render(<ProfileSection {...defaultProps} />);
    const section = screen.getByRole('button');
    fireEvent.keyDown(section, { key: 'a' });
    expect(mockOnEditClick).not.toHaveBeenCalled();
  });

  it('has role button', () => {
    render(<ProfileSection {...defaultProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('is keyboard accessible with tabIndex', () => {
    render(<ProfileSection {...defaultProps} />);
    const section = screen.getByRole('button');
    expect(section).toHaveAttribute('tabIndex', '0');
  });

  it('displays both birth date and gender when both provided', () => {
    render(<ProfileSection {...defaultProps} birthDate="1995-12-25" gender="female" />);
    expect(screen.getByText(/1995\.12\.25/)).toBeInTheDocument();
    expect(screen.getByText(/Female/)).toBeInTheDocument();
  });

  it('formats birth date with dots instead of hyphens', () => {
    render(<ProfileSection {...defaultProps} birthDate="2000-01-01" />);
    expect(screen.getByText(/2000\.01\.01/)).toBeInTheDocument();
    expect(screen.queryByText(/2000-01-01/)).not.toBeInTheDocument();
  });

  it('does not call onEditClick when onEditClick is not provided', () => {
    render(<ProfileSection birthDate="1990-01-01" gender="male" />);
    const section = screen.getByRole('button');
    fireEvent.click(section);
    // Should not throw error
  });

  it('handles null birth date', () => {
    render(<ProfileSection {...defaultProps} birthDate={null} />);
    expect(screen.getByText(/Not set/)).toBeInTheDocument();
  });

  it('handles null gender', () => {
    render(<ProfileSection {...defaultProps} gender={null} />);
    expect(screen.getByText(/Not set/)).toBeInTheDocument();
  });

  it('applies cursor-pointer class for interactivity', () => {
    render(<ProfileSection {...defaultProps} />);
    const section = screen.getByRole('button');
    expect(section.className).toContain('cursor-pointer');
  });
});
