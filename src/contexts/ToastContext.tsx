/**
 * Toast Context
 * Toast 상태를 관리하는 Context
 */

import { createContext } from 'react';
import type { ToastType } from '@/components/common/Toast';

export interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
