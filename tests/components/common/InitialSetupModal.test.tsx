import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { InitialSetupModal } from '@/components/common/InitialSetupModal';
import { authService } from '@/api/services/auth';
import { userService } from '@/api/services/user';
import { createMockAddressSearchResponse, createMockAddress } from '@tests/factories';
import type { UserSetupStatus } from '@shared/utils/userSetup';

// Mock API services
vi.mock('@/api/services/auth', () => ({
  authService: {
    updateUser: vi.fn(),
  },
}));

vi.mock('@/api/services/user', () => ({
  userService: {
    searchAddress: vi.fn(),
    setAddress: vi.fn(),
    getAddresses: vi.fn(),
    updateAddress: vi.fn(),
    setPreferences: vi.fn(),
  },
}));

describe('InitialSetupModal', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('open이 true일 때 모달이 렌더링된다', () => {
      const setupStatus: UserSetupStatus = { needsName: true, needsAddress: false, needsPreferences: false, hasAnyMissing: true };

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      expect(screen.getByText('서비스 이용을 위한 정보 입력')).toBeInTheDocument();
    });

    it('open이 false일 때 모달이 렌더링되지 않는다', () => {
      const setupStatus: UserSetupStatus = { needsName: true, needsAddress: false, needsPreferences: false, hasAnyMissing: true };

      renderWithProviders(
        <InitialSetupModal open={false} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      expect(screen.queryByText('서비스 이용을 위한 정보 입력')).not.toBeInTheDocument();
    });

    it('needsName이 true일 때 이름 입력 섹션이 렌더링된다', () => {
      const setupStatus: UserSetupStatus = { needsName: true, needsAddress: false, needsPreferences: false, hasAnyMissing: true };

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      expect(screen.getByText('이름')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('이름을 입력하세요')).toBeInTheDocument();
    });

    it('needsAddress가 true일 때 주소 입력 섹션이 렌더링된다', () => {
      const setupStatus: UserSetupStatus = { needsName: false, needsAddress: true, needsPreferences: false, hasAnyMissing: true };

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      expect(screen.getByText('주소')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('주소를 검색하세요')).toBeInTheDocument();
    });

    it('needsPreferences가 true일 때 취향 입력 섹션이 렌더링된다', () => {
      const setupStatus: UserSetupStatus = { needsName: false, needsAddress: false, needsPreferences: true, hasAnyMissing: true };

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      expect(screen.getByText('취향 정보')).toBeInTheDocument();
      expect(screen.getByText('좋아하는 것')).toBeInTheDocument();
      expect(screen.getByText('싫어하는 것')).toBeInTheDocument();
    });

    it('모든 섹션이 필요할 때 모두 렌더링된다', () => {
      const setupStatus: UserSetupStatus = { needsName: true, needsAddress: true, needsPreferences: true, hasAnyMissing: true };

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      expect(screen.getByText('이름')).toBeInTheDocument();
      expect(screen.getByText('주소')).toBeInTheDocument();
      expect(screen.getByText('취향 정보')).toBeInTheDocument();
    });
  });

  describe('이름 입력 테스트', () => {
    it('이름을 입력할 수 있다', async () => {
      const user = userEvent.setup();
      const setupStatus: UserSetupStatus = { needsName: true, needsAddress: false, needsPreferences: false, hasAnyMissing: true };

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      const nameInput = screen.getByPlaceholderText('이름을 입력하세요');
      await user.type(nameInput, '홍길동');

      expect(nameInput).toHaveValue('홍길동');
    });
  });

  describe('주소 검색 테스트', () => {
    it('주소를 검색할 수 있다', async () => {
      const user = userEvent.setup();
      const setupStatus: UserSetupStatus = { needsName: false, needsAddress: true, needsPreferences: false, hasAnyMissing: true };
      const mockResponse = createMockAddressSearchResponse();
      vi.mocked(userService.searchAddress).mockResolvedValue(mockResponse);

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      const addressInput = screen.getByPlaceholderText('주소를 검색하세요');
      await user.type(addressInput, '서울시 강남구');
      await user.click(screen.getByRole('button', { name: '검색' }));

      await waitFor(() => {
        expect(userService.searchAddress).toHaveBeenCalledWith('서울시 강남구');
      });
    });

    it('주소를 선택하면 별칭 입력 필드가 표시된다', async () => {
      const user = userEvent.setup();
      const setupStatus: UserSetupStatus = { needsName: false, needsAddress: true, needsPreferences: false, hasAnyMissing: true };
      const mockResponse = createMockAddressSearchResponse();
      vi.mocked(userService.searchAddress).mockResolvedValue(mockResponse);

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      const addressInput = screen.getByPlaceholderText('주소를 검색하세요');
      await user.type(addressInput, '서울시 강남구');
      await user.click(screen.getByRole('button', { name: '검색' }));

      await waitFor(() => {
        expect(screen.getByText(mockResponse.addresses[0].roadAddress!)).toBeInTheDocument();
      });

      await user.click(screen.getByText(mockResponse.addresses[0].roadAddress!));

      await waitFor(() => {
        expect(screen.getByText('별칭 (선택사항)')).toBeInTheDocument();
      });
    });
  });

  describe('취향 입력 테스트', () => {
    it('좋아하는 것을 추가할 수 있다', async () => {
      const user = userEvent.setup();
      const setupStatus: UserSetupStatus = { needsName: false, needsAddress: false, needsPreferences: true, hasAnyMissing: true };

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      const likeInput = screen.getByPlaceholderText('좋아하는 음식이나 재료를 입력하세요');
      await user.type(likeInput, '피자');
      await user.click(screen.getAllByRole('button', { name: '추가' })[0]);

      expect(screen.getByText('피자')).toBeInTheDocument();
    });

    it('좋아하는 것을 Enter 키로 추가할 수 있다', async () => {
      const user = userEvent.setup();
      const setupStatus: UserSetupStatus = { needsName: false, needsAddress: false, needsPreferences: true, hasAnyMissing: true };

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      const likeInput = screen.getByPlaceholderText('좋아하는 음식이나 재료를 입력하세요');
      await user.type(likeInput, '피자{Enter}');

      expect(screen.getByText('피자')).toBeInTheDocument();
    });

    it('좋아하는 것을 제거할 수 있다', async () => {
      const user = userEvent.setup();
      const setupStatus: UserSetupStatus = { needsName: false, needsAddress: false, needsPreferences: true, hasAnyMissing: true };

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      const likeInput = screen.getByPlaceholderText('좋아하는 음식이나 재료를 입력하세요');
      await user.type(likeInput, '피자{Enter}');

      expect(screen.getByText('피자')).toBeInTheDocument();

      const removeButton = screen.getByText('×');
      await user.click(removeButton);

      expect(screen.queryByText('피자')).not.toBeInTheDocument();
    });

    it('싫어하는 것을 추가할 수 있다', async () => {
      const user = userEvent.setup();
      const setupStatus: UserSetupStatus = { needsName: false, needsAddress: false, needsPreferences: true, hasAnyMissing: true };

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      const dislikeInput = screen.getByPlaceholderText('싫어하는 음식이나 재료를 입력하세요');
      await user.type(dislikeInput, '양파');
      await user.click(screen.getAllByRole('button', { name: '추가' })[1]);

      expect(screen.getByText('양파')).toBeInTheDocument();
    });

    it('중복된 좋아하는 것은 추가되지 않는다', async () => {
      const user = userEvent.setup();
      const setupStatus: UserSetupStatus = { needsName: false, needsAddress: false, needsPreferences: true, hasAnyMissing: true };

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      const likeInput = screen.getByPlaceholderText('좋아하는 음식이나 재료를 입력하세요');
      await user.type(likeInput, '피자{Enter}');
      await user.type(likeInput, '피자{Enter}');

      const pizzaElements = screen.getAllByText('피자');
      expect(pizzaElements).toHaveLength(1);
    });
  });

  describe('저장 버튼 활성화 테스트', () => {
    it('이름이 필요하지만 입력하지 않으면 저장 버튼이 비활성화된다', () => {
      const setupStatus: UserSetupStatus = { needsName: true, needsAddress: false, needsPreferences: false, hasAnyMissing: true };

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      const saveButton = screen.getByRole('button', { name: '저장하기' });
      expect(saveButton).toBeDisabled();
    });

    it('이름을 입력하면 저장 버튼이 활성화된다', async () => {
      const user = userEvent.setup();
      const setupStatus: UserSetupStatus = { needsName: true, needsAddress: false, needsPreferences: false, hasAnyMissing: true };

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      const nameInput = screen.getByPlaceholderText('이름을 입력하세요');
      await user.type(nameInput, '홍길동');

      const saveButton = screen.getByRole('button', { name: '저장하기' });
      expect(saveButton).not.toBeDisabled();
    });

    it('주소가 필요하지만 선택하지 않으면 저장 버튼이 비활성화된다', () => {
      const setupStatus: UserSetupStatus = { needsName: false, needsAddress: true, needsPreferences: false, hasAnyMissing: true };

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      const saveButton = screen.getByRole('button', { name: '저장하기' });
      expect(saveButton).toBeDisabled();
    });
  });

  describe('정보 저장 테스트', () => {
    it('이름만 저장할 수 있다', async () => {
      const user = userEvent.setup();
      const setupStatus: UserSetupStatus = { needsName: true, needsAddress: false, needsPreferences: false, hasAnyMissing: true };
      vi.mocked(authService.updateUser).mockResolvedValue({ name: '홍길동' } as Partial<User> as User);

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      const nameInput = screen.getByPlaceholderText('이름을 입력하세요');
      await user.type(nameInput, '홍길동');
      await user.click(screen.getByRole('button', { name: '저장하기' }));

      await waitFor(() => {
        expect(authService.updateUser).toHaveBeenCalledWith({ name: '홍길동' });
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });

    it('주소만 저장할 수 있다', async () => {
      const user = userEvent.setup();
      const setupStatus: UserSetupStatus = { needsName: false, needsAddress: true, needsPreferences: false, hasAnyMissing: true };
      const mockResponse = createMockAddressSearchResponse();
      const mockAddress = createMockAddress();
      const mockSetAddressResponse = {
        ...mockAddress,
        createdAt: new Date(mockAddress.createdAt),
        updatedAt: new Date(mockAddress.updatedAt),
      };
      vi.mocked(userService.searchAddress).mockResolvedValue(mockResponse);
      vi.mocked(userService.setAddress).mockResolvedValue(mockSetAddressResponse);

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      const addressInput = screen.getByPlaceholderText('주소를 검색하세요');
      await user.type(addressInput, '서울시 강남구');
      await user.click(screen.getByRole('button', { name: '검색' }));

      await waitFor(() => {
        expect(screen.getByText(mockResponse.addresses[0].roadAddress!)).toBeInTheDocument();
      });

      await user.click(screen.getByText(mockResponse.addresses[0].roadAddress!));
      await user.click(screen.getByRole('button', { name: '저장하기' }));

      await waitFor(() => {
        expect(userService.setAddress).toHaveBeenCalled();
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });

    it('취향만 저장할 수 있다', async () => {
      const user = userEvent.setup();
      const setupStatus: UserSetupStatus = { needsName: false, needsAddress: false, needsPreferences: true, hasAnyMissing: true };
      vi.mocked(userService.setPreferences).mockResolvedValue({ preferences: { likes: [], dislikes: [] } });

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      const likeInput = screen.getByPlaceholderText('좋아하는 음식이나 재료를 입력하세요');
      await user.type(likeInput, '피자{Enter}');

      await user.click(screen.getByRole('button', { name: '저장하기' }));

      await waitFor(() => {
        expect(userService.setPreferences).toHaveBeenCalledWith({
          likes: ['피자'],
          dislikes: [],
        });
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });

    it('모든 정보를 한번에 저장할 수 있다', async () => {
      const user = userEvent.setup();
      const setupStatus: UserSetupStatus = { needsName: true, needsAddress: true, needsPreferences: true, hasAnyMissing: true };
      const mockResponse = createMockAddressSearchResponse();
      const mockAddress = createMockAddress();
      const mockSetAddressResponse = {
        ...mockAddress,
        createdAt: new Date(mockAddress.createdAt),
        updatedAt: new Date(mockAddress.updatedAt),
      };
      vi.mocked(authService.updateUser).mockResolvedValue({ name: '홍길동' } as Partial<User> as User);
      vi.mocked(userService.searchAddress).mockResolvedValue(mockResponse);
      vi.mocked(userService.setAddress).mockResolvedValue(mockSetAddressResponse);
      vi.mocked(userService.setPreferences).mockResolvedValue({ preferences: { likes: [], dislikes: [] } });

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      // 이름 입력
      const nameInput = screen.getByPlaceholderText('이름을 입력하세요');
      await user.type(nameInput, '홍길동');

      // 주소 검색 및 선택
      const addressInput = screen.getByPlaceholderText('주소를 검색하세요');
      await user.type(addressInput, '서울시 강남구');
      await user.click(screen.getByRole('button', { name: '검색' }));

      await waitFor(() => {
        expect(screen.getByText(mockResponse.addresses[0].roadAddress!)).toBeInTheDocument();
      });

      await user.click(screen.getByText(mockResponse.addresses[0].roadAddress!));

      // 취향 입력
      const likeInput = screen.getByPlaceholderText('좋아하는 음식이나 재료를 입력하세요');
      await user.type(likeInput, '피자{Enter}');

      // 저장
      await user.click(screen.getByRole('button', { name: '저장하기' }));

      await waitFor(() => {
        expect(authService.updateUser).toHaveBeenCalled();
        expect(userService.setAddress).toHaveBeenCalled();
        expect(userService.setPreferences).toHaveBeenCalled();
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });

    // Note: Alert validation tests are skipped since disabled buttons cannot be clicked in test environment
  });

  describe('모달 상태 초기화 테스트', () => {
    it('모달이 닫히면 입력 상태가 초기화된다', async () => {
      const user = userEvent.setup();
      const setupStatus: UserSetupStatus = { needsName: true, needsAddress: false, needsPreferences: false, hasAnyMissing: true };

      const { rerender } = renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      const nameInput = screen.getByPlaceholderText('이름을 입력하세요');
      await user.type(nameInput, '홍길동');

      rerender(
        <InitialSetupModal open={false} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      rerender(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      const inputAfter = screen.getByPlaceholderText('이름을 입력하세요') as HTMLInputElement;
      expect(inputAfter.value).toBe('');
    });
  });

  describe('Body 스크롤 관리 테스트', () => {
    beforeEach(() => {
      // Reset body overflow before each test
      document.body.style.overflow = '';
    });

    it('모달이 열리면 body 스크롤이 숨겨진다', () => {
      const setupStatus: UserSetupStatus = { needsName: true, needsAddress: false, needsPreferences: false, hasAnyMissing: true };

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('모달이 닫히면 body 스크롤이 복원된다', () => {
      const setupStatus: UserSetupStatus = { needsName: true, needsAddress: false, needsPreferences: false, hasAnyMissing: true };

      const { rerender } = renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <InitialSetupModal open={false} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      expect(document.body.style.overflow).toBe('');
    });

    it('컴포넌트 언마운트 시 body 스크롤이 복원된다', () => {
      const setupStatus: UserSetupStatus = { needsName: true, needsAddress: false, needsPreferences: false, hasAnyMissing: true };

      const { unmount } = renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      expect(document.body.style.overflow).toBe('hidden');

      unmount();

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Enter 키 처리 테스트', () => {
    it('주소 검색 입력 필드에서 Enter를 누르면 검색이 실행된다', async () => {
      const user = userEvent.setup();
      const setupStatus: UserSetupStatus = { needsName: false, needsAddress: true, needsPreferences: false, hasAnyMissing: true };
      const mockResponse = createMockAddressSearchResponse();
      vi.mocked(userService.searchAddress).mockResolvedValue(mockResponse);

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      const addressInput = screen.getByPlaceholderText('주소를 검색하세요');
      await user.type(addressInput, '서울시 강남구{Enter}');

      await waitFor(() => {
        expect(userService.searchAddress).toHaveBeenCalledWith('서울시 강남구');
      });
    });

    it('좋아하는 것 입력 필드에서 Enter를 누르면 항목이 추가된다', async () => {
      const user = userEvent.setup();
      const setupStatus: UserSetupStatus = { needsName: false, needsAddress: false, needsPreferences: true, hasAnyMissing: true };

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      const likeInput = screen.getByPlaceholderText('좋아하는 음식이나 재료를 입력하세요');
      await user.type(likeInput, '피자{Enter}');

      expect(screen.getByText('피자')).toBeInTheDocument();
    });

    it('싫어하는 것 입력 필드에서 Enter를 누르면 항목이 추가된다', async () => {
      const user = userEvent.setup();
      const setupStatus: UserSetupStatus = { needsName: false, needsAddress: false, needsPreferences: true, hasAnyMissing: true };

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      const dislikeInput = screen.getByPlaceholderText('싫어하는 음식이나 재료를 입력하세요');
      await user.type(dislikeInput, '양파{Enter}');

      expect(screen.getByText('양파')).toBeInTheDocument();
    });

    it('검색 중일 때 Enter를 눌러도 중복 검색이 실행되지 않는다', async () => {
      const user = userEvent.setup();
      const setupStatus: UserSetupStatus = { needsName: false, needsAddress: true, needsPreferences: false, hasAnyMissing: true };
      const mockResponse = createMockAddressSearchResponse();

      // Delay the response to simulate searching state
      vi.mocked(userService.searchAddress).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100))
      );

      renderWithProviders(
        <InitialSetupModal open={true} setupStatus={setupStatus} onComplete={mockOnComplete} />
      );

      const addressInput = screen.getByPlaceholderText('주소를 검색하세요');

      // Type and press Enter
      await user.type(addressInput, '서울시 강남구{Enter}');

      // Try to trigger another search while first one is still loading
      await user.type(addressInput, '{Enter}');

      // Should only be called once
      await waitFor(() => {
        expect(userService.searchAddress).toHaveBeenCalledTimes(1);
      });
    });
  });
});
