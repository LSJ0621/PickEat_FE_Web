import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { MenuSelectionModal } from '@/components/features/menu/MenuSelectionModal';
import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';

describe('MenuSelectionModal', () => {
  const mockOnClose = vi.fn();
  const mockOnComplete = vi.fn();

  const defaultProps = {
    open: true,
    recommendations: ['김치찌개', '불고기', '비빔밥'],
    historyId: 1,
    onClose: mockOnClose,
    onComplete: mockOnComplete,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Rendering', () => {
    it('should render modal when open', async () => {
      renderWithProviders(<MenuSelectionModal {...defaultProps} />);
      // Portal renders to document.body after animation frame
      await waitFor(() => {
        expect(document.body.querySelector('.fixed.inset-0.z-50')).toBeInTheDocument();
      });
      expect(screen.getByRole('heading', { name: '메뉴 선택하기' })).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      renderWithProviders(<MenuSelectionModal {...defaultProps} open={false} />);
      expect(document.body.querySelector('.fixed.inset-0.z-50')).not.toBeInTheDocument();
    });

    it('should render all menu recommendations', async () => {
      renderWithProviders(<MenuSelectionModal {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
      });
      expect(screen.getByText('불고기')).toBeInTheDocument();
      expect(screen.getByText('비빔밥')).toBeInTheDocument();
    });

    it('should render slot selection buttons', async () => {
      renderWithProviders(<MenuSelectionModal {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '아침' })).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: '점심' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '저녁' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '기타' })).toBeInTheDocument();
    });

    it('should render with lunch slot selected by default', async () => {
      renderWithProviders(<MenuSelectionModal {...defaultProps} />);
      await waitFor(() => {
        const lunchButton = screen.getByRole('button', { name: '점심' });
        expect(lunchButton).toHaveClass('bg-orange-500');
      });
    });

    it('should render close button', async () => {
      renderWithProviders(<MenuSelectionModal {...defaultProps} />);
      await waitFor(() => {
        const closeButton = document.body.querySelector('button[aria-label="닫기"]');
        expect(closeButton).toBeInTheDocument();
      });
    });
  });

  describe('Menu Selection', () => {
    it('should toggle menu selection when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MenuSelectionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
      });

      const menuButton = screen.getByText('김치찌개').closest('button');
      expect(menuButton).not.toHaveClass('border-orange-400/60');

      if (menuButton) {
        await user.click(menuButton);

        await waitFor(() => {
          expect(menuButton).toHaveClass('border-orange-400/60');
        });
      }
    });

    it('should deselect menu when clicked twice', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MenuSelectionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
      });

      const menuButton = screen.getByText('김치찌개').closest('button');
      expect(menuButton).toBeInTheDocument();

      await user.click(menuButton!);
      await waitFor(() => {
        expect(menuButton).toHaveClass('border-orange-400/60');
      });

      await user.click(menuButton!);
      await waitFor(() => {
        expect(menuButton).not.toHaveClass('border-orange-400/60');
      });
    });

    it('should allow multiple menu selection', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MenuSelectionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
      });

      const menu1 = screen.getByText('김치찌개').closest('button');
      const menu2 = screen.getByText('불고기').closest('button');

      expect(menu1).toBeInTheDocument();
      expect(menu2).toBeInTheDocument();
      await user.click(menu1!);
      await user.click(menu2!);

      await waitFor(() => {
        expect(menu1).toHaveClass('border-orange-400/60');
        expect(menu2).toHaveClass('border-orange-400/60');
      });
    });

    it('should show checkmark for selected menus', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MenuSelectionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
      });

      const menuButton = screen.getByText('김치찌개').closest('button');
      expect(menuButton).toBeInTheDocument();

      await user.click(menuButton!);

      await waitFor(() => {
        expect(screen.getByTestId('selected-indicator')).toBeInTheDocument();
      });
    });

    it('should update selection count in button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MenuSelectionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/선택 완료 \(0개\)/)).toBeInTheDocument();
      });

      const menu1 = screen.getByText('김치찌개').closest('button');
      expect(menu1).toBeInTheDocument();
      await user.click(menu1!);

      await waitFor(() => {
        expect(screen.getByText(/선택 완료 \(1개\)/)).toBeInTheDocument();
      });
    });
  });

  describe('Slot Selection', () => {
    it('should select breakfast slot', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MenuSelectionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '아침' })).toBeInTheDocument();
      });

      const breakfastButton = screen.getByRole('button', { name: '아침' });
      await user.click(breakfastButton);

      expect(breakfastButton).toHaveClass('bg-orange-500');
    });

    it('should select dinner slot', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MenuSelectionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '저녁' })).toBeInTheDocument();
      });

      const dinnerButton = screen.getByRole('button', { name: '저녁' });
      await user.click(dinnerButton);

      expect(dinnerButton).toHaveClass('bg-orange-500');
    });

    it('should select etc slot', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MenuSelectionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '기타' })).toBeInTheDocument();
      });

      const etcButton = screen.getByRole('button', { name: '기타' });
      await user.click(etcButton);

      expect(etcButton).toHaveClass('bg-orange-500');
    });

    it('should deselect previous slot when selecting new slot', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MenuSelectionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '점심' })).toBeInTheDocument();
      });

      const lunchButton = screen.getByRole('button', { name: '점심' });
      const dinnerButton = screen.getByRole('button', { name: '저녁' });

      expect(lunchButton).toHaveClass('bg-orange-500');

      await user.click(dinnerButton);

      expect(dinnerButton).toHaveClass('bg-orange-500');
      expect(lunchButton).not.toHaveClass('bg-orange-500');
    });
  });

  describe('Save Functionality', () => {
    it('should call API when save is clicked with selected menus', async () => {
      const user = userEvent.setup();
      let apiCalled = false;

      server.use(
        http.post('*/menu/selections', async () => {
          apiCalled = true;
          return HttpResponse.json({ success: true });
        })
      );

      renderWithProviders(<MenuSelectionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
      });

      const menuButton = screen.getByText('김치찌개').closest('button');
      if (menuButton) {
        await user.click(menuButton);
      }

      await waitFor(() => {
        expect(screen.getByText(/선택 완료 \(1개\)/)).toBeInTheDocument();
      });

      const saveButton = screen.getByText(/선택 완료/);
      await user.click(saveButton);

      await waitFor(() => {
        expect(apiCalled).toBe(true);
      });
    });

    it('should call onComplete after successful save', async () => {
      const user = userEvent.setup();

      server.use(
        http.post('*/menu/selections', () => {
          return HttpResponse.json({ success: true });
        })
      );

      renderWithProviders(<MenuSelectionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
      });

      const menuButton = screen.getByText('김치찌개').closest('button');
      if (menuButton) {
        await user.click(menuButton);
      }

      const saveButton = screen.getByText(/선택 완료/);
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });

    it('should call onClose after successful save', async () => {
      const user = userEvent.setup();

      server.use(
        http.post('*/menu/selections', () => {
          return HttpResponse.json({ success: true });
        })
      );

      renderWithProviders(<MenuSelectionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
      });

      const menuButton = screen.getByText('김치찌개').closest('button');
      if (menuButton) {
        await user.click(menuButton);
      }

      const saveButton = screen.getByText(/선택 완료/);
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should disable save button when no menus selected', async () => {
      renderWithProviders(<MenuSelectionModal {...defaultProps} />);

      await waitFor(() => {
        const saveButton = screen.getByText(/선택 완료 \(0개\)/);
        expect(saveButton).toBeDisabled();
      });
    });

    it('should enable save button when menus are selected', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MenuSelectionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
      });

      const menuButton = screen.getByText('김치찌개').closest('button');
      if (menuButton) {
        await user.click(menuButton);
      }

      await waitFor(() => {
        const saveButton = screen.getByText(/선택 완료 \(1개\)/);
        expect(saveButton).not.toBeDisabled();
      });
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MenuSelectionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: '취소' });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MenuSelectionModal {...defaultProps} />);

      await waitFor(() => {
        const closeButton = document.body.querySelector('button[aria-label="닫기"]');
        expect(closeButton).toBeInTheDocument();
      });

      const closeButton = document.body.querySelector('button[aria-label="닫기"]');
      if (closeButton) {
        await user.click(closeButton);
      }

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle API error gracefully', async () => {
      const user = userEvent.setup();

      server.use(
        http.post('*/menu/selections', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      renderWithProviders(<MenuSelectionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
      });

      const menuButton = screen.getByText('김치찌개').closest('button');
      if (menuButton) {
        await user.click(menuButton);
      }

      const saveButton = screen.getByText(/선택 완료/);
      await user.click(saveButton);

      // Modal should not close on error
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '메뉴 선택하기' })).toBeInTheDocument();
      });

      expect(mockOnComplete).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should show loading state during save', async () => {
      const user = userEvent.setup();

      server.use(
        http.post('*/menu/selections', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({ success: true });
        })
      );

      renderWithProviders(<MenuSelectionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
      });

      const menuButton = screen.getByText('김치찌개').closest('button');
      if (menuButton) {
        await user.click(menuButton);
      }

      const saveButton = screen.getByText(/선택 완료/);
      await user.click(saveButton);

      // Button should be disabled during save
      expect(saveButton).toBeDisabled();
    });
  });

  describe('Portal Rendering', () => {
    it('should render in document body', async () => {
      renderWithProviders(<MenuSelectionModal {...defaultProps} />);

      await waitFor(() => {
        const modalInBody = document.body.querySelector('.fixed.inset-0.z-50');
        expect(modalInBody).toBeInTheDocument();
      });
    });
  });

  describe('Scrollable Content', () => {
    it('should render menu list with scroll for many items', async () => {
      const manyRecommendations = Array.from({ length: 20 }, (_, i) => `메뉴${i + 1}`);
      renderWithProviders(
        <MenuSelectionModal {...defaultProps} recommendations={manyRecommendations} />
      );

      await waitFor(() => {
        const scrollContainer = document.body.querySelector('.max-h-96.overflow-y-auto');
        expect(scrollContainer).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', async () => {
      renderWithProviders(<MenuSelectionModal {...defaultProps} />);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MenuSelectionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
      });

      const menuButton = screen.getByText('김치찌개').closest('button');
      if (menuButton) {
        menuButton.focus();
        await user.keyboard('{Enter}');

        await waitFor(() => {
          expect(menuButton).toHaveClass('border-orange-400/60');
        });
      }
    });
  });

  describe('Animation', () => {
    it('should apply animation classes when opening', async () => {
      renderWithProviders(<MenuSelectionModal {...defaultProps} />);

      await waitFor(() => {
        const backdrop = document.body.querySelector('.modal-backdrop-enter');
        expect(backdrop).toBeInTheDocument();
      });
    });
  });
});
