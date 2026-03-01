/**
 * User Data Cache Redux Slice
 * Provides cached state management for addresses and preferences with 5-minute stale time.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { UserAddress, Preferences } from '@features/user/types';
import { userService } from '@features/user/api';
import { CACHE_STALE_MS } from '@shared/utils/constants';
import { logoutAsync, initializeAuth } from '@app/store/slices/authSlice';
import { extractErrorMessage } from '@shared/utils/error';

interface UserDataState {
  addresses: {
    list: UserAddress[];
    defaultAddress: UserAddress | null;
    lastFetchedAt: number | null;
    isLoading: boolean;
    isDirty: boolean;
    error: string | null;
  };
  preferences: {
    data: Preferences | null;
    lastFetchedAt: number | null;
    isLoading: boolean;
    isDirty: boolean;
    error: string | null;
  };
}

const initialState: UserDataState = {
  addresses: {
    list: [],
    defaultAddress: null,
    lastFetchedAt: null,
    isLoading: false,
    isDirty: false,
    error: null,
  },
  preferences: {
    data: null,
    lastFetchedAt: null,
    isLoading: false,
    isDirty: false,
    error: null,
  },
};

// Check if cache is stale
const isCacheStale = (lastFetchedAt: number | null, isDirty: boolean): boolean => {
  if (isDirty) return true;
  if (!lastFetchedAt) return true;
  return Date.now() - lastFetchedAt > CACHE_STALE_MS;
};

// Fetch addresses from API (only if cache is stale)
export const fetchAddresses = createAsyncThunk(
  'userData/fetchAddresses',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { userData: UserDataState };
    const { addresses } = state.userData;

    // Skip API call if cache is fresh
    if (!isCacheStale(addresses.lastFetchedAt, addresses.isDirty)) {
      return null;
    }

    try {
      const addressesResponse = await userService.getAddresses();
      const list = addressesResponse.addresses;
      const defaultAddress = list.find((addr) => addr.isDefault) ?? null;

      return { list, defaultAddress };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, '주소를 불러오지 못했습니다'));
    }
  }
);

// Fetch preferences from API (only if cache is stale)
export const fetchPreferences = createAsyncThunk(
  'userData/fetchPreferences',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { userData: UserDataState };
    const { preferences } = state.userData;

    // Skip API call if cache is fresh
    if (!isCacheStale(preferences.lastFetchedAt, preferences.isDirty)) {
      return null;
    }

    try {
      const result = await userService.getPreferences();
      return result.preferences;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, '선호도를 불러오지 못했습니다'));
    }
  }
);

const userDataSlice = createSlice({
  name: 'userData',
  initialState,
  reducers: {
    // Mark addresses cache as dirty (needs refetch)
    invalidateAddresses: (state) => {
      state.addresses.isDirty = true;
    },
    // Mark preferences cache as dirty (needs refetch)
    invalidatePreferences: (state) => {
      state.preferences.isDirty = true;
    },
    // Directly set addresses (used after write operations)
    setAddresses: (state, action) => {
      state.addresses.list = action.payload.list;
      state.addresses.defaultAddress = action.payload.defaultAddress;
      state.addresses.lastFetchedAt = Date.now();
      state.addresses.isDirty = false;
    },
    // Directly set preferences (used after write operations)
    setPreferences: (state, action) => {
      state.preferences.data = action.payload;
      state.preferences.lastFetchedAt = Date.now();
      state.preferences.isDirty = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch addresses thunk
      .addCase(fetchAddresses.pending, (state) => {
        state.addresses.isLoading = true;
        state.addresses.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.addresses.isLoading = false;
        state.addresses.error = null;
        if (action.payload) {
          state.addresses.list = action.payload.list;
          state.addresses.defaultAddress = action.payload.defaultAddress;
          state.addresses.lastFetchedAt = Date.now();
          state.addresses.isDirty = false;
        }
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.addresses.isLoading = false;
        state.addresses.isDirty = true;
        state.addresses.error = action.payload as string;
      })
      // Fetch preferences thunk
      .addCase(fetchPreferences.pending, (state) => {
        state.preferences.isLoading = true;
        state.preferences.error = null;
      })
      .addCase(fetchPreferences.fulfilled, (state, action) => {
        state.preferences.isLoading = false;
        state.preferences.error = null;
        if (action.payload) {
          state.preferences.data = action.payload;
          state.preferences.lastFetchedAt = Date.now();
          state.preferences.isDirty = false;
        }
      })
      .addCase(fetchPreferences.rejected, (state, action) => {
        state.preferences.isLoading = false;
        state.preferences.isDirty = true;
        state.preferences.error = action.payload as string;
      })
      // Cache preferences from initializeAuth to prevent double-fetch on MyPage entry
      .addCase(initializeAuth.fulfilled, (state, action) => {
        const preferences = action.payload?.user?.preferences;
        if (preferences) {
          state.preferences.data = preferences;
          state.preferences.lastFetchedAt = Date.now();
          state.preferences.isDirty = false;
        }
      })
      // Reset all state on logout
      .addCase(logoutAsync.fulfilled, () => {
        return initialState;
      });
  },
});

export const { invalidateAddresses, invalidatePreferences, setAddresses, setPreferences } =
  userDataSlice.actions;

export default userDataSlice.reducer;
