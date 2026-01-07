import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useToast } from '@/hooks/common/useToast';
import { ToastContext } from '@/contexts/ToastContext';
import type { ReactNode } from 'react';

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error when used outside ToastProvider', () => {
    expect(() => {
      renderHook(() => useToast());
    }).toThrow('useToast must be used within ToastProvider');
  });

  it('should return context when used within ToastProvider', () => {
    const mockToastContext = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ToastContext.Provider value={mockToastContext}>
        {children}
      </ToastContext.Provider>
    );

    const { result } = renderHook(() => useToast(), { wrapper });

    expect(result.current).toBe(mockToastContext);
  });
});
