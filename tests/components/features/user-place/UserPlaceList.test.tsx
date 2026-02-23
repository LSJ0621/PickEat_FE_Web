/**
 * UserPlaceList Unit Tests
 *
 * Tests for UserPlaceList component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserPlaceList } from '@/components/features/user-place/UserPlaceList';
import type { UserPlace } from '@/types/user-place';

// Mock dependencies
vi.mock('@/components/features/user-place/UserPlaceCard', () => ({
  UserPlaceCard: ({ place, onClick }: any) => (
    <div
      data-testid={`place-card-${place.id}`}
      onClick={onClick}
      className="user-place-card-mock"
    >
      {place.name}
    </div>
  ),
}));

vi.mock('@/components/common/Button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/common/EmptyState', () => ({
  EmptyState: ({ title, description }: any) => (
    <div data-testid="empty-state">
      <p>{title}</p>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.all': 'All',
        'userPlace.status.PENDING': 'Pending',
        'userPlace.status.APPROVED': 'Approved',
        'userPlace.status.REJECTED': 'Rejected',
        'userPlace.searchPlaceholder': 'Search places...',
        'userPlace.noPlaces': 'No places found',
        'userPlace.noPlacesDescription': 'Try adding a new place',
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
      ['All', 'Pending', 'Approved', 'Rejected'].includes(btn.textContent || '')
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
      btn.textContent === 'Pending' && btn.className.includes('rounded-full')
    );
    fireEvent.click(pendingButton!);
    expect(mockOnStatusFilter).toHaveBeenCalledWith('PENDING');
  });

  it('calls onStatusFilter with undefined when All button is clicked', () => {
    render(<UserPlaceList {...defaultProps} />);
    const allButton = screen.getByText('All');
    fireEvent.click(allButton);
    expect(mockOnStatusFilter).toHaveBeenCalledWith(undefined);
  });

  it('highlights active status filter', () => {
    render(<UserPlaceList {...defaultProps} status="APPROVED" />);
    const buttons = screen.getAllByRole('button');
    const approvedButton = buttons.find(btn =>
      btn.textContent === 'Approved' && btn.className.includes('rounded-full')
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

  it('shows loading skeleton when isLoading is true', () => {
    render(<UserPlaceList {...defaultProps} isLoading={true} />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state when no places', () => {
    render(<UserPlaceList {...defaultProps} places={[]} />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
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

  it('calls onPageChange when next page button is clicked', () => {
    render(<UserPlaceList {...defaultProps} page={1} totalPages={3} />);
    const buttons = screen.getAllByRole('button');
    const nextButton = buttons.find(btn => !btn.disabled && btn.querySelector('svg'));
    if (nextButton) {
      fireEvent.click(nextButton);
      expect(mockOnPageChange).toHaveBeenCalled();
    }
  });

  it('disables previous button on first page', () => {
    render(<UserPlaceList {...defaultProps} page={1} totalPages={3} />);
    const buttons = screen.getAllByRole('button');
    const prevButton = buttons.find(btn => btn.disabled);
    expect(prevButton).toBeDefined();
  });

  it('disables next button on last page', () => {
    render(<UserPlaceList {...defaultProps} page={3} totalPages={3} />);
    const buttons = screen.getAllByRole('button');
    const disabledButtons = buttons.filter(btn => btn.disabled);
    expect(disabledButtons.length).toBeGreaterThan(0);
  });

  it('displays current search value', () => {
    render(<UserPlaceList {...defaultProps} search="test search" />);
    const searchInput = screen.getByPlaceholderText('Search places...') as HTMLInputElement;
    expect(searchInput.value).toBe('test search');
  });
});
