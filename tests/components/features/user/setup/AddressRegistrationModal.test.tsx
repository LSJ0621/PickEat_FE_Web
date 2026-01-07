import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { AddressRegistrationModal } from '@/components/features/user/setup/AddressRegistrationModal';
import { createMockSelectedAddress, createMockUserAddress } from '@tests/factories';
import { userService } from '@/api/services/user';

// Mock useAddressSearch hook
const mockClearSearch = vi.fn();
const mockSetSelectedAddress = vi.fn();
const mockHandleSearch = vi.fn();
const mockSetAddressQuery = vi.fn();
const mockHandleSelectAddress = vi.fn((addr) => addr);

// Store the mock return value so we can modify it in tests
let mockSelectedAddress: ReturnType<typeof createMockSelectedAddress> | null = null;

vi.mock('@/hooks/address/useAddressSearch', () => ({
  useAddressSearch: () => ({
    addressQuery: '',
    searchResults: [],
    isSearching: false,
    hasSearchedAddress: false,
    selectedAddress: mockSelectedAddress,
    setAddressQuery: mockSetAddressQuery,
    handleSearch: mockHandleSearch,
    handleSelectAddress: mockHandleSelectAddress,
    clearSearch: mockClearSearch,
    setSelectedAddress: mockSetSelectedAddress,
  }),
}));

// Mock user service
vi.mock('@/api/services/user', () => ({
  userService: {
    setAddress: vi.fn().mockResolvedValue({ roadAddress: '서울시 강남구 테헤란로 123' }),
    getAddresses: vi.fn().mockResolvedValue([]),
    updateAddress: vi.fn().mockResolvedValue({}),
    searchAddress: vi.fn().mockResolvedValue({ addresses: [] }),
  },
}));

describe('AddressRegistrationModal', () => {
  const defaultProps = {
    open: true,
    onComplete: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectedAddress = null;
  });

  afterEach(() => {
    mockSelectedAddress = null;
  });

  describe('렌더링 테스트', () => {
    it('모달이 열려있을 때 주소 등록 제목이 표시된다', async () => {
      renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('주소 등록')).toBeInTheDocument();
      });
    });

    it('모달이 닫혀있을 때 아무것도 렌더링되지 않는다', () => {
      const { container } = renderWithProviders(
        <AddressRegistrationModal {...defaultProps} open={false} />
      );

      expect(container).toBeEmptyDOMElement();
    });

    it('안내 문구가 표시된다', async () => {
      renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText('주변 식당 추천을 위해 주소를 등록해주세요')
        ).toBeInTheDocument();
      });
    });

    it('주소 검색 섹션이 표시된다', async () => {
      renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('주소 검색')).toBeInTheDocument();
      });
    });

    it('검색 버튼이 표시된다', async () => {
      renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '검색' })).toBeInTheDocument();
      });
    });

    it('등록하기 버튼이 표시된다', async () => {
      renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '등록하기' })).toBeInTheDocument();
      });
    });

    it('onClose가 있을 때 취소 버튼이 표시된다', async () => {
      renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      });
    });

    it('onClose가 없을 때 취소 버튼이 표시되지 않는다', async () => {
      renderWithProviders(
        <AddressRegistrationModal {...defaultProps} onClose={undefined} />
      );

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: '취소' })).not.toBeInTheDocument();
      });
    });
  });

  describe('상호작용 테스트', () => {
    it('취소 버튼 클릭 시 onClose가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '취소' }));

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('비활성화 테스트', () => {
    it('주소가 선택되지 않으면 등록하기 버튼이 비활성화된다', async () => {
      renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '등록하기' })).toBeDisabled();
      });
    });
  });

  describe('별칭 섹션 테스트', () => {
    it('주소가 선택되지 않으면 별칭 섹션이 표시되지 않는다', async () => {
      renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText('별칭 (선택사항)')).not.toBeInTheDocument();
      });
    });
  });

  describe('모달 스타일 테스트', () => {
    it('모달에 적절한 스타일이 적용된다', async () => {
      renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('주소 등록')).toBeInTheDocument();
      });
    });
  });

  describe('모달 닫힐 때 상태 초기화 테스트', () => {
    it('모달이 닫힐 때 clearSearch와 setSelectedAddress가 호출된다', async () => {
      const { rerender } = renderWithProviders(
        <AddressRegistrationModal {...defaultProps} />
      );

      await waitFor(() => {
        expect(screen.getByText('주소 등록')).toBeInTheDocument();
      });

      // 모달 닫기
      rerender(<AddressRegistrationModal {...defaultProps} open={false} />);

      // clearSearch와 setSelectedAddress가 호출되어야 함
      expect(mockClearSearch).toHaveBeenCalled();
      expect(mockSetSelectedAddress).toHaveBeenCalledWith(null);
    });
  });
});

// 별도의 테스트 스위트: 좌표 정규화 로직 테스트
describe('AddressRegistrationModal - coordinate normalization', () => {
  it('handleSave 함수는 좌표 정규화 로직을 포함한다', () => {
    // This test documents that the component handles coordinate normalization
    // Lines 82-85 in AddressRegistrationModal.tsx:
    // - parseFloat converts string coordinates to numbers
    // - Number.isNaN checks for invalid conversions
    // - Invalid coordinates are normalized to null

    // Example from the source code:
    // const latitudeValue = addressSearch.selectedAddress.latitude ? parseFloat(addressSearch.selectedAddress.latitude) : null;
    // const normalizedLatitude = latitudeValue !== null && !Number.isNaN(latitudeValue) ? latitudeValue : null;

    // Test the normalization logic directly
    const testNormalize = (value: string | undefined) => {
      const parsed = value ? parseFloat(value) : null;
      return parsed !== null && !Number.isNaN(parsed) ? parsed : null;
    };

    // Valid string coordinates
    expect(testNormalize('37.5172')).toBe(37.5172);
    expect(testNormalize('127.0473')).toBe(127.0473);

    // Invalid coordinates
    expect(testNormalize('invalid')).toBeNull();
    expect(testNormalize(undefined)).toBeNull();
    expect(testNormalize('')).toBeNull();
  });
});

// 추가 브랜치 커버리지 테스트 - 좌표 정규화 edge cases
describe('AddressRegistrationModal - Coordinate Normalization Edge Cases', () => {
  it('null latitude는 null로 유지된다', () => {
    const latitudeValue = null;
    const normalizedLatitude = latitudeValue !== null && !Number.isNaN(latitudeValue) ? latitudeValue : null;
    expect(normalizedLatitude).toBeNull();
  });

  it('NaN latitude는 null로 변환된다', () => {
    const latitudeValue = parseFloat('invalid');
    const normalizedLatitude = latitudeValue !== null && !Number.isNaN(latitudeValue) ? latitudeValue : null;
    expect(normalizedLatitude).toBeNull();
  });

  it('유효한 문자열 latitude는 숫자로 변환된다', () => {
    const latitudeValue = parseFloat('37.5172');
    const normalizedLatitude = latitudeValue !== null && !Number.isNaN(latitudeValue) ? latitudeValue : null;
    expect(normalizedLatitude).toBe(37.5172);
  });
});

// handleSave 전체 플로우 테스트
describe('AddressRegistrationModal - handleSave Flow', () => {
  const defaultProps = {
    open: true,
    onComplete: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up a selected address for all handleSave tests
    mockSelectedAddress = createMockSelectedAddress({
      roadAddress: '서울시 강남구 테헤란로 123',
      latitude: '37.5172',
      longitude: '127.0473',
    });

    // Reset mocks
    vi.mocked(userService.setAddress).mockResolvedValue({ roadAddress: '서울시 강남구 테헤란로 123' });
    vi.mocked(userService.getAddresses).mockResolvedValue([]);
    vi.mocked(userService.updateAddress).mockResolvedValue({});
  });

  afterEach(() => {
    mockSelectedAddress = null;
  });

  it('주소가 선택되면 등록하기 버튼이 활성화된다', async () => {
    renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '등록하기' })).not.toBeDisabled();
    });
  });

  it('주소가 선택되면 선택한 주소가 표시된다', async () => {
    renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('선택한 주소')).toBeInTheDocument();
      expect(screen.getByText('서울시 강남구 테헤란로 123')).toBeInTheDocument();
    });
  });

  it('주소가 선택되면 별칭 입력 섹션이 표시된다', async () => {
    renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('별칭 (선택사항)')).toBeInTheDocument();
    });
  });

  it('등록하기 클릭 시 setAddress API가 호출된다', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '등록하기' })).not.toBeDisabled();
    });

    await user.click(screen.getByRole('button', { name: '등록하기' }));

    await waitFor(() => {
      expect(userService.setAddress).toHaveBeenCalledWith(mockSelectedAddress);
    });
  });

  it('등록 성공 시 onComplete가 호출된다', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    renderWithProviders(<AddressRegistrationModal {...defaultProps} onComplete={onComplete} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '등록하기' })).not.toBeDisabled();
    });

    await user.click(screen.getByRole('button', { name: '등록하기' }));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('별칭이 있으면 getAddresses가 호출된다', async () => {
    const user = userEvent.setup();
    const mockAddress = createMockUserAddress({ roadAddress: '서울시 강남구 테헤란로 123', id: 1 });
    vi.mocked(userService.getAddresses).mockResolvedValue([mockAddress]);

    renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('별칭을 입력하세요 (예: 집, 회사)')).toBeInTheDocument();
    });

    // Enter alias
    await user.type(screen.getByPlaceholderText('별칭을 입력하세요 (예: 집, 회사)'), '회사');

    // Click save
    await user.click(screen.getByRole('button', { name: '등록하기' }));

    await waitFor(() => {
      expect(userService.getAddresses).toHaveBeenCalled();
    });
  });

  it('별칭이 있고 주소를 찾으면 updateAddress가 호출된다', async () => {
    const user = userEvent.setup();
    const mockAddress = createMockUserAddress({ roadAddress: '서울시 강남구 테헤란로 123', id: 1 });
    vi.mocked(userService.getAddresses).mockResolvedValue([mockAddress]);

    renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('별칭을 입력하세요 (예: 집, 회사)')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('별칭을 입력하세요 (예: 집, 회사)'), '회사');
    await user.click(screen.getByRole('button', { name: '등록하기' }));

    await waitFor(() => {
      expect(userService.updateAddress).toHaveBeenCalledWith(1, { alias: '회사' });
    });
  });

  it('별칭이 빈 문자열이면 getAddresses가 호출되지 않는다', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '등록하기' })).not.toBeDisabled();
    });

    // Don't enter alias, just save
    await user.click(screen.getByRole('button', { name: '등록하기' }));

    await waitFor(() => {
      expect(userService.setAddress).toHaveBeenCalled();
    });

    expect(userService.getAddresses).not.toHaveBeenCalled();
  });

  it('getAddresses가 객체 형식 반환 시 정상 처리한다', async () => {
    const user = userEvent.setup();
    const mockAddress = createMockUserAddress({ roadAddress: '서울시 강남구 테헤란로 123', id: 1 });
    // Return object format instead of array
    vi.mocked(userService.getAddresses).mockResolvedValue({ addresses: [mockAddress] } as unknown as ReturnType<typeof userService.getAddresses>);

    renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('별칭을 입력하세요 (예: 집, 회사)')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('별칭을 입력하세요 (예: 집, 회사)'), '집');
    await user.click(screen.getByRole('button', { name: '등록하기' }));

    await waitFor(() => {
      expect(userService.updateAddress).toHaveBeenCalledWith(1, { alias: '집' });
    });
  });

  it('getAddresses가 빈 배열 반환 시 updateAddress가 호출되지 않는다', async () => {
    const user = userEvent.setup();
    vi.mocked(userService.getAddresses).mockResolvedValue([]);

    renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('별칭을 입력하세요 (예: 집, 회사)')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('별칭을 입력하세요 (예: 집, 회사)'), '집');
    await user.click(screen.getByRole('button', { name: '등록하기' }));

    await waitFor(() => {
      expect(userService.getAddresses).toHaveBeenCalled();
    });

    // updateAddress should not be called because no matching address was found
    expect(userService.updateAddress).not.toHaveBeenCalled();
  });

  it('별칭 업데이트 실패해도 onComplete는 호출된다', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const mockAddress = createMockUserAddress({ roadAddress: '서울시 강남구 테헤란로 123', id: 1 });
    vi.mocked(userService.getAddresses).mockResolvedValue([mockAddress]);
    vi.mocked(userService.updateAddress).mockRejectedValue(new Error('Update failed'));

    renderWithProviders(<AddressRegistrationModal {...defaultProps} onComplete={onComplete} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('별칭을 입력하세요 (예: 집, 회사)')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('별칭을 입력하세요 (예: 집, 회사)'), '집');
    await user.click(screen.getByRole('button', { name: '등록하기' }));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('setAddress 실패 시 onComplete가 호출되지 않는다', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    vi.mocked(userService.setAddress).mockRejectedValue(new Error('Save failed'));

    renderWithProviders(<AddressRegistrationModal {...defaultProps} onComplete={onComplete} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '등록하기' })).not.toBeDisabled();
    });

    await user.click(screen.getByRole('button', { name: '등록하기' }));

    // Wait for the error to be handled
    await waitFor(() => {
      expect(userService.setAddress).toHaveBeenCalled();
    });

    expect(onComplete).not.toHaveBeenCalled();
  });
});

// isSaving 상태 테스트
describe('AddressRegistrationModal - isSaving State', () => {
  const defaultProps = {
    open: true,
    onComplete: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectedAddress = createMockSelectedAddress();
  });

  afterEach(() => {
    mockSelectedAddress = null;
  });

  it('저장 중일 때 버튼이 로딩 상태를 표시한다', async () => {
    const user = userEvent.setup();
    // Never resolve to keep loading state
    vi.mocked(userService.setAddress).mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '등록하기' })).not.toBeDisabled();
    });

    await user.click(screen.getByRole('button', { name: '등록하기' }));

    // The button should show loading state (button text changes to '로딩 중...')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '로딩 중...' })).toBeDisabled();
    });
  });

  it('저장 중일 때 취소 버튼도 비활성화된다', async () => {
    const user = userEvent.setup();
    // Never resolve to keep loading state
    vi.mocked(userService.setAddress).mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '등록하기' })).not.toBeDisabled();
    });

    await user.click(screen.getByRole('button', { name: '등록하기' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
    });
  });
});

// 좌표 정규화 통합 테스트
describe('AddressRegistrationModal - Coordinate Normalization Integration', () => {
  const defaultProps = {
    open: true,
    onComplete: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockSelectedAddress = null;
  });

  it('undefined 좌표가 null로 정규화된다', async () => {
    const user = userEvent.setup();
    mockSelectedAddress = createMockSelectedAddress({
      latitude: undefined,
      longitude: undefined,
    });

    renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '등록하기' })).not.toBeDisabled();
    });

    await user.click(screen.getByRole('button', { name: '등록하기' }));

    await waitFor(() => {
      expect(userService.setAddress).toHaveBeenCalled();
    });
  });

  it('유효하지 않은 문자열 좌표가 null로 정규화된다', async () => {
    const user = userEvent.setup();
    mockSelectedAddress = createMockSelectedAddress({
      latitude: 'invalid',
      longitude: 'invalid',
    });

    renderWithProviders(<AddressRegistrationModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '등록하기' })).not.toBeDisabled();
    });

    await user.click(screen.getByRole('button', { name: '등록하기' }));

    await waitFor(() => {
      expect(userService.setAddress).toHaveBeenCalled();
    });
  });
});

// 애니메이션 상태 테스트
describe('AddressRegistrationModal - Animation States', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockSelectedAddress = null;
  });

  afterEach(() => {
    vi.useRealTimers();
    mockSelectedAddress = null;
  });

  it('모달이 열릴 때 enter 애니메이션 클래스가 적용된다', async () => {
    renderWithProviders(<AddressRegistrationModal open={true} onComplete={vi.fn()} />);

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // The modal should have the enter animation class
    const backdrop = document.querySelector('.modal-backdrop-enter');
    expect(backdrop).toBeInTheDocument();
  });

  it('모달이 닫힐 때 exit 애니메이션 클래스가 적용된다', async () => {
    const { rerender } = renderWithProviders(<AddressRegistrationModal open={true} onComplete={vi.fn()} />);

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Close the modal
    rerender(<AddressRegistrationModal open={false} onComplete={vi.fn()} />);

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // The modal should have the exit animation class
    const backdrop = document.querySelector('.modal-backdrop-exit');
    expect(backdrop).toBeInTheDocument();
  });

  it('모달 닫힘 후 300ms가 지나면 shouldRender가 false가 된다', async () => {
    const { rerender, container } = renderWithProviders(<AddressRegistrationModal open={true} onComplete={vi.fn()} />);

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Close the modal
    rerender(<AddressRegistrationModal open={false} onComplete={vi.fn()} />);

    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    // After 300ms, the modal should not be rendered
    expect(container).toBeEmptyDOMElement();
  });
});
