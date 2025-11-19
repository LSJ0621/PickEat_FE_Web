/**
 * 인증 Redux Slice
 */

import { authService } from '@/api/services/auth';
import type { User } from '@/types/auth';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const getErrorMessage = (error: unknown) => {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data
  ) {
    return String(error.response.data.message);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
};

type CoordinateInput = number | string | null | undefined;

const normalizeCoordinate = (value: CoordinateInput): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const normalizeUser = (user: User | null): User | null => {
  if (!user) {
    return null;
  }

  return {
    ...user,
    address: user.address ?? null,
    latitude: normalizeCoordinate(user.latitude),
    longitude: normalizeCoordinate(user.longitude),
  };
};

const normalizeUserPartial = (user: Partial<User>): Partial<User> => {
  const normalized = { ...user };

  if ('address' in normalized) {
    normalized.address = normalized.address ?? null;
  }

  if ('latitude' in normalized) {
    normalized.latitude = normalizeCoordinate(normalized.latitude as CoordinateInput);
  }

  if ('longitude' in normalized) {
    normalized.longitude = normalizeCoordinate(normalized.longitude as CoordinateInput);
  }

  return normalized;
};

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    try {
      const user = await authService.getMe();
      return { user: normalizeUser(user), token };
    } catch (error: unknown) {
      localStorage.removeItem('token');
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = normalizeUser(action.payload.user);
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        const normalized = normalizeUserPartial(action.payload);
        state.user = { ...state.user, ...normalized };
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = normalizeUser(action.payload.user);
          state.token = action.payload.token;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
        state.loading = false;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = (action.payload as string) || '인증 정보 초기화 실패';
      });
  },
});

export const { setCredentials, logout, setLoading, setError, updateUser } = authSlice.actions;

export const logoutAsync = createAsyncThunk(
  'auth/logoutAsync',
  async (_, { dispatch }) => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error);
    } finally {
      dispatch(logout());
    }
  }
);

export default authSlice.reducer;

