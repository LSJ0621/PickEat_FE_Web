/**
 * ProfileEditModal Unit Tests
 *
 * Tests for ProfileEditModal component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileEditModal } from '@/components/features/user/profile/ProfileEditModal';

// Mock dependencies
vi.mock('@/components/common/Button', () => ({
  Button: ({ children, onClick, isLoading, className }: any) => (
    <button onClick={onClick} disabled={isLoading} className={className} data-loading={isLoading}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/common/ModalCloseButton', () => ({
  ModalCloseButton: ({ onClose }: any) => (
    <button onClick={onClose} aria-label="Close">
      X
    </button>
  ),
}));

vi.mock('@/components/common/ScrollDatePicker', () => ({
  ScrollDatePicker: ({ value, onChange }: any) => (
    <div data-testid="scroll-date-picker">
      <input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        data-testid="date-input"
      />
    </div>
  ),
}));

vi.mock('@/hooks/common/useModalAnimation', () => ({
  useModalAnimation: (open: boolean) => ({
    isAnimating: open,
    shouldRender: open,
  }),
}));

vi.mock('@/hooks/common/useModalScrollLock', () => ({
  useModalScrollLock: vi.fn(),
}));

vi.mock('@/hooks/common/useFocusTrap', () => ({
  useFocusTrap: () => ({ current: null }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'user.profile.edit': 'Edit Profile',
        'user.profile.birthDate': 'Birth Date',
        'user.profile.gender': 'Gender',
        'user.profile.genderMale': 'Male',
        'user.profile.genderFemale': 'Female',
        'user.profile.genderOther': 'Other',
        'user.profile.save': 'Save',
      };
      return translations[key] || key;
    },
  }),
}));

describe('ProfileEditModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSave.mockResolvedValue(true);
  });

  it('renders when open is true', () => {
    render(<ProfileEditModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<ProfileEditModal {...defaultProps} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays modal title', () => {
    render(<ProfileEditModal {...defaultProps} />);
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
  });

  it('renders birth date picker', () => {
    render(<ProfileEditModal {...defaultProps} />);
    expect(screen.getByTestId('scroll-date-picker')).toBeInTheDocument();
    expect(screen.getByText('Birth Date')).toBeInTheDocument();
  });

  it('renders gender options', () => {
    render(<ProfileEditModal {...defaultProps} />);
    expect(screen.getByText('Gender')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('Female')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('initializes with provided birth date', () => {
    render(<ProfileEditModal {...defaultProps} birthDate="1990-05-15" />);
    const dateInput = screen.getByTestId('date-input') as HTMLInputElement;
    expect(dateInput.value).toBe('1990-05-15');
  });

  it('initializes with provided gender', () => {
    render(<ProfileEditModal {...defaultProps} gender="male" />);
    const radios = screen.getAllByRole('radio');
    const maleRadio = radios.find((radio) => (radio as HTMLInputElement).value === 'male');
    expect(maleRadio).toBeChecked();
  });

  it('allows selecting a gender', () => {
    render(<ProfileEditModal {...defaultProps} />);
    const femaleRadio = screen.getByRole('radio', { name: /Female/i });
    fireEvent.click(femaleRadio);
    expect(femaleRadio).toBeChecked();
  });

  it('allows changing birth date', () => {
    render(<ProfileEditModal {...defaultProps} />);
    const dateInput = screen.getByTestId('date-input');
    fireEvent.change(dateInput, { target: { value: '1995-12-25' } });
    expect((dateInput as HTMLInputElement).value).toBe('1995-12-25');
  });

  it('calls onClose when close button is clicked', () => {
    render(<ProfileEditModal {...defaultProps} />);
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    render(<ProfileEditModal {...defaultProps} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSave with updated data when save button is clicked', async () => {
    render(<ProfileEditModal {...defaultProps} birthDate="1990-01-01" gender="male" />);

    const femaleRadio = screen.getByRole('radio', { name: /Female/i });
    fireEvent.click(femaleRadio);

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        birthDate: '1990-01-01',
        gender: 'female',
      });
    });
  });

  it('closes modal after successful save', async () => {
    render(<ProfileEditModal {...defaultProps} />);

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('does not close modal when save fails', async () => {
    mockOnSave.mockResolvedValue(false);
    render(<ProfileEditModal {...defaultProps} />);

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('shows loading state while saving', async () => {
    mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));
    render(<ProfileEditModal {...defaultProps} />);

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(saveButton).toHaveAttribute('data-loading', 'true');
  });

  it('calls onClose when backdrop is clicked', () => {
    render(<ProfileEditModal {...defaultProps} />);
    const backdrop = screen.getByRole('dialog').parentElement;
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('resets form when modal reopens', () => {
    const { rerender } = render(<ProfileEditModal {...defaultProps} open={false} />);

    rerender(<ProfileEditModal {...defaultProps} open={true} birthDate="2000-01-01" gender="other" />);

    const otherRadio = screen.getByRole('radio', { name: /Other/i });
    expect(otherRadio).toBeChecked();
  });
});
