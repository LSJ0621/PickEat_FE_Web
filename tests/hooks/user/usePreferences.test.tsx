import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePreferences } from '@/hooks/user/usePreferences';
import { createWrapper } from '@tests/utils/renderWithProviders';
import { userService } from '@/api/services/user';
import { createMockPreferences } from '@tests/factories/user';

// Mock dependencies
vi.mock('@/api/services/user');
vi.mock('@/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
    handleSuccess: vi.fn(),
  }),
}));

describe('usePreferences', () => {
  const mockPreferences = createMockPreferences();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = createWrapper();

  describe('Initialization', () => {
    it('should initialize with empty arrays when no options provided', () => {
      const { result } = renderHook(() => usePreferences(), { wrapper });

      expect(result.current.likes).toEqual([]);
      expect(result.current.dislikes).toEqual([]);
      expect(result.current.analysis).toBeNull();
      expect(result.current.newLike).toBe('');
      expect(result.current.newDislike).toBe('');
      expect(result.current.isLoadingPreferences).toBe(false);
      expect(result.current.isSavingPreferences).toBe(false);
    });

    it('should initialize with provided options', () => {
      const options = {
        initialLikes: ['한식', '중식'],
        initialDislikes: ['매운 음식'],
        initialAnalysis: '분석 내용',
      };

      const { result } = renderHook(() => usePreferences(options), { wrapper });

      expect(result.current.likes).toEqual(options.initialLikes);
      expect(result.current.dislikes).toEqual(options.initialDislikes);
      expect(result.current.analysis).toBe(options.initialAnalysis);
    });

    it('should update state when initial values change', async () => {
      const { result, rerender } = renderHook(
        ({ initialLikes }) => usePreferences({ initialLikes }),
        {
          wrapper,
          initialProps: { initialLikes: ['한식'] },
        }
      );

      expect(result.current.likes).toEqual(['한식']);

      rerender({ initialLikes: ['한식', '중식'] });

      await waitFor(() => {
        expect(result.current.likes).toEqual(['한식', '중식']);
      });
    });
  });

  describe('loadPreferences', () => {
    it('should load preferences successfully', async () => {
      vi.mocked(userService.getPreferences).mockResolvedValue({
        preferences: mockPreferences,
      });

      const { result } = renderHook(() => usePreferences(), { wrapper });

      expect(result.current.isLoadingPreferences).toBe(false);

      await act(async () => {
        await result.current.loadPreferences();
      });

      await waitFor(() => {
        expect(result.current.isLoadingPreferences).toBe(false);
      });

      expect(result.current.likes).toEqual(mockPreferences.likes);
      expect(result.current.dislikes).toEqual(mockPreferences.dislikes);
      expect(result.current.analysis).toBe(mockPreferences.analysis);
      expect(userService.getPreferences).toHaveBeenCalledTimes(1);
    });

    it('should handle loading state correctly', async () => {
      vi.mocked(userService.getPreferences).mockResolvedValue({
        preferences: mockPreferences,
      });

      const { result } = renderHook(() => usePreferences(), { wrapper });

      act(() => {
        result.current.loadPreferences();
      });

      expect(result.current.isLoadingPreferences).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoadingPreferences).toBe(false);
      });
    });

    it('should handle loading error silently', async () => {
      vi.mocked(userService.getPreferences).mockRejectedValue(
        new Error('Failed to load')
      );

      const { result } = renderHook(() => usePreferences(), { wrapper });

      await act(async () => {
        await result.current.loadPreferences();
      });

      // Should not throw and should reset loading state
      expect(result.current.isLoadingPreferences).toBe(false);
    });
  });

  describe('handleAddLike', () => {
    it('should add a like item', () => {
      const { result } = renderHook(() => usePreferences(), { wrapper });

      act(() => {
        result.current.setNewLike('한식');
      });

      act(() => {
        result.current.handleAddLike();
      });

      expect(result.current.likes).toEqual(['한식']);
      expect(result.current.newLike).toBe('');
    });

    it('should trim whitespace when adding like', () => {
      const { result } = renderHook(() => usePreferences(), { wrapper });

      act(() => {
        result.current.setNewLike('  한식  ');
      });

      act(() => {
        result.current.handleAddLike();
      });

      expect(result.current.likes).toEqual(['한식']);
    });

    it('should not add duplicate likes', () => {
      const { result } = renderHook(() => usePreferences(), { wrapper });

      act(() => {
        result.current.setNewLike('한식');
      });

      act(() => {
        result.current.handleAddLike();
      });

      act(() => {
        result.current.setNewLike('한식');
      });

      act(() => {
        result.current.handleAddLike();
      });

      expect(result.current.likes).toEqual(['한식']);
    });

    it('should not add empty string', () => {
      const { result } = renderHook(() => usePreferences(), { wrapper });

      act(() => {
        result.current.setNewLike('   ');
      });

      act(() => {
        result.current.handleAddLike();
      });

      expect(result.current.likes).toEqual([]);
    });
  });

  describe('handleRemoveLike', () => {
    it('should remove a like item', () => {
      const { result } = renderHook(
        () => usePreferences({ initialLikes: ['한식', '중식'] }),
        { wrapper }
      );

      act(() => {
        result.current.handleRemoveLike('한식');
      });

      expect(result.current.likes).toEqual(['중식']);
    });

    it('should handle removing non-existent item', () => {
      const { result } = renderHook(
        () => usePreferences({ initialLikes: ['한식'] }),
        { wrapper }
      );

      act(() => {
        result.current.handleRemoveLike('중식');
      });

      expect(result.current.likes).toEqual(['한식']);
    });
  });

  describe('handleAddDislike', () => {
    it('should add a dislike item', () => {
      const { result } = renderHook(() => usePreferences(), { wrapper });

      act(() => {
        result.current.setNewDislike('매운 음식');
      });

      act(() => {
        result.current.handleAddDislike();
      });

      expect(result.current.dislikes).toEqual(['매운 음식']);
      expect(result.current.newDislike).toBe('');
    });

    it('should trim whitespace when adding dislike', () => {
      const { result } = renderHook(() => usePreferences(), { wrapper });

      act(() => {
        result.current.setNewDislike('  매운 음식  ');
      });

      act(() => {
        result.current.handleAddDislike();
      });

      expect(result.current.dislikes).toEqual(['매운 음식']);
    });

    it('should not add duplicate dislikes', () => {
      const { result } = renderHook(() => usePreferences(), { wrapper });

      act(() => {
        result.current.setNewDislike('매운 음식');
      });

      act(() => {
        result.current.handleAddDislike();
      });

      act(() => {
        result.current.setNewDislike('매운 음식');
      });

      act(() => {
        result.current.handleAddDislike();
      });

      expect(result.current.dislikes).toEqual(['매운 음식']);
    });

    it('should not add empty string', () => {
      const { result } = renderHook(() => usePreferences(), { wrapper });

      act(() => {
        result.current.setNewDislike('   ');
      });

      act(() => {
        result.current.handleAddDislike();
      });

      expect(result.current.dislikes).toEqual([]);
    });
  });

  describe('handleRemoveDislike', () => {
    it('should remove a dislike item', () => {
      const { result } = renderHook(
        () => usePreferences({ initialDislikes: ['매운 음식', '생선'] }),
        { wrapper }
      );

      act(() => {
        result.current.handleRemoveDislike('매운 음식');
      });

      expect(result.current.dislikes).toEqual(['생선']);
    });

    it('should handle removing non-existent item', () => {
      const { result } = renderHook(
        () => usePreferences({ initialDislikes: ['매운 음식'] }),
        { wrapper }
      );

      act(() => {
        result.current.handleRemoveDislike('생선');
      });

      expect(result.current.dislikes).toEqual(['매운 음식']);
    });
  });

  describe('handleSavePreferences', () => {
    it('should save preferences successfully', async () => {
      vi.mocked(userService.setPreferences).mockResolvedValue({
        preferences: mockPreferences,
      });
      vi.mocked(userService.getPreferences).mockResolvedValue({
        preferences: mockPreferences,
      });

      const { result } = renderHook(
        () =>
          usePreferences({
            initialLikes: ['한식'],
            initialDislikes: ['매운 음식'],
          }),
        { wrapper }
      );

      let saveResult: boolean = false;
      await act(async () => {
        saveResult = await result.current.handleSavePreferences();
      });

      expect(saveResult).toBe(true);
      expect(userService.setPreferences).toHaveBeenCalledWith({
        likes: ['한식'],
        dislikes: ['매운 음식'],
      });
      expect(userService.getPreferences).toHaveBeenCalled();
    });

    it('should handle saving state correctly', async () => {
      vi.mocked(userService.setPreferences).mockResolvedValue({
        preferences: mockPreferences,
      });
      vi.mocked(userService.getPreferences).mockResolvedValue({
        preferences: mockPreferences,
      });

      const { result } = renderHook(() => usePreferences(), { wrapper });

      act(() => {
        result.current.handleSavePreferences();
      });

      expect(result.current.isSavingPreferences).toBe(true);

      await waitFor(() => {
        expect(result.current.isSavingPreferences).toBe(false);
      });
    });

    it('should return false on save error', async () => {
      vi.mocked(userService.setPreferences).mockRejectedValue(
        new Error('Failed to save')
      );

      const { result } = renderHook(() => usePreferences(), { wrapper });

      let saveResult: boolean = true;
      await act(async () => {
        saveResult = await result.current.handleSavePreferences();
      });

      expect(saveResult).toBe(false);
    });

    it('should reload preferences after successful save', async () => {
      const updatedPreferences = createMockPreferences({
        analysis: 'Updated analysis',
      });

      vi.mocked(userService.setPreferences).mockResolvedValue({
        preferences: mockPreferences,
      });
      vi.mocked(userService.getPreferences).mockResolvedValue({
        preferences: updatedPreferences,
      });

      const { result } = renderHook(
        () =>
          usePreferences({
            initialLikes: ['한식'],
            initialDislikes: [],
          }),
        { wrapper }
      );

      await act(async () => {
        await result.current.handleSavePreferences();
      });

      await waitFor(() => {
        expect(result.current.analysis).toBe('Updated analysis');
      });
    });
  });

  describe('resetPreferencesModal', () => {
    it('should reset input fields', () => {
      const { result } = renderHook(() => usePreferences(), { wrapper });

      act(() => {
        result.current.setNewLike('한식');
        result.current.setNewDislike('매운 음식');
      });

      expect(result.current.newLike).toBe('한식');
      expect(result.current.newDislike).toBe('매운 음식');

      act(() => {
        result.current.resetPreferencesModal();
      });

      expect(result.current.newLike).toBe('');
      expect(result.current.newDislike).toBe('');
    });
  });

  describe('State setters', () => {
    it('should allow direct state manipulation', () => {
      const { result } = renderHook(() => usePreferences(), { wrapper });

      act(() => {
        result.current.setLikes(['한식', '중식']);
        result.current.setDislikes(['매운 음식']);
        result.current.setNewLike('일식');
        result.current.setNewDislike('생선');
      });

      expect(result.current.likes).toEqual(['한식', '중식']);
      expect(result.current.dislikes).toEqual(['매운 음식']);
      expect(result.current.newLike).toBe('일식');
      expect(result.current.newDislike).toBe('생선');
    });
  });

  describe('Empty preferences handling', () => {
    it('should handle empty likes array from server', async () => {
      vi.mocked(userService.getPreferences).mockResolvedValue({
        preferences: {
          id: 1,
          userId: 1,
          likes: [],
          dislikes: ['매운 음식'],
          analysis: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      const { result } = renderHook(() => usePreferences(), { wrapper });

      await act(async () => {
        await result.current.loadPreferences();
      });

      expect(result.current.likes).toEqual([]);
      expect(result.current.dislikes).toEqual(['매운 음식']);
    });

    it('should handle empty dislikes array from server', async () => {
      vi.mocked(userService.getPreferences).mockResolvedValue({
        preferences: {
          id: 1,
          userId: 1,
          likes: ['한식'],
          dislikes: [],
          analysis: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      const { result } = renderHook(() => usePreferences(), { wrapper });

      await act(async () => {
        await result.current.loadPreferences();
      });

      expect(result.current.likes).toEqual(['한식']);
      expect(result.current.dislikes).toEqual([]);
    });

    it('should handle null analysis from server', async () => {
      vi.mocked(userService.getPreferences).mockResolvedValue({
        preferences: {
          id: 1,
          userId: 1,
          likes: ['한식'],
          dislikes: ['매운 음식'],
          analysis: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      const { result } = renderHook(() => usePreferences(), { wrapper });

      await act(async () => {
        await result.current.loadPreferences();
      });

      expect(result.current.analysis).toBeNull();
    });
  });

  describe('Initial values update behavior', () => {
    it('should not update when initialLikes is undefined', () => {
      const { result, rerender } = renderHook(
        ({ initialLikes }) => usePreferences({ initialLikes }),
        {
          wrapper,
          initialProps: { initialLikes: undefined },
        }
      );

      expect(result.current.likes).toEqual([]);

      rerender({ initialLikes: undefined });

      expect(result.current.likes).toEqual([]);
    });

    it('should not update when initialDislikes is undefined', () => {
      const { result, rerender } = renderHook(
        ({ initialDislikes }) => usePreferences({ initialDislikes }),
        {
          wrapper,
          initialProps: { initialDislikes: undefined },
        }
      );

      expect(result.current.dislikes).toEqual([]);

      rerender({ initialDislikes: undefined });

      expect(result.current.dislikes).toEqual([]);
    });

    it('should not update when initialAnalysis is undefined', () => {
      const { result, rerender } = renderHook(
        ({ initialAnalysis }) => usePreferences({ initialAnalysis }),
        {
          wrapper,
          initialProps: { initialAnalysis: undefined },
        }
      );

      expect(result.current.analysis).toBeNull();

      rerender({ initialAnalysis: undefined });

      expect(result.current.analysis).toBeNull();
    });

    it('should update when initialDislikes changes', async () => {
      const { result, rerender } = renderHook(
        ({ initialDislikes }) => usePreferences({ initialDislikes }),
        {
          wrapper,
          initialProps: { initialDislikes: ['매운 음식'] },
        }
      );

      expect(result.current.dislikes).toEqual(['매운 음식']);

      rerender({ initialDislikes: ['매운 음식', '생선'] });

      await waitFor(() => {
        expect(result.current.dislikes).toEqual(['매운 음식', '생선']);
      });
    });

    it('should update when initialAnalysis changes', async () => {
      const { result, rerender } = renderHook(
        ({ initialAnalysis }) => usePreferences({ initialAnalysis }),
        {
          wrapper,
          initialProps: { initialAnalysis: '분석1' },
        }
      );

      expect(result.current.analysis).toBe('분석1');

      rerender({ initialAnalysis: '분석2' });

      await waitFor(() => {
        expect(result.current.analysis).toBe('분석2');
      });
    });

    it('should handle initialAnalysis changing from string to null', async () => {
      const { result, rerender } = renderHook(
        ({ initialAnalysis }) => usePreferences({ initialAnalysis }),
        {
          wrapper,
          initialProps: { initialAnalysis: '분석 내용' },
        }
      );

      expect(result.current.analysis).toBe('분석 내용');

      rerender({ initialAnalysis: null });

      await waitFor(() => {
        expect(result.current.analysis).toBeNull();
      });
    });

    it('should handle initialAnalysis changing from null to string', async () => {
      const { result, rerender } = renderHook(
        ({ initialAnalysis }) => usePreferences({ initialAnalysis }),
        {
          wrapper,
          initialProps: { initialAnalysis: null },
        }
      );

      expect(result.current.analysis).toBeNull();

      rerender({ initialAnalysis: '새로운 분석' });

      await waitFor(() => {
        expect(result.current.analysis).toBe('새로운 분석');
      });
    });
  });

  describe('Error response handling', () => {
    it('should handle server error with error message', async () => {
      const error = {
        response: {
          data: {
            message: 'Server error occurred',
          },
        },
      };
      vi.mocked(userService.setPreferences).mockRejectedValue(error);

      const { result } = renderHook(() => usePreferences(), { wrapper });

      let saveResult: boolean = true;
      await act(async () => {
        saveResult = await result.current.handleSavePreferences();
      });

      expect(saveResult).toBe(false);
      expect(result.current.isSavingPreferences).toBe(false);
    });

    it('should handle network error without response', async () => {
      const error = new Error('Network error');
      vi.mocked(userService.setPreferences).mockRejectedValue(error);

      const { result } = renderHook(() => usePreferences(), { wrapper });

      let saveResult: boolean = true;
      await act(async () => {
        saveResult = await result.current.handleSavePreferences();
      });

      expect(saveResult).toBe(false);
    });
  });
});
