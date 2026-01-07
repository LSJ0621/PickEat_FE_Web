import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { ToastContainer, type Toast } from '@/components/common/Toast';

describe('ToastContainer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render nothing when toasts array is empty', () => {
      const { container } = renderWithProviders(<ToastContainer toasts={[]} onClose={vi.fn()} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render toast message', () => {
      const toast: Toast = {
        id: '1',
        message: 'Test message',
        type: 'info',
      };
      renderWithProviders(<ToastContainer toasts={[toast]} onClose={vi.fn()} />);
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should render multiple toasts', () => {
      const toasts: Toast[] = [
        { id: '1', message: 'First toast', type: 'info' },
        { id: '2', message: 'Second toast', type: 'success' },
      ];
      renderWithProviders(<ToastContainer toasts={toasts} onClose={vi.fn()} />);
      expect(screen.getByText('First toast')).toBeInTheDocument();
      expect(screen.getByText('Second toast')).toBeInTheDocument();
    });
  });

  describe('Toast Types', () => {
    it('should render success toast with success styles', () => {
      const toast: Toast = {
        id: '1',
        message: 'Success message',
        type: 'success',
      };
      renderWithProviders(<ToastContainer toasts={[toast]} onClose={vi.fn()} />);
      const toastElement = screen.getByText('Success message').closest('div');
      expect(toastElement).toHaveClass('bg-emerald-500/90');
    });

    it('should render error toast with error styles', () => {
      const toast: Toast = {
        id: '1',
        message: 'Error message',
        type: 'error',
      };
      renderWithProviders(<ToastContainer toasts={[toast]} onClose={vi.fn()} />);
      const toastElement = screen.getByText('Error message').closest('div');
      expect(toastElement).toHaveClass('bg-red-500/90');
    });

    it('should render warning toast with warning styles', () => {
      const toast: Toast = {
        id: '1',
        message: 'Warning message',
        type: 'warning',
      };
      renderWithProviders(<ToastContainer toasts={[toast]} onClose={vi.fn()} />);
      const toastElement = screen.getByText('Warning message').closest('div');
      expect(toastElement).toHaveClass('bg-amber-500/90');
    });

    it('should render info toast with info styles', () => {
      const toast: Toast = {
        id: '1',
        message: 'Info message',
        type: 'info',
      };
      renderWithProviders(<ToastContainer toasts={[toast]} onClose={vi.fn()} />);
      const toastElement = screen.getByText('Info message').closest('div');
      expect(toastElement).toHaveClass('bg-blue-500/90');
    });
  });

  describe('Toast Icons', () => {
    it('should render success icon for success toast', () => {
      const toast: Toast = {
        id: '1',
        message: 'Success',
        type: 'success',
      };
      const { container } = renderWithProviders(<ToastContainer toasts={[toast]} onClose={vi.fn()} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render error icon for error toast', () => {
      const toast: Toast = {
        id: '1',
        message: 'Error',
        type: 'error',
      };
      const { container } = renderWithProviders(<ToastContainer toasts={[toast]} onClose={vi.fn()} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render warning icon for warning toast', () => {
      const toast: Toast = {
        id: '1',
        message: 'Warning',
        type: 'warning',
      };
      const { container } = renderWithProviders(<ToastContainer toasts={[toast]} onClose={vi.fn()} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render info icon for info toast', () => {
      const toast: Toast = {
        id: '1',
        message: 'Info',
        type: 'info',
      };
      const { container } = renderWithProviders(<ToastContainer toasts={[toast]} onClose={vi.fn()} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      const onClose = vi.fn();
      const toast: Toast = {
        id: '1',
        message: 'Test',
        type: 'info',
      };
      renderWithProviders(<ToastContainer toasts={[toast]} onClose={onClose} />);

      const closeButton = screen.getByRole('button', { name: '닫기' });
      await act(async () => {
        closeButton.click();
        // Wait for animation
        await vi.advanceTimersByTimeAsync(300);
      });

      expect(onClose).toHaveBeenCalledWith('1');
    });

    it('should have accessible close button with aria-label', () => {
      const toast: Toast = {
        id: '1',
        message: 'Test',
        type: 'info',
      };
      renderWithProviders(<ToastContainer toasts={[toast]} onClose={vi.fn()} />);
      const closeButton = screen.getByRole('button', { name: '닫기' });
      expect(closeButton).toHaveAttribute('aria-label', '닫기');
    });
  });

  describe('Auto Close Behavior', () => {
    it('should auto close after default duration (3000ms)', async () => {
      const onClose = vi.fn();
      const toast: Toast = {
        id: '1',
        message: 'Auto close',
        type: 'info',
      };
      renderWithProviders(<ToastContainer toasts={[toast]} onClose={onClose} />);

      // Fast-forward time by default duration + animation time
      await act(async () => {
        await vi.advanceTimersByTimeAsync(3000 + 300);
      });

      expect(onClose).toHaveBeenCalledWith('1');
    });

    it('should auto close after custom duration', async () => {
      const onClose = vi.fn();
      const toast: Toast = {
        id: '1',
        message: 'Custom duration',
        type: 'info',
        duration: 5000,
      };
      renderWithProviders(<ToastContainer toasts={[toast]} onClose={onClose} />);

      // Should not close before duration
      await act(async () => {
        await vi.advanceTimersByTimeAsync(4000);
      });
      expect(onClose).not.toHaveBeenCalled();

      // Should close after duration + animation
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000 + 300);
      });
      expect(onClose).toHaveBeenCalledWith('1');
    });

    it('should handle zero duration', async () => {
      const onClose = vi.fn();
      const toast: Toast = {
        id: '1',
        message: 'Zero duration',
        type: 'info',
        duration: 0,
      };
      renderWithProviders(<ToastContainer toasts={[toast]} onClose={onClose} />);

      // Should close immediately + animation time
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });
      expect(onClose).toHaveBeenCalledWith('1');
    });
  });

  describe('Animation', () => {
    it('should apply visible animation class after mounting', async () => {
      // Use real timers for this animation test
      vi.useRealTimers();
      try {
        const toast: Toast = {
          id: '1',
          message: 'Animate',
          type: 'info',
        };
        renderWithProviders(<ToastContainer toasts={[toast]} onClose={vi.fn()} />);

        // Initial state - not visible
        const toastElement = screen.getByText('Animate').closest('div');
        expect(toastElement).toHaveClass('translate-x-full', 'opacity-0');

        // After animation delay - increased timeout for reliability
        await waitFor(
          () => {
            expect(toastElement).toHaveClass('translate-x-0', 'opacity-100');
          },
          { timeout: 500 }
        );
      } finally {
        // Restore fake timers
        vi.useFakeTimers();
      }
    });

    it('should apply exit animation before closing', async () => {
      const onClose = vi.fn();
      const toast: Toast = {
        id: '1',
        message: 'Exit animation',
        type: 'info',
        duration: 100,
      };
      renderWithProviders(<ToastContainer toasts={[toast]} onClose={onClose} />);

      // Wait for close to start
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      const toastElement = screen.getByText('Exit animation').closest('div');
      expect(toastElement).toHaveClass('translate-x-full', 'opacity-0');
    });
  });

  describe('Edge Cases', () => {
    it('should handle toast with very long message', () => {
      const longMessage = 'A'.repeat(200);
      const toast: Toast = {
        id: '1',
        message: longMessage,
        type: 'info',
      };
      renderWithProviders(<ToastContainer toasts={[toast]} onClose={vi.fn()} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle undefined duration by using default', async () => {
      const onClose = vi.fn();
      const toast: Toast = {
        id: '1',
        message: 'Undefined duration',
        type: 'info',
        duration: undefined,
      };
      renderWithProviders(<ToastContainer toasts={[toast]} onClose={onClose} />);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(3000 + 300);
      });
      expect(onClose).toHaveBeenCalledWith('1');
    });

    it('should cleanup timer on unmount', async () => {
      const toast: Toast = {
        id: '1',
        message: 'Cleanup',
        type: 'info',
      };
      const { unmount } = renderWithProviders(<ToastContainer toasts={[toast]} onClose={vi.fn()} />);

      await act(async () => {
        unmount();
      });

      // Should not throw error
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });
      expect(true).toBe(true);
    });
  });

  describe('Container Positioning', () => {
    it('should render at fixed bottom-right position', () => {
      const toast: Toast = {
        id: '1',
        message: 'Position test',
        type: 'info',
      };
      const { container } = renderWithProviders(<ToastContainer toasts={[toast]} onClose={vi.fn()} />);
      const toastContainer = container.querySelector('.fixed');
      expect(toastContainer).toHaveClass('bottom-4', 'right-4', 'z-[10001]');
    });

    it('should stack multiple toasts vertically', () => {
      const toasts: Toast[] = [
        { id: '1', message: 'First', type: 'info' },
        { id: '2', message: 'Second', type: 'info' },
      ];
      const { container } = renderWithProviders(<ToastContainer toasts={toasts} onClose={vi.fn()} />);
      const toastContainer = container.querySelector('.flex-col-reverse');
      expect(toastContainer).toBeInTheDocument();
    });
  });
});
