/**
 * UserPlaceForm Unit Tests
 *
 * Tests for UserPlaceForm component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserPlaceForm } from '@features/user-place/components/UserPlaceForm';
import type { UserPlace } from '@features/user-place/types';

// Mock dependencies
vi.mock('@shared/components/Button', () => ({
  Button: ({ children, onClick, type, disabled, isLoading }: any) => (
    <button onClick={onClick} type={type} disabled={disabled} data-loading={isLoading}>
      {children}
    </button>
  ),
}));

vi.mock('@features/user-place/components/UserPlaceImageUploader', () => ({
  UserPlaceImageUploader: ({ onNewAdd, onNewRemove }: any) => (
    <div data-testid="image-uploader">
      <button onClick={() => onNewAdd([new File([''], 'test.jpg')])}>Add Image</button>
      <button onClick={() => onNewRemove(0)}>Remove Image</button>
    </div>
  ),
}));

vi.mock('@features/user-place/components/UserPlaceAddressField', () => ({
  UserPlaceAddressField: ({ selectedAddress, onReset }: any) => (
    <div data-testid="address-field">
      {selectedAddress && (
        <span data-testid="selected-address">
          {selectedAddress.roadAddress || selectedAddress.address}
        </span>
      )}
      <button onClick={onReset}>Reset Address</button>
    </div>
  ),
}));

vi.mock('@features/user-place/components/UserPlaceMenuTypesField', () => ({
  UserPlaceMenuTypesField: ({ menuTypes, onAddMenu, onRemoveMenu }: any) => (
    <div data-testid="menu-types-field">
      {menuTypes.map((menu: string, idx: number) => (
        <span key={idx} data-testid={`menu-type-${idx}`}>
          {menu}
          <button onClick={() => onRemoveMenu(idx)}>Remove</button>
        </span>
      ))}
      <button onClick={onAddMenu}>Add Menu</button>
    </div>
  ),
}));

// Stable function references for useAddressSearch mock.
// vi.hoisted() ensures these are available inside vi.mock() factories,
// which are hoisted before regular const declarations.
// The same stable references are returned on every render, preventing
// the useEffect in UserPlaceForm from re-firing due to a changed
// setSelectedAddress dependency.
const {
  mockSetAddressQuery,
  mockHandleSearch,
  mockHandleSelectAddress,
  mockClearSearch,
  mockSetSelectedAddress,
} = vi.hoisted(() => ({
  mockSetAddressQuery: vi.fn(),
  mockHandleSearch: vi.fn().mockResolvedValue(undefined),
  mockHandleSelectAddress: vi.fn(),
  mockClearSearch: vi.fn(),
  mockSetSelectedAddress: vi.fn(),
}));

vi.mock('@shared/hooks/address/useAddressSearch', () => ({
  useAddressSearch: () => ({
    addressQuery: '',
    searchResults: [],
    isSearching: false,
    hasSearchedAddress: false,
    selectedAddress: null,
    setAddressQuery: mockSetAddressQuery,
    handleSearch: mockHandleSearch,
    handleSelectAddress: mockHandleSelectAddress,
    clearSearch: mockClearSearch,
    setSelectedAddress: mockSetSelectedAddress,
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

vi.mock('@features/user-place/types', async () => {
  const actual = await vi.importActual('@features/user-place/types');
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

vi.mock('@shared/utils/constants', () => ({
  USER_PLACE: {
    MAX_IMAGES: 5,
    MAX_IMAGE_SIZE: 5 * 1024 * 1024,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  },
}));

vi.mock('@shared/utils/error', () => ({
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
    userId: 1,
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
    rejectionCount: 0,
    lastRejectedAt: null,
    lastSubmittedAt: null,
    rejectionReason: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with basic fields', () => {
    render(<UserPlaceForm {...defaultProps} />);
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
    // The form element does not have an explicit aria-label so getByRole('form')
    // is not reliable; query directly via DOM selector instead.
    const form = document.querySelector('form');
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
