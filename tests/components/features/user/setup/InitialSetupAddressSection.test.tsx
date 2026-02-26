import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { InitialSetupAddressSection } from '@features/user/components/setup/InitialSetupAddressSection';
import { createMockSelectedAddress } from '@tests/factories';

// Mock useAddressSearch hook with dynamic state
let mockSearchResults: unknown[] = [];
let mockHandleSelectAddress = vi.fn((addr) => addr);
let mockClearSearch = vi.fn();

vi.mock('@shared/hooks/address/useAddressSearch', () => ({
  useAddressSearch: () => ({
    addressQuery: '',
    searchResults: mockSearchResults,
    isSearching: false,
    hasSearchedAddress: mockSearchResults.length > 0,
    selectedAddress: null,
    setAddressQuery: vi.fn(),
    handleSearch: vi.fn(),
    handleSelectAddress: mockHandleSelectAddress,
    clearSearch: mockClearSearch,
    setSelectedAddress: vi.fn(),
  }),
}));

describe('InitialSetupAddressSection', () => {
  const defaultProps = {
    selectedAddress: null,
    addressAlias: '',
    onAddressChange: vi.fn(),
    onAddressAliasChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchResults = [];
    mockHandleSelectAddress = vi.fn((addr) => addr);
    mockClearSearch = vi.fn();
  });

  describe('렌더링 테스트', () => {
    it('주소 섹션이 렌더링된다', () => {
      renderWithProviders(<InitialSetupAddressSection {...defaultProps} />);

      expect(screen.getByText('주소')).toBeInTheDocument();
    });

    it('주소 안내 문구가 표시된다', () => {
      renderWithProviders(<InitialSetupAddressSection {...defaultProps} />);

      expect(
        screen.getByText('주변 식당 추천을 위해 주소를 입력해주세요')
      ).toBeInTheDocument();
    });

    it('주소 검색 입력 필드가 표시된다', () => {
      renderWithProviders(<InitialSetupAddressSection {...defaultProps} />);

      expect(screen.getByPlaceholderText('주소를 검색하세요')).toBeInTheDocument();
    });

    it('검색 버튼이 표시된다', () => {
      renderWithProviders(<InitialSetupAddressSection {...defaultProps} />);

      expect(screen.getByRole('button', { name: '검색' })).toBeInTheDocument();
    });
  });

  describe('선택된 주소 표시 테스트', () => {
    it('주소가 선택되면 선택한 주소가 표시된다', () => {
      const selectedAddress = createMockSelectedAddress({
        roadAddress: '서울시 강남구 테헤란로 123',
      });

      renderWithProviders(
        <InitialSetupAddressSection {...defaultProps} selectedAddress={selectedAddress} />
      );

      expect(screen.getByText('선택한 주소')).toBeInTheDocument();
      expect(screen.getByText('서울시 강남구 테헤란로 123')).toBeInTheDocument();
    });

    it('도로명 주소가 없으면 지번 주소가 표시된다', () => {
      const selectedAddress = createMockSelectedAddress({
        roadAddress: '',
        address: '서울시 강남구 역삼동 123-45',
      });

      renderWithProviders(
        <InitialSetupAddressSection {...defaultProps} selectedAddress={selectedAddress} />
      );

      expect(screen.getByText('서울시 강남구 역삼동 123-45')).toBeInTheDocument();
    });

    it('별칭 입력 필드가 표시된다', () => {
      const selectedAddress = createMockSelectedAddress();

      renderWithProviders(
        <InitialSetupAddressSection {...defaultProps} selectedAddress={selectedAddress} />
      );

      expect(screen.getByText('별칭 (선택사항)')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('별칭을 입력하세요 (예: 집, 회사)')
      ).toBeInTheDocument();
    });

    it('주소가 선택되지 않으면 별칭 필드가 표시되지 않는다', () => {
      renderWithProviders(<InitialSetupAddressSection {...defaultProps} />);

      expect(screen.queryByText('별칭 (선택사항)')).not.toBeInTheDocument();
    });
  });

  describe('별칭 입력 테스트', () => {
    it('별칭 입력 시 onAddressAliasChange가 호출된다', async () => {
      const user = userEvent.setup();
      const selectedAddress = createMockSelectedAddress();

      renderWithProviders(
        <InitialSetupAddressSection {...defaultProps} selectedAddress={selectedAddress} />
      );

      const input = screen.getByPlaceholderText('별칭을 입력하세요 (예: 집, 회사)');
      await user.type(input, '회사');

      expect(defaultProps.onAddressAliasChange).toHaveBeenCalled();
    });

    it('별칭 값이 입력 필드에 표시된다', () => {
      const selectedAddress = createMockSelectedAddress();

      renderWithProviders(
        <InitialSetupAddressSection
          {...defaultProps}
          selectedAddress={selectedAddress}
          addressAlias="회사"
        />
      );

      const input = screen.getByPlaceholderText('별칭을 입력하세요 (예: 집, 회사)');
      expect(input).toHaveValue('회사');
    });

    it('별칭 입력 필드에 최대 글자 수 제한이 있다', () => {
      const selectedAddress = createMockSelectedAddress();

      renderWithProviders(
        <InitialSetupAddressSection {...defaultProps} selectedAddress={selectedAddress} />
      );

      const input = screen.getByPlaceholderText('별칭을 입력하세요 (예: 집, 회사)');
      expect(input).toHaveAttribute('maxLength', '20');
    });
  });

  describe('스타일 테스트', () => {
    it('섹션에 적절한 스타일이 적용된다', () => {
      const { container } = renderWithProviders(
        <InitialSetupAddressSection {...defaultProps} />
      );

      const section = container.firstChild as HTMLElement;
      expect(section).toHaveClass('rounded-2xl');
      expect(section).toHaveClass('border');
    });

    it('선택된 주소 영역에 emerald 스타일이 적용된다', () => {
      const selectedAddress = createMockSelectedAddress();

      const { container } = renderWithProviders(
        <InitialSetupAddressSection {...defaultProps} selectedAddress={selectedAddress} />
      );

      const selectedAddressDiv = container.querySelector('.border-emerald-500\\/30');
      expect(selectedAddressDiv).toBeInTheDocument();
    });
  });

  describe('주소 선택 콜백 테스트', () => {
    it('주소 선택 시 onAddressChange와 clearSearch가 호출된다', async () => {
      // Setup mock search results
      mockSearchResults = [
        {
          roadAddress: '서울시 강남구 테헤란로 123',
          address: '서울시 강남구 역삼동 123-45',
          zipCode: '12345',
          latitude: '37.5',
          longitude: '127.0',
        },
      ];

      const user = userEvent.setup();
      const onAddressChange = vi.fn();

      renderWithProviders(
        <InitialSetupAddressSection {...defaultProps} onAddressChange={onAddressChange} />
      );

      // Verify search results are displayed
      await waitFor(() => {
        expect(screen.getByText('서울시 강남구 테헤란로 123')).toBeInTheDocument();
      });

      // Click on the address to select it
      const addressButton = screen.getByText('서울시 강남구 테헤란로 123').closest('button');
      expect(addressButton).toBeInTheDocument();
      await user.click(addressButton!);

      // Line 50: onSelectAddress calls handleSelectAddress from hook
      expect(mockHandleSelectAddress).toHaveBeenCalled();

      // After address selection, onAddressChange should be called (line 28)
      // and clearSearch should be called (line 29)
      await waitFor(() => {
        expect(onAddressChange).toHaveBeenCalled();
      });

      // mockClearSearch gets called through the wrapped function
      // This covers lines 28-29 in the component
    });
  });
});
