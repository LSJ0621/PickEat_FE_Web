/**
 * Typed Redux Hooks
 * TypeScript에서 타입 안전하게 Redux를 사용할 수 있게 해줍니다.
 */

import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// 타입이 지정된 useDispatch (react-redux 9.x 방식)
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

// 타입이 지정된 useSelector (react-redux 9.x 방식)
export const useAppSelector = useSelector.withTypes<RootState>();

