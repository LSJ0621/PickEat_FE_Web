import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUserPlaceCreate } from '@features/user-place/hooks/useUserPlaceCreate';
import { userPlaceService } from '@features/user-place/api';
import { useErrorHandler } from '@shared/hooks/useErrorHandler';
import type { UserPlace } from '@features/user-place/types';

vi.mock('@features/user-place/api');
vi.mock('@shared/hooks/useErrorHandler');

describe('useUserPlaceCreate', () => {
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
      const { result } = renderHook(() => useUserPlaceCreate());

      expect(result.current.checkResult).toBe(null);
      expect(result.current.isCheckLoading).toBe(false);
      expect(result.current.isCreateLoading).toBe(false);
      expect(result.current.checkRegistration).toBeTypeOf('function');
      expect(result.current.createPlace).toBeTypeOf('function');
      expect(result.current.resetCheck).toBeTypeOf('function');
    });
  });

  describe('checkRegistration', () => {
    it('should successfully check registration', async () => {
      const mockCheckResult = {
        canRegister: true,
        message: '등록 가능한 장소입니다.',
        existingPlace: null,
      };

      vi.mocked(userPlaceService.checkRegistration).mockResolvedValue(mockCheckResult);

      const { result } = renderHook(() => useUserPlaceCreate());

      const checkData = {
        placeId: 'google_place_123',
      };

      await act(async () => {
        await result.current.checkRegistration(checkData);
      });

      expect(userPlaceService.checkRegistration).toHaveBeenCalledWith(checkData);
      expect(result.current.checkResult).toEqual(mockCheckResult);
      expect(result.current.isCheckLoading).toBe(false);
    });

    it('should set loading state during check', async () => {
      let resolveCheck: (value: any) => void;
      const checkPromise = new Promise((resolve) => {
        resolveCheck = resolve;
      });
      vi.mocked(userPlaceService.checkRegistration).mockReturnValue(checkPromise);

      const { result } = renderHook(() => useUserPlaceCreate());

      const checkData = { placeId: 'google_place_123' };

      let checkResult: Promise<void>;
      act(() => {
        checkResult = result.current.checkRegistration(checkData);
      });

      expect(result.current.isCheckLoading).toBe(true);

      await act(async () => {
        resolveCheck!({ canRegister: true, message: 'OK', existingPlace: null });
        await checkResult;
      });

      expect(result.current.isCheckLoading).toBe(false);
    });

    it('should handle check error', async () => {
      const error = new Error('Check failed');
      vi.mocked(userPlaceService.checkRegistration).mockRejectedValue(error);

      const { result } = renderHook(() => useUserPlaceCreate());

      const checkData = { placeId: 'google_place_123' };

      await act(async () => {
        await result.current.checkRegistration(checkData);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, 'useUserPlaceCreate');
      expect(result.current.checkResult).toBe(null);
      expect(result.current.isCheckLoading).toBe(false);
    });

    it('should handle existing place in check result', async () => {
      const mockExistingPlace: UserPlace = {
        id: 1,
        name: 'Existing Place',
        category: 'CAFE',
        placeId: 'google_place_123',
        address: '123 Main St',
        latitude: 37.5665,
        longitude: 126.9780,
        status: 'ACTIVE',
        visitCount: 5,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockCheckResult = {
        canRegister: false,
        message: '이미 등록된 장소입니다.',
        existingPlace: mockExistingPlace,
      };

      vi.mocked(userPlaceService.checkRegistration).mockResolvedValue(mockCheckResult);

      const { result } = renderHook(() => useUserPlaceCreate());

      await act(async () => {
        await result.current.checkRegistration({ placeId: 'google_place_123' });
      });

      expect(result.current.checkResult).toEqual(mockCheckResult);
      expect(result.current.checkResult?.existingPlace).toEqual(mockExistingPlace);
    });
  });

  describe('createPlace', () => {
    it('should successfully create a place', async () => {
      const mockCreatedPlace: UserPlace = {
        id: 1,
        name: 'New Place',
        category: 'RESTAURANT',
        placeId: 'google_place_123',
        address: '123 Main St',
        latitude: 37.5665,
        longitude: 126.9780,
        status: 'ACTIVE',
        visitCount: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(userPlaceService.createUserPlace).mockResolvedValue(mockCreatedPlace);

      const { result } = renderHook(() => useUserPlaceCreate());

      // Set check result first
      act(() => {
        result.current.checkRegistration({ placeId: 'google_place_123' });
      });

      const createData = {
        placeId: 'google_place_123',
        name: 'New Place',
        category: 'RESTAURANT' as const,
        address: '123 Main St',
        latitude: 37.5665,
        longitude: 126.9780,
      };

      let createdPlace: UserPlace | undefined;
      await act(async () => {
        createdPlace = await result.current.createPlace(createData);
      });

      expect(userPlaceService.createUserPlace).toHaveBeenCalledWith(createData);
      expect(mockHandleSuccess).toHaveBeenCalledWith('userPlace.createSuccess');
      expect(createdPlace).toEqual(mockCreatedPlace);
      expect(result.current.checkResult).toBe(null); // Should reset after create
      expect(result.current.isCreateLoading).toBe(false);
    });

    it('should set loading state during create', async () => {
      let resolveCreate: (value: any) => void;
      const createPromise = new Promise((resolve) => {
        resolveCreate = resolve;
      });
      vi.mocked(userPlaceService.createUserPlace).mockReturnValue(createPromise);

      const { result } = renderHook(() => useUserPlaceCreate());

      const createData = {
        placeId: 'google_place_123',
        name: 'New Place',
        category: 'RESTAURANT' as const,
        address: '123 Main St',
        latitude: 37.5665,
        longitude: 126.9780,
      };

      let createResult: Promise<UserPlace>;
      act(() => {
        createResult = result.current.createPlace(createData);
      });

      expect(result.current.isCreateLoading).toBe(true);

      const mockPlace: UserPlace = {
        id: 1,
        name: 'New Place',
        category: 'RESTAURANT',
        placeId: 'google_place_123',
        address: '123 Main St',
        latitude: 37.5665,
        longitude: 126.9780,
        status: 'ACTIVE',
        visitCount: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      await act(async () => {
        resolveCreate!(mockPlace);
        await createResult;
      });

      expect(result.current.isCreateLoading).toBe(false);
    });

    it('should handle create error', async () => {
      const error = new Error('Create failed');
      vi.mocked(userPlaceService.createUserPlace).mockRejectedValue(error);

      const { result } = renderHook(() => useUserPlaceCreate());

      const createData = {
        placeId: 'google_place_123',
        name: 'New Place',
        category: 'RESTAURANT' as const,
        address: '123 Main St',
        latitude: 37.5665,
        longitude: 126.9780,
      };

      await expect(
        act(async () => {
          await result.current.createPlace(createData);
        })
      ).rejects.toThrow('Create failed');

      expect(mockHandleError).toHaveBeenCalledWith(error, 'useUserPlaceCreate');
      expect(mockHandleSuccess).not.toHaveBeenCalled();
      expect(result.current.isCreateLoading).toBe(false);
    });

    it('should reset loading state even after error', async () => {
      vi.mocked(userPlaceService.createUserPlace).mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useUserPlaceCreate());

      const createData = {
        placeId: 'google_place_123',
        name: 'New Place',
        category: 'RESTAURANT' as const,
        address: '123 Main St',
        latitude: 37.5665,
        longitude: 126.9780,
      };

      try {
        await act(async () => {
          await result.current.createPlace(createData);
        });
      } catch {
        // Expected to throw
      }

      expect(result.current.isCreateLoading).toBe(false);
    });
  });

  describe('resetCheck', () => {
    it('should reset check result', async () => {
      const mockCheckResult = {
        canRegister: true,
        message: '등록 가능한 장소입니다.',
        existingPlace: null,
      };

      vi.mocked(userPlaceService.checkRegistration).mockResolvedValue(mockCheckResult);

      const { result } = renderHook(() => useUserPlaceCreate());

      await act(async () => {
        await result.current.checkRegistration({ placeId: 'google_place_123' });
      });

      expect(result.current.checkResult).toEqual(mockCheckResult);

      act(() => {
        result.current.resetCheck();
      });

      expect(result.current.checkResult).toBe(null);
    });
  });

  describe('Independent Loading States', () => {
    it('should maintain independent loading states for check and create', async () => {
      let resolveCheck: (value: any) => void;
      let resolveCreate: (value: any) => void;

      const checkPromise = new Promise((resolve) => {
        resolveCheck = resolve;
      });
      const createPromise = new Promise((resolve) => {
        resolveCreate = resolve;
      });

      vi.mocked(userPlaceService.checkRegistration).mockReturnValue(checkPromise);
      vi.mocked(userPlaceService.createUserPlace).mockReturnValue(createPromise);

      const { result } = renderHook(() => useUserPlaceCreate());

      const checkData = { placeId: 'google_place_123' };
      const createData = {
        placeId: 'google_place_123',
        name: 'New Place',
        category: 'RESTAURANT' as const,
        address: '123 Main St',
        latitude: 37.5665,
        longitude: 126.9780,
      };

      // Start check operation
      let checkResult: Promise<void>;
      act(() => {
        checkResult = result.current.checkRegistration(checkData);
      });

      expect(result.current.isCheckLoading).toBe(true);
      expect(result.current.isCreateLoading).toBe(false);

      // Start create operation while check is pending
      let createResult: Promise<UserPlace>;
      act(() => {
        createResult = result.current.createPlace(createData);
      });

      expect(result.current.isCheckLoading).toBe(true);
      expect(result.current.isCreateLoading).toBe(true);

      // Resolve check
      await act(async () => {
        resolveCheck!({ canRegister: true, message: 'OK', existingPlace: null });
        await checkResult;
      });

      expect(result.current.isCheckLoading).toBe(false);
      expect(result.current.isCreateLoading).toBe(true);

      // Resolve create
      const mockPlace: UserPlace = {
        id: 1,
        name: 'New Place',
        category: 'RESTAURANT',
        placeId: 'google_place_123',
        address: '123 Main St',
        latitude: 37.5665,
        longitude: 126.9780,
        status: 'ACTIVE',
        visitCount: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      await act(async () => {
        resolveCreate!(mockPlace);
        await createResult;
      });

      expect(result.current.isCheckLoading).toBe(false);
      expect(result.current.isCreateLoading).toBe(false);
    });
  });
});
