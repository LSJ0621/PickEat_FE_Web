import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { AddressAddModal } from '@features/user/components/address/AddressAddModal';
import {
  createMockUserAddresses,
  createMockAddressSearchResult,
  createMockSelectedAddress,
} from '@tests/factories';

describe('AddressAddModal', () => {
  const defaultProps = {
    open: true,
    addresses: createMockUserAddresses(2),
    addressQuery: '',
    searchResults: [],
    isSearching: false,
    selectedAddress: null,
    addressAlias: '',
    isSaving: false,
    hasSearchedAddress: false,
    onClose: vi.fn(),
    onAddressQueryChange: vi.fn(),
    onSearch: vi.fn(),
    onSelectAddress: vi.fn(),
    onAddressAliasChange: vi.fn(),
    onAddAddress: vi.fn().mockResolvedValue(true),
    onClearSelection: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('모달이 열려있을 때 주소 추가 제목이 표시된다', async () => {
      renderWithProviders(<AddressAddModal {...defaultProps} />);

      await waitFor(() => {
        // 주소 추가 텍스트가 제목과 버튼에 각각 존재할 수 있음
        const allTexts = screen.getAllByText('주소 추가');
        expect(allTexts.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('모달이 닫혀있을 때 아무것도 렌더링되지 않는다', () => {
      const { container } = renderWithProviders(
        <AddressAddModal {...defaultProps} open={false} />
      );

      expect(container).toBeEmptyDOMElement();
    });

    it('주소 등록 현황이 표시된다', async () => {
      renderWithProviders(<AddressAddModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/현재: 2\/4/)).toBeInTheDocument();
      });
    });

    it('추가 가능한 주소 개수가 표시된다', async () => {
      renderWithProviders(<AddressAddModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/추가 가능: 2개/)).toBeInTheDocument();
      });
    });

    it('닫기 버튼이 렌더링된다', async () => {
      renderWithProviders(<AddressAddModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
      });
    });

    it('취소 버튼이 렌더링된다', async () => {
      renderWithProviders(<AddressAddModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      });
    });

    it('주소 추가 버튼이 렌더링된다', async () => {
      renderWithProviders(<AddressAddModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '주소 추가' })).toBeInTheDocument();
      });
    });
  });

  describe('검색 결과 테스트', () => {
    it('검색 결과가 있을 때 주소 목록이 표시된다', async () => {
      const searchResults = [
        createMockAddressSearchResult({ roadAddress: '서울시 강남구 테헤란로 100' }),
        createMockAddressSearchResult({ roadAddress: '서울시 강남구 테헤란로 200' }),
      ];

      renderWithProviders(
        <AddressAddModal {...defaultProps} searchResults={searchResults} />
      );

      await waitFor(() => {
        expect(screen.getByText('서울시 강남구 테헤란로 100')).toBeInTheDocument();
        expect(screen.getByText('서울시 강남구 테헤란로 200')).toBeInTheDocument();
      });
    });
  });

  describe('선택된 주소 테스트', () => {
    it('주소가 선택되면 선택한 주소가 표시된다', async () => {
      const selectedAddress = createMockSelectedAddress({
        roadAddress: '서울시 강남구 테헤란로 555',
      });

      renderWithProviders(
        <AddressAddModal {...defaultProps} selectedAddress={selectedAddress} />
      );

      await waitFor(() => {
        expect(screen.getByText('선택한 주소')).toBeInTheDocument();
        expect(screen.getByText('서울시 강남구 테헤란로 555')).toBeInTheDocument();
      });
    });

    it('별칭 입력 필드가 표시된다', async () => {
      const selectedAddress = createMockSelectedAddress();

      renderWithProviders(
        <AddressAddModal {...defaultProps} selectedAddress={selectedAddress} />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/별칭 입력/)).toBeInTheDocument();
      });
    });

    it('선택 취소 버튼이 표시된다', async () => {
      const selectedAddress = createMockSelectedAddress();

      renderWithProviders(
        <AddressAddModal {...defaultProps} selectedAddress={selectedAddress} />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '선택 취소' })).toBeInTheDocument();
      });
    });
  });

  describe('상호작용 테스트', () => {
    it('닫기 버튼 클릭 시 onClose가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<AddressAddModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '닫기' }));

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('취소 버튼 클릭 시 onClose가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<AddressAddModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '취소' }));

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('선택 취소 클릭 시 onClearSelection이 호출된다', async () => {
      const user = userEvent.setup();
      const selectedAddress = createMockSelectedAddress();

      renderWithProviders(
        <AddressAddModal {...defaultProps} selectedAddress={selectedAddress} />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '선택 취소' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '선택 취소' }));

      expect(defaultProps.onClearSelection).toHaveBeenCalledTimes(1);
    });

    it('주소 추가 버튼 클릭 시 onAddAddress가 호출된다', async () => {
      const user = userEvent.setup();
      const selectedAddress = createMockSelectedAddress();

      renderWithProviders(
        <AddressAddModal {...defaultProps} selectedAddress={selectedAddress} />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '주소 추가' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '주소 추가' }));

      expect(defaultProps.onAddAddress).toHaveBeenCalledTimes(1);
    });
  });

  describe('비활성화 테스트', () => {
    it('주소가 선택되지 않으면 주소 추가 버튼이 비활성화된다', async () => {
      renderWithProviders(<AddressAddModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '주소 추가' })).toBeDisabled();
      });
    });

    it('주소가 4개 이상이면 주소 추가 버튼이 비활성화된다', async () => {
      const selectedAddress = createMockSelectedAddress();

      renderWithProviders(
        <AddressAddModal
          {...defaultProps}
          addresses={createMockUserAddresses(4)}
          selectedAddress={selectedAddress}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '주소 추가' })).toBeDisabled();
      });
    });

    it('저장 중일 때 취소 버튼이 비활성화된다', async () => {
      renderWithProviders(<AddressAddModal {...defaultProps} isSaving={true} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
      });
    });
  });

  describe('애니메이션 테스트', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('모달 닫기 애니메이션 완료 후 DOM에서 제거된다', async () => {
      const { rerender } = renderWithProviders(<AddressAddModal {...defaultProps} open={true} />);

      await waitFor(() => {
        expect(screen.getAllByText('주소 추가').length).toBeGreaterThan(0);
      });

      rerender(<AddressAddModal {...defaultProps} open={false} />);

      // act()로 타이머 진행을 감싸서 상태 업데이트를 올바르게 처리
      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        const titles = screen.queryAllByText('주소 추가');
        expect(titles.length).toBe(0);
      });
    });
  });

  describe('주소 추가 성공/실패 테스트', () => {
    it('onAddAddress가 false를 반환하면 모달이 열린 상태로 유지된다', async () => {
      const user = userEvent.setup();
      const onAddAddressFail = vi.fn().mockResolvedValue(false);
      const selectedAddress = createMockSelectedAddress();

      renderWithProviders(
        <AddressAddModal
          {...defaultProps}
          selectedAddress={selectedAddress}
          onAddAddress={onAddAddressFail}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '주소 추가' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '주소 추가' }));

      await waitFor(() => {
        expect(onAddAddressFail).toHaveBeenCalled();
      });

      // 모달이 여전히 열려있는지 확인
      expect(screen.getAllByText('주소 추가').length).toBeGreaterThan(0);
    });

    it('onAddAddress가 true를 반환하면 onClose가 호출된다', async () => {
      const user = userEvent.setup();
      const selectedAddress = createMockSelectedAddress();

      renderWithProviders(
        <AddressAddModal {...defaultProps} selectedAddress={selectedAddress} />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '주소 추가' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '주소 추가' }));

      await waitFor(() => {
        expect(defaultProps.onAddAddress).toHaveBeenCalled();
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    });
  });
});
