/**
 * CompactPlaceGrid Unit Tests
 *
 * Tests for CompactPlaceGrid component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CompactPlaceGrid } from '@/components/features/restaurant/CompactPlaceGrid';
import type { PlaceRecommendationItemV2 } from '@/types/menu';

// Mock dependencies
vi.mock('@/components/features/restaurant/CompactPlaceCard', () => ({
  CompactPlaceCard: ({ place, index, source, onSelect }: any) => (
    <button data-testid={`place-card-${index}`} onClick={onSelect}>
      <span>{place.name}</span>
      {source && <span data-testid={`source-${index}`}>{source}</span>}
    </button>
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'restaurant.noRecommendationsForMenu': 'No recommendations found',
      };
      return translations[key] || key;
    },
  }),
}));

describe('CompactPlaceGrid', () => {
  const mockOnSelectPlace = vi.fn();

  const mockPlaces: (PlaceRecommendationItemV2 & { _source?: 'search' | 'community' })[] = [
    {
      placeId: 'place1',
      name: 'Restaurant 1',
      address: 'Address 1',
      rating: 4.5,
      userRatingsTotal: 100,
      _source: 'search',
    },
    {
      placeId: 'place2',
      name: 'Restaurant 2',
      address: 'Address 2',
      rating: 4.0,
      userRatingsTotal: 50,
      _source: 'community',
    },
    {
      placeId: 'place3',
      name: 'Restaurant 3',
      address: 'Address 3',
      rating: 3.5,
      userRatingsTotal: 25,
    },
  ];

  const defaultProps = {
    places: mockPlaces,
    onSelectPlace: mockOnSelectPlace,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all place cards', () => {
    render(<CompactPlaceGrid {...defaultProps} />);
    expect(screen.getByTestId('place-card-0')).toBeInTheDocument();
    expect(screen.getByTestId('place-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('place-card-2')).toBeInTheDocument();
  });

  it('displays place names', () => {
    render(<CompactPlaceGrid {...defaultProps} />);
    expect(screen.getByText('Restaurant 1')).toBeInTheDocument();
    expect(screen.getByText('Restaurant 2')).toBeInTheDocument();
    expect(screen.getByText('Restaurant 3')).toBeInTheDocument();
  });

  it('passes source prop to CompactPlaceCard', () => {
    render(<CompactPlaceGrid {...defaultProps} />);
    expect(screen.getByTestId('source-0')).toHaveTextContent('search');
    expect(screen.getByTestId('source-1')).toHaveTextContent('community');
  });

  it('calls onSelectPlace when place card is clicked', () => {
    render(<CompactPlaceGrid {...defaultProps} />);
    const firstCard = screen.getByTestId('place-card-0');
    fireEvent.click(firstCard);
    expect(mockOnSelectPlace).toHaveBeenCalledWith(mockPlaces[0]);
  });

  it('calls onSelectPlace with correct place for each card', () => {
    render(<CompactPlaceGrid {...defaultProps} />);

    fireEvent.click(screen.getByTestId('place-card-1'));
    expect(mockOnSelectPlace).toHaveBeenCalledWith(mockPlaces[1]);

    fireEvent.click(screen.getByTestId('place-card-2'));
    expect(mockOnSelectPlace).toHaveBeenCalledWith(mockPlaces[2]);
  });

  it('displays empty state when no places', () => {
    render(<CompactPlaceGrid {...defaultProps} places={[]} />);
    expect(screen.getByText('No recommendations found')).toBeInTheDocument();
  });

  it('does not render place cards when empty', () => {
    render(<CompactPlaceGrid {...defaultProps} places={[]} />);
    expect(screen.queryByTestId('place-card-0')).not.toBeInTheDocument();
  });

  it('generates unique keys for places with placeId', () => {
    const { container } = render(<CompactPlaceGrid {...defaultProps} />);
    const cards = container.querySelectorAll('.stagger-item');
    expect(cards).toHaveLength(3);
  });

  it('handles places without _source property', () => {
    const placesWithoutSource: PlaceRecommendationItemV2[] = [
      {
        placeId: 'place1',
        name: 'Restaurant 1',
        address: 'Address 1',
        rating: 4.5,
        userRatingsTotal: 100,
      },
    ];

    render(<CompactPlaceGrid places={placesWithoutSource} onSelectPlace={mockOnSelectPlace} />);
    expect(screen.getByTestId('place-card-0')).toBeInTheDocument();
  });

  it('handles places without placeId', () => {
    const placesWithoutId = [
      {
        name: 'Restaurant 1',
        address: 'Address 1',
        rating: 4.5,
        userRatingsTotal: 100,
        _source: 'search' as const,
      },
    ];

    render(<CompactPlaceGrid places={placesWithoutId as any} onSelectPlace={mockOnSelectPlace} />);
    expect(screen.getByTestId('place-card-0')).toBeInTheDocument();
  });

  it('renders multiple places with stagger animation', () => {
    const { container } = render(<CompactPlaceGrid {...defaultProps} />);
    const staggerItems = container.querySelectorAll('.stagger-item');
    expect(staggerItems).toHaveLength(mockPlaces.length);
  });

  it('preserves place order', () => {
    render(<CompactPlaceGrid {...defaultProps} />);
    const cards = screen.getAllByTestId(/place-card-/);
    expect(cards[0]).toHaveTextContent('Restaurant 1');
    expect(cards[1]).toHaveTextContent('Restaurant 2');
    expect(cards[2]).toHaveTextContent('Restaurant 3');
  });
});
