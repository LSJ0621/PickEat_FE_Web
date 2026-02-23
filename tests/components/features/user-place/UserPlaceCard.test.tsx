/**
 * UserPlaceCard Unit Tests
 *
 * Tests for UserPlaceCard component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserPlaceCard } from '@/components/features/user-place/UserPlaceCard';
import type { UserPlace } from '@/types/user-place';

// Mock dependencies
vi.mock('@/components/features/user-place/UserPlaceStatusBadge', () => ({
  UserPlaceStatusBadge: ({ status }: any) => <span data-testid="status-badge">{status}</span>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        'common.viewDetails': 'View Details',
        'rating.ratingCount': `${params?.count} reviews`,
        'userPlace.categories.korean': 'Korean Food',
        'userPlace.categories.chinese': 'Chinese Food',
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock('@/types/user-place', async () => {
  const actual = await vi.importActual('@/types/user-place');
  return {
    ...actual,
    getCategoryTranslationKey: (category: string) => {
      const map: Record<string, string> = {
        '한식': 'korean',
        '중식': 'chinese',
      };
      return map[category];
    },
  };
});

describe('UserPlaceCard', () => {
  const mockOnClick = vi.fn();

  const defaultPlace: UserPlace = {
    id: 1,
    name: 'Test Restaurant',
    address: '123 Test Street, Seoul',
    status: 'APPROVED',
    category: '한식',
    phoneNumber: '02-1234-5678',
    menuTypes: ['김치찌개', '된장찌개', '비빔밥'],
    description: 'A great Korean restaurant',
    averageRating: 4.5,
    ratingCount: 10,
    latitude: 37.5665,
    longitude: 126.9780,
    createdAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders place name', () => {
    render(<UserPlaceCard place={defaultPlace} onClick={mockOnClick} />);
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
  });

  it('renders place address', () => {
    render(<UserPlaceCard place={defaultPlace} onClick={mockOnClick} />);
    expect(screen.getByText('123 Test Street, Seoul')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<UserPlaceCard place={defaultPlace} onClick={mockOnClick} />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('APPROVED');
  });

  it('renders category with translation', () => {
    render(<UserPlaceCard place={defaultPlace} onClick={mockOnClick} />);
    expect(screen.getByText('Korean Food')).toBeInTheDocument();
  });

  it('renders phone number', () => {
    render(<UserPlaceCard place={defaultPlace} onClick={mockOnClick} />);
    expect(screen.getByText('02-1234-5678')).toBeInTheDocument();
  });

  it('renders rating when available', () => {
    render(<UserPlaceCard place={defaultPlace} onClick={mockOnClick} />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(10 reviews)')).toBeInTheDocument();
  });

  it('does not render rating when not available', () => {
    const placeWithoutRating = { ...defaultPlace, averageRating: null, ratingCount: null };
    render(<UserPlaceCard place={placeWithoutRating} onClick={mockOnClick} />);
    expect(screen.queryByText(/reviews/)).not.toBeInTheDocument();
  });

  it('renders first 3 menu types', () => {
    render(<UserPlaceCard place={defaultPlace} onClick={mockOnClick} />);
    expect(screen.getByText('김치찌개')).toBeInTheDocument();
    expect(screen.getByText('된장찌개')).toBeInTheDocument();
    expect(screen.getByText('비빔밥')).toBeInTheDocument();
  });

  it('shows +N indicator when more than 3 menu types', () => {
    const placeWithManyMenus = {
      ...defaultPlace,
      menuTypes: ['Menu 1', 'Menu 2', 'Menu 3', 'Menu 4', 'Menu 5'],
    };
    render(<UserPlaceCard place={placeWithManyMenus} onClick={mockOnClick} />);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<UserPlaceCard place={defaultPlace} onClick={mockOnClick} />);
    expect(screen.getByText('A great Korean restaurant')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const placeWithoutDesc = { ...defaultPlace, description: undefined };
    render(<UserPlaceCard place={placeWithoutDesc} onClick={mockOnClick} />);
    expect(screen.queryByText('A great Korean restaurant')).not.toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    render(<UserPlaceCard place={defaultPlace} onClick={mockOnClick} />);
    const card = screen.getByText('Test Restaurant').closest('div')?.parentElement;
    if (card) {
      fireEvent.click(card);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    }
  });

  it('does not render category when not provided', () => {
    const placeWithoutCategory = { ...defaultPlace, category: undefined };
    render(<UserPlaceCard place={placeWithoutCategory} onClick={mockOnClick} />);
    expect(screen.queryByText('Korean Food')).not.toBeInTheDocument();
  });

  it('does not render phone number when not provided', () => {
    const placeWithoutPhone = { ...defaultPlace, phoneNumber: undefined };
    render(<UserPlaceCard place={placeWithoutPhone} onClick={mockOnClick} />);
    expect(screen.queryByText('02-1234-5678')).not.toBeInTheDocument();
  });

  it('does not render menu types when empty', () => {
    const placeWithoutMenus = { ...defaultPlace, menuTypes: [] };
    render(<UserPlaceCard place={placeWithoutMenus} onClick={mockOnClick} />);
    expect(screen.queryByText('김치찌개')).not.toBeInTheDocument();
  });

  it('renders with rating of 0', () => {
    const placeWithZeroRating = { ...defaultPlace, averageRating: 0 };
    render(<UserPlaceCard place={placeWithZeroRating} onClick={mockOnClick} />);
    expect(screen.queryByText('0.0')).not.toBeInTheDocument();
  });
});
