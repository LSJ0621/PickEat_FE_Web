/**
 * UserPlaceCard Unit Tests
 *
 * Tests for UserPlaceCard component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserPlaceCard } from '@features/user-place/components/UserPlaceCard';
import type { UserPlace } from '@features/user-place/types';

// Mock dependencies
vi.mock('@features/user-place/components/UserPlaceStatusBadge', () => ({
  UserPlaceStatusBadge: ({ status }: { status: string }) => <span data-testid="status-badge">{status}</span>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'userPlace.noDetails': '상세 정보가 없습니다.',
      };
      return translations[key] || key;
    },
  }),
}));

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

  it('renders raw category text', () => {
    render(<UserPlaceCard place={defaultPlace} onClick={mockOnClick} />);
    expect(screen.getByText('한식')).toBeInTheDocument();
  });

  it('renders phone number', () => {
    render(<UserPlaceCard place={defaultPlace} onClick={mockOnClick} />);
    expect(screen.getByText('02-1234-5678')).toBeInTheDocument();
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
    const card = screen.getByText('Test Restaurant').closest('h3')?.closest('div');
    if (card) {
      fireEvent.click(card);
      expect(mockOnClick).toHaveBeenCalled();
    }
  });

  it('does not render category when not provided', () => {
    const placeWithoutCategory = { ...defaultPlace, category: undefined };
    render(<UserPlaceCard place={placeWithoutCategory} onClick={mockOnClick} />);
    expect(screen.queryByText('한식')).not.toBeInTheDocument();
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

  it('renders card with proper structure', () => {
    const { container } = render(<UserPlaceCard place={defaultPlace} onClick={mockOnClick} />);
    const card = container.querySelector('.cursor-pointer');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('rounded-2xl', 'border', 'border-border-default');
  });
});
