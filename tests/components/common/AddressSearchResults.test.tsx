import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { AddressSearchResults } from '@/components/common/AddressSearchResults';
import { createMockAddressSearchResult } from '@tests/factories';

describe('AddressSearchResults', () => {
  const mockOnSelectAddress = vi.fn();

  describe('렌더링 테스트', () => {
    it('검색 결과가 있을 때 주소 리스트가 렌더링된다', () => {
      const mockResults = [
        createMockAddressSearchResult({
          roadAddress: '서울시 강남구 테헤란로 123',
          address: '서울시 강남구 역삼동 123'
        }),
        createMockAddressSearchResult({
          roadAddress: '서울시 강남구 역삼로 456',
          address: '서울시 강남구 역삼동 456'
        }),
      ];

      renderWithProviders(
        <AddressSearchResults
          searchResults={mockResults}
          isSearching={false}
          hasSearchedAddress={false}
          onSelectAddress={mockOnSelectAddress}
        />
      );

      expect(screen.getAllByText('서울시 강남구 테헤란로 123')[0]).toBeInTheDocument();
      expect(screen.getAllByText('서울시 강남구 역삼로 456')[0]).toBeInTheDocument();
    });

    it('검색 결과가 없고 검색을 하지 않았을 때 아무것도 렌더링되지 않는다', () => {
      const { container } = renderWithProviders(
        <AddressSearchResults
          searchResults={[]}
          isSearching={false}
          hasSearchedAddress={false}
          onSelectAddress={mockOnSelectAddress}
        />
      );

      expect(container).toBeEmptyDOMElement();
    });

    it('검색 중일 때 빈 메시지가 표시되지 않는다', () => {
      const { container } = renderWithProviders(
        <AddressSearchResults
          searchResults={[]}
          isSearching={true}
          hasSearchedAddress={false}
          onSelectAddress={mockOnSelectAddress}
        />
      );

      expect(screen.queryByText('주소를 찾을 수 없습니다.')).not.toBeInTheDocument();
      expect(container).toBeEmptyDOMElement();
    });

    it('검색 완료 후 결과가 없을 때 빈 메시지가 표시된다', () => {
      renderWithProviders(
        <AddressSearchResults
          searchResults={[]}
          isSearching={false}
          hasSearchedAddress={true}
          onSelectAddress={mockOnSelectAddress}
        />
      );

      expect(screen.getByText('주소를 찾을 수 없습니다.')).toBeInTheDocument();
    });

    it('커스텀 빈 메시지를 사용할 수 있다', () => {
      renderWithProviders(
        <AddressSearchResults
          searchResults={[]}
          isSearching={false}
          hasSearchedAddress={true}
          onSelectAddress={mockOnSelectAddress}
          emptyMessage="검색 결과가 없어요"
        />
      );

      expect(screen.getByText('검색 결과가 없어요')).toBeInTheDocument();
    });

    it('도로명 주소와 지번 주소가 모두 표시된다', () => {
      const mockResults = [
        createMockAddressSearchResult({
          roadAddress: '서울시 강남구 테헤란로 123',
          address: '서울시 강남구 역삼동 789-10'
        }),
      ];

      renderWithProviders(
        <AddressSearchResults
          searchResults={mockResults}
          isSearching={false}
          hasSearchedAddress={false}
          onSelectAddress={mockOnSelectAddress}
        />
      );

      expect(screen.getByText('서울시 강남구 테헤란로 123')).toBeInTheDocument();
      expect(screen.getByText('서울시 강남구 역삼동 789-10')).toBeInTheDocument();
    });

    it('도로명 주소가 없을 때 지번 주소만 표시된다', () => {
      const mockResults = [
        createMockAddressSearchResult({
          roadAddress: '',
          address: '서울시 강남구 역삼동 789-10'
        }),
      ];

      renderWithProviders(
        <AddressSearchResults
          searchResults={mockResults}
          isSearching={false}
          hasSearchedAddress={false}
          onSelectAddress={mockOnSelectAddress}
        />
      );

      expect(screen.getByText('서울시 강남구 역삼동 789-10')).toBeInTheDocument();
    });
  });

  describe('상호작용 테스트', () => {
    it('주소를 클릭하면 onSelectAddress가 호출된다', async () => {
      const user = userEvent.setup();
      const mockResults = [
        createMockAddressSearchResult({
          roadAddress: '서울시 강남구 테헤란로 123',
          address: '서울시 강남구 역삼동 789'
        }),
      ];

      renderWithProviders(
        <AddressSearchResults
          searchResults={mockResults}
          isSearching={false}
          hasSearchedAddress={false}
          onSelectAddress={mockOnSelectAddress}
        />
      );

      await user.click(screen.getAllByText('서울시 강남구 테헤란로 123')[0]);

      expect(mockOnSelectAddress).toHaveBeenCalledWith(mockResults[0]);
    });

    it('여러 주소 중 하나를 선택할 수 있다', async () => {
      const user = userEvent.setup();
      const mockResults = [
        createMockAddressSearchResult({
          roadAddress: '서울시 강남구 테헤란로 123',
          address: '서울시 강남구 역삼동 123'
        }),
        createMockAddressSearchResult({
          roadAddress: '서울시 강남구 역삼로 456',
          address: '서울시 강남구 역삼동 456'
        }),
      ];

      renderWithProviders(
        <AddressSearchResults
          searchResults={mockResults}
          isSearching={false}
          hasSearchedAddress={false}
          onSelectAddress={mockOnSelectAddress}
        />
      );

      await user.click(screen.getAllByText('서울시 강남구 역삼로 456')[0]);

      expect(mockOnSelectAddress).toHaveBeenCalledWith(mockResults[1]);
    });
  });

  describe('스타일 커스터마이징 테스트', () => {
    it('maxHeight prop을 사용할 수 있다', () => {
      const mockResults = [
        createMockAddressSearchResult({ roadAddress: '서울시 강남구 테헤란로 123' }),
      ];

      const { container } = renderWithProviders(
        <AddressSearchResults
          searchResults={mockResults}
          isSearching={false}
          hasSearchedAddress={false}
          onSelectAddress={mockOnSelectAddress}
          maxHeight="max-h-96"
        />
      );

      const resultsContainer = container.firstChild as HTMLElement;
      expect(resultsContainer.className).toContain('max-h-96');
    });

    it('기본 maxHeight 값이 적용된다', () => {
      const mockResults = [
        createMockAddressSearchResult({ roadAddress: '서울시 강남구 테헤란로 123' }),
      ];

      const { container } = renderWithProviders(
        <AddressSearchResults
          searchResults={mockResults}
          isSearching={false}
          hasSearchedAddress={false}
          onSelectAddress={mockOnSelectAddress}
        />
      );

      const resultsContainer = container.firstChild as HTMLElement;
      expect(resultsContainer.className).toContain('max-h-48');
    });
  });

  describe('다중 주소 렌더링 테스트', () => {
    it('많은 주소 결과를 모두 렌더링한다', () => {
      const mockResults = Array.from({ length: 10 }, (_, i) =>
        createMockAddressSearchResult({ roadAddress: `서울시 강남구 테헤란로 ${i + 1}` })
      );

      renderWithProviders(
        <AddressSearchResults
          searchResults={mockResults}
          isSearching={false}
          hasSearchedAddress={false}
          onSelectAddress={mockOnSelectAddress}
        />
      );

      mockResults.forEach((result) => {
        expect(screen.getByText(result.roadAddress!)).toBeInTheDocument();
      });
    });
  });

  describe('접근성 테스트', () => {
    it('주소 버튼이 클릭 가능한 요소로 렌더링된다', () => {
      const mockResults = [
        createMockAddressSearchResult({ roadAddress: '서울시 강남구 테헤란로 123' }),
      ];

      renderWithProviders(
        <AddressSearchResults
          searchResults={mockResults}
          isSearching={false}
          hasSearchedAddress={false}
          onSelectAddress={mockOnSelectAddress}
        />
      );

      const button = screen.getByRole('button', { name: /서울시 강남구 테헤란로 123/i });
      expect(button).toBeInTheDocument();
    });
  });
});
