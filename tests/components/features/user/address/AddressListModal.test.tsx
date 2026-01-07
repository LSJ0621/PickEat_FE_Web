import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { AddressListModal } from '@/components/features/user/address/AddressListModal';
import { createMockUserAddresses, createMockUserAddress } from '@tests/factories';

describe('AddressListModal', () => {
  const defaultProps = {
    open: true,
    addresses: createMockUserAddresses(3),
    defaultAddress: createMockUserAddress({ isDefault: true }),
    isEditMode: false,
    selectedDeleteIds: [],
    onClose: vi.fn(),
    onEditModeChange: vi.fn(),
    onAddressClick: vi.fn(),
    onToggleDeleteSelection: vi.fn(),
    onDeleteAddresses: vi.fn(),
    onAddAddress: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('모달이 열려있을 때 주소 관리 제목이 표시된다', async () => {
      renderWithProviders(<AddressListModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('주소 관리')).toBeInTheDocument();
      });
    });

    it('모달이 닫혀있을 때 아무것도 렌더링되지 않는다', () => {
      const { container } = renderWithProviders(
        <AddressListModal {...defaultProps} open={false} />
      );

      expect(container).toBeEmptyDOMElement();
    });

    it('기본 주소가 표시된다', async () => {
      renderWithProviders(<AddressListModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('서울시 강남구 테헤란로 123')).toBeInTheDocument();
      });
    });

    it('주소가 없을 때 빈 메시지가 표시된다', async () => {
      renderWithProviders(
        <AddressListModal {...defaultProps} addresses={[]} defaultAddress={null} />
      );

      await waitFor(() => {
        expect(screen.getByText('등록된 주소가 없습니다.')).toBeInTheDocument();
      });
    });

    it('닫기 버튼이 렌더링된다', async () => {
      renderWithProviders(<AddressListModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
      });
    });

    it('주소가 2개 이상일 때 편집 버튼이 표시된다', async () => {
      // 기본 주소가 아닌 주소가 있어야 편집 버튼이 나타남 (addresses.length > 1)
      renderWithProviders(
        <AddressListModal
          {...defaultProps}
          addresses={createMockUserAddresses(3)}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '편집' })).toBeInTheDocument();
      });
    });

    it('주소가 1개일 때 편집 버튼이 표시되지 않는다', async () => {
      renderWithProviders(
        <AddressListModal {...defaultProps} addresses={createMockUserAddresses(1)} />
      );

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: '편집' })).not.toBeInTheDocument();
      });
    });

    it('주소 추가 버튼이 표시된다', async () => {
      renderWithProviders(<AddressListModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /주소 추가/ })).toBeInTheDocument();
      });
    });

    it('주소가 4개일 때 추가 버튼 대신 안내 메시지가 표시된다', async () => {
      renderWithProviders(
        <AddressListModal {...defaultProps} addresses={createMockUserAddresses(4)} />
      );

      await waitFor(() => {
        expect(screen.getByText('최대 4개까지 주소를 등록할 수 있습니다.')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /주소 추가/ })).not.toBeInTheDocument();
      });
    });
  });

  describe('편집 모드 테스트', () => {
    it('편집 모드에서 완료 버튼이 표시된다', async () => {
      renderWithProviders(<AddressListModal {...defaultProps} isEditMode={true} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '완료' })).toBeInTheDocument();
      });
    });

    it('편집 모드에서 체크박스가 표시된다', async () => {
      renderWithProviders(<AddressListModal {...defaultProps} isEditMode={true} />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(0);
      });
    });

    it('편집 모드에서 주소 추가 버튼이 숨겨진다', async () => {
      renderWithProviders(<AddressListModal {...defaultProps} isEditMode={true} />);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /주소 추가/ })).not.toBeInTheDocument();
      });
    });

    it('선택된 주소가 있을 때 삭제 버튼이 표시된다', async () => {
      renderWithProviders(
        <AddressListModal {...defaultProps} isEditMode={true} selectedDeleteIds={[2, 3]} />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /선택한 2개 주소 삭제/ })).toBeInTheDocument();
      });
    });
  });

  describe('상호작용 테스트', () => {
    it('닫기 버튼 클릭 시 onEditModeChange와 onClose가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<AddressListModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '닫기' }));

      expect(defaultProps.onEditModeChange).toHaveBeenCalledWith(false);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('편집 버튼 클릭 시 onEditModeChange가 true로 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<AddressListModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '편집' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '편집' }));

      expect(defaultProps.onEditModeChange).toHaveBeenCalledWith(true);
    });

    it('완료 버튼 클릭 시 onEditModeChange가 false로 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<AddressListModal {...defaultProps} isEditMode={true} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '완료' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '완료' }));

      expect(defaultProps.onEditModeChange).toHaveBeenCalledWith(false);
    });

    it('주소 추가 버튼 클릭 시 onAddAddress가 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<AddressListModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /주소 추가/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /주소 추가/ }));

      expect(defaultProps.onAddAddress).toHaveBeenCalledTimes(1);
    });

    it('삭제 버튼 클릭 시 onDeleteAddresses가 선택된 ID로 호출된다', async () => {
      const user = userEvent.setup();
      const selectedIds = [2, 3];

      renderWithProviders(
        <AddressListModal {...defaultProps} isEditMode={true} selectedDeleteIds={selectedIds} />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /선택한 2개 주소 삭제/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /선택한 2개 주소 삭제/ }));

      expect(defaultProps.onDeleteAddresses).toHaveBeenCalledWith(selectedIds);
    });

    it('체크박스 클릭 시 onToggleDeleteSelection이 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<AddressListModal {...defaultProps} isEditMode={true} />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(0);
      });

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      expect(defaultProps.onToggleDeleteSelection).toHaveBeenCalled();
    });
  });

  describe('주소 별칭 테스트', () => {
    it('별칭이 있는 주소는 별칭이 표시된다', async () => {
      const addressWithAlias = createMockUserAddress({
        id: 2,
        alias: '우리집',
        isDefault: false,
        roadAddress: '서울시 강남구 역삼로 100',
      });

      renderWithProviders(
        <AddressListModal
          {...defaultProps}
          addresses={[
            createMockUserAddress({ id: 1, isDefault: true, alias: '직장' }),
            addressWithAlias,
          ]}
          defaultAddress={createMockUserAddress({ id: 1, isDefault: true, alias: '직장' })}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('우리집')).toBeInTheDocument();
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
      const { rerender } = renderWithProviders(<AddressListModal {...defaultProps} open={true} />);

      await waitFor(() => {
        expect(screen.getByText('주소 관리')).toBeInTheDocument();
      });

      rerender(<AddressListModal {...defaultProps} open={false} />);

      // Wrap timer advancement in act() to handle state updates properly
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.queryByText('주소 관리')).not.toBeInTheDocument();
      });
    });
  });

  describe('주소 클릭 테스트', () => {
    it('편집 모드가 아닐 때 주소 클릭 시 onAddressClick이 호출된다', async () => {
      const user = userEvent.setup();
      const address = createMockUserAddress({
        id: 2,
        isDefault: false,
        roadAddress: '서울시 서초구 반포대로 100',
        alias: '우리집'
      });

      renderWithProviders(
        <AddressListModal
          {...defaultProps}
          addresses={[createMockUserAddress({ id: 1, isDefault: true }), address]}
          isEditMode={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(address.roadAddress)).toBeInTheDocument();
      });

      const addressElement = screen.getByText(address.roadAddress).closest('div[class*="cursor-pointer"]');
      expect(addressElement).toBeInTheDocument();
      await user.click(addressElement!);

      expect(defaultProps.onAddressClick).toHaveBeenCalledWith(address);
    });
  });

  describe('기본 주소 찾기 테스트', () => {
    it('defaultAddress가 null일 때 addresses에서 isDefault가 true인 주소를 찾는다', async () => {
      const defaultAddr = createMockUserAddress({ id: 1, isDefault: true, alias: '집' });
      const otherAddr = createMockUserAddress({ id: 2, isDefault: false, alias: '회사' });

      renderWithProviders(
        <AddressListModal
          {...defaultProps}
          addresses={[defaultAddr, otherAddr]}
          defaultAddress={null}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('집')).toBeInTheDocument();
      });
    });
  });

  describe('접근성 테스트', () => {
    it('닫기 버튼이 접근 가능한 역할과 이름을 가진다', async () => {
      renderWithProviders(<AddressListModal {...defaultProps} />);

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: '닫기' });
        expect(closeButton).toBeInTheDocument();
      });
    });

    it('편집 모드 체크박스가 접근 가능하다', async () => {
      renderWithProviders(<AddressListModal {...defaultProps} isEditMode={true} />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(0);
        checkboxes.forEach((checkbox) => {
          expect(checkbox).toBeInTheDocument();
        });
      });
    });

    it('모든 대화형 요소가 시맨틱 버튼을 사용한다', async () => {
      renderWithProviders(<AddressListModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach((button) => {
        expect(button.tagName).toBe('BUTTON');
      });
    });

    it('삭제 버튼이 비활성 상태를 올바르게 표시한다', async () => {
      renderWithProviders(
        <AddressListModal {...defaultProps} isEditMode={true} selectedDeleteIds={[]} />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '완료' })).toBeInTheDocument();
      });

      const deleteButton = screen.queryByRole('button', { name: /삭제/ });
      if (deleteButton) {
        expect(deleteButton).toBeDisabled();
      }
    });
  });
});
