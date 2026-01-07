import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { MenuSelectionEditModal } from '@/components/features/menu/MenuSelectionEditModal';
import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';

describe('MenuSelectionEditModal', () => {
  const mockOnClose = vi.fn();
  const mockOnComplete = vi.fn();

  const defaultProps = {
    open: true,
    selectionId: 1,
    currentMenuNames: ['김치찌개', '불고기'],
    historyId: 1,
    slot: 'lunch' as const,
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
      server.use(
        http.get('*/menu/recommendations/1', () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: 'test',
              reason: 'test reason',
              recommendedAt: new Date().toISOString(),
              requestAddress: null,
              hasPlaceRecommendations: true,
            },
            places: [
              { menuName: '김치찌개', placeId: 'place1', name: 'Restaurant 1', reason: 'test' },
            ],
          });
        })
      );

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(document.body.querySelector('.fixed.inset-0.z-50')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '메뉴 수정하기' })).toBeInTheDocument();
      });
    });

    it('should not render when closed', () => {
      renderWithProviders(<MenuSelectionEditModal {...defaultProps} open={false} />);
      expect(document.body.querySelector('.fixed.inset-0.z-50')).not.toBeInTheDocument();
    });

    it('should show loading state while fetching menus', () => {
      server.use(
        http.get('*/menu/recommendations/1', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: 'test',
              reason: 'test',
              recommendedAt: new Date().toISOString(),
              requestAddress: null,
              hasPlaceRecommendations: true,
            },
            places: [],
          });
        })
      );

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should render close button', async () => {
      server.use(
        http.get('*/menu/recommendations/1', () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: 'test',
              reason: 'test',
              recommendedAt: new Date().toISOString(),
              requestAddress: null,
              hasPlaceRecommendations: true,
            },
            places: [],
          });
        })
      );

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => {
        const closeButton = document.body.querySelector('button[aria-label="닫기"]');
        expect(closeButton).toBeInTheDocument();
      });
    });
  });

  describe('Menu Loading', () => {
    it('should load menus from history when historyId is provided', async () => {
      server.use(
        http.get('*/menu/recommendations/1', () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: 'test',
              reason: 'test',
              recommendedAt: new Date().toISOString(),
              requestAddress: null,
              hasPlaceRecommendations: true,
            },
            places: [
              { menuName: '김치찌개', placeId: 'place1', name: 'Restaurant 1', reason: 'test' },
              { menuName: '불고기', placeId: 'place2', name: 'Restaurant 2', reason: 'test' },
              { menuName: '비빔밥', placeId: 'place3', name: 'Restaurant 3', reason: 'test' },
            ],
          });
        })
      );

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
        expect(screen.getByText('불고기')).toBeInTheDocument();
        expect(screen.getByText('비빔밥')).toBeInTheDocument();
      });
    });

    it('should use current menu names when API fails', async () => {
      server.use(
        http.get('*/menu/recommendations/1', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
        expect(screen.getByText('불고기')).toBeInTheDocument();
      });
    });

    it('should use current menu names when historyId is null', () => {
      renderWithProviders(<MenuSelectionEditModal {...defaultProps} historyId={null} />);

      // Component should not make API call and use current menus
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should pre-select current menus', async () => {
      server.use(
        http.get('*/menu/recommendations/1', () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: 'test',
              reason: 'test',
              recommendedAt: new Date().toISOString(),
              requestAddress: null,
              hasPlaceRecommendations: true,
            },
            places: [
              { menuName: '김치찌개', placeId: 'place1', name: 'Restaurant 1', reason: 'test' },
              { menuName: '불고기', placeId: 'place2', name: 'Restaurant 2', reason: 'test' },
            ],
          });
        })
      );

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => {
        const menu1Button = screen.getByText('김치찌개').closest('button');
        const menu2Button = screen.getByText('불고기').closest('button');
        expect(menu1Button).toHaveClass('border-orange-400/60');
        expect(menu2Button).toHaveClass('border-orange-400/60');
      });
    });
  });

  describe('Menu Selection', () => {
    it('should toggle menu selection when clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get('*/menu/recommendations/1', () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: 'test',
              reason: 'test',
              recommendedAt: new Date().toISOString(),
              requestAddress: null,
              hasPlaceRecommendations: true,
            },
            places: [
              { menuName: '김치찌개', placeId: 'place1', name: 'Restaurant 1', reason: 'test' },
              { menuName: '불고기', placeId: 'place2', name: 'Restaurant 2', reason: 'test' },
              { menuName: '비빔밥', placeId: 'place3', name: 'Restaurant 3', reason: 'test' },
            ],
          });
        })
      );

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('비빔밥')).toBeInTheDocument();
      });

      const menuButton = screen.getByText('비빔밥').closest('button');
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).not.toHaveClass('border-orange-400/60');
      await user.click(menuButton!);

      await waitFor(() => {
        expect(menuButton).toHaveClass('border-orange-400/60');
      });
    });

    it('should deselect menu when clicked twice', async () => {
      const user = userEvent.setup();

      server.use(
        http.get('*/menu/recommendations/1', () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: 'test',
              reason: 'test',
              recommendedAt: new Date().toISOString(),
              requestAddress: null,
              hasPlaceRecommendations: true,
            },
            places: [
              { menuName: '김치찌개', placeId: 'place1', name: 'Restaurant 1', reason: 'test' },
            ],
          });
        })
      );

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
      });

      const menuButton = screen.getByText('김치찌개').closest('button');
      expect(menuButton).toBeInTheDocument();

      // Initially selected
      expect(menuButton).toHaveClass('border-orange-400/60');

      // Deselect
      await user.click(menuButton!);
      await waitFor(() => {
        expect(menuButton).not.toHaveClass('border-orange-400/60');
      });
    });

    it('should show checkmark for selected menus', async () => {
      server.use(
        http.get('*/menu/recommendations/1', () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: 'test',
              reason: 'test',
              recommendedAt: new Date().toISOString(),
              requestAddress: null,
              hasPlaceRecommendations: true,
            },
            places: [
              { menuName: '김치찌개', placeId: 'place1', name: 'Restaurant 1', reason: 'test' },
            ],
          });
        })
      );

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('selected-indicator')).toBeInTheDocument();
      });
    });

    it('should update selection count in button', async () => {
      const user = userEvent.setup();

      server.use(
        http.get('*/menu/recommendations/1', () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: 'test',
              reason: 'test',
              recommendedAt: new Date().toISOString(),
              requestAddress: null,
              hasPlaceRecommendations: true,
            },
            places: [
              { menuName: '김치찌개', placeId: 'place1', name: 'Restaurant 1', reason: 'test' },
              { menuName: '불고기', placeId: 'place2', name: 'Restaurant 2', reason: 'test' },
            ],
          });
        })
      );

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/수정 완료 \(2개\)/)).toBeInTheDocument();
      });

      const menuButton = screen.getByText('김치찌개').closest('button');
      expect(menuButton).toBeInTheDocument();
      await user.click(menuButton!);

      await waitFor(() => {
        expect(screen.getByText(/수정 완료 \(1개\)/)).toBeInTheDocument();
      });
    });
  });

  describe('Save Functionality', () => {
    it('should call API with correct data when save is clicked', async () => {
      const user = userEvent.setup();
      let apiCalledWith: unknown = null;

      server.use(
        http.get('*/menu/recommendations/1', () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: 'test',
              reason: 'test',
              recommendedAt: new Date().toISOString(),
              requestAddress: null,
              hasPlaceRecommendations: true,
            },
            places: [
              { menuName: '김치찌개', placeId: 'place1', name: 'Restaurant 1', reason: 'test' },
            ],
          });
        }),
        http.patch('*/menu/selections/:id', async ({ request }) => {
          apiCalledWith = await request.json();
          return HttpResponse.json({ success: true });
        })
      );

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
      });

      const saveButton = screen.getByText(/수정 완료/);
      await user.click(saveButton);

      await waitFor(() => {
        expect(apiCalledWith).toEqual({ lunch: ['김치찌개', '불고기'] });
      });
    });

    it('should call onComplete after successful save', async () => {
      const user = userEvent.setup();

      server.use(
        http.get('*/menu/recommendations/1', () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: 'test',
              reason: 'test',
              recommendedAt: new Date().toISOString(),
              requestAddress: null,
              hasPlaceRecommendations: true,
            },
            places: [
              { menuName: '김치찌개', placeId: 'place1', name: 'Restaurant 1', reason: 'test' },
            ],
          });
        }),
        http.patch('*/menu/selections/:id', () => {
          return HttpResponse.json({ success: true });
        })
      );

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
      });

      const saveButton = screen.getByText(/수정 완료/);
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });

    it('should call onClose after successful save', async () => {
      const user = userEvent.setup();

      server.use(
        http.get('*/menu/recommendations/1', () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: 'test',
              reason: 'test',
              recommendedAt: new Date().toISOString(),
              requestAddress: null,
              hasPlaceRecommendations: true,
            },
            places: [
              { menuName: '김치찌개', placeId: 'place1', name: 'Restaurant 1', reason: 'test' },
            ],
          });
        }),
        http.patch('*/menu/selections/:id', () => {
          return HttpResponse.json({ success: true });
        })
      );

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
      });

      const saveButton = screen.getByText(/수정 완료/);
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should disable save button when no menus selected', async () => {
      const user = userEvent.setup();

      server.use(
        http.get('*/menu/recommendations/1', () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: 'test',
              reason: 'test',
              recommendedAt: new Date().toISOString(),
              requestAddress: null,
              hasPlaceRecommendations: true,
            },
            places: [
              { menuName: '김치찌개', placeId: 'place1', name: 'Restaurant 1', reason: 'test' },
              { menuName: '불고기', placeId: 'place2', name: 'Restaurant 2', reason: 'test' },
            ],
          });
        })
      );

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
      });

      // Deselect all menus
      const menu1Button = screen.getByText('김치찌개').closest('button');
      const menu2Button = screen.getByText('불고기').closest('button');

      expect(menu1Button).toBeInTheDocument();
      expect(menu2Button).toBeInTheDocument();
      await user.click(menu1Button!);
      await user.click(menu2Button!);

      await waitFor(() => {
        const saveButton = screen.getByText(/수정 완료 \(0개\)/);
        expect(saveButton).toBeDisabled();
      });
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get('*/menu/recommendations/1', () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: 'test',
              reason: 'test',
              recommendedAt: new Date().toISOString(),
              requestAddress: null,
              hasPlaceRecommendations: true,
            },
            places: [],
          });
        })
      );

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: '취소' });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should show message when no menus available', async () => {
      server.use(
        http.get('*/menu/recommendations/1', () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: 'test',
              reason: 'test',
              recommendedAt: new Date().toISOString(),
              requestAddress: null,
              hasPlaceRecommendations: true,
            },
            places: [],
          });
        })
      );

      renderWithProviders(
        <MenuSelectionEditModal {...defaultProps} currentMenuNames={[]} />
      );

      await waitFor(() => {
        expect(screen.getByText('선택 가능한 메뉴가 없습니다.')).toBeInTheDocument();
      });
    });
  });

  describe('Portal Rendering', () => {
    it('should render in document body', () => {
      server.use(
        http.get('*/menu/recommendations/1', () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: 'test',
              reason: 'test',
              recommendedAt: new Date().toISOString(),
              requestAddress: null,
              hasPlaceRecommendations: true,
            },
            places: [],
          });
        })
      );

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      const modalInBody = document.body.querySelector('.fixed.inset-0.z-50');
      expect(modalInBody).toBeInTheDocument();
    });
  });

  describe('Slot-Specific Request Data', () => {
    it('should send breakfast slot data when slot is breakfast', async () => {
      const user = userEvent.setup();
      let apiCalledWith: unknown = null;

      server.use(
        http.get('*/menu/recommendations/1', () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: 'test',
              reason: 'test',
              recommendedAt: new Date().toISOString(),
              requestAddress: null,
              hasPlaceRecommendations: true,
            },
            places: [
              { menuName: '시리얼', placeId: 'place1', name: 'Restaurant 1', reason: 'test' },
            ],
          });
        }),
        http.patch('*/menu/selections/:id', async ({ request }) => {
          apiCalledWith = await request.json();
          return HttpResponse.json({ success: true });
        })
      );

      renderWithProviders(
        <MenuSelectionEditModal {...defaultProps} slot="breakfast" currentMenuNames={['시리얼']} />
      );

      await waitFor(() => {
        expect(screen.getByText('시리얼')).toBeInTheDocument();
      });

      const saveButton = screen.getByText(/수정 완료/);
      await user.click(saveButton);

      await waitFor(() => {
        expect(apiCalledWith).toEqual({ breakfast: ['시리얼'] });
      });
    });

    it('should send dinner slot data when slot is dinner', async () => {
      const user = userEvent.setup();
      let apiCalledWith: unknown = null;

      server.use(
        http.get('*/menu/recommendations/1', () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: 'test',
              reason: 'test',
              recommendedAt: new Date().toISOString(),
              requestAddress: null,
              hasPlaceRecommendations: true,
            },
            places: [
              { menuName: '스테이크', placeId: 'place1', name: 'Restaurant 1', reason: 'test' },
            ],
          });
        }),
        http.patch('*/menu/selections/:id', async ({ request }) => {
          apiCalledWith = await request.json();
          return HttpResponse.json({ success: true });
        })
      );

      renderWithProviders(
        <MenuSelectionEditModal {...defaultProps} slot="dinner" currentMenuNames={['스테이크']} />
      );

      await waitFor(() => {
        expect(screen.getByText('스테이크')).toBeInTheDocument();
      });

      const saveButton = screen.getByText(/수정 완료/);
      await user.click(saveButton);

      await waitFor(() => {
        expect(apiCalledWith).toEqual({ dinner: ['스테이크'] });
      });
    });

    it('should send etc slot data when slot is etc', async () => {
      const user = userEvent.setup();
      let apiCalledWith: unknown = null;

      server.use(
        http.get('*/menu/recommendations/1', () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: 'test',
              reason: 'test',
              recommendedAt: new Date().toISOString(),
              requestAddress: null,
              hasPlaceRecommendations: true,
            },
            places: [
              { menuName: '커피', placeId: 'place1', name: 'Restaurant 1', reason: 'test' },
            ],
          });
        }),
        http.patch('*/menu/selections/:id', async ({ request }) => {
          apiCalledWith = await request.json();
          return HttpResponse.json({ success: true });
        })
      );

      renderWithProviders(
        <MenuSelectionEditModal {...defaultProps} slot="etc" currentMenuNames={['커피']} />
      );

      await waitFor(() => {
        expect(screen.getByText('커피')).toBeInTheDocument();
      });

      const saveButton = screen.getByText(/수정 완료/);
      await user.click(saveButton);

      await waitFor(() => {
        expect(apiCalledWith).toEqual({ etc: ['커피'] });
      });
    });
  });

  describe('Selected Menus Reset After Save', () => {
    it('should reset selectedMenus after successful save', async () => {
      const user = userEvent.setup();

      server.use(
        http.get('*/menu/recommendations/1', () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: 'test',
              reason: 'test',
              recommendedAt: new Date().toISOString(),
              requestAddress: null,
              hasPlaceRecommendations: true,
            },
            places: [
              { menuName: '김치찌개', placeId: 'place1', name: 'Restaurant 1', reason: 'test' },
              { menuName: '불고기', placeId: 'place2', name: 'Restaurant 2', reason: 'test' },
            ],
          });
        }),
        http.patch('*/menu/selections/:id', () => {
          return HttpResponse.json({ success: true });
        })
      );

      const { rerender } = renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
      });

      // Save and close modal
      const saveButton = screen.getByText(/수정 완료/);
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });

      // Reopen modal - selections should be reset
      rerender(<MenuSelectionEditModal {...defaultProps} open={false} />);
      rerender(<MenuSelectionEditModal {...defaultProps} open={true} />);

      await waitFor(() => {
        // Should start fresh with current menu names selected
        expect(screen.getByText(/수정 완료 \(2개\)/)).toBeInTheDocument();
      });
    });
  });

  describe('Animation Timer', () => {
    it('should have animation timeout of 300ms when closing', async () => {
      server.use(
        http.get('*/menu/recommendations/1', () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: 'test',
              reason: 'test',
              recommendedAt: new Date().toISOString(),
              requestAddress: null,
              hasPlaceRecommendations: true,
            },
            places: [],
          });
        })
      );

      const { rerender } = renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(document.body.querySelector('.fixed.inset-0.z-50')).toBeInTheDocument();
      });

      // Close modal
      rerender(<MenuSelectionEditModal {...defaultProps} open={false} />);

      // Modal should still be in DOM immediately after close
      expect(document.body.querySelector('.fixed.inset-0.z-50')).toBeInTheDocument();

      // Wait for animation to complete (300ms timeout + buffer)
      await waitFor(
        () => {
          expect(document.body.querySelector('.fixed.inset-0.z-50')).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });
  });
});
