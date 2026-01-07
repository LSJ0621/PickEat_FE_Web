/**
 * Redux Store 설정
 */

import { configureStore } from '@reduxjs/toolkit';
import agentReducer from './slices/agentSlice';
import authReducer from './slices/authSlice';
// import menuReducer from './slices/menuSlice';
// import cartReducer from './slices/cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    agent: agentReducer,
    // menu: menuReducer,
    // cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

