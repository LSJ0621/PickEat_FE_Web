import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUserPlaceActions } from '@/hooks/user-place/useUserPlaceActions';
import { userPlaceService } from '@/api/services/user-place';
import { useErrorHandler } from '@/hooks/useErrorHandler';

vi.mock('@/api/services/user-place');
vi.mock('@/hooks/useErrorHandler');

describe('useUserPlaceActions', () => {
  const mockHandleError = vi.fn();
  const mockHandleSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useErrorHandler).mockReturnValue({
      handleError: mockHandleError,
      handleSuccess: mockHandleSuccess,
    });
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useUserPlaceActions());

      expect(result.current.isUpdateLoading).toBe(false);
      expect(result.current.isDeleteLoading).toBe(false);
      expect(result.current.updatePlace).toBeTypeOf('function');
      expect(result.current.deletePlace).toBeTypeOf('function');
    });
  });

  describe('updatePlace', () => {
    it('should successfully update a place', async () => {
      vi.mocked(userPlaceService.updateUserPlace).mockResolvedValue(undefined);

      const { result } = renderHook(() => useUserPlaceActions());

      const updateData = {
        name: 'Updated Place',
        category: 'CAFE' as const,
        notes: 'Updated notes',
      };

      await act(async () => {
        await result.current.updatePlace(1, updateData);
      });

      expect(userPlaceService.updateUserPlace).toHaveBeenCalledWith(1, updateData);
      expect(mockHandleSuccess).toHaveBeenCalledWith('userPlace.updateSuccess');
      expect(result.current.isUpdateLoading).toBe(false);
    });

    it('should set loading state during update', async () => {
      let resolveUpdate: () => void;
      const updatePromise = new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      });
      vi.mocked(userPlaceService.updateUserPlace).mockReturnValue(updatePromise);

      const { result } = renderHook(() => useUserPlaceActions());

      const updateData = {
        name: 'Updated Place',
        category: 'CAFE' as const,
      };

      let updatePromiseResult: Promise<void>;
      act(() => {
        updatePromiseResult = result.current.updatePlace(1, updateData);
      });

      // Should be loading while promise is pending
      expect(result.current.isUpdateLoading).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolveUpdate!();
        await updatePromiseResult;
      });

      expect(result.current.isUpdateLoading).toBe(false);
    });

    it('should handle update error', async () => {
      const error = new Error('Update failed');
      vi.mocked(userPlaceService.updateUserPlace).mockRejectedValue(error);

      const { result } = renderHook(() => useUserPlaceActions());

      const updateData = {
        name: 'Updated Place',
        category: 'CAFE' as const,
      };

      await expect(
        act(async () => {
          await result.current.updatePlace(1, updateData);
        })
      ).rejects.toThrow('Update failed');

      expect(mockHandleError).toHaveBeenCalledWith(error, 'useUserPlaceActions');
      expect(mockHandleSuccess).not.toHaveBeenCalled();
      expect(result.current.isUpdateLoading).toBe(false);
    });

    it('should reset loading state even after error', async () => {
      vi.mocked(userPlaceService.updateUserPlace).mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useUserPlaceActions());

      const updateData = {
        name: 'Updated Place',
        category: 'CAFE' as const,
      };

      try {
        await act(async () => {
          await result.current.updatePlace(1, updateData);
        });
      } catch {
        // Expected to throw
      }

      expect(result.current.isUpdateLoading).toBe(false);
    });
  });

  describe('deletePlace', () => {
    it('should successfully delete a place', async () => {
      vi.mocked(userPlaceService.deleteUserPlace).mockResolvedValue(undefined);

      const { result } = renderHook(() => useUserPlaceActions());

      await act(async () => {
        await result.current.deletePlace(1);
      });

      expect(userPlaceService.deleteUserPlace).toHaveBeenCalledWith(1);
      expect(mockHandleSuccess).toHaveBeenCalledWith('userPlace.deleteSuccess');
      expect(result.current.isDeleteLoading).toBe(false);
    });

    it('should set loading state during delete', async () => {
      let resolveDelete: () => void;
      const deletePromise = new Promise<void>((resolve) => {
        resolveDelete = resolve;
      });
      vi.mocked(userPlaceService.deleteUserPlace).mockReturnValue(deletePromise);

      const { result } = renderHook(() => useUserPlaceActions());

      let deletePromiseResult: Promise<void>;
      act(() => {
        deletePromiseResult = result.current.deletePlace(1);
      });

      // Should be loading while promise is pending
      expect(result.current.isDeleteLoading).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolveDelete!();
        await deletePromiseResult;
      });

      expect(result.current.isDeleteLoading).toBe(false);
    });

    it('should handle delete error', async () => {
      const error = new Error('Delete failed');
      vi.mocked(userPlaceService.deleteUserPlace).mockRejectedValue(error);

      const { result } = renderHook(() => useUserPlaceActions());

      await expect(
        act(async () => {
          await result.current.deletePlace(1);
        })
      ).rejects.toThrow('Delete failed');

      expect(mockHandleError).toHaveBeenCalledWith(error, 'useUserPlaceActions');
      expect(mockHandleSuccess).not.toHaveBeenCalled();
      expect(result.current.isDeleteLoading).toBe(false);
    });

    it('should reset loading state even after error', async () => {
      vi.mocked(userPlaceService.deleteUserPlace).mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useUserPlaceActions());

      try {
        await act(async () => {
          await result.current.deletePlace(1);
        });
      } catch {
        // Expected to throw
      }

      expect(result.current.isDeleteLoading).toBe(false);
    });
  });

  describe('Independent Loading States', () => {
    it('should maintain independent loading states for update and delete', async () => {
      let resolveUpdate: () => void;
      let resolveDelete: () => void;

      const updatePromise = new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      });
      const deletePromise = new Promise<void>((resolve) => {
        resolveDelete = resolve;
      });

      vi.mocked(userPlaceService.updateUserPlace).mockReturnValue(updatePromise);
      vi.mocked(userPlaceService.deleteUserPlace).mockReturnValue(deletePromise);

      const { result } = renderHook(() => useUserPlaceActions());

      const updateData = { name: 'Updated', category: 'CAFE' as const };

      // Start both operations
      let updateResult: Promise<void>;
      let deleteResult: Promise<void>;

      act(() => {
        updateResult = result.current.updatePlace(1, updateData);
        deleteResult = result.current.deletePlace(2);
      });

      expect(result.current.isUpdateLoading).toBe(true);
      expect(result.current.isDeleteLoading).toBe(true);

      // Resolve update first
      await act(async () => {
        resolveUpdate!();
        await updateResult;
      });

      expect(result.current.isUpdateLoading).toBe(false);
      expect(result.current.isDeleteLoading).toBe(true);

      // Resolve delete
      await act(async () => {
        resolveDelete!();
        await deleteResult;
      });

      expect(result.current.isUpdateLoading).toBe(false);
      expect(result.current.isDeleteLoading).toBe(false);
    });
  });
});
