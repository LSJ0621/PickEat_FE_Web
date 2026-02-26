import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePreferences } from '@features/user/hooks/usePreferences';
import { createWrapper } from '@tests/utils/renderWithProviders';
import { userService } from '@features/user/api';
import { createMockPreferences } from '@tests/factories/user';

// Mock dependencies
vi.mock('@features/user/api');
vi.mock('@shared/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
    handleSuccess: vi.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// Shared fixture types for parameterised tests
// ---------------------------------------------------------------------------
type UsePreferencesResult = ReturnType<typeof usePreferences>;

interface AddFixture {
  field: string;
  value: string;
  trimmedValue: string;
  listKey: 'likes' | 'dislikes';
  inputKey: 'newLike' | 'newDislike';
  setter: (r: UsePreferencesResult, v: string) => void;
  handler: (r: UsePreferencesResult) => void;
}

interface RemoveFixture {
  field: string;
  initialOptions: Parameters<typeof usePreferences>[0];
  removeValue: string;
  listKey: 'likes' | 'dislikes';
  handler: (r: UsePreferencesResult, v: string) => void;
  expectedAfterRemove: string[];
  nonExistentInitialOptions: Parameters<typeof usePreferences>[0];
  expectedNonExistentRemove: string[];
}

const ADD_FIXTURES: AddFixture[] = [
  {
    field: 'like',
    value: '한식',
    trimmedValue: '한식',
    listKey: 'likes',
    inputKey: 'newLike',
    setter: (r, v) => r.setNewLike(v),
    handler: (r) => r.handleAddLike(),
  },
  {
    field: 'dislike',
    value: '매운 음식',
    trimmedValue: '매운 음식',
    listKey: 'dislikes',
    inputKey: 'newDislike',
    setter: (r, v) => r.setNewDislike(v),
    handler: (r) => r.handleAddDislike(),
  },
];

const REMOVE_FIXTURES: RemoveFixture[] = [
  {
    field: 'like',
    initialOptions: { initialLikes: ['한식', '중식'] },
    removeValue: '한식',
    listKey: 'likes',
    handler: (r, v) => r.handleRemoveLike(v),
    expectedAfterRemove: ['중식'],
    nonExistentInitialOptions: { initialLikes: ['한식'] },
    expectedNonExistentRemove: ['한식'],
  },
  {
    field: 'dislike',
    initialOptions: { initialDislikes: ['매운 음식', '생선'] },
    removeValue: '매운 음식',
    listKey: 'dislikes',
    handler: (r, v) => r.handleRemoveDislike(v),
    expectedAfterRemove: ['생선'],
    nonExistentInitialOptions: { initialDislikes: ['매운 음식'] },
    expectedNonExistentRemove: ['매운 음식'],
  },
];

// ---------------------------------------------------------------------------

describe('usePreferences', () => {
  const mockPreferences = createMockPreferences();
  let wrapper: ReturnType<typeof createWrapper>;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  // -------------------------------------------------------------------------
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

  });

  // -------------------------------------------------------------------------
  describe('loadPreferences', () => {
    it('should load preferences and update state', async () => {
      vi.mocked(userService.getPreferences).mockResolvedValue({
        preferences: mockPreferences,
      });
      const { result } = renderHook(() => usePreferences(), { wrapper });

      await act(async () => {
        await result.current.loadPreferences();
      });

      expect(result.current.likes).toEqual(mockPreferences.likes);
      expect(result.current.dislikes).toEqual(mockPreferences.dislikes);
      expect(result.current.analysis).toBe(mockPreferences.analysis);
    });

    it('should set isLoadingPreferences true during load and false after', async () => {
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

    it('should handle loading error silently and reset loading state', async () => {
      vi.mocked(userService.getPreferences).mockRejectedValue(
        new Error('Failed to load')
      );
      const { result } = renderHook(() => usePreferences(), { wrapper });

      await act(async () => {
        await result.current.loadPreferences();
      });

      expect(result.current.isLoadingPreferences).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  describe('handleAddLike / handleAddDislike', () => {
    it.each(ADD_FIXTURES)(
      'should add $field item and clear input',
      ({ value, listKey, inputKey, setter, handler }) => {
        const { result } = renderHook(() => usePreferences(), { wrapper });

        act(() => setter(result.current, value));
        act(() => handler(result.current));

        expect(result.current[listKey]).toEqual([value]);
        expect(result.current[inputKey]).toBe('');
      }
    );

    it.each(ADD_FIXTURES)(
      'should trim whitespace when adding $field',
      ({ trimmedValue, listKey, setter, handler }) => {
        const { result } = renderHook(() => usePreferences(), { wrapper });

        act(() => setter(result.current, `  ${trimmedValue}  `));
        act(() => handler(result.current));

        expect(result.current[listKey]).toEqual([trimmedValue]);
      }
    );

    it.each(ADD_FIXTURES)(
      'should not add duplicate $field',
      ({ value, listKey, setter, handler }) => {
        const { result } = renderHook(() => usePreferences(), { wrapper });

        act(() => setter(result.current, value));
        act(() => handler(result.current));
        act(() => setter(result.current, value));
        act(() => handler(result.current));

        expect(result.current[listKey]).toEqual([value]);
      }
    );

    it.each(ADD_FIXTURES)(
      'should not add empty string for $field',
      ({ listKey, setter, handler }) => {
        const { result } = renderHook(() => usePreferences(), { wrapper });

        act(() => setter(result.current, '   '));
        act(() => handler(result.current));

        expect(result.current[listKey]).toEqual([]);
      }
    );
  });

  // -------------------------------------------------------------------------
  describe('handleRemoveLike / handleRemoveDislike', () => {
    it.each(REMOVE_FIXTURES)(
      'should remove $field item',
      ({ initialOptions, removeValue, listKey, handler, expectedAfterRemove }) => {
        const { result } = renderHook(
          () => usePreferences(initialOptions),
          { wrapper }
        );

        act(() => handler(result.current, removeValue));

        expect(result.current[listKey]).toEqual(expectedAfterRemove);
      }
    );

    it.each(REMOVE_FIXTURES)(
      'should handle removing non-existent $field item gracefully',
      ({
        nonExistentInitialOptions,
        listKey,
        handler,
        expectedNonExistentRemove,
      }) => {
        const { result } = renderHook(
          () => usePreferences(nonExistentInitialOptions),
          { wrapper }
        );

        act(() => handler(result.current, '__nonexistent__'));

        expect(result.current[listKey]).toEqual(expectedNonExistentRemove);
      }
    );
  });

  // -------------------------------------------------------------------------
  describe('handleSavePreferences', () => {
    it('should save with correct payload and return true', async () => {
      vi.mocked(userService.setPreferences).mockResolvedValue({
        preferences: mockPreferences,
      });
      vi.mocked(userService.getPreferences).mockResolvedValue({
        preferences: mockPreferences,
      });

      const { result } = renderHook(
        () =>
          usePreferences({ initialLikes: ['한식'], initialDislikes: ['매운 음식'] }),
        { wrapper }
      );

      let saveResult = false;
      await act(async () => {
        saveResult = await result.current.handleSavePreferences();
      });

      expect(saveResult).toBe(true);
      expect(userService.setPreferences).toHaveBeenCalledWith({
        likes: ['한식'],
        dislikes: ['매운 음식'],
      });
    });

    it('should set isSavingPreferences true during save and false after', async () => {
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

    it('should reload preferences and reflect updated analysis after save', async () => {
      const updatedPreferences = createMockPreferences({ analysis: 'Updated analysis' });

      vi.mocked(userService.setPreferences).mockResolvedValue({
        preferences: mockPreferences,
      });
      vi.mocked(userService.getPreferences).mockResolvedValue({
        preferences: updatedPreferences,
      });

      const { result } = renderHook(
        () => usePreferences({ initialLikes: ['한식'], initialDislikes: [] }),
        { wrapper }
      );

      await act(async () => {
        await result.current.handleSavePreferences();
      });

      await waitFor(() => {
        expect(result.current.analysis).toBe('Updated analysis');
      });
    });

    it.each([
      {
        label: 'server error with response body',
        error: { response: { data: { message: 'Server error occurred' } } },
      },
      {
        label: 'network error without response',
        error: new Error('Network error'),
      },
    ])('should return false and reset saving state on $label', async ({ error }) => {
      vi.mocked(userService.setPreferences).mockRejectedValue(error);

      const { result } = renderHook(() => usePreferences(), { wrapper });

      let saveResult = true;
      await act(async () => {
        saveResult = await result.current.handleSavePreferences();
      });

      expect(saveResult).toBe(false);
      expect(result.current.isSavingPreferences).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  describe('resetPreferencesModal', () => {
    it('should clear newLike and newDislike inputs', () => {
      const { result } = renderHook(() => usePreferences(), { wrapper });

      act(() => {
        result.current.setNewLike('한식');
        result.current.setNewDislike('매운 음식');
      });
      act(() => {
        result.current.resetPreferencesModal();
      });

      expect(result.current.newLike).toBe('');
      expect(result.current.newDislike).toBe('');
    });
  });

  // -------------------------------------------------------------------------
  describe('State setters', () => {
    it('should allow direct state manipulation for all list and input states', () => {
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

  // -------------------------------------------------------------------------
  describe('Empty preferences handling from server', () => {
    it.each([
      {
        label: 'empty likes array',
        serverData: { likes: [], dislikes: ['매운 음식'], analysis: null },
        expectLikes: [] as string[],
        expectDislikes: ['매운 음식'],
        expectAnalysis: null as string | null,
      },
      {
        label: 'empty dislikes array',
        serverData: { likes: ['한식'], dislikes: [], analysis: null },
        expectLikes: ['한식'],
        expectDislikes: [] as string[],
        expectAnalysis: null as string | null,
      },
      {
        label: 'null analysis',
        serverData: { likes: ['한식'], dislikes: ['매운 음식'], analysis: null },
        expectLikes: ['한식'],
        expectDislikes: ['매운 음식'],
        expectAnalysis: null as string | null,
      },
    ])(
      'should handle $label',
      async ({ serverData, expectLikes, expectDislikes, expectAnalysis }) => {
        vi.mocked(userService.getPreferences).mockResolvedValue({
          preferences: {
            id: 1,
            userId: 1,
            ...serverData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
        const { result } = renderHook(() => usePreferences(), { wrapper });

        await act(async () => {
          await result.current.loadPreferences();
        });

        expect(result.current.likes).toEqual(expectLikes);
        expect(result.current.dislikes).toEqual(expectDislikes);
        expect(result.current.analysis).toBe(expectAnalysis);
      }
    );
  });

  // -------------------------------------------------------------------------
  describe('Initial values update behavior', () => {
    it.each([
      { label: 'initialLikes', propKey: 'initialLikes', resultKey: 'likes', defaultValue: [] as unknown },
      { label: 'initialDislikes', propKey: 'initialDislikes', resultKey: 'dislikes', defaultValue: [] as unknown },
      { label: 'initialAnalysis', propKey: 'initialAnalysis', resultKey: 'analysis', defaultValue: null as unknown },
    ])(
      'should not update $label when value remains undefined',
      ({ propKey, resultKey, defaultValue }) => {
        const { result, rerender } = renderHook(
          (props: Record<string, unknown>) => usePreferences(props),
          { wrapper, initialProps: { [propKey]: undefined } }
        );

        expect(result.current[resultKey as keyof UsePreferencesResult]).toEqual(defaultValue);

        rerender({ [propKey]: undefined });

        expect(result.current[resultKey as keyof UsePreferencesResult]).toEqual(defaultValue);
      }
    );

    it('should update likes and dislikes when initial arrays change', async () => {
      const { result: likesResult, rerender: rerenderLikes } = renderHook(
        ({ initialLikes }) => usePreferences({ initialLikes }),
        { wrapper, initialProps: { initialLikes: ['한식'] } }
      );
      rerenderLikes({ initialLikes: ['한식', '중식'] });
      await waitFor(() => {
        expect(likesResult.current.likes).toEqual(['한식', '중식']);
      });

      const { result: dislikesResult, rerender: rerenderDislikes } = renderHook(
        ({ initialDislikes }) => usePreferences({ initialDislikes }),
        { wrapper, initialProps: { initialDislikes: ['매운 음식'] } }
      );
      rerenderDislikes({ initialDislikes: ['매운 음식', '생선'] });
      await waitFor(() => {
        expect(dislikesResult.current.dislikes).toEqual(['매운 음식', '생선']);
      });
    });

    it('should update analysis when value changes between string and null', async () => {
      const { result, rerender } = renderHook(
        ({ initialAnalysis }) => usePreferences({ initialAnalysis }),
        { wrapper, initialProps: { initialAnalysis: '분석 내용' as string | null } }
      );

      expect(result.current.analysis).toBe('분석 내용');

      rerender({ initialAnalysis: null });
      await waitFor(() => {
        expect(result.current.analysis).toBeNull();
      });

      rerender({ initialAnalysis: '새로운 분석' });
      await waitFor(() => {
        expect(result.current.analysis).toBe('새로운 분석');
      });
    });
  });
});
