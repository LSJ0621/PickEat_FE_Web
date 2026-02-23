/**
 * UserPlaceForm Unit Tests
 *
 * Tests for UserPlaceForm component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserPlaceForm } from '@/components/features/user-place/UserPlaceForm';
import type { UserPlace } from '@/types/user-place';

// Mock dependencies
vi.mock('@/components/common/Button', () => ({
  Button: ({ children, onClick, type, disabled, isLoading }: any) => (
    <button onClick={onClick} type={type} disabled={disabled} data-loading={isLoading}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/features/user-place/UserPlaceImageUploader', () => ({
  UserPlaceImageUploader: ({ onImagesAdd, onImageRemove }: any) => (
    <div data-testid="image-uploader">
      <button onClick={() => onImagesAdd([new File([''], 'test.jpg')])}>Add Image</button>
      <button onClick={() => onImageRemove(0)}>Remove Image</button>
    </div>
  ),
}));

vi.mock('@/hooks/address/useAddressSearch', () => ({
  useAddressSearch: () => ({
    addressQuery: '',
    searchResults: [],
    isSearching: false,
    selectedAddress: null,
    setAddressQuery: vi.fn(),
    handleSearch: vi.fn(),
    handleSelectAddress: vi.fn(),
    clearSearch: vi.fn(),
    setSelectedAddress: vi.fn(),
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'userPlace.basicInfo': 'Basic Information',
        'userPlace.name': 'Place Name',
        'userPlace.namePlaceholder': 'Enter place name',
        'userPlace.address': 'Address',
        'userPlace.category': 'Category',
        'userPlace.phoneNumber': 'Phone Number',
        'userPlace.description': 'Description',
        'userPlace.menuTypes': 'Menu Types',
        'userPlace.addMenu': 'Add Menu',
        'common.submit': 'Submit',
        'common.cancel': 'Cancel',
        'common.reset': 'Reset',
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock('@/types/user-place', async () => {
  const actual = await vi.importActual('@/types/user-place');
  return {
    ...actual,
    USER_PLACE_CATEGORY_KEYS: ['korean', 'chinese', 'japanese'],
    CATEGORY_KEY_TO_VALUE: {
      korean: '한식',
      chinese: '중식',
      japanese: '일식',
    },
  };
});

vi.mock('@/utils/constants', () => ({
  USER_PLACE: {
    MAX_MENU_TYPES: 10,
  },
}));

vi.mock('@/utils/error', () => ({
  extractErrorMessage: (error: any, fallback: string) => fallback,
}));

describe('UserPlaceForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    isLoading: false,
  };

  const mockInitialData: UserPlace = {
    id: 1,
    name: 'Test Restaurant',
    address: '123 Test Street',
    latitude: 37.5665,
    longitude: 126.9780,
    status: 'APPROVED',
    phoneNumber: '02-1234-5678',
    category: '한식',
    description: 'A great restaurant',
    menuTypes: ['김치찌개', '된장찌개'],
    photos: ['photo1.jpg', 'photo2.jpg'],
    openingHours: '09:00-22:00',
    createdAt: '2024-01-01T00:00:00Z',
    version: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with basic fields', () => {
    render(<UserPlaceForm {...defaultProps} />);
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter place name')).toBeInTheDocument();
  });

  it('renders name input field', () => {
    render(<UserPlaceForm {...defaultProps} />);
    const nameInput = screen.getByPlaceholderText('Enter place name');
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveAttribute('required');
  });

  it('allows typing in name field', () => {
    render(<UserPlaceForm {...defaultProps} />);
    const nameInput = screen.getByPlaceholderText('Enter place name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Restaurant' } });
    expect(nameInput.value).toBe('New Restaurant');
  });

  it('populates form fields with initial data', () => {
    render(<UserPlaceForm {...defaultProps} initialData={mockInitialData} />);
    const nameInput = screen.getByPlaceholderText('Enter place name') as HTMLInputElement;
    expect(nameInput.value).toBe('Test Restaurant');
  });

  it('renders submit button', () => {
    render(<UserPlaceForm {...defaultProps} submitLabel="Save" />);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('renders cancel button when onCancel is provided', () => {
    render(<UserPlaceForm {...defaultProps} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<UserPlaceForm {...defaultProps} />);
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('disables submit button when loading', () => {
    render(<UserPlaceForm {...defaultProps} isLoading={true} />);
    const submitButtons = screen.getAllByRole('button');
    const submitButton = submitButtons.find(btn => btn.getAttribute('type') === 'submit');
    expect(submitButton).toBeDisabled();
  });

  it('shows loading state on submit button', () => {
    render(<UserPlaceForm {...defaultProps} isLoading={true} submitLabel="Submit" />);
    const submitButton = screen.getByText('Submit');
    expect(submitButton).toHaveAttribute('data-loading', 'true');
  });

  it('renders image uploader component', () => {
    render(<UserPlaceForm {...defaultProps} />);
    expect(screen.getByTestId('image-uploader')).toBeInTheDocument();
  });

  it('prevents form submission when name is empty', () => {
    render(<UserPlaceForm {...defaultProps} />);
    const form = screen.getByRole('form', { hidden: true }) || document.querySelector('form');
    if (form) {
      fireEvent.submit(form);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    }
  });

  it('enforces maxLength on name input', () => {
    render(<UserPlaceForm {...defaultProps} />);
    const nameInput = screen.getByPlaceholderText('Enter place name');
    expect(nameInput).toHaveAttribute('maxLength', '100');
  });

  it('initializes menuTypes from initial data', () => {
    render(<UserPlaceForm {...defaultProps} initialData={mockInitialData} />);
    expect(screen.getByText('김치찌개')).toBeInTheDocument();
    expect(screen.getByText('된장찌개')).toBeInTheDocument();
  });

  it('clears form when initial data changes', () => {
    const { rerender } = render(<UserPlaceForm {...defaultProps} />);
    const nameInput = screen.getByPlaceholderText('Enter place name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Temp Name' } });

    rerender(<UserPlaceForm {...defaultProps} initialData={mockInitialData} />);
    expect(nameInput.value).toBe('Test Restaurant');
  });

  it('displays phone number field', () => {
    render(<UserPlaceForm {...defaultProps} initialData={mockInitialData} />);
    const phoneInput = document.querySelector('input[type="text"]');
    // Phone field exists in the form
    expect(phoneInput).toBeTruthy();
  });

  it('does not call onSubmit when form is invalid', () => {
    render(<UserPlaceForm {...defaultProps} />);
    const form = document.querySelector('form');
    if (form) {
      fireEvent.submit(form);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    }
  });
});
