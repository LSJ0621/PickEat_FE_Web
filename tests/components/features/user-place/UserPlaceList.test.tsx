/**
 * UserPlaceList Unit Tests
 *
 * Tests for UserPlaceList component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserPlaceList } from '@features/user-place/components/UserPlaceList';
import type { UserPlace } from '@features/user-place/types';

// Mock dependencies
vi.mock('@features/user-place/components/UserPlaceCard', () => ({
  UserPlaceCard: ({ place, onClick }: { place: UserPlace; onClick: () => void }) => (
    <div
      data-testid={`place-card-${place.id}`}
      onClick={onClick}
      className="user-place-card-mock"
    >
      {place.name}
    </div>
  ),
}));

vi.mock('@shared/components/Button', () => ({
  Button: ({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock('@shared/ui/input', () => ({
  Input: ({ value, onChange, placeholder, className }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
  }) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.all': '전체',
        'common.previous': '이전',
        'common.next': '다음',
        'userPlace.status.PENDING': '검토중',
        'userPlace.status.APPROVED': '승인',
        'userPlace.status.REJECTED': '거절',
        'userPlace.searchPlaceholder': 'Search places...',
        'userPlace.noPlaces': 'No places found',
      };
      return translations[key] || key;
    },
  }),
}));

describe('UserPlaceList', () => {
  const mockOnStatusFilter = vi.fn();
  const mockOnSearch = vi.fn();
  const mockOnPageChange = vi.fn();
  const mockOnPlaceClick = vi.fn();

  const mockPlaces: UserPlace[] = [
    {
      id: 1,
      name: 'Place 1',
      address: 'Address 1',
      status: 'APPROVED',
      latitude: 37.5665,
      longitude: 126.9780,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Place 2',
      address: 'Address 2',
      status: 'PENDING',
      latitude: 37.5665,
      longitude: 126.9780,
      createdAt: '2024-01-02T00:00:00Z',
    },
  ];

  const defaultProps = {
    places: mockPlaces,
    isLoading: false,
    status: undefined,
    search: '',
    page: 1,
    totalPages: 3,
    onStatusFilter: mockOnStatusFilter,
    onSearch: mockOnSearch,
    onPageChange: mockOnPageChange,
    onPlaceClick: mockOnPlaceClick,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders status filter buttons', () => {
    render(<UserPlaceList {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    const filterButtons = buttons.filter(btn =>
      ['전체', '검토중', '승인', '거절'].includes(btn.textContent || '')
    );
    expect(filterButtons.length).toBe(4);
  });

  it('renders search input', () => {
    render(<UserPlaceList {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText('Search places...');
    expect(searchInput).toBeInTheDocument();
  });

  it('calls onSearch when search input changes', () => {
    render(<UserPlaceList {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText('Search places...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('calls onStatusFilter when filter button is clicked', () => {
    render(<UserPlaceList {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    const pendingButton = buttons.find(btn =>
      btn.textContent === '검토중' && btn.className.includes('rounded-full')
    );
    fireEvent.click(pendingButton!);
    expect(mockOnStatusFilter).toHaveBeenCalledWith('PENDING');
  });

  it('calls onStatusFilter with undefined when All button is clicked', () => {
    render(<UserPlaceList {...defaultProps} />);
    const allButton = screen.getByText('전체');
    fireEvent.click(allButton);
    expect(mockOnStatusFilter).toHaveBeenCalledWith(undefined);
  });

  it('highlights active status filter', () => {
    render(<UserPlaceList {...defaultProps} status="APPROVED" />);
    const buttons = screen.getAllByRole('button');
    const approvedButton = buttons.find(btn =>
      btn.textContent === '승인' && btn.className.includes('rounded-full')
    );
    expect(approvedButton?.className).toContain('bg-brand-primary');
  });

  it('renders place cards for each place', () => {
    render(<UserPlaceList {...defaultProps} />);
    expect(screen.getByTestId('place-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('place-card-2')).toBeInTheDocument();
  });

  it('calls onPlaceClick when place card is clicked', () => {
    render(<UserPlaceList {...defaultProps} />);
    const placeCard = screen.getByTestId('place-card-1');
    fireEvent.click(placeCard);
    expect(mockOnPlaceClick).toHaveBeenCalledWith(mockPlaces[0]);
  });

  it('shows loading spinner when isLoading is true', () => {
    const { container } = render(<UserPlaceList {...defaultProps} isLoading={true} />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows empty state when no places', () => {
    render(<UserPlaceList {...defaultProps} places={[]} />);
    expect(screen.getByText('No places found')).toBeInTheDocument();
  });

  it('renders pagination when totalPages > 1', () => {
    render(<UserPlaceList {...defaultProps} totalPages={3} page={1} />);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('does not render pagination when totalPages is 1', () => {
    render(<UserPlaceList {...defaultProps} totalPages={1} page={1} />);
    expect(screen.queryByText('1 / 1')).not.toBeInTheDocument();
  });

  it('calls onPageChange when next button is clicked', () => {
    render(<UserPlaceList {...defaultProps} page={1} totalPages={3} />);
    const nextButton = screen.getByText('다음');
    fireEvent.click(nextButton);
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('disables previous button on first page', () => {
    render(<UserPlaceList {...defaultProps} page={1} totalPages={3} />);
    const prevButton = screen.getByText('이전');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<UserPlaceList {...defaultProps} page={3} totalPages={3} />);
    const nextButton = screen.getByText('다음');
    expect(nextButton).toBeDisabled();
  });

  it('displays current search value', () => {
    render(<UserPlaceList {...defaultProps} search="test search" />);
    const searchInput = screen.getByPlaceholderText('Search places...') as HTMLInputElement;
    expect(searchInput.value).toBe('test search');
  });
});
