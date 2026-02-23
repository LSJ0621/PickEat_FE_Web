/**
 * Toast Hook
 * Toast 메시지 표시를 위한 커스텀 훅
 */

import { useContext } from 'react';
import { ToastContext } from '@app/providers/ToastContext';

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
