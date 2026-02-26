import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { AddressSection } from '@features/user/components/address/AddressSection';
import { createMockUserAddresses } from '@tests/factories';

describe('AddressSection', () => {
  const mockOnManageClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('주소 관리 섹션이 렌더링된다', () => {
      renderWithProviders(
        <AddressSection
          userAddress="서울시 강남구 테헤란로 123"
          addresses={createMockUserAddresses(1)}
          onManageClick={mockOnManageClick}
        />
      );

      // 주소 관리 텍스트가 레이블과 버튼에 각각 존재함
      const allTexts = screen.getAllByText('주소 관리');
      expect(allTexts.length).toBeGreaterThanOrEqual(1);
    });

    it('사용자 주소가 표시된다', () => {
      renderWithProviders(
        <AddressSection
          userAddress="서울시 강남구 테헤란로 123"
          addresses={createMockUserAddresses(1)}
          onManageClick={mockOnManageClick}
        />
      );

      expect(screen.getByText('서울시 강남구 테헤란로 123')).toBeInTheDocument();
    });

    it('주소가 없을 때 안내 메시지가 표시된다', () => {
      renderWithProviders(
        <AddressSection
          userAddress={null}
          addresses={[]}
          onManageClick={mockOnManageClick}
        />
      );

      expect(screen.getByText('주소가 등록되지 않았습니다.')).toBeInTheDocument();
    });

    it('undefined 주소일 때 안내 메시지가 표시된다', () => {
      renderWithProviders(
        <AddressSection
          userAddress={undefined}
          addresses={[]}
          onManageClick={mockOnManageClick}
        />
      );

      expect(screen.getByText('주소가 등록되지 않았습니다.')).toBeInTheDocument();
    });

    it('여러 주소가 있을 때 총 주소 개수가 표시된다', () => {
      renderWithProviders(
        <AddressSection
          userAddress="서울시 강남구 테헤란로 123"
          addresses={createMockUserAddresses(3)}
          onManageClick={mockOnManageClick}
        />
      );

      expect(screen.getByText(/총 3개의 주소가 등록되어 있습니다/)).toBeInTheDocument();
    });

    it('주소가 1개일 때는 총 주소 개수가 표시되지 않는다', () => {
      renderWithProviders(
        <AddressSection
          userAddress="서울시 강남구 테헤란로 123"
          addresses={createMockUserAddresses(1)}
          onManageClick={mockOnManageClick}
        />
      );

      expect(screen.queryByText(/총.*주소가 등록되어 있습니다/)).not.toBeInTheDocument();
    });

    it('주소 관리 버튼이 렌더링된다', () => {
      renderWithProviders(
        <AddressSection
          userAddress="서울시 강남구 테헤란로 123"
          addresses={createMockUserAddresses(1)}
          onManageClick={mockOnManageClick}
        />
      );

      expect(screen.getByRole('button', { name: '주소 관리' })).toBeInTheDocument();
    });
  });

  describe('상호작용 테스트', () => {
    it('주소 관리 버튼을 클릭하면 onManageClick이 호출된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <AddressSection
          userAddress="서울시 강남구 테헤란로 123"
          addresses={createMockUserAddresses(1)}
          onManageClick={mockOnManageClick}
        />
      );

      await user.click(screen.getByRole('button', { name: '주소 관리' }));

      expect(mockOnManageClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('스타일 테스트', () => {
    it('카드 스타일이 적용된다', () => {
      const { container } = renderWithProviders(
        <AddressSection
          userAddress="서울시 강남구 테헤란로 123"
          addresses={createMockUserAddresses(1)}
          onManageClick={mockOnManageClick}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('rounded-[32px]');
      expect(card).toHaveClass('border');
    });
  });
});
