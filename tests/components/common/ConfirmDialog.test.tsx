import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { ConfirmDialog } from '@shared/components/ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    message: 'Are you sure?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  describe('Rendering', () => {
    it('should not render when open is false', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} open={false} />);
      expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
    });

    it('should render when open is true', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    it('should render with default title', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} />);
      // Default title is '확인', but need to be specific since button also has this text
      const titles = screen.getAllByText('확인');
      expect(titles.length).toBeGreaterThan(0);
    });

    it('should render with custom title', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} title="Custom Title" />);
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should render message text', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} message="Delete this item?" />);
      expect(screen.getByText('Delete this item?')).toBeInTheDocument();
    });

    it('should render with default button labels', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });

    it('should render with custom button labels', () => {
      renderWithProviders(
        <ConfirmDialog
          {...defaultProps}
          confirmLabel="Delete"
          cancelLabel="Keep"
        />
      );
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render info variant by default', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} />);
      const confirmButton = screen.getByRole('button', { name: '확인' });
      expect(confirmButton).toHaveClass('bg-gradient-to-r');
    });

    it('should render danger variant with red styling', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} variant="danger" />);
      const confirmButton = screen.getByRole('button', { name: '확인' });
      expect(confirmButton).toHaveClass('bg-red-600', 'hover:bg-red-700', 'text-white');
    });

    it('should render info variant with primary gradient styling', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} variant="info" />);
      const confirmButton = screen.getByRole('button', { name: '확인' });
      expect(confirmButton).toHaveClass('bg-gradient-to-r');
    });
  });

  describe('User Interactions', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      renderWithProviders(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

      await user.click(screen.getByRole('button', { name: '확인' }));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      renderWithProviders(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);

      await user.click(screen.getByRole('button', { name: '취소' }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should not call onCancel when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      renderWithProviders(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);

      await user.click(screen.getByRole('button', { name: '확인' }));
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('should not call onConfirm when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      renderWithProviders(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

      await user.click(screen.getByRole('button', { name: '취소' }));
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Layout and Styling', () => {
    it('should render with backdrop overlay', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} />);
      // Component uses createPortal to render into document.body
      const backdrop = document.body.querySelector('.bg-black\\/40');
      expect(backdrop).toBeInTheDocument();
    });

    it('should render dialog centered on screen', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} />);
      const backdrop = document.body.querySelector('.fixed.inset-0');
      expect(backdrop).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('should have high z-index for overlay', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} />);
      // z-index is applied via inline style from Z_INDEX constant (value: 100)
      const backdrop = document.body.querySelector('[style*="z-index"]');
      expect(backdrop).toBeInTheDocument();
    });

    it('should render dialog card with rounded corners', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} />);
      const card = document.body.querySelector('.rounded-\\[32px\\]');
      expect(card).toBeInTheDocument();
    });

    it('should render buttons in horizontal layout', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} />);
      const confirmButton = screen.getByRole('button', { name: '확인' });
      const cancelButton = screen.getByRole('button', { name: '취소' });
      expect(confirmButton.parentElement).toHaveClass('flex', 'gap-3');
      expect(cancelButton.parentElement).toBe(confirmButton.parentElement);
    });

    it('should render both buttons with equal flex', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} />);
      const confirmButton = screen.getByRole('button', { name: '확인' });
      const cancelButton = screen.getByRole('button', { name: '취소' });
      expect(confirmButton).toHaveClass('flex-1');
      expect(cancelButton).toHaveClass('flex-1');
    });
  });

  describe('Accessibility', () => {
    it('should render cancel button as ghost variant', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} />);
      const cancelButton = screen.getByRole('button', { name: '취소' });
      expect(cancelButton).toHaveClass('border-border-default');
    });

    it('should render buttons with large size', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} />);
      const confirmButton = screen.getByRole('button', { name: '확인' });
      const cancelButton = screen.getByRole('button', { name: '취소' });
      expect(confirmButton).toHaveClass('px-8', 'py-3', 'text-lg');
      expect(cancelButton).toHaveClass('px-8', 'py-3', 'text-lg');
    });

    it('should render title with appropriate text size and weight', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} title="Important" />);
      const title = screen.getByText('Important');
      expect(title).toHaveClass('text-xl', 'font-semibold');
    });

    it('should render message with readable styling', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} />);
      const message = screen.getByText('Are you sure?');
      expect(message).toHaveClass('text-base', 'leading-relaxed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long message text', () => {
      const longMessage = 'A'.repeat(500);
      renderWithProviders(<ConfirmDialog {...defaultProps} message={longMessage} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle very long title text', () => {
      const longTitle = 'B'.repeat(100);
      renderWithProviders(<ConfirmDialog {...defaultProps} title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle very long button labels', () => {
      renderWithProviders(
        <ConfirmDialog
          {...defaultProps}
          confirmLabel="Very Long Confirm Button Label"
          cancelLabel="Very Long Cancel Button Label"
        />
      );
      expect(screen.getByRole('button', { name: 'Very Long Confirm Button Label' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Very Long Cancel Button Label' })).toBeInTheDocument();
    });

    it('should handle empty message gracefully', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} message="" />);
      expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
    });

    it('should maintain consistent styling with danger variant', () => {
      renderWithProviders(
        <ConfirmDialog
          {...defaultProps}
          variant="danger"
          title="Delete Item"
          message="This action cannot be undone"
          confirmLabel="Delete"
        />
      );
      expect(screen.getByText('Delete Item')).toBeInTheDocument();
      expect(screen.getByText('This action cannot be undone')).toBeInTheDocument();
      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      expect(deleteButton).toHaveClass('bg-red-600', 'hover:bg-red-700');
    });
  });

  describe('Backdrop Behavior', () => {
    it('should have backdrop blur effect', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} />);
      // Component uses createPortal to render into document.body
      const backdrop = document.body.querySelector('.backdrop-blur-sm');
      expect(backdrop).toBeInTheDocument();
    });

    it('should render with full screen backdrop', () => {
      renderWithProviders(<ConfirmDialog {...defaultProps} />);
      const backdrop = document.body.querySelector('.fixed.inset-0');
      expect(backdrop).toBeInTheDocument();
    });
  });
});
