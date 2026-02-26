/**
 * Toast Provider 컴포넌트
 * Toast 상태를 관리하고 ToastContainer를 렌더링
 */

import { useState, useCallback, useMemo, type ReactNode } from 'react';
import { ToastContainer, type Toast, type ToastType } from './Toast';
import { ToastContext, type ToastContextValue } from '@/contexts/ToastContext';

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = {
      id,
      message,
      type,
      duration,
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  // Memoize the context value to prevent infinite re-renders in consumers
  const value: ToastContextValue = useMemo(
    () => ({
      toast: addToast,
      success: (message, duration) => addToast(message, 'success', duration),
      error: (message, duration) => addToast(message, 'error', duration),
      warning: (message, duration) => addToast(message, 'warning', duration),
      info: (message, duration) => addToast(message, 'info', duration),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

