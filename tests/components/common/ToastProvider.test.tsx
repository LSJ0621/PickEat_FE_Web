import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, act } from '@testing-library/react';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { ToastProvider } from '@shared/components/ToastProvider';
import { useToast } from '@shared/hooks/useToast';

// Test component that uses the toast context
function TestComponent() {
  const toast = useToast();

  return (
    <div>
      <button onClick={() => toast.success('Success message')}>Show Success</button>
      <button onClick={() => toast.error('Error message')}>Show Error</button>
      <button onClick={() => toast.warning('Warning message')}>Show Warning</button>
      <button onClick={() => toast.info('Info message')}>Show Info</button>
      <button onClick={() => toast.toast('Custom message', 'success', 5000)}>
        Show Custom
      </button>
    </div>
  );
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Provider Setup', () => {
    it('should render children without error', () => {
      renderWithProviders(
        <ToastProvider>
          <div>Test child</div>
        </ToastProvider>
      );
      expect(screen.getByText('Test child')).toBeInTheDocument();
    });

    it('should provide toast context to children', () => {
      renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      expect(screen.getByText('Show Success')).toBeInTheDocument();
    });
  });

  describe('Toast Methods', () => {
    it('should show success toast when success method is called', async () => {
      renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const button = screen.getByText('Show Success');
      await act(async () => {
        button.click();
        await vi.advanceTimersByTimeAsync(10);
      });

      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    it('should show error toast when error method is called', async () => {
      renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const button = screen.getByText('Show Error');
      await act(async () => {
        button.click();
        await vi.advanceTimersByTimeAsync(10);
      });

      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('should show warning toast when warning method is called', async () => {
      renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const button = screen.getByText('Show Warning');
      await act(async () => {
        button.click();
        await vi.advanceTimersByTimeAsync(10);
      });

      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });

    it('should show info toast when info method is called', async () => {
      renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const button = screen.getByText('Show Info');
      await act(async () => {
        button.click();
        await vi.advanceTimersByTimeAsync(10);
      });

      expect(screen.getByText('Info message')).toBeInTheDocument();
    });

    it('should show toast with custom type and duration', async () => {
      renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const button = screen.getByText('Show Custom');
      await act(async () => {
        button.click();
        await vi.advanceTimersByTimeAsync(10);
      });

      expect(screen.getByText('Custom message')).toBeInTheDocument();
    });
  });

  describe('Multiple Toasts', () => {
    it('should show multiple toasts simultaneously', async () => {
      renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await act(async () => {
        screen.getByText('Show Success').click();
        screen.getByText('Show Error').click();
        await vi.advanceTimersByTimeAsync(10);
      });

      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('should remove toasts independently', async () => {
      renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await act(async () => {
        screen.getByText('Show Success').click();
        await vi.advanceTimersByTimeAsync(10);
      });

      expect(screen.getByText('Success message')).toBeInTheDocument();

      // Wait for first toast to auto-close
      await act(async () => {
        await vi.advanceTimersByTimeAsync(3000 + 300);
      });

      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });

    it('should handle adding toasts while others are closing', async () => {
      renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await act(async () => {
        screen.getByText('Show Success').click();
        await vi.advanceTimersByTimeAsync(10);
      });

      expect(screen.getByText('Success message')).toBeInTheDocument();

      // Add another toast while first is still visible
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
        screen.getByText('Show Error').click();
        await vi.advanceTimersByTimeAsync(10);
      });

      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('Toast Removal', () => {
    it('should remove toast when close button is clicked', async () => {
      renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await act(async () => {
        screen.getByText('Show Success').click();
        await vi.advanceTimersByTimeAsync(10);
      });

      expect(screen.getByText('Success message')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: '닫기' });
      await act(async () => {
        closeButton.click();
        await vi.advanceTimersByTimeAsync(300);
      });

      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });

    it('should auto-remove toast after duration', async () => {
      renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await act(async () => {
        screen.getByText('Show Success').click();
        await vi.advanceTimersByTimeAsync(10);
      });

      expect(screen.getByText('Success message')).toBeInTheDocument();

      // Wait for auto-close duration + animation
      await act(async () => {
        await vi.advanceTimersByTimeAsync(3000 + 300);
      });

      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });
  });

  describe('Context Value Stability', () => {
    it('should memoize context value to prevent unnecessary re-renders', async () => {
      const renderSpy = vi.fn();

      function SpyComponent() {
        const toast = useToast();
        renderSpy();
        return (
          <button onClick={() => toast.success('Test')}>
            Show Toast
          </button>
        );
      }

      renderWithProviders(
        <ToastProvider>
          <SpyComponent />
        </ToastProvider>
      );

      const initialRenderCount = renderSpy.mock.calls.length;

      // Show a toast
      await act(async () => {
        screen.getByText('Show Toast').click();
        await vi.advanceTimersByTimeAsync(10);
      });

      // Component should not re-render due to memoized context value
      expect(renderSpy).toHaveBeenCalledTimes(initialRenderCount);
    });
  });

  describe('Toast ID Generation', () => {
    it('should generate unique IDs for each toast', async () => {
      renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await act(async () => {
        screen.getByText('Show Success').click();
        screen.getByText('Show Error').click();
        await vi.advanceTimersByTimeAsync(10);
      });

      const toasts = screen.getAllByRole('button', { name: '닫기' });
      expect(toasts).toHaveLength(2);
    });
  });

  describe('Custom Duration', () => {
    it('should respect custom duration passed to toast method', async () => {
      renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await act(async () => {
        screen.getByText('Show Custom').click();
        await vi.advanceTimersByTimeAsync(10);
      });

      expect(screen.getByText('Custom message')).toBeInTheDocument();

      // Should still be visible before 5000ms
      await act(async () => {
        await vi.advanceTimersByTimeAsync(4000);
      });
      expect(screen.getByText('Custom message')).toBeInTheDocument();

      // Should be removed after 5000ms + animation
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000 + 300);
      });

      expect(screen.queryByText('Custom message')).not.toBeInTheDocument();
    });

    it('should respect custom duration passed to helper methods', async () => {
      function CustomDurationComponent() {
        const toast = useToast();
        return (
          <button onClick={() => toast.success('Custom duration', 1000)}>
            Show Quick Toast
          </button>
        );
      }

      renderWithProviders(
        <ToastProvider>
          <CustomDurationComponent />
        </ToastProvider>
      );

      await act(async () => {
        screen.getByText('Show Quick Toast').click();
        await vi.advanceTimersByTimeAsync(10);
      });

      expect(screen.getByText('Custom duration')).toBeInTheDocument();

      // Should be removed after 1000ms + animation
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000 + 300);
      });

      expect(screen.queryByText('Custom duration')).not.toBeInTheDocument();
    });
  });

  describe('Toast Container Rendering', () => {
    it('should not render container when no toasts are present', () => {
      const { container } = renderWithProviders(
        <ToastProvider>
          <div>No toasts</div>
        </ToastProvider>
      );

      // ToastContainer returns null when toasts array is empty
      const toastContainer = container.querySelector('.fixed.bottom-4.right-4');
      expect(toastContainer).not.toBeInTheDocument();
    });

    it('should render container when toasts are present', async () => {
      const { container } = renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await act(async () => {
        screen.getByText('Show Success').click();
        await vi.advanceTimersByTimeAsync(10);
      });

      const toastContainer = container.querySelector('.fixed.bottom-4.right-4');
      expect(toastContainer).toBeInTheDocument();
    });
  });
});
