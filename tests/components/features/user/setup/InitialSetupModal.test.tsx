import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { InitialSetupModal } from '@features/user/components/setup/InitialSetupModal';
import type { UserSetupStatus } from '@shared/utils/userSetup';
import { authService } from '@features/auth/api';
import { userService } from '@features/user/api';
import { createMockSelectedAddress, createMockUserAddress } from '@tests/factories';

// Store mock state for address section callbacks
let mockOnAddressChange: ((addr: ReturnType<typeof createMockSelectedAddress> | null) => void) | null = null;
let mockOnAddressAliasChange: ((alias: string) => void) | null = null;

// Mock child components
vi.mock('@features/user/components/setup/InitialSetupAddressSection', () => ({
  InitialSetupAddressSection: ({ onAddressChange, onAddressAliasChange }: {
    onAddressChange: (addr: ReturnType<typeof createMockSelectedAddress> | null) => void;
    onAddressAliasChange: (alias: string) => void;
  }) => {
    mockOnAddressChange = onAddressChange;
    mockOnAddressAliasChange = onAddressAliasChange;
    return (
      <div data-testid="address-section">
        <h3>주소</h3>
        <div>주소 섹션</div>
      </div>
    );
  },
}));

vi.mock('@features/user/components/setup/InitialSetupPreferencesSection', () => ({
  InitialSetupPreferencesSection: ({ onLikesChange, onDislikesChange }: {
    onLikesChange: (likes: string[]) => void;
    onDislikesChange: (dislikes: string[]) => void;
  }) => (
    <div data-testid="preferences-section">
      <h3>취향 정보</h3>
      <button data-testid="add-like-btn" onClick={() => onLikesChange(['한식'])}>
        좋아하는 음식 추가
      </button>
      <button data-testid="add-dislike-btn" onClick={() => onDislikesChange(['매운 음식'])}>
        싫어하는 음식 추가
      </button>
    </div>
  ),
}));

vi.mock('@features/auth/api', () => ({
  authService: {
    updateUser: vi.fn().mockResolvedValue({ name: 'Test User' }),
  },
}));

vi.mock('@features/user/api', () => ({
  userService: {
    setAddress: vi.fn().mockResolvedValue({
      id: 1,
      roadAddress: '서울시 강남구 테헤란로 123',
      postalCode: '06236',
      latitude: 37.5172,
      longitude: 127.0473,
      isDefault: true,
      isSearchAddress: true,
      alias: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }),
    getAddresses: vi.fn().mockResolvedValue([]),
    updateAddress: vi.fn().mockResolvedValue({
      id: 1,
      roadAddress: '서울시 강남구 테헤란로 123',
      postalCode: '06236',
      latitude: 37.5172,
      longitude: 127.0473,
      isDefault: true,
      isSearchAddress: true,
      alias: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }),
    setPreferences: vi.fn().mockResolvedValue({ preferences: { likes: [], dislikes: [] } }),
    searchAddress: vi.fn().mockResolvedValue({ addresses: [] }),
  },
}));

const mockHandleError = vi.fn();
vi.mock('@shared/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
    handleSuccess: vi.fn(),
  }),
}));

// ─── Shared setup status fixtures ───────────────────────────────────────────

const fullSetupStatus: UserSetupStatus = {
  needsName: true,
  needsAddress: true,
  needsPreferences: true,
  hasAnyMissing: true,
};

const nameOnlySetupStatus: UserSetupStatus = {
  needsName: true,
  needsAddress: false,
  needsPreferences: false,
  hasAnyMissing: true,
};

const addressOnlySetupStatus: UserSetupStatus = {
  needsName: false,
  needsAddress: true,
  needsPreferences: false,
  hasAnyMissing: true,
};

const preferencesOnlySetupStatus: UserSetupStatus = {
  needsName: false,
  needsAddress: false,
  needsPreferences: true,
  hasAnyMissing: true,
};

// ─── Helper ──────────────────────────────────────────────────────────────────

function renderModal(
  setupStatus: UserSetupStatus,
  open = true,
  onComplete = vi.fn(),
) {
  return renderWithProviders(
    <InitialSetupModal open={open} setupStatus={setupStatus} onComplete={onComplete} />,
  );
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('InitialSetupModal', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAddressChange = null;
    mockOnAddressAliasChange = null;
  });

  afterEach(() => {
    mockOnAddressChange = null;
    mockOnAddressAliasChange = null;
  });

  // ── 렌더링 ──────────────────────────────────────────────────────────────────

  describe('렌더링 테스트', () => {
    it('모달이 열려있을 때 제목과 안내 문구, 저장 버튼이 표시된다', async () => {
      renderModal(fullSetupStatus, true, mockOnComplete);

      await waitFor(() => {
        expect(screen.getByText('서비스 이용을 위한 정보 입력')).toBeInTheDocument();
        expect(screen.getByText('더 나은 추천을 위해 아래 정보를 입력해주세요')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '저장하기' })).toBeInTheDocument();
      });
    });

    it('모달이 닫혀있을 때 아무것도 렌더링되지 않는다', () => {
      const { container } = renderModal(fullSetupStatus, false, mockOnComplete);
      expect(container).toBeEmptyDOMElement();
    });
  });

  // ── 조건부 섹션 렌더링 ────────────────────────────────────────────────────

  describe('조건부 섹션 렌더링 테스트', () => {
    it.each([
      ['이름 섹션', nameOnlySetupStatus, '이름을 입력하세요', true],
      ['이름 섹션', addressOnlySetupStatus, '이름을 입력하세요', false],
    ])('%s이 needsName=%s일 때 올바르게 표시/숨김 처리된다', async (_label, status, placeholder, shouldShow) => {
      renderModal(status, true, mockOnComplete);

      await waitFor(() => {
        const el = screen.queryByPlaceholderText(placeholder);
        if (shouldShow) {
          expect(el).toBeInTheDocument();
        } else {
          expect(el).not.toBeInTheDocument();
        }
      });
    });

    it.each([
      ['주소 섹션', addressOnlySetupStatus, '주소', true],
      ['주소 섹션', nameOnlySetupStatus, '주소', false],
      ['취향 섹션', preferencesOnlySetupStatus, '취향 정보', true],
      ['취향 섹션', nameOnlySetupStatus, '취향 정보', false],
    ])('%s이 올바르게 표시/숨김 처리된다', async (_label, status, text, shouldShow) => {
      renderModal(status, true, mockOnComplete);

      await waitFor(() => {
        const el = screen.queryByText(text);
        if (shouldShow) {
          expect(el).toBeInTheDocument();
        } else {
          expect(el).not.toBeInTheDocument();
        }
      });
    });
  });

  // ── 유효성 검사 및 버튼 상태 ──────────────────────────────────────────────

  describe('저장 버튼 유효성 검사 테스트', () => {
    it('이름이 비어 있으면 저장 버튼이 비활성화된다', async () => {
      renderModal(nameOnlySetupStatus, true, mockOnComplete);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '저장하기' })).toBeDisabled();
      });
    });

    it('이름이 공백만 있으면 저장 버튼이 비활성화된다', async () => {
      const user = userEvent.setup();
      renderModal(nameOnlySetupStatus, true, mockOnComplete);

      await waitFor(() => expect(screen.getByPlaceholderText('이름을 입력하세요')).toBeInTheDocument());
      await user.type(screen.getByPlaceholderText('이름을 입력하세요'), '   ');

      expect(screen.getByRole('button', { name: '저장하기' })).toBeDisabled();
    });

    it('주소가 선택되지 않으면 저장 버튼이 비활성화된다', async () => {
      renderModal(addressOnlySetupStatus, true, mockOnComplete);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '저장하기' })).toBeDisabled();
      });
    });

    it('이름을 입력하면 저장 버튼이 활성화된다', async () => {
      const user = userEvent.setup();
      renderModal(nameOnlySetupStatus, true, mockOnComplete);

      await waitFor(() => expect(screen.getByPlaceholderText('이름을 입력하세요')).toBeInTheDocument());
      await user.type(screen.getByPlaceholderText('이름을 입력하세요'), '홍길동');

      expect(screen.getByRole('button', { name: '저장하기' })).not.toBeDisabled();
    });

    it('이름 입력 필드에 입력한 값이 반영된다', async () => {
      const user = userEvent.setup();
      renderModal(nameOnlySetupStatus, true, mockOnComplete);

      await waitFor(() => expect(screen.getByPlaceholderText('이름을 입력하세요')).toBeInTheDocument());
      await user.type(screen.getByPlaceholderText('이름을 입력하세요'), '홍길동');

      expect(screen.getByPlaceholderText('이름을 입력하세요')).toHaveValue('홍길동');
    });
  });

  // ── 모달 상태 초기화 ──────────────────────────────────────────────────────

  describe('모달 닫힐 때 상태 초기화 테스트', () => {
    it('모달을 닫고 다시 열면 이름 입력 필드가 초기화된다', async () => {
      const user = userEvent.setup();
      const { rerender } = renderModal(nameOnlySetupStatus, true, mockOnComplete);

      await waitFor(() => expect(screen.getByPlaceholderText('이름을 입력하세요')).toBeInTheDocument());
      await user.type(screen.getByPlaceholderText('이름을 입력하세요'), '홍길동');

      rerender(<InitialSetupModal open={false} setupStatus={nameOnlySetupStatus} onComplete={mockOnComplete} />);
      rerender(<InitialSetupModal open={true} setupStatus={nameOnlySetupStatus} onComplete={mockOnComplete} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('이름을 입력하세요')).toHaveValue('');
      });
    });
  });

  // ── API 호출 ──────────────────────────────────────────────────────────────

  describe('API 호출 테스트', () => {
    it('이름 저장 시 authService.updateUser가 올바른 인자로 호출되고 onComplete가 실행된다', async () => {
      const user = userEvent.setup();
      vi.mocked(authService.updateUser).mockResolvedValue({ name: '홍길동' });
      renderModal(nameOnlySetupStatus, true, mockOnComplete);

      await waitFor(() => expect(screen.getByPlaceholderText('이름을 입력하세요')).toBeInTheDocument());
      await user.type(screen.getByPlaceholderText('이름을 입력하세요'), '홍길동');
      await user.click(screen.getByRole('button', { name: '저장하기' }));

      await waitFor(() => {
        expect(authService.updateUser).toHaveBeenCalledWith({ name: '홍길동' });
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });

    it('이름 저장 API 실패 시 onComplete가 호출되지 않는다', async () => {
      const user = userEvent.setup();
      vi.mocked(authService.updateUser).mockRejectedValue(new Error('API Error'));
      renderModal(nameOnlySetupStatus, true, mockOnComplete);

      await waitFor(() => expect(screen.getByPlaceholderText('이름을 입력하세요')).toBeInTheDocument());
      await user.type(screen.getByPlaceholderText('이름을 입력하세요'), '홍길동');
      await user.click(screen.getByRole('button', { name: '저장하기' }));

      await waitFor(() => {
        expect(mockOnComplete).not.toHaveBeenCalled();
      });
    });
  });
});

// ─── 주소 저장 플로우 통합 테스트 ────────────────────────────────────────────

describe('InitialSetupModal - 주소 저장 플로우', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAddressChange = null;
    mockOnAddressAliasChange = null;
    vi.mocked(userService.setAddress).mockResolvedValue({
      id: 1,
      roadAddress: '서울시 강남구 테헤란로 123',
      postalCode: '06236',
      latitude: 37.5172,
      longitude: 127.0473,
      isDefault: true,
      isSearchAddress: true,
      alias: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    });
    vi.mocked(userService.getAddresses).mockResolvedValue([]);
    vi.mocked(userService.updateAddress).mockResolvedValue(createMockUserAddress());
  });

  afterEach(() => {
    mockOnAddressChange = null;
    mockOnAddressAliasChange = null;
  });

  async function renderAndSelectAddress(
    address = createMockSelectedAddress(),
    alias?: string,
  ) {
    const user = userEvent.setup();

    renderWithProviders(
      <InitialSetupModal
        open={true}
        setupStatus={addressOnlySetupStatus}
        onComplete={mockOnComplete}
      />,
    );

    await waitFor(() => expect(screen.getByTestId('address-section')).toBeInTheDocument());

    act(() => {
      mockOnAddressChange?.(address);
      if (alias !== undefined) {
        mockOnAddressAliasChange?.(alias);
      }
    });

    await waitFor(() => expect(screen.getByRole('button', { name: '저장하기' })).not.toBeDisabled());

    return user;
  }

  it('주소를 선택하면 저장 버튼이 활성화된다', async () => {
    await renderAndSelectAddress();
    // waitFor inside helper already asserts button is enabled
  });

  it('주소 저장 시 setAddress API가 호출되고 onComplete가 실행된다', async () => {
    const mockAddress = createMockSelectedAddress();
    const user = await renderAndSelectAddress(mockAddress);

    await user.click(screen.getByRole('button', { name: '저장하기' }));

    await waitFor(() => {
      expect(userService.setAddress).toHaveBeenCalledWith(mockAddress);
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  it('별칭이 빈 문자열이면 getAddresses를 호출하지 않는다', async () => {
    const user = await renderAndSelectAddress(createMockSelectedAddress());

    await user.click(screen.getByRole('button', { name: '저장하기' }));

    await waitFor(() => expect(userService.setAddress).toHaveBeenCalled());
    expect(userService.getAddresses).not.toHaveBeenCalled();
  });

  it('별칭이 있으면 getAddresses와 updateAddress가 올바른 인자로 호출된다', async () => {
    const mockAddress = createMockSelectedAddress({ roadAddress: '서울시 강남구 테헤란로 123' });
    vi.mocked(userService.getAddresses).mockResolvedValue([
      createMockUserAddress({ id: 1, roadAddress: '서울시 강남구 테헤란로 123' }),
    ]);

    const user = await renderAndSelectAddress(mockAddress, '회사');
    await user.click(screen.getByRole('button', { name: '저장하기' }));

    await waitFor(() => {
      expect(userService.setAddress).toHaveBeenCalled();
      expect(userService.getAddresses).toHaveBeenCalled();
      expect(userService.updateAddress).toHaveBeenCalledWith(1, { alias: '회사' });
    });
  });

  it('getAddresses가 객체 형식으로 반환될 때 정상 처리된다', async () => {
    const mockAddress = createMockSelectedAddress({ roadAddress: '서울시 강남구 테헤란로 123' });
    vi.mocked(userService.getAddresses).mockResolvedValue(
      { addresses: [createMockUserAddress({ id: 2, roadAddress: '서울시 강남구 테헤란로 123' })] } as unknown as ReturnType<typeof userService.getAddresses>,
    );

    const user = await renderAndSelectAddress(mockAddress, '집');
    await user.click(screen.getByRole('button', { name: '저장하기' }));

    await waitFor(() => {
      expect(userService.updateAddress).toHaveBeenCalledWith(2, { alias: '집' });
    });
  });

  it('주소를 찾지 못하면 updateAddress를 호출하지 않는다', async () => {
    const mockAddress = createMockSelectedAddress({ roadAddress: '서울시 강남구 테헤란로 123' });
    vi.mocked(userService.getAddresses).mockResolvedValue([
      createMockUserAddress({ id: 1, roadAddress: '다른 주소' }),
    ]);

    const user = await renderAndSelectAddress(mockAddress, '별칭');
    await user.click(screen.getByRole('button', { name: '저장하기' }));

    await waitFor(() => expect(userService.getAddresses).toHaveBeenCalled());
    expect(userService.updateAddress).not.toHaveBeenCalled();
  });

  it('별칭 업데이트 실패해도 onComplete가 호출된다', async () => {
    const mockAddress = createMockSelectedAddress({ roadAddress: '서울시 강남구 테헤란로 123' });
    vi.mocked(userService.getAddresses).mockRejectedValue(new Error('Failed'));

    const user = await renderAndSelectAddress(mockAddress, '학교');
    await user.click(screen.getByRole('button', { name: '저장하기' }));

    await waitFor(() => expect(mockOnComplete).toHaveBeenCalled());
  });
});

// ─── 취향 저장 플로우 통합 테스트 ────────────────────────────────────────────

describe('InitialSetupModal - 취향 저장 플로우', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.setPreferences).mockResolvedValue({ preferences: { likes: [], dislikes: [] } });
  });

  async function renderPreferencesModal() {
    const user = userEvent.setup();
    renderWithProviders(
      <InitialSetupModal
        open={true}
        setupStatus={preferencesOnlySetupStatus}
        onComplete={mockOnComplete}
      />,
    );
    await waitFor(() => expect(screen.getByTestId('preferences-section')).toBeInTheDocument());
    return user;
  }

  it('아무것도 선택하지 않으면 저장 버튼이 비활성화된다', async () => {
    await renderPreferencesModal();
    expect(screen.getByRole('button', { name: '저장하기' })).toBeDisabled();
  });

  it.each([
    ['좋아하는 음식', 'add-like-btn', { likes: ['한식'], dislikes: [] }],
    ['싫어하는 음식', 'add-dislike-btn', { likes: [], dislikes: ['매운 음식'] }],
  ])('%s을 추가하면 저장 버튼이 활성화되고 setPreferences가 올바른 인자로 호출된다', async (_label, btnTestId, expectedPayload) => {
    const user = await renderPreferencesModal();

    await user.click(screen.getByTestId(btnTestId));

    await waitFor(() => expect(screen.getByRole('button', { name: '저장하기' })).not.toBeDisabled());

    await user.click(screen.getByRole('button', { name: '저장하기' }));

    await waitFor(() => {
      expect(userService.setPreferences).toHaveBeenCalledWith(expectedPayload);
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });
});

// ─── 애니메이션 상태 테스트 ───────────────────────────────────────────────────

describe('InitialSetupModal - 애니메이션 상태', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('모달이 열릴 때 dialog 엘리먼트가 렌더링된다', async () => {
    renderWithProviders(
      <InitialSetupModal open={true} setupStatus={fullSetupStatus} onComplete={vi.fn()} />,
    );

    await act(async () => { vi.advanceTimersByTime(100); });

    expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
  });

  it('모달을 닫으면 opacity-0 클래스가 적용된다', async () => {
    const { rerender } = renderWithProviders(
      <InitialSetupModal open={true} setupStatus={fullSetupStatus} onComplete={vi.fn()} />,
    );

    await act(async () => { vi.advanceTimersByTime(100); });

    rerender(<InitialSetupModal open={false} setupStatus={fullSetupStatus} onComplete={vi.fn()} />);

    await act(async () => { vi.advanceTimersByTime(100); });

    const backdrop = document.querySelector('[role="dialog"]');
    expect(backdrop).toBeInTheDocument();
    expect(backdrop?.className).toContain('opacity-0');
  });

  it('모달 닫힘 후 300ms가 지나면 DOM에서 제거된다', async () => {
    const { rerender, container } = renderWithProviders(
      <InitialSetupModal open={true} setupStatus={fullSetupStatus} onComplete={vi.fn()} />,
    );

    await act(async () => { vi.advanceTimersByTime(100); });

    rerender(<InitialSetupModal open={false} setupStatus={fullSetupStatus} onComplete={vi.fn()} />);

    await act(async () => { vi.advanceTimersByTime(350); });

    expect(container).toBeEmptyDOMElement();
  });
});

// ─── 좌표 정규화 통합 테스트 ──────────────────────────────────────────────────

describe('InitialSetupModal - 좌표 정규화', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAddressChange = null;
    vi.mocked(userService.setAddress).mockResolvedValue({ roadAddress: '서울시 강남구 테헤란로 123' });
  });

  afterEach(() => {
    mockOnAddressChange = null;
  });

  it.each([
    ['undefined 좌표', { latitude: undefined, longitude: undefined }],
    ['유효하지 않은 문자열 좌표', { latitude: 'invalid', longitude: 'invalid' }],
  ])('%s가 null로 정규화되어 저장이 성공한다', async (_label, coords) => {
    const user = userEvent.setup();
    const mockAddress = createMockSelectedAddress(coords);

    renderWithProviders(
      <InitialSetupModal
        open={true}
        setupStatus={addressOnlySetupStatus}
        onComplete={mockOnComplete}
      />,
    );

    await waitFor(() => expect(screen.getByTestId('address-section')).toBeInTheDocument());

    act(() => { mockOnAddressChange?.(mockAddress); });

    await waitFor(() => expect(screen.getByRole('button', { name: '저장하기' })).not.toBeDisabled());

    await user.click(screen.getByRole('button', { name: '저장하기' }));

    await waitFor(() => expect(mockOnComplete).toHaveBeenCalled());
  });
});
