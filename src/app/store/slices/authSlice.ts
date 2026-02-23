/**
 * 인증 Redux Slice
 */

import { authService } from '@features/auth/api';
import { userService } from '@features/user/api';
import { extractErrorMessage } from '@shared/utils/error';
import { decodeJwt } from '@shared/utils/jwt';
import { STORAGE_KEYS } from '@shared/utils/constants';
import type { User } from '@features/auth/types';
import type { Language } from '@shared/types/common';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { clearAgentState } from './agentSlice';
import i18n from '@/i18n/config';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  language: Language;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.TOKEN),
  loading: false,
  error: null,
  language: 'ko',
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
    // preferences는 그대로 유지 (null이거나 객체)
    preferences: user.preferences ?? null,
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

  // preferences는 그대로 유지 (null이거나 객체)
  if ('preferences' in normalized) {
    normalized.preferences = normalized.preferences ?? null;
  }

  return normalized;
};

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      return null;
    }

    // JWT 토큰에서 role 추출
    const decodedToken = decodeJwt(token);
    if (!decodedToken) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      return null;
    }

    try {
      const user = await authService.getMe();

      // 서버에서 preferences를 별도 API로 관리하므로, 초기화 시 한 번 더 불러와서 병합
      try {
        const prefsResponse = await userService.getPreferences();
        const mergedUser: User = {
          ...user,
          role: decodedToken.role,
          preferences: prefsResponse.preferences ?? user.preferences ?? null,
        };
        return { user: normalizeUser(mergedUser) };
      } catch {
        // 취향 정보 불러오기에 실패해도 로그인 자체는 유지
        const mergedUser: User = {
          ...user,
          role: decodedToken.role,
        };
        return { user: normalizeUser(mergedUser) };
      }
    } catch (error: unknown) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      return rejectWithValue(extractErrorMessage(error, '알 수 없는 오류가 발생했습니다.'));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      const decodedToken = decodeJwt(action.payload.token);
      const userWithRole: User = {
        ...action.payload.user,
        role: decodedToken?.role,
      };
      state.user = normalizeUser(userWithRole);
      state.isAuthenticated = true;
      localStorage.setItem(STORAGE_KEYS.TOKEN, action.payload.token);
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        const normalized = normalizeUserPartial(action.payload);
        state.user = { ...state.user, ...normalized };
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
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
          state.isAuthenticated = true;

          // 서버의 preferredLanguage와 동기화
          const serverLanguage = action.payload.user?.preferredLanguage;
          // 유효한 언어인지 검증 후 적용, 유효하지 않으면 기본값 사용
          if (serverLanguage && (serverLanguage === 'ko' || serverLanguage === 'en')) {
            state.language = serverLanguage;
            i18n.changeLanguage(serverLanguage);
            localStorage.setItem('i18nextLng', serverLanguage);
          } else if (serverLanguage) {
            // 유효하지 않은 언어가 전달된 경우 기본값으로 fallback
            const defaultLang = 'ko';
            state.language = defaultLang;
            i18n.changeLanguage(defaultLang);
            localStorage.setItem('i18nextLng', defaultLang);
          }
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
        state.loading = false;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = (action.payload as string) || '인증 정보 초기화 실패';
      });
  },
});

export const { setCredentials, logout, setLoading, setError, updateUser, setLanguage } = authSlice.actions;

export const logoutAsync = createAsyncThunk(
  'auth/logoutAsync',
  async (_, { dispatch }) => {
    try {
      await authService.logout();
    } catch {
      // 로그아웃 API 호출 실패는 무시 (로컬 상태는 정리됨)
    } finally {
      dispatch(logout());
      // 로그아웃 시 agent 상태도 초기화
      dispatch(clearAgentState());
    }
  }
);

export default authSlice.reducer;

