import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { AddressSearchInput } from '@features/user/components/setup/AddressSearchInput';

describe('AddressSearchInput', () => {
  const defaultProps = {
    addressQuery: '',
    isSearching: false,
    onAddressQueryChange: vi.fn(),
    onSearch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('주소 검색 입력 필드가 렌더링된다', () => {
      renderWithProviders(<AddressSearchInput {...defaultProps} />);

      expect(screen.getByPlaceholderText('주소를 검색하세요')).toBeInTheDocument();
    });

    it('검색 버튼이 렌더링된다', () => {
      renderWithProviders(<AddressSearchInput {...defaultProps} />);

      expect(screen.getByRole('button', { name: '검색' })).toBeInTheDocument();
    });

    it('커스텀 placeholder를 사용할 수 있다', () => {
      renderWithProviders(
        <AddressSearchInput {...defaultProps} placeholder="도로명 주소를 입력하세요" />
      );

      expect(screen.getByPlaceholderText('도로명 주소를 입력하세요')).toBeInTheDocument();
    });

    it('주소 쿼리가 입력 필드에 표시된다', () => {
      renderWithProviders(
        <AddressSearchInput {...defaultProps} addressQuery="서울시 강남구" />
      );

      expect(screen.getByDisplayValue('서울시 강남구')).toBeInTheDocument();
    });
  });

  describe('상호작용 테스트', () => {
    it('입력 시 onAddressQueryChange가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<AddressSearchInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('주소를 검색하세요');
      await user.type(input, '테');

      expect(defaultProps.onAddressQueryChange).toHaveBeenCalled();
    });

    it('검색 버튼 클릭 시 onSearch가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<AddressSearchInput {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: '검색' }));

      expect(defaultProps.onSearch).toHaveBeenCalledTimes(1);
    });

    it('Enter 키 입력 시 onSearch가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<AddressSearchInput {...defaultProps} addressQuery="서울" />);

      const input = screen.getByPlaceholderText('주소를 검색하세요');
      await user.click(input);
      await user.keyboard('{Enter}');

      expect(defaultProps.onSearch).toHaveBeenCalledTimes(1);
    });

    it('검색 중일 때 Enter 키를 눌러도 onSearch가 호출되지 않는다', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <AddressSearchInput {...defaultProps} isSearching={true} addressQuery="서울" />
      );

      const input = screen.getByPlaceholderText('주소를 검색하세요');
      await user.click(input);
      await user.keyboard('{Enter}');

      expect(defaultProps.onSearch).not.toHaveBeenCalled();
    });
  });

  describe('로딩 상태 테스트', () => {
    it('검색 중일 때 버튼이 비활성화된다', () => {
      renderWithProviders(<AddressSearchInput {...defaultProps} isSearching={true} />);

      // Button uses aria-label="검색", isLoading disables the button
      // The button content changes to "로딩 중..." but aria-label stays "검색"
      const button = screen.getByRole('button', { name: '검색' });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  describe('스타일 테스트', () => {
    it('입력 필드에 적절한 스타일이 적용된다', () => {
      renderWithProviders(<AddressSearchInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('주소를 검색하세요');
      // Input uses rounded-xl (not rounded-2xl)
      expect(input).toHaveClass('rounded-xl');
      expect(input).toHaveClass('border');
    });

    it('입력 필드와 버튼이 가로로 배치된다', () => {
      const { container } = renderWithProviders(<AddressSearchInput {...defaultProps} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('gap-2');
    });
  });

  describe('접근성 테스트', () => {
    it('입력 필드에 타입이 text로 설정된다', () => {
      renderWithProviders(<AddressSearchInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('주소를 검색하세요');
      expect(input).toHaveAttribute('type', 'text');
    });
  });
});
