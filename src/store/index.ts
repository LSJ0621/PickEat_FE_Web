/**
 * Redux Store 설정
 */

import { configureStore } from '@reduxjs/toolkit';
import agentReducer from './slices/agentSlice';
import authReducer from './slices/authSlice';
import userDataReducer from './slices/userDataSlice';
// import menuReducer from './slices/menuSlice';
// import cartReducer from './slices/cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    agent: agentReducer,
    userData: userDataReducer,
    // menu: menuReducer,
    // cart: cartReducer,
  },
});

// client.ts와의 순환 의존성을 피하기 위해 store 생성 후 주입
import { injectStore } from '@/api/client';
injectStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

