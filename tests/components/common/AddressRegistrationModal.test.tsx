import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { AddressRegistrationModal } from '@/components/common/AddressRegistrationModal';
import { userService } from '@/api/services/user';
import { createMockAddressSearchResponse, createMockAddress } from '@tests/factories';

// Mock API services
vi.mock('@/api/services/user', () => ({
  userService: {
    searchAddress: vi.fn(),
    setAddress: vi.fn(),
    getAddresses: vi.fn(),
    updateAddress: vi.fn(),
  },
}));

describe('AddressRegistrationModal', () => {
  const mockOnComplete = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('open이 true일 때 모달이 렌더링된다', () => {
      renderWithProviders(
        <AddressRegistrationModal open={true} onComplete={mockOnComplete} onClose={mockOnClose} />
      );

      expect(screen.getByText('주소 등록')).toBeInTheDocument();
      expect(screen.getByText('주변 식당 추천을 위해 주소를 등록해주세요')).toBeInTheDocument();
    });

    it('open이 false일 때 모달이 렌더링되지 않는다', () => {
      renderWithProviders(
        <AddressRegistrationModal open={false} onComplete={mockOnComplete} onClose={mockOnClose} />
      );

      expect(screen.queryByText('주소 등록')).not.toBeInTheDocument();
    });

    it('주소 검색 섹션이 렌더링된다', () => {
      renderWithProviders(
        <AddressRegistrationModal open={true} onComplete={mockOnComplete} onClose={mockOnClose} />
      );

      expect(screen.getByText('주소 검색')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('주소를 검색하세요')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '검색' })).toBeInTheDocument();
    });

    it('onClose가 제공되면 취소 버튼이 렌더링된다', () => {
      renderWithProviders(
        <AddressRegistrationModal open={true} onComplete={mockOnComplete} onClose={mockOnClose} />
      );

      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });

    it('onClose가 없으면 취소 버튼이 렌더링되지 않는다', () => {
      renderWithProviders(
        <AddressRegistrationModal open={true} onComplete={mockOnComplete} />
      );

      expect(screen.queryByRole('button', { name: '취소' })).not.toBeInTheDocument();
    });
  });

  describe('주소 검색 테스트', () => {
    it('주소를 입력하고 검색 버튼을 클릭하면 검색이 실행된다', async () => {
      const user = userEvent.setup();
      const mockResponse = createMockAddressSearchResponse();
      vi.mocked(userService.searchAddress).mockResolvedValue(mockResponse);

      renderWithProviders(
        <AddressRegistrationModal open={true} onComplete={mockOnComplete} onClose={mockOnClose} />
      );

      const input = screen.getByPlaceholderText('주소를 검색하세요');
      await user.type(input, '서울시 강남구');
      await user.click(screen.getByRole('button', { name: '검색' }));

      await waitFor(() => {
        expect(userService.searchAddress).toHaveBeenCalledWith('서울시 강남구');
      });
    });

    it('Enter 키를 누르면 검색이 실행된다', async () => {
      const user = userEvent.setup();
      const mockResponse = createMockAddressSearchResponse();
      vi.mocked(userService.searchAddress).mockResolvedValue(mockResponse);

      renderWithProviders(
        <AddressRegistrationModal open={true} onComplete={mockOnComplete} onClose={mockOnClose} />
      );

      const input = screen.getByPlaceholderText('주소를 검색하세요');
      await user.type(input, '서울시 강남구{Enter}');

      await waitFor(() => {
        expect(userService.searchAddress).toHaveBeenCalledWith('서울시 강남구');
      });
    });

    it('검색 결과가 표시된다', async () => {
      const user = userEvent.setup();
      const mockResponse = createMockAddressSearchResponse();
      vi.mocked(userService.searchAddress).mockResolvedValue(mockResponse);

      renderWithProviders(
        <AddressRegistrationModal open={true} onComplete={mockOnComplete} onClose={mockOnClose} />
      );

      const input = screen.getByPlaceholderText('주소를 검색하세요');
      await user.type(input, '서울시 강남구');
      await user.click(screen.getByRole('button', { name: '검색' }));

      await waitFor(() => {
        expect(screen.getByText(mockResponse.addresses[0].roadAddress)).toBeInTheDocument();
      });
    });

    it('검색 결과가 없을 때 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      vi.mocked(userService.searchAddress).mockResolvedValue({ addresses: [] });

      renderWithProviders(
        <AddressRegistrationModal open={true} onComplete={mockOnComplete} onClose={mockOnClose} />
      );

      const input = screen.getByPlaceholderText('주소를 검색하세요');
      await user.type(input, '존재하지않는주소');
      await user.click(screen.getByRole('button', { name: '검색' }));

      await waitFor(() => {
        expect(screen.getByText('주소를 찾을 수 없습니다.')).toBeInTheDocument();
      });
    });

    it('빈 문자열로 검색하면 API 호출이 되지 않는다', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <AddressRegistrationModal open={true} onComplete={mockOnComplete} onClose={mockOnClose} />
      );

      await user.click(screen.getByRole('button', { name: '검색' }));

      expect(userService.searchAddress).not.toHaveBeenCalled();
    });

    it('검색 실패 시 에러 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      vi.mocked(userService.searchAddress).mockRejectedValue(new Error('검색 실패'));

      renderWithProviders(
        <AddressRegistrationModal open={true} onComplete={mockOnComplete} onClose={mockOnClose} />
      );

      const input = screen.getByPlaceholderText('주소를 검색하세요');
      await user.type(input, '서울시 강남구');
      await user.click(screen.getByRole('button', { name: '검색' }));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();
      });

      alertSpy.mockRestore();
    });
  });

  describe('주소 선택 테스트', () => {
    it('검색 결과를 클릭하면 주소가 선택된다', async () => {
      const user = userEvent.setup();
      const mockResponse = createMockAddressSearchResponse();
      vi.mocked(userService.searchAddress).mockResolvedValue(mockResponse);

      renderWithProviders(
        <AddressRegistrationModal open={true} onComplete={mockOnComplete} onClose={mockOnClose} />
      );

      const input = screen.getByPlaceholderText('주소를 검색하세요');
      await user.type(input, '서울시 강남구');
      await user.click(screen.getByRole('button', { name: '검색' }));

      await waitFor(() => {
        expect(screen.getByText(mockResponse.addresses[0].roadAddress)).toBeInTheDocument();
      });

      await user.click(screen.getByText(mockResponse.addresses[0].roadAddress));

      await waitFor(() => {
        expect(screen.getByText('선택한 주소')).toBeInTheDocument();
        expect(screen.getByText(mockResponse.addresses[0].roadAddress)).toBeInTheDocument();
      });
    });

    it('주소 선택 후 별칭 입력 필드가 표시된다', async () => {
      const user = userEvent.setup();
      const mockResponse = createMockAddressSearchResponse();
      vi.mocked(userService.searchAddress).mockResolvedValue(mockResponse);

      renderWithProviders(
        <AddressRegistrationModal open={true} onComplete={mockOnComplete} onClose={mockOnClose} />
      );

      const input = screen.getByPlaceholderText('주소를 검색하세요');
      await user.type(input, '서울시 강남구');
      await user.click(screen.getByRole('button', { name: '검색' }));

      await waitFor(() => {
        expect(screen.getByText(mockResponse.addresses[0].roadAddress)).toBeInTheDocument();
      });

      await user.click(screen.getByText(mockResponse.addresses[0].roadAddress));

      await waitFor(() => {
        expect(screen.getByText('별칭 (선택사항)')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('별칭을 입력하세요 (예: 집, 회사)')).toBeInTheDocument();
      });
    });
  });

  describe('주소 저장 테스트', () => {
    it('주소를 선택하지 않으면 저장 버튼이 비활성화된다', () => {
      renderWithProviders(
        <AddressRegistrationModal open={true} onComplete={mockOnComplete} onClose={mockOnClose} />
      );

      const saveButton = screen.getByRole('button', { name: '등록하기' });
      expect(saveButton).toBeDisabled();
    });

    it('주소를 선택하면 저장 버튼이 활성화된다', async () => {
      const user = userEvent.setup();
      const mockResponse = createMockAddressSearchResponse();
      vi.mocked(userService.searchAddress).mockResolvedValue(mockResponse);

      renderWithProviders(
        <AddressRegistrationModal open={true} onComplete={mockOnComplete} onClose={mockOnClose} />
      );

      const input = screen.getByPlaceholderText('주소를 검색하세요');
      await user.type(input, '서울시 강남구');
      await user.click(screen.getByRole('button', { name: '검색' }));

      await waitFor(() => {
        expect(screen.getByText(mockResponse.addresses[0].roadAddress)).toBeInTheDocument();
      });

      await user.click(screen.getByText(mockResponse.addresses[0].roadAddress));

      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: '등록하기' });
        expect(saveButton).not.toBeDisabled();
      });
    });

    it('주소 저장이 성공하면 onComplete가 호출된다', async () => {
      const user = userEvent.setup();
      const mockResponse = createMockAddressSearchResponse();
      const mockAddress = createMockAddress();
      vi.mocked(userService.searchAddress).mockResolvedValue(mockResponse);
      vi.mocked(userService.setAddress).mockResolvedValue(mockAddress);

      renderWithProviders(
        <AddressRegistrationModal open={true} onComplete={mockOnComplete} onClose={mockOnClose} />
      );

      const input = screen.getByPlaceholderText('주소를 검색하세요');
      await user.type(input, '서울시 강남구');
      await user.click(screen.getByRole('button', { name: '검색' }));

      await waitFor(() => {
        expect(screen.getByText(mockResponse.addresses[0].roadAddress)).toBeInTheDocument();
      });

      await user.click(screen.getByText(mockResponse.addresses[0].roadAddress));

      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: '등록하기' });
        expect(saveButton).not.toBeDisabled();
      });

      await user.click(screen.getByRole('button', { name: '등록하기' }));

      await waitFor(() => {
        expect(userService.setAddress).toHaveBeenCalled();
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });

    it('별칭과 함께 주소를 저장할 수 있다', async () => {
      const user = userEvent.setup();
      const mockResponse = createMockAddressSearchResponse();
      const mockAddress = createMockAddress();
      vi.mocked(userService.searchAddress).mockResolvedValue(mockResponse);
      vi.mocked(userService.setAddress).mockResolvedValue(mockAddress);
      vi.mocked(userService.getAddresses).mockResolvedValue([mockAddress]);
      vi.mocked(userService.updateAddress).mockResolvedValue(mockAddress);

      renderWithProviders(
        <AddressRegistrationModal open={true} onComplete={mockOnComplete} onClose={mockOnClose} />
      );

      const input = screen.getByPlaceholderText('주소를 검색하세요');
      await user.type(input, '서울시 강남구');
      await user.click(screen.getByRole('button', { name: '검색' }));

      await waitFor(() => {
        expect(screen.getByText(mockResponse.addresses[0].roadAddress)).toBeInTheDocument();
      });

      await user.click(screen.getByText(mockResponse.addresses[0].roadAddress));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('별칭을 입력하세요 (예: 집, 회사)')).toBeInTheDocument();
      });

      const aliasInput = screen.getByPlaceholderText('별칭을 입력하세요 (예: 집, 회사)');
      await user.type(aliasInput, '집');

      await user.click(screen.getByRole('button', { name: '등록하기' }));

      await waitFor(() => {
        expect(userService.setAddress).toHaveBeenCalled();
        expect(userService.updateAddress).toHaveBeenCalledWith(expect.any(Number), { alias: '집' });
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });

    it('주소 저장 실패 시 에러 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      const mockResponse = createMockAddressSearchResponse();
      vi.mocked(userService.searchAddress).mockResolvedValue(mockResponse);
      vi.mocked(userService.setAddress).mockRejectedValue(new Error('저장 실패'));

      renderWithProviders(
        <AddressRegistrationModal open={true} onComplete={mockOnComplete} onClose={mockOnClose} />
      );

      const input = screen.getByPlaceholderText('주소를 검색하세요');
      await user.type(input, '서울시 강남구');
      await user.click(screen.getByRole('button', { name: '검색' }));

      await waitFor(() => {
        expect(screen.getByText(mockResponse.addresses[0].roadAddress)).toBeInTheDocument();
      });

      await user.click(screen.getByText(mockResponse.addresses[0].roadAddress));

      await user.click(screen.getByRole('button', { name: '등록하기' }));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();
      });

      alertSpy.mockRestore();
    });
  });

  describe('모달 닫기 테스트', () => {
    it('취소 버튼을 클릭하면 onClose가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <AddressRegistrationModal open={true} onComplete={mockOnComplete} onClose={mockOnClose} />
      );

      await user.click(screen.getByRole('button', { name: '취소' }));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('저장 중에는 취소 버튼이 비활성화된다', async () => {
      const user = userEvent.setup();
      const mockResponse = createMockAddressSearchResponse();
      vi.mocked(userService.searchAddress).mockResolvedValue(mockResponse);
      vi.mocked(userService.setAddress).mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithProviders(
        <AddressRegistrationModal open={true} onComplete={mockOnComplete} onClose={mockOnClose} />
      );

      const input = screen.getByPlaceholderText('주소를 검색하세요');
      await user.type(input, '서울시 강남구');
      await user.click(screen.getByRole('button', { name: '검색' }));

      await waitFor(() => {
        expect(screen.getByText(mockResponse.addresses[0].roadAddress)).toBeInTheDocument();
      });

      await user.click(screen.getByText(mockResponse.addresses[0].roadAddress));
      await user.click(screen.getByRole('button', { name: '등록하기' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
      });
    });
  });

  describe('모달 상태 초기화 테스트', () => {
    it('모달이 닫히면 입력 상태가 초기화된다', async () => {
      const user = userEvent.setup();
      const mockResponse = createMockAddressSearchResponse();
      vi.mocked(userService.searchAddress).mockResolvedValue(mockResponse);

      const { rerender } = renderWithProviders(
        <AddressRegistrationModal open={true} onComplete={mockOnComplete} onClose={mockOnClose} />
      );

      const input = screen.getByPlaceholderText('주소를 검색하세요');
      await user.type(input, '서울시 강남구');

      rerender(
        <AddressRegistrationModal open={false} onComplete={mockOnComplete} onClose={mockOnClose} />
      );

      rerender(
        <AddressRegistrationModal open={true} onComplete={mockOnComplete} onClose={mockOnClose} />
      );

      const inputAfter = screen.getByPlaceholderText('주소를 검색하세요') as HTMLInputElement;
      expect(inputAfter.value).toBe('');
    });
  });
});
