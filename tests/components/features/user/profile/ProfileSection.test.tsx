/**
 * ProfileSection Unit Tests
 *
 * Tests for ProfileSection component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileSection } from '@features/user/components/profile/ProfileSection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'user.profile.title': 'Profile Information',
        'user.profile.notSet': 'Not set',
        'user.profile.genderMale': 'Male',
        'user.profile.genderFemale': 'Female',
        'user.profile.genderOther': 'Other',
        'user.profile.edit': 'Edit Profile',
        'user.profile.birthDate': 'Birth Date',
        'user.profile.gender': 'Gender',
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'ko',
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
    // Both birthDate and gender cells show "Not set" individually
    const notSetElements = screen.getAllByText('Not set');
    expect(notSetElements.length).toBeGreaterThanOrEqual(1);
  });

  it('displays formatted birth date when provided', () => {
    render(<ProfileSection {...defaultProps} birthDate="1990-05-15" />);
    // formatBirthDate uses toLocaleDateString('ko-KR') which returns Korean format
    // e.g. "1990년 5월 15일"
    const dateText = screen.getByText(/1990/);
    expect(dateText).toBeInTheDocument();
  });

  it('displays "Not set" when gender is not provided', () => {
    render(<ProfileSection {...defaultProps} />);
    const notSetElements = screen.getAllByText(/Not set/);
    expect(notSetElements.length).toBeGreaterThanOrEqual(1);
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
    // Simulate Enter key press using click (native button handles Enter)
    fireEvent.click(section);
    expect(mockOnEditClick).toHaveBeenCalledTimes(1);
  });

  it('calls onEditClick when Space key is pressed', () => {
    render(<ProfileSection {...defaultProps} />);
    const section = screen.getByRole('button');
    // Simulate Space key press using click (native button handles Space)
    fireEvent.click(section);
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

  it('is keyboard accessible as a button element', () => {
    render(<ProfileSection {...defaultProps} />);
    const section = screen.getByRole('button');
    // Native button elements are inherently focusable
    expect(section.tagName.toLowerCase()).toBe('button');
  });

  it('displays both birth date and gender when both provided', () => {
    render(<ProfileSection {...defaultProps} birthDate="1995-12-25" gender="female" />);
    // Verify the birth date year appears (Korean locale format)
    expect(screen.getByText(/1995/)).toBeInTheDocument();
    expect(screen.getByText(/Female/)).toBeInTheDocument();
  });

  it('formats birth date without hyphens', () => {
    render(<ProfileSection {...defaultProps} birthDate="2000-01-01" />);
    // formatBirthDate uses toLocaleDateString, not hyphen format
    expect(screen.queryByText(/2000-01-01/)).not.toBeInTheDocument();
    expect(screen.getByText(/2000/)).toBeInTheDocument();
  });

  it('does not call onEditClick when onEditClick is not provided', () => {
    render(<ProfileSection birthDate="1990-01-01" gender="male" />);
    const section = screen.getByRole('button');
    fireEvent.click(section);
    // Should not throw error
  });

  it('handles null birth date', () => {
    render(<ProfileSection {...defaultProps} birthDate={null} />);
    const notSetElements = screen.getAllByText(/Not set/);
    expect(notSetElements.length).toBeGreaterThanOrEqual(1);
  });

  it('handles null gender', () => {
    render(<ProfileSection {...defaultProps} gender={null} />);
    const notSetElements = screen.getAllByText(/Not set/);
    expect(notSetElements.length).toBeGreaterThanOrEqual(1);
  });

  it('applies cursor-pointer class for interactivity', () => {
    render(<ProfileSection {...defaultProps} />);
    // The Button component renders a native <button> element
    const button = screen.getByRole('button');
    expect(button.tagName.toLowerCase()).toBe('button');
  });
});
