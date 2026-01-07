import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAddressList } from '@/hooks/address/useAddressList';
import { createWrapper } from '@tests/utils/renderWithProviders';
import { userService } from '@/api/services/user';
import { createMockUserAddresses, createMockUserAddress } from '@tests/factories/address';

// Mock dependencies
vi.mock('@/api/services/user');
vi.mock('@/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
    handleSuccess: vi.fn(),
  }),
}));

// Mock window.confirm
const mockConfirm = vi.fn();
globalThis.confirm = mockConfirm;

describe('useAddressList', () => {
  const mockAddresses = createMockUserAddresses(3);
  const defaultAddress = mockAddresses[0];

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  const wrapper = createWrapper();

  describe('Initialization', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useAddressList(), { wrapper });

      expect(result.current.addresses).toEqual([]);
      expect(result.current.defaultAddress).toBeNull();
      expect(result.current.isLoadingAddresses).toBe(false);
      expect(result.current.selectedDeleteIds).toEqual([]);
      expect(result.current.isEditMode).toBe(false);
      expect(result.current.confirmDefaultAddress).toBeNull();
    });
  });

  describe('loadAddresses', () => {
    it('should load addresses successfully', async () => {
      vi.mocked(userService.getAddresses).mockResolvedValue({
        addresses: mockAddresses,
      });
      vi.mocked(userService.getDefaultAddress).mockResolvedValue({
        address: defaultAddress,
      });

      const { result } = renderHook(() => useAddressList(), { wrapper });

      await act(async () => {
        await result.current.loadAddresses();
      });

      await waitFor(() => {
        expect(result.current.addresses).toEqual(mockAddresses);
        expect(result.current.defaultAddress).toEqual(defaultAddress);
        expect(result.current.isLoadingAddresses).toBe(false);
      });

      expect(userService.getAddresses).toHaveBeenCalledTimes(1);
      expect(userService.getDefaultAddress).toHaveBeenCalledTimes(1);
    });

    it('should handle loading state correctly', async () => {
      vi.mocked(userService.getAddresses).mockResolvedValue({
        addresses: mockAddresses,
      });
      vi.mocked(userService.getDefaultAddress).mockResolvedValue({
        address: defaultAddress,
      });

      const { result } = renderHook(() => useAddressList(), { wrapper });

      act(() => {
        result.current.loadAddresses();
      });

      expect(result.current.isLoadingAddresses).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoadingAddresses).toBe(false);
      });
    });

    it('should handle loading error silently', async () => {
      vi.mocked(userService.getAddresses).mockRejectedValue(
        new Error('Failed to load')
      );
      vi.mocked(userService.getDefaultAddress).mockRejectedValue(
        new Error('Failed to load')
      );

      const { result } = renderHook(() => useAddressList(), { wrapper });

      await act(async () => {
        await result.current.loadAddresses();
      });

      expect(result.current.isLoadingAddresses).toBe(false);
    });
  });

  describe('handleSetDefaultAddress', () => {
    it('should set default address successfully', async () => {
      const newDefaultAddress = createMockUserAddress({
        id: 2,
        isDefault: true,
      });

      vi.mocked(userService.setDefaultAddress).mockResolvedValue(newDefaultAddress);
      vi.mocked(userService.getAddresses).mockResolvedValue({
        addresses: mockAddresses,
      });
      vi.mocked(userService.getDefaultAddress).mockResolvedValue({
        address: newDefaultAddress,
      });

      const { result } = renderHook(() => useAddressList(), { wrapper });

      await act(async () => {
        await result.current.handleSetDefaultAddress(2);
      });

      expect(userService.setDefaultAddress).toHaveBeenCalledWith(2);
      expect(userService.getAddresses).toHaveBeenCalled();
      expect(userService.getDefaultAddress).toHaveBeenCalled();
    });

    it('should handle null coordinates correctly', async () => {
      const addressWithNullCoords = createMockUserAddress({
        id: 2,
        latitude: NaN,
        longitude: NaN,
        isDefault: true,
      });

      vi.mocked(userService.setDefaultAddress).mockResolvedValue(addressWithNullCoords);
      vi.mocked(userService.getAddresses).mockResolvedValue({
        addresses: mockAddresses,
      });
      vi.mocked(userService.getDefaultAddress).mockResolvedValue({
        address: addressWithNullCoords,
      });

      const { result } = renderHook(() => useAddressList(), { wrapper });

      await act(async () => {
        await result.current.handleSetDefaultAddress(2);
      });

      expect(userService.setDefaultAddress).toHaveBeenCalledWith(2);
    });

    it('should handle error when setting default address', async () => {
      vi.mocked(userService.setDefaultAddress).mockRejectedValue(
        new Error('Failed to set default')
      );

      const { result } = renderHook(() => useAddressList(), { wrapper });

      await act(async () => {
        await result.current.handleSetDefaultAddress(2);
      });

      expect(userService.setDefaultAddress).toHaveBeenCalledWith(2);
    });
  });

  describe('handleAddressClick', () => {
    it('should set confirm address for non-default address', () => {
      const { result } = renderHook(() => useAddressList(), { wrapper });
      const nonDefaultAddress = createMockUserAddress({
        id: 2,
        isDefault: false,
      });

      act(() => {
        result.current.handleAddressClick(nonDefaultAddress);
      });

      expect(result.current.confirmDefaultAddress).toEqual(nonDefaultAddress);
    });

    it('should not set confirm address for default address', () => {
      const { result } = renderHook(() => useAddressList(), { wrapper });
      const defaultAddr = createMockUserAddress({
        id: 1,
        isDefault: true,
      });

      act(() => {
        result.current.handleAddressClick(defaultAddr);
      });

      expect(result.current.confirmDefaultAddress).toBeNull();
    });
  });

  describe('handleConfirmSetDefault', () => {
    it('should confirm and set default address', async () => {
      const newDefaultAddress = createMockUserAddress({
        id: 2,
        isDefault: true,
      });

      vi.mocked(userService.setDefaultAddress).mockResolvedValue(newDefaultAddress);
      vi.mocked(userService.getAddresses).mockResolvedValue({
        addresses: mockAddresses,
      });
      vi.mocked(userService.getDefaultAddress).mockResolvedValue({
        address: newDefaultAddress,
      });

      const { result } = renderHook(() => useAddressList(), { wrapper });

      act(() => {
        result.current.setConfirmDefaultAddress(newDefaultAddress);
      });

      await act(async () => {
        await result.current.handleConfirmSetDefault();
      });

      await waitFor(() => {
        expect(result.current.confirmDefaultAddress).toBeNull();
      });

      expect(userService.setDefaultAddress).toHaveBeenCalledWith(2);
    });

    it('should do nothing if no confirm address set', async () => {
      const { result } = renderHook(() => useAddressList(), { wrapper });

      await act(async () => {
        await result.current.handleConfirmSetDefault();
      });

      expect(userService.setDefaultAddress).not.toHaveBeenCalled();
    });

    it('should handle error during confirmation', async () => {
      vi.mocked(userService.setDefaultAddress).mockRejectedValue(
        new Error('Failed')
      );

      const { result } = renderHook(() => useAddressList(), { wrapper });
      const address = createMockUserAddress({ id: 2, isDefault: false });

      act(() => {
        result.current.setConfirmDefaultAddress(address);
      });

      await act(async () => {
        await result.current.handleConfirmSetDefault();
      });

      // Error is handled silently in the hook
      expect(userService.setDefaultAddress).toHaveBeenCalled();
    });
  });

  describe('handleDeleteAddresses', () => {
    it('should delete addresses successfully', async () => {
      vi.mocked(userService.deleteAddresses).mockResolvedValue({
        message: '2개의 주소가 삭제되었습니다.',
      });
      vi.mocked(userService.getAddresses).mockResolvedValue({
        addresses: [mockAddresses[0]],
      });
      vi.mocked(userService.getDefaultAddress).mockResolvedValue({
        address: mockAddresses[0],
      });

      const { result } = renderHook(() => useAddressList(), { wrapper });

      // Set up addresses with some non-default ones
      act(() => {
        result.current.loadAddresses();
      });

      await waitFor(() => {
        vi.mocked(userService.getAddresses).mockResolvedValue({
          addresses: mockAddresses,
        });
      });

      await act(async () => {
        await result.current.handleDeleteAddresses([2, 3]);
      });

      expect(mockConfirm).toHaveBeenCalledWith('정말 2개의 주소를 삭제하시겠습니까?');
      expect(userService.deleteAddresses).toHaveBeenCalledWith([2, 3]);
    });

    it('should not delete when no ids provided', async () => {
      const { result } = renderHook(() => useAddressList(), { wrapper });

      await act(async () => {
        await result.current.handleDeleteAddresses([]);
      });

      expect(userService.deleteAddresses).not.toHaveBeenCalled();
    });

    it('should not delete default address', async () => {
      const { result } = renderHook(() => useAddressList(), { wrapper });

      // Load addresses first
      vi.mocked(userService.getAddresses).mockResolvedValue({
        addresses: mockAddresses,
      });
      vi.mocked(userService.getDefaultAddress).mockResolvedValue({
        address: mockAddresses[0],
      });

      await act(async () => {
        await result.current.loadAddresses();
      });

      await act(async () => {
        await result.current.handleDeleteAddresses([1]); // ID 1 is default
      });

      expect(userService.deleteAddresses).not.toHaveBeenCalled();
    });

    it('should not delete when user cancels confirmation', async () => {
      mockConfirm.mockReturnValue(false);

      const { result } = renderHook(() => useAddressList(), { wrapper });

      await act(async () => {
        await result.current.handleDeleteAddresses([2]);
      });

      expect(userService.deleteAddresses).not.toHaveBeenCalled();
    });

    it('should reset selected ids after successful deletion', async () => {
      vi.mocked(userService.deleteAddresses).mockResolvedValue({
        message: '1개의 주소가 삭제되었습니다.',
      });
      vi.mocked(userService.getAddresses).mockResolvedValue({
        addresses: mockAddresses,
      });
      vi.mocked(userService.getDefaultAddress).mockResolvedValue({
        address: mockAddresses[0],
      });

      const { result } = renderHook(() => useAddressList(), { wrapper });

      // Load addresses
      await act(async () => {
        await result.current.loadAddresses();
      });

      await act(async () => {
        await result.current.handleDeleteAddresses([2]);
      });

      await waitFor(() => {
        expect(result.current.selectedDeleteIds).toEqual([]);
      });
    });
  });

  describe('handleToggleDeleteSelection', () => {
    beforeEach(async () => {
      vi.mocked(userService.getAddresses).mockResolvedValue({
        addresses: mockAddresses,
      });
      vi.mocked(userService.getDefaultAddress).mockResolvedValue({
        address: mockAddresses[0],
      });
    });

    it('should toggle selection', async () => {
      const { result } = renderHook(() => useAddressList(), { wrapper });

      // Load addresses first
      await act(async () => {
        await result.current.loadAddresses();
      });

      act(() => {
        result.current.handleToggleDeleteSelection(2);
      });

      expect(result.current.selectedDeleteIds).toEqual([2]);

      act(() => {
        result.current.handleToggleDeleteSelection(2);
      });

      expect(result.current.selectedDeleteIds).toEqual([]);
    });

    it('should not select default address', async () => {
      const { result } = renderHook(() => useAddressList(), { wrapper });

      // Load addresses first
      await act(async () => {
        await result.current.loadAddresses();
      });

      act(() => {
        result.current.handleToggleDeleteSelection(1); // ID 1 is default
      });

      expect(result.current.selectedDeleteIds).toEqual([]);
    });

    it('should not select more than 3 addresses', async () => {
      const manyAddresses = createMockUserAddresses(5);
      vi.mocked(userService.getAddresses).mockResolvedValue({
        addresses: manyAddresses,
      });

      const { result } = renderHook(() => useAddressList(), { wrapper });

      // Load addresses first
      await act(async () => {
        await result.current.loadAddresses();
      });

      // Select 3 non-default addresses one by one
      act(() => {
        result.current.handleToggleDeleteSelection(2);
      });

      act(() => {
        result.current.handleToggleDeleteSelection(3);
      });

      act(() => {
        result.current.handleToggleDeleteSelection(4);
      });

      expect(result.current.selectedDeleteIds).toHaveLength(3);

      // Try to select 4th address
      act(() => {
        result.current.handleToggleDeleteSelection(5);
      });

      expect(result.current.selectedDeleteIds).toHaveLength(3);
      expect(result.current.selectedDeleteIds).not.toContain(5);
    });
  });

  describe('resetAddressListModal', () => {
    it('should reset modal state', () => {
      const { result } = renderHook(() => useAddressList(), { wrapper });
      const address = createMockUserAddress({ id: 2, isDefault: false });

      act(() => {
        result.current.setIsEditMode(true);
        result.current.setConfirmDefaultAddress(address);
      });

      act(() => {
        result.current.resetAddressListModal();
      });

      expect(result.current.selectedDeleteIds).toEqual([]);
      expect(result.current.isEditMode).toBe(false);
      expect(result.current.confirmDefaultAddress).toBeNull();
    });
  });

  describe('State setters', () => {
    it('should allow direct state manipulation', () => {
      const { result } = renderHook(() => useAddressList(), { wrapper });
      const address = createMockUserAddress({ id: 2 });

      act(() => {
        result.current.setIsEditMode(true);
        result.current.setConfirmDefaultAddress(address);
      });

      expect(result.current.isEditMode).toBe(true);
      expect(result.current.confirmDefaultAddress).toEqual(address);
    });
  });
});
